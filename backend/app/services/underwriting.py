# app/services/underwriting.py
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import date

from app.models.borrower import Borrower
from app.models.guarantor import Guarantor
from app.models.business_credit import BusinessCredit
from app.models.loan_request import LoanRequest
from app.models.lender_policy import LenderPolicy, LenderProgram, Lender
from app.models.match_result import MatchRun, MatchResult

from app.schemas.lender_policy import PolicyJson
from app.services.policy_engine import (
    ApplicationProfile,
    evaluate_policy,
)


def build_application_profile(
    db: Session,
    loan_request_id: int,
) -> ApplicationProfile:
    lr: LoanRequest = db.query(LoanRequest).filter(LoanRequest.id == loan_request_id).one()
    borrower: Borrower = lr.borrower
    guarantors: List[Guarantor] = borrower.guarantors
    bc: BusinessCredit | None = (
        db.query(BusinessCredit)
        .filter(BusinessCredit.borrower_id == borrower.id)
        .one_or_none()
    )

    # Basic dicts
    b_dict: Dict[str, Any] = {
        "business_name": borrower.business_name,
        "industry": borrower.industry,
        "state": borrower.state,
        "years_in_business": borrower.years_in_business,
        "annual_revenue": borrower.annual_revenue,
    }

    g_dicts: List[Dict[str, Any]] = [
        {
            "name": g.name,
            "fico_score": g.fico_score,
            "bankruptcy_flag": g.bankruptcy_flag,
            "delinquency_flag": g.delinquency_flag,
        }
        for g in guarantors
    ]

    bc_dict: Dict[str, Any] | None = None
    if bc:
        bc_dict = {
            "paynet_score": bc.paynet_score,
            "tradelines_count": bc.tradelines_count,
            "serious_delinquency_count": bc.serious_delinquency_count,
        }

    lr_dict: Dict[str, Any] = {
        "amount": lr.amount,
        "term_months": lr.term_months,
        "equipment_type": lr.equipment_type,
        "equipment_cost": lr.equipment_cost,
        "equipment_year": lr.equipment_year,
        "equipment_condition": lr.equipment_condition,
        "created_at": lr.created_at.isoformat(),
    }

    current_year = date.today().year
    equipment_age = None
    if lr.equipment_year:
        equipment_age = current_year - lr.equipment_year

    primary_fico = g_dicts[0]["fico_score"] if g_dicts and g_dicts[0]["fico_score"] else None
    foir = None

    derived = {
        "equipment_age": equipment_age,
        "primary_fico": primary_fico,
        "foir": foir,
    }

    return ApplicationProfile(
        borrower=b_dict,
        guarantors=g_dicts,
        business_credit=bc_dict,
        loan_request=lr_dict,
        derived=derived,
    )


def run_underwriting(db: Session, loan_request_id: int) -> MatchRun:
    # Create match run
    match_run = MatchRun(loan_request_id=loan_request_id, status="RUNNING")
    db.add(match_run)
    db.commit()
    db.refresh(match_run)

    app_profile = build_application_profile(db, loan_request_id)

    # Fetch active policies
    policies: List[LenderPolicy] = (
        db.query(LenderPolicy)
        .join(LenderProgram)
        .join(Lender)
        .filter(Lender.active == True)
        .filter(LenderPolicy.is_active == True)
        .all()
    )

    for p in policies:
        pj = PolicyJson(**p.policy_json)
        lender_id = p.program.lender_id
        lender_program_id = p.lender_program_id

        eval_result = evaluate_policy(
            policy_json=pj,
            lender_id=lender_id,
            lender_program_id=lender_program_id,
            app=app_profile,
        )

        mr = MatchResult(
            match_run_id=match_run.id,
            lender_id=lender_id,
            lender_program_id=lender_program_id,
            eligible=eval_result.eligible,
            fit_score=eval_result.fit_score,
            reasons=[r for r in eval_result.reasons],
            rule_results={
                "hard": [r.dict() for r in eval_result.hard_rule_results],
                "soft": [r.dict() for r in eval_result.soft_rule_results],
            },
        )
        db.add(mr)

    match_run.status = "COMPLETE"
    db.commit()
    db.refresh(match_run)
    return match_run
