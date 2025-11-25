# app/models/borrower.py
from sqlalchemy import Boolean, Column, Integer, String, Float
from app.db import Base

class Borrower(Base):
    __tablename__ = "borrowers"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String, nullable=False)
    industry = Column(String, nullable=False)      # e.g. NAICS/SIC
    state = Column(String, nullable=False)
    years_in_business = Column(Float, nullable=False)
    annual_revenue = Column(Float, nullable=False)
    paynet_score = Column(Integer, nullable=True)
    medical_license_flag = Column(Boolean, default=False)
