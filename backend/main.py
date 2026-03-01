"""
Standalone experimental app: Golden Layout workspace with backend-owned persistence.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .layout.api import router as layout_router

app = FastAPI(
    title="Grid Layout API",
    description="Configuration-driven layout persistence for Golden Layout proof-of-concept",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(layout_router)


@app.get("/")
def root():
    return {"service": "grid-layout-api", "layout": "/layout/{name}"}
