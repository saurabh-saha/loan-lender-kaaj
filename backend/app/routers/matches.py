# app/routers/matches.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.match_result import MatchRun, MatchResult
from app.schemas.underwriting import PolicyEvaluation, RuleResult

router = APIRouter()

@router.get("/by-run/{match_run_id}", response_model=List[PolicyEvaluation])
def get_match_results(match_run_id: int, db: Session = Depends(get_db)):
    mr = db.query(MatchRun).filter(MatchRun.id == match_run_id).first()
    if not mr:
        raise HTTPException(status_code=404, detail="Match run not found")

    results: list[MatchResult] = mr.results

    evaluations: List[PolicyEvaluation] = []
    for r in results:
        rule_results = r.rule_results or {}
        hard = [RuleResult(**rr) for rr in rule_results.get("hard", [])]
        soft = [RuleResult(**rr) for rr in rule_results.get("soft", [])]

        evaluations.append(
            PolicyEvaluation(
                lender_id=r.lender_id,
                lender_program_id=r.lender_program_id,
                eligible=r.eligible,
                fit_score=r.fit_score,
                hard_rule_results=hard,
                soft_rule_results=soft,
                reasons=r.reasons or [],
            )
        )
    return evaluations
