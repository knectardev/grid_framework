"""
Layout REST API. Backend is authoritative; frontend renders from backend state.
"""
from fastapi import APIRouter, HTTPException
from .models import GoldenLayoutConfig
from . import storage

router = APIRouter(prefix="/layout", tags=["layout"])


@router.get("/{name}", response_model=GoldenLayoutConfig)
def get_layout(name: str) -> GoldenLayoutConfig:
    """Fetch layout config by name. 404 if not found."""
    item = storage.load(name)
    if item is None:
        raise HTTPException(status_code=404, detail="Layout not found")
    return item


@router.post("/{name}", response_model=GoldenLayoutConfig)
def create_or_replace_layout(name: str, body: GoldenLayoutConfig) -> GoldenLayoutConfig:
    """Create or fully replace layout. Config stored exactly as received; version maintained."""
    if body.name != name:
        raise HTTPException(status_code=400, detail="Name in path and body must match")
    return storage.save(body)


@router.patch("/{name}", response_model=GoldenLayoutConfig)
def update_layout(name: str, body: GoldenLayoutConfig) -> GoldenLayoutConfig:
    """Update layout config. Same semantics as POST: full config replace, version increment."""
    if body.name != name:
        raise HTTPException(status_code=400, detail="Name in path and body must match")
    existing = storage.load(name)
    if existing is None:
        raise HTTPException(status_code=404, detail="Layout not found")
    return storage.save(body)
