# app/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://user:password@localhost:5432/lender_matching"
)

engine = create_engine(DATABASE_URL, echo=True, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()


# Dependency for FastAPI routes
def get_db():
    from fastapi import Depends
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
