# app/schemas/lender_policy.py
from pydantic import BaseModel
from typing import Any, Literal, List, Optional

RuleSeverity = Literal["HARD", "SOFT"]

class RuleConfig(BaseModel):
    id: str
    type: str  # e.g. MIN_VALUE, MAX_VALUE, IN_SET, NOT_IN_SET, etc.
    field: Optional[str] = None
    params: dict[str, Any] = {}
    severity: RuleSeverity
    message: str


class RuleGroupConfig(BaseModel):
    logic: Literal["ALL", "ANY"] = "ALL"
    rules: list[RuleConfig] | None = None
    groups: list["RuleGroupConfig"] | None = None


RuleGroupConfig.model_rebuild()


class ScoringConfig(BaseModel):
    base_score: float = 100.0
    deductions: list[dict[str, Any]] = []  # {"ruleId": ..., "points": ...}
    min_accept_score: float = 60.0


class PolicyJson(BaseModel):
    hard_rules: RuleGroupConfig
    soft_rules: RuleGroupConfig | None = None
    scoring_config: ScoringConfig


class LenderBase(BaseModel):
    name: str
    active: bool = True


class LenderCreate(LenderBase):
    pass


class LenderRead(LenderBase):
    id: int

    class Config:
        orm_mode = True


class LenderProgramBase(BaseModel):
    lender_id: int
    name: str
    min_amount: int
    max_amount: int
    min_term_months: int
    max_term_months: int


class LenderProgramCreate(LenderProgramBase):
    pass


class LenderProgramRead(LenderProgramBase):
    id: int

    class Config:
        orm_mode = True


class LenderPolicyBase(BaseModel):
    lender_program_id: int
    version: int = 1
    is_active: bool = True
    policy_json: PolicyJson


class LenderPolicyCreate(LenderPolicyBase):
    pass


class LenderPolicyRead(LenderPolicyBase):
    id: int

    class Config:
        orm_mode = True
