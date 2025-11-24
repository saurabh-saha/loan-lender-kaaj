# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import applications, policies, underwriting, matches
from app.db import Base, engine

# Create tables (for demo; in prod use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lender Matching Platform",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(applications.router, prefix="/applications", tags=["applications"])
app.include_router(policies.router,     prefix="/policies",     tags=["policies"])
app.include_router(underwriting.router, prefix="/underwriting", tags=["underwriting"])
app.include_router(matches.router,      prefix="/matches",      tags=["matches"])
