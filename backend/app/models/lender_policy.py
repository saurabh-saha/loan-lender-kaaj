# app/models/lender_policy.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db import Base

class Lender(Base):
    __tablename__ = "lenders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    active = Column(Boolean, default=True)


class LenderProgram(Base):
    """
    Individual products / programs / tiers per lender
    """
    __tablename__ = "lender_programs"

    id = Column(Integer, primary_key=True, index=True)
    lender_id = Column(Integer, ForeignKey("lenders.id"), nullable=False)
    name = Column(String, nullable=False)
    min_amount = Column(Integer, nullable=False)
    max_amount = Column(Integer, nullable=False)
    min_term_months = Column(Integer, nullable=False)
    max_term_months = Column(Integer, nullable=False)

    lender = relationship("Lender", backref="programs")


class LenderPolicy(Base):
    """
    Versioned policy config per program. Policy JSON holds the rule tree.
    """
    __tablename__ = "lender_policies"

    id = Column(Integer, primary_key=True, index=True)
    lender_program_id = Column(Integer, ForeignKey("lender_programs.id"), nullable=False)
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, default=True)

    # JSON structure contains hard/soft rules and scoring config
    policy_json = Column(JSON, nullable=False)

    program = relationship("LenderProgram", backref="policies")
