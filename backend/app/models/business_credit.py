# app/models/business_credit.py
from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class BusinessCredit(Base):
    __tablename__ = "business_credit"

    id = Column(Integer, primary_key=True, index=True)
    borrower_id = Column(Integer, ForeignKey("borrowers.id"), nullable=False)
    paynet_score = Column(Integer, nullable=True)
    tradelines_count = Column(Integer, nullable=True)
    serious_delinquency_count = Column(Integer, nullable=True)

    borrower = relationship("Borrower", backref="business_credit_profile")
