from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class MatchResultRead(BaseModel):
    id: int
    match_run_id: int
    lender_id: int
    lender_program_id: int
    eligible: bool
    fit_score: Optional[float] = None
    reasons: List[str]
    rule_results: Dict[str, Any]  # contains "hard" and "soft"

    class Config:
        orm_mode = True
