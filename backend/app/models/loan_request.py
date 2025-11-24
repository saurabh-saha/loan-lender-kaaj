# app/models/loan_request.py
from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class LoanRequest(Base):
    __tablename__ = "loan_requests"

    id = Column(Integer, primary_key=True, index=True)
    borrower_id = Column(Integer, ForeignKey("borrowers.id"), nullable=False)

    amount = Column(Float, nullable=False)
    term_months = Column(Integer, nullable=False)

    equipment_type = Column(String, nullable=False)
    equipment_cost = Column(Float, nullable=False)
    equipment_year = Column(Integer, nullable=True)
    equipment_vendor = Column(String, nullable=True)
    equipment_condition = Column(String, nullable=True)  # new/used

    created_at = Column(Date, nullable=False)

    borrower = relationship("Borrower", backref="loan_requests")
