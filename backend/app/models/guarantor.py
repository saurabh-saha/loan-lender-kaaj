# app/models/guarantor.py
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Guarantor(Base):
    __tablename__ = "guarantors"

    id = Column(Integer, primary_key=True, index=True)
    borrower_id = Column(Integer, ForeignKey("borrowers.id"), nullable=False)
    name = Column(String, nullable=False)
    fico_score = Column(Integer, nullable=True)
    bankruptcy_flag = Column(Boolean, default=False)
    delinquency_flag = Column(Boolean, default=False)

    borrower = relationship("Borrower", backref="guarantors")
