# app/schemas/underwriting.py
from pydantic import BaseModel
from typing import List, Any

from app.schemas.match_result import MatchResultRead

class RuleResult(BaseModel):
    rule_id: str
    passed: bool
    severity: str
    message: str
    field: str | None = None
    expected: Any | None = None
    actual: Any | None = None


class PolicyEvaluation(BaseModel):
    lender_id: int
    lender_program_id: int
    eligible: bool
    fit_score: float | None
    hard_rule_results: List[RuleResult]
    soft_rule_results: List[RuleResult]
    reasons: List[str]


class MatchRunRead(BaseModel):
    id: int
    loan_request_id: int
    status: str
    results: List[MatchResultRead] = []
    class Config:
        orm_mode = True
