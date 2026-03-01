"""
Layout domain models. Backend owns layout persistence; config stored exactly as received.
"""
from pydantic import BaseModel, Field


class GoldenLayoutConfig(BaseModel):
    """Layout snapshot: name, raw config dict, and version for round-trip integrity."""
    name: str = Field(..., description="Layout identifier")
    config: dict = Field(..., description="Golden Layout config/serialized state, stored as-is")
    version: int = Field(default=0, ge=0, description="Monotonically incremented on each save")
