import json
import os
from datetime import datetime, timezone
from typing import Any, Dict

from .config import MODEL_DIR

REGISTRY_PATH = os.path.join(MODEL_DIR, "model_registry.json")

DEFAULT_MODEL_INFO: Dict[str, Any] = {
    "ready": False,
    "model_version": None,
    "last_trained": None,
    "data_points": None,
    "metrics": None,
}


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _load_registry() -> Dict[str, Dict[str, Any]]:
    if not os.path.exists(REGISTRY_PATH):
        return {}
    try:
        with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def _save_registry(registry: Dict[str, Dict[str, Any]]) -> None:
    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2, sort_keys=True)


def get_model_info(name: str) -> Dict[str, Any]:
    registry = _load_registry()
    info = registry.get(name, {})
    merged = dict(DEFAULT_MODEL_INFO)
    merged.update(info)
    return merged


def update_model_info(name: str, **fields: Any) -> Dict[str, Any]:
    registry = _load_registry()
    current = registry.get(name, {})
    merged = dict(DEFAULT_MODEL_INFO)
    merged.update(current)
    merged.update(fields)
    merged.setdefault("last_trained", _utc_now_iso())
    registry[name] = merged
    _save_registry(registry)
    return merged


def mark_model_ready(name: str, model_version: str, data_points: int, metrics: Dict[str, Any]) -> Dict[str, Any]:
    return update_model_info(
        name,
        ready=True,
        model_version=model_version,
        data_points=data_points,
        metrics=metrics,
        last_trained=_utc_now_iso(),
    )
