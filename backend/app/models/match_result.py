# app/models/match_result.py
from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db import Base

class MatchRun(Base):
    __tablename__ = "match_runs"

    id = Column(Integer, primary_key=True, index=True)
    loan_request_id = Column(Integer, ForeignKey("loan_requests.id"), nullable=False)
    status = Column(String, nullable=False, default="PENDING")  # PENDING/RUNNING/COMPLETE/FAILED

    loan_request = relationship("LoanRequest", backref="match_runs")


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    match_run_id = Column(Integer, ForeignKey("match_runs.id"), nullable=False)
    lender_id = Column(Integer, ForeignKey("lenders.id"), nullable=False)
    lender_program_id = Column(Integer, ForeignKey("lender_programs.id"), nullable=False)

    eligible = Column(Boolean, nullable=False)
    fit_score = Column(Float, nullable=True)

    reasons = Column(JSON, nullable=False)  # list[str]
    rule_results = Column(JSON, nullable=False)  # full detail of checks

    lender = relationship("Lender")
    program = relationship("LenderProgram")
    match_run = relationship("MatchRun", backref="results")
