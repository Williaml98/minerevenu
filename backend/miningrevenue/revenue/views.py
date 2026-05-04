from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SalesTransaction
from .serializers import SalesTransactionSerializer
from ml.anomaly import detect_anomalies
from django.utils import timezone
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
from mining.models import Mine, ProductionRecord
import pandas as pd
from datetime import timedelta


class IsAdminOrOfficerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in {"Admin", "Officer"}


class SalesTransactionViewSet(viewsets.ModelViewSet):
    queryset = SalesTransaction.objects.all()
    serializer_class = SalesTransactionSerializer
    permission_classes = [IsAdminOrOfficerOrReadOnly]

    def get_queryset(self):
        return (
            SalesTransaction.objects.select_related("mine", "created_by", "validated_by")
            .all()
            .order_by("-date", "-created_at")
        )

    def _resolve_production_pricing(self, mine_id, date_value, quantity_value, instance=None):
        production_qs = ProductionRecord.objects.filter(
            mine_id=mine_id, date__lte=date_value
        )
        if not production_qs.exists():
            return None, Response(
                {
                    "detail": "Production record required before sales. Create production first."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_produced = (
            production_qs.aggregate(total=Sum("quantity_produced"))["total"] or 0
        )
        sold_qs = SalesTransaction.objects.filter(mine_id=mine_id, date__lte=date_value)
        if instance is not None:
            sold_qs = sold_qs.exclude(id=instance.id)
        total_sold = sold_qs.aggregate(total=Sum("quantity"))["total"] or 0

        if total_sold + quantity_value > total_produced:
            return None, Response(
                {
                    "detail": "Sales quantity exceeds total produced quantity for this mine."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        latest_production = production_qs.order_by("-date", "-id").first()
        return latest_production.unit_price, None

    def perform_create(self, serializer):
        save_kwargs = {
            "created_by": self.request.user,
            "status": SalesTransaction.STATUS_PENDING,
        }
        if hasattr(self, "_forced_unit_price") and self._forced_unit_price is not None:
            save_kwargs["unit_price"] = self._forced_unit_price
        instance = serializer.save(**save_kwargs)

        # Prepare data for anomaly detection
        try:
            last_30 = timezone.now().date() - timedelta(days=30)
            recent_total = (
                SalesTransaction.objects.filter(
                    mine=instance.mine,
                    date__gte=last_30,
                )
                .exclude(id=instance.id)
                .aggregate(total=Sum("total_amount"))["total"]
                or 0
            )
            allocation_base = recent_total + (instance.total_amount or 0)
            allocation_pct = (
                (instance.total_amount / allocation_base) * 100
                if allocation_base > 0
                else 100.0
            )

            data = pd.DataFrame(
                [
                    {
                        "Quantity_Tons": instance.quantity,
                        "Unit_Price_USD": instance.unit_price,
                        "Total_Amount_USD": instance.total_amount,
                        "Allocation_Percentage": allocation_pct,
                    }
                ]
            )

            result = detect_anomalies(data)

            if result[0] == 1:
                instance.is_flagged = True
                instance.save(update_fields=["is_flagged"])
        except Exception:
            # If the anomaly model is not ready, skip flagging for now.
            pass

    def create(self, request, *args, **kwargs):
        mine_id = request.data.get("mine")
        date_value = request.data.get("date")
        quantity = request.data.get("quantity")

        if not mine_id or not date_value or quantity is None:
            return Response(
                {"detail": "mine, date, and quantity are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity_value = float(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "quantity must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        unit_price, error_response = self._resolve_production_pricing(
            mine_id, date_value, quantity_value
        )
        if error_response:
            return error_response

        payload = request.data.copy()

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self._forced_unit_price = unit_price
        self.perform_create(serializer)
        self._forced_unit_price = None
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        mine_id = request.data.get("mine", instance.mine_id)
        date_value = request.data.get("date", instance.date)
        quantity = request.data.get("quantity", instance.quantity)

        try:
            quantity_value = float(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "quantity must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        unit_price, error_response = self._resolve_production_pricing(
            mine_id, date_value, quantity_value, instance=instance
        )
        if error_response:
            return error_response

        payload = request.data.copy()

        serializer = self.get_serializer(instance, data=payload, partial=partial)
        serializer.is_valid(raise_exception=True)
        self._forced_unit_price = unit_price
        self.perform_update(serializer)
        self._forced_unit_price = None
        return Response(serializer.data)

    def perform_update(self, serializer):
        save_kwargs = {}
        if hasattr(self, "_forced_unit_price") and self._forced_unit_price is not None:
            save_kwargs["unit_price"] = self._forced_unit_price
        instance = serializer.save(**save_kwargs)
        if self.request.user.role == "Officer":
            if instance.status != SalesTransaction.STATUS_PENDING:
                instance.status = SalesTransaction.STATUS_PENDING
                instance.validated_by = None
                instance.validated_at = None
                instance.save(update_fields=["status", "validated_by", "validated_at"])

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        if request.user.role != "Admin":
            return Response(
                {"detail": "Only admins can update revenue status."},
                status=status.HTTP_403_FORBIDDEN,
            )
        transaction = self.get_object()
        new_status = request.data.get("status")

        allowed_statuses = {
            SalesTransaction.STATUS_PENDING,
            SalesTransaction.STATUS_APPROVED,
            SalesTransaction.STATUS_REJECTED,
        }

        if new_status not in allowed_statuses:
            return Response(
                {
                    "detail": "Invalid status. Use one of: Pending, Approved, Rejected."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        transaction.status = new_status
        if new_status == SalesTransaction.STATUS_PENDING:
            transaction.validated_by = None
            transaction.validated_at = None
        else:
            transaction.validated_by = request.user
            transaction.validated_at = timezone.now()

        transaction.save(update_fields=["status", "validated_by", "validated_at"])
        serializer = self.get_serializer(transaction)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RevenueSummaryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        month_start = today.replace(day=1)
        year_start = today.replace(month=1, day=1)

        transactions = SalesTransaction.objects.all()

        today_revenue = (
            transactions.filter(date=today).aggregate(total=Sum("total_amount"))["total"]
            or 0
        )
        month_revenue = (
            transactions.filter(date__gte=month_start).aggregate(total=Sum("total_amount"))[
                "total"
            ]
            or 0
        )
        year_revenue = (
            transactions.filter(date__gte=year_start).aggregate(total=Sum("total_amount"))[
                "total"
            ]
            or 0
        )

        status_counts = transactions.aggregate(
            pending=Count("id", filter=Q(status=SalesTransaction.STATUS_PENDING)),
            approved=Count("id", filter=Q(status=SalesTransaction.STATUS_APPROVED)),
            rejected=Count("id", filter=Q(status=SalesTransaction.STATUS_REJECTED)),
            flagged=Count("id", filter=Q(is_flagged=True)),
        )

        return Response(
            {
                "today_revenue": today_revenue,
                "month_revenue": month_revenue,
                "year_revenue": year_revenue,
                "pending_entries": status_counts["pending"],
                "approved_entries": status_counts["approved"],
                "rejected_entries": status_counts["rejected"],
                "flagged_entries": status_counts["flagged"],
                "total_transactions": transactions.count(),
            },
            status=status.HTTP_200_OK,
        )


class PublicStatsAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        transactions = SalesTransaction.objects.all()
        total_revenue = transactions.aggregate(total=Sum("total_amount"))["total"] or 0
        status_counts = transactions.aggregate(
            approved=Count("id", filter=Q(status=SalesTransaction.STATUS_APPROVED)),
            total=Count("id"),
        )
        compliance_rate = (
            (status_counts["approved"] / status_counts["total"]) * 100
            if status_counts["total"] > 0
            else 0.0
        )
        active_sites = Mine.objects.filter(status__iexact="Active").count()
        return Response(
            {
                "total_revenue": float(total_revenue),
                "compliance_rate": compliance_rate,
                "active_sites": active_sites,
            },
            status=status.HTTP_200_OK,
        )


class StakeholderInsightsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        current_year_start = today.replace(month=1, day=1)
        previous_year_start = current_year_start.replace(year=current_year_start.year - 1)

        transactions = SalesTransaction.objects.select_related("mine").all()

        total_revenue = transactions.aggregate(total=Sum("total_amount"))["total"] or 0
        current_year_revenue = (
            transactions.filter(date__gte=current_year_start).aggregate(total=Sum("total_amount"))[
                "total"
            ]
            or 0
        )
        previous_year_revenue = (
            transactions.filter(
                date__gte=previous_year_start, date__lt=current_year_start
            ).aggregate(total=Sum("total_amount"))["total"]
            or 0
        )

        if previous_year_revenue > 0:
            annual_growth_rate = (
                (current_year_revenue - previous_year_revenue) / previous_year_revenue
            ) * 100
        else:
            annual_growth_rate = 0.0

        status_counts = transactions.aggregate(
            approved=Count("id", filter=Q(status=SalesTransaction.STATUS_APPROVED)),
            total=Count("id"),
        )
        compliance_rate = (
            (status_counts["approved"] / status_counts["total"]) * 100
            if status_counts["total"] > 0
            else 0.0
        )

        active_sites = Mine.objects.filter(status__iexact="Active").count()

        monthly_rows = (
            transactions.annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("total_amount"))
            .order_by("month")
        )
        monthly_revenue = [
            {
                "month": row["month"].strftime("%Y-%m"),
                "total_revenue": float(row["total"] or 0),
            }
            for row in monthly_rows
        ]

        site_rows = (
            transactions.values("mine", "mine__name")
            .annotate(total_revenue=Sum("total_amount"))
            .order_by("-total_revenue")
        )
        site_breakdown = []
        for row in site_rows:
            site_total = float(row["total_revenue"] or 0)
            contribution_percent = (site_total / total_revenue * 100) if total_revenue > 0 else 0
            site_breakdown.append(
                {
                    "mine_id": row["mine"],
                    "mine_name": row["mine__name"],
                    "total_revenue": site_total,
                    "contribution_percent": contribution_percent,
                }
            )

        payload = {
            "overview": {
                "total_revenue": total_revenue,
                "current_year_revenue": current_year_revenue,
                "previous_year_revenue": previous_year_revenue,
                "annual_growth_rate": annual_growth_rate,
                "active_sites": active_sites,
                "compliance_rate": compliance_rate,
            },
            "monthly_revenue": monthly_revenue,
            "site_breakdown": site_breakdown,
        }

        return Response(payload, status=status.HTTP_200_OK)
