import csv

from django.core.management.base import BaseCommand
from django.db.models import Sum

from mining.models import Mine, ProductionRecord
from revenue.models import SalesTransaction
from ml.config import FORECAST_DATA_PATH, ANOMALY_DATA_PATH


class Command(BaseCommand):
    help = "Export production and sales data to ML CSV datasets."

    def add_arguments(self, parser):
        parser.add_argument(
            "--forecast-path",
            default=FORECAST_DATA_PATH,
            help="Output path for forecasting dataset CSV.",
        )
        parser.add_argument(
            "--transactions-path",
            default=ANOMALY_DATA_PATH,
            help="Output path for transactions dataset CSV.",
        )

    def handle(self, *args, **options):
        forecast_path = options["forecast_path"]
        transactions_path = options["transactions_path"]

        self.stdout.write("Exporting forecasting dataset...")
        self._export_forecast_csv(forecast_path)
        self.stdout.write(f"OK: Forecast dataset saved to {forecast_path}")

        self.stdout.write("Exporting transactions dataset...")
        self._export_transactions_csv(transactions_path)
        self.stdout.write(f"OK: Transactions dataset saved to {transactions_path}")

    def _export_forecast_csv(self, output_path: str) -> None:
        headers = [
            "Date",
            "Mine_ID",
            "Mineral_Type",
            "Quantity_Produced_Tons",
            "Unit_Price_USD",
            "Total_Revenue_USD",
            "Operating_Cost_USD",
            "Taxes_USD",
            "Net_Revenue_USD",
        ]

        rows = []

        sales_qs = SalesTransaction.objects.select_related("mine").order_by("date", "id")
        if sales_qs.exists():
            aggregates = {}
            for tx in sales_qs:
                key = (tx.date, tx.mine.id)
                entry = aggregates.get(key)
                if entry is None:
                    aggregates[key] = {
                        "date": tx.date,
                        "mine": tx.mine,
                        "quantity": float(tx.quantity),
                        "total": float(tx.total_amount),
                    }
                else:
                    entry["quantity"] += float(tx.quantity)
                    entry["total"] += float(tx.total_amount)

            for (_, _), entry in aggregates.items():
                mine: Mine = entry["mine"]
                quantity = entry["quantity"]
                total = entry["total"]
                unit_price = total / quantity if quantity > 0 else 0.0
                rows.append(
                    [
                        entry["date"].isoformat(),
                        mine.id,
                        mine.mineral_type,
                        float(quantity),
                        float(unit_price),
                        float(total),
                        0.0,
                        0.0,
                        float(total),
                    ]
                )
        else:
            qs = ProductionRecord.objects.select_related("mine").order_by("date", "id")
            for record in qs:
                mine: Mine = record.mine
                total_revenue = record.total_revenue or (record.quantity_produced * record.unit_price)
                rows.append(
                    [
                        record.date.isoformat(),
                        mine.id,
                        mine.mineral_type,
                        float(record.quantity_produced),
                        float(record.unit_price),
                        float(total_revenue),
                        0.0,
                        0.0,
                        float(total_revenue),
                    ]
                )

        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(rows)

    def _export_transactions_csv(self, output_path: str) -> None:
        headers = [
            "Transaction_ID",
            "Date",
            "Mine_ID",
            "Mineral_Type",
            "Quantity_Tons",
            "Unit_Price_USD",
            "Total_Amount_USD",
            "Payment_Method",
            "Allocation_Percentage",
            "Is_Anomaly",
        ]

        qs = SalesTransaction.objects.select_related("mine").order_by("date", "id")
        rows = []
        for tx in qs:
            mine_total = (
                SalesTransaction.objects.filter(mine=tx.mine, date__lte=tx.date)
                .aggregate(total=Sum("total_amount"))["total"]
                or 0
            )
            allocation_pct = (tx.total_amount / mine_total) * 100.0 if mine_total > 0 else 100.0

            rows.append(
                [
                    tx.id,
                    tx.date.isoformat(),
                    tx.mine.id,
                    tx.mine.mineral_type,
                    float(tx.quantity),
                    float(tx.unit_price),
                    float(tx.total_amount),
                    tx.payment_method,
                    float(allocation_pct),
                    1 if tx.is_flagged else 0,
                ]
            )

        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(rows)
