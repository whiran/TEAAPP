"""
Tea Factories API
Serves factory data from the static factories.json file with filtering support.
Data is loaded once into memory at startup for fast responses.
"""

from fastapi import APIRouter, Query
from typing import Optional
import json
import os
from pathlib import Path

router = APIRouter()

# ── Load factories.json once at module import time ──────────────────────────
_BASE_DIR = Path(__file__).parent.parent.parent
_DATA_FILE = _BASE_DIR / "frontend" / "public" / "data" / "factories.json"

_FACTORIES: list[dict] = []

def _load():
    global _FACTORIES
    if _DATA_FILE.exists():
        with open(_DATA_FILE, encoding="utf-8") as f:
            _FACTORIES = json.load(f)
        print(f"✅ Loaded {len(_FACTORIES)} factories from {_DATA_FILE.name}")
    else:
        print(f"⚠️  factories.json not found at {_DATA_FILE}")

_load()


# ── Helpers ──────────────────────────────────────────────────────────────────

def _norm(value) -> str:
    """Normalise a value for case-insensitive comparison."""
    if value is None:
        return ""
    return str(value).strip().upper()


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
async def get_factories(
    elevation: Optional[str] = Query(None, description="High | Medium | Low"),
    sub_elevation: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    ds_div: Optional[str] = Query(None),
    atc_reg: Optional[str] = Query(None),
    inspector_region: Optional[str] = Query(None),
    agro_div: Optional[str] = Query(None),
    management_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
):
    """
    Return all tea factories, optionally filtered by one or more criteria.
    All string filters are case-insensitive.
    """
    results = _FACTORIES

    if elevation:
        ev = elevation.strip().capitalize()  # "High", "Medium", "Low"
        results = [f for f in results if _norm(f.get("elevation")) == ev.upper()]

    if sub_elevation:
        sv = _norm(sub_elevation)
        results = [f for f in results if _norm(f.get("subElevation")) == sv]

    if district:
        dv = _norm(district)
        results = [f for f in results if _norm(f.get("district")) == dv]

    if ds_div:
        ddv = _norm(ds_div)
        results = [f for f in results if _norm(f.get("dsDiv")) == ddv]

    if atc_reg:
        av = _norm(atc_reg)
        results = [f for f in results if _norm(f.get("atcReg")) == av]

    if inspector_region:
        iv = _norm(inspector_region)
        results = [f for f in results if _norm(f.get("inspectorRegion")) == iv]

    if agro_div:
        agv = _norm(agro_div)
        results = [f for f in results if _norm(f.get("agroDiv")) == agv]

    if management_type:
        mv = _norm(management_type)
        results = [f for f in results if _norm(f.get("managementType")) == mv]

    if is_active is not None:
        results = [f for f in results if bool(f.get("isActive")) == is_active]

    return {
        "total": len(_FACTORIES),
        "filtered": len(results),
        "factories": results,
    }


@router.get("/filters")
async def get_filter_options():
    """
    Return all distinct values for every filterable dimension.
    Used to populate dropdown menus in the frontend.
    """
    def distinct(key: str) -> list[str]:
        seen = set()
        out = []
        for f in _FACTORIES:
            v = f.get(key)
            if v is not None and str(v).strip():
                nv = str(v).strip()
                if nv not in seen:
                    seen.add(nv)
                    out.append(nv)
        return sorted(out)

    return {
        "elevation":       distinct("elevation"),
        "subElevation":    distinct("subElevation"),
        "district":        distinct("district"),
        "dsDiv":           distinct("dsDiv"),
        "atcReg":          distinct("atcReg"),
        "inspectorRegion": distinct("inspectorRegion"),
        "agroDiv":         distinct("agroDiv"),
        "managementType":  distinct("managementType"),
    }
