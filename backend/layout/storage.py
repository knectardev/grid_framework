"""
JSON file storage for layout configs. No database; round-trip integrity and versioning.
"""
import json
from pathlib import Path
from .models import GoldenLayoutConfig

# Store layout files under backend/data/layouts (gitignore in production)
DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "layouts"
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _path(name: str) -> Path:
    """Path to JSON file for layout name. Sanitize to avoid path traversal."""
    safe = "".join(c for c in name if c.isalnum() or c in "-_").strip() or "default"
    return DATA_DIR / f"{safe}.json"


def load(name: str) -> GoldenLayoutConfig | None:
    """Load layout by name. Returns None if not found."""
    p = _path(name)
    if not p.exists():
        return None
    raw = json.loads(p.read_text(encoding="utf-8"))
    return GoldenLayoutConfig.model_validate(raw)


def save(item: GoldenLayoutConfig) -> GoldenLayoutConfig:
    """Persist layout. Increments version. Stores config exactly as received."""
    existing = load(item.name)
    version = (existing.version + 1) if existing else 0
    to_save = GoldenLayoutConfig(name=item.name, config=item.config, version=version)
    _path(to_save.name).write_text(to_save.model_dump_json(indent=2), encoding="utf-8")
    return to_save


def ensure_exists(name: str, default_config: dict) -> GoldenLayoutConfig:
    """Return existing layout or create with default config at version 0."""
    existing = load(name)
    if existing is not None:
        return existing
    new_item = GoldenLayoutConfig(name=name, config=default_config, version=0)
    return save(new_item)
