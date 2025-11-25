# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import applications, policies, underwriting, matches
from app.db import Base, engine

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.seed.apex import seed_apex
from app.seed.advantage import seed_advantage
from app.seed.falcon import seed_falcon
from app.seed.citizens import seed_citizens
from app.seed.stearns import seed_stearns

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- RUN ON STARTUP ----
    print("Running Seeder...")
    seed_apex()
    seed_advantage()
    seed_falcon()
    seed_citizens()
    seed_stearns()
    print(" Seeder Complete.")

    yield

    # ---- RUN ON SHUTDOWN ----
    print("Shutting down...")


# Create tables (for demo; in prod use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lender Matching Platform",
    version="0.1.0",
    lifespan=lifespan
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
