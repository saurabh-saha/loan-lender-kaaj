# app/seeds/falcon.py

from app.db import SessionLocal
from app.models.lender_policy import Lender, LenderProgram, LenderPolicy


def seed_falcon():
    db = SessionLocal()

    # Skip if seeded already
    existing = db.query(Lender).filter(Lender.name == "Falcon Equipment Finance").first()
    if existing:
        print("Falcon already seeded — skipping.")
        return

    # ---------------------------------------------------------
    # Create Falcon lender
    # ---------------------------------------------------------
    falcon = Lender(name="Falcon Equipment Finance", active=True)
    db.add(falcon)
    db.flush()   # Get falcon.id

    # ---------------------------------------------------------
    # Shared Credit Policy (applies to A/B/C/D/E)
    # Extracted from "112025 Rates - STANDARD.pdf"
    # ---------------------------------------------------------
    shared_policy = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                # 3+ years in business
                {
                    "id": "tib_3yrs",
                    "type": "MIN_VALUE",
                    "field": "borrower.years_in_business",
                    "params": {"min": 3},
                    "severity": "HARD",
                    "message": "Minimum 3 years in business required"
                },
                # 680+ FICO
                {
                    "id": "fico_680",
                    "type": "MIN_VALUE",
                    "field": "guarantors[0].fico_score",
                    "params": {"min": 680},
                    "severity": "HARD",
                    "message": "Minimum FICO 680 required"
                },
                # PayNet 660+ (still treated as "field" in ApplicationProfile)
                {
                    "id": "paynet_660",
                    "type": "MIN_VALUE",
                    "field": "borrower.paynet_score",
                    "params": {"min": 660},
                    "severity": "HARD",
                    "message": "Minimum PayNet 660 required"
                },
                # No bankruptcies in 15 years
                {
                    "id": "no_recent_bankruptcy",
                    "type": "BOOLEAN_IS_TRUE",
                    "field": "guarantors[0].bankruptcy_flag_15yrs_clear",
                    "params": {},
                    "severity": "HARD",
                    "message": "No bankruptcies in last 15 years"
                },
                # Private party sales forbidden
                {
                    "id": "no_private_party_sales",
                    "type": "NOT_IN_LIST",
                    "field": "loan_request.equipment_condition",
                    "params": {"list": ["Private Party"]},
                    "severity": "HARD",
                    "message": "Private party sales not allowed"
                }
            ]
        },

        "soft_rules": {
            "logic": "ALL",
            "rules": [
                # Ideal tier: FICO 700+
                {
                    "id": "ideal_fico_700",
                    "type": "MIN_VALUE",
                    "field": "guarantors[0].fico_score",
                    "params": {"min": 700},
                    "severity": "SOFT",
                    "message": "Ideal FICO 700+"
                }
            ]
        },

        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 60,
            "deductions": [
                {"ruleId": "ideal_fico_700", "points": 10}
            ]
        }
    }

    # ---------------------------------------------------------
    # Helper: Create program + attach shared Falcon policy
    # ---------------------------------------------------------
    def add_program(name, min_amt, max_amt, min_term, max_term):
        program = LenderProgram(
            lender_id=falcon.id,
            name=name,
            min_amount=min_amt,
            max_amount=max_amt,
            min_term_months=min_term,
            max_term_months=max_term
        )
        db.add(program)
        db.flush()

        policy = LenderPolicy(
            lender_program_id=program.id,
            version=1,
            is_active=True,
            policy_json=shared_policy
        )
        db.add(policy)
        return program

    # ---------------------------------------------------------
    # Create Falcon Programs (A/B/C/D/E)
    # Only pricing differs in PDF → same underwriting rules
    # ---------------------------------------------------------
    add_program("Falcon A Program", 10000, 500000, 24, 60)
    add_program("Falcon B Program", 10000, 500000, 24, 60)
    add_program("Falcon C Program", 10000, 500000, 24, 60)
    add_program("Falcon D Program", 10000, 500000, 24, 60)
    add_program("Falcon E Program", 10000, 500000, 24, 60)

    db.commit()
    db.close()
    print("Falcon seed inserted successfully!")


# ----------------------------------------------------
# Allow: python -m app.seeds.falcon
# ----------------------------------------------------
def main():
    seed_falcon()


if __name__ == "__main__":
    main()
