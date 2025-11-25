# app/seeds/citizens.py
from app.db import SessionLocal
from app.models.lender_policy import Lender, LenderProgram, LenderPolicy


def seed_citizens():
    db = SessionLocal()

    # skip if already added
    existing = db.query(Lender).filter(Lender.name == "Citizens Bank").first()
    if existing:
        print("Citizens already seeded — skipping.")
        return

    citizens = Lender(name="Citizens Bank", active=True)
    db.add(citizens)
    db.flush()

    # helper
    def add_program(name, min_amt, max_amt, min_term, max_term, policy_json):
        program = LenderProgram(
            lender_id=citizens.id,
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
            policy_json=policy_json
        )
        db.add(policy)


    # -------------------------------------------------------------------
    # PROGRAM 1 — Tier 1
    # -------------------------------------------------------------------
    policy_tier1 = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                # 700+ TU score
                {"id": "fico_700", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score",
                 "params": {"min": 700}, "severity": "HARD",
                 "message": "Minimum 700 TransUnion score required"},

                # 2 years TIB
                {"id": "tib_2yrs", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business",
                 "params": {"min": 2}, "severity": "HARD",
                 "message": "Minimum 2 years in business required"},

                # homeownership required (boolean)
                {"id": "homeowner_check", "type": "BOOLEAN_IS_TRUE",
                 "field": "guarantors[0].homeowner_flag",
                 "params": {}, "severity": "HARD",
                 "message": "Homeownership required"},
            ]
        },

        "soft_rules": {
            "logic": "ALL",
            "rules": [
                # Prefer >3yr TIB
                {"id": "ideal_tib_3yrs", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business",
                 "params": {"min": 3}, "severity": "SOFT",
                 "message": "Ideal: 3+ years in business"}
            ]
        },

        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 60,
            "deductions": [{"ruleId": "ideal_tib_3yrs", "points": 10}]
        }
    }

    add_program("Tier 1 Program", 5000, 1000000, 24, 60, policy_tier1)


    # -------------------------------------------------------------------
    # PROGRAM 2 — Tier 2 (Start-Up Program)
    # -------------------------------------------------------------------
    policy_tier2 = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "fico_700", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score",
                 "params": {"min": 700}, "severity": "HARD",
                 "message": "Minimum 700 TransUnion score required"},

                {"id": "tib_2yrs", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business",
                 "params": {"min": 2}, "severity": "HARD",
                 "message": "Minimum 2 years in business required"},

                {"id": "homeowner", "type": "BOOLEAN_IS_TRUE",
                 "field": "guarantors[0].homeowner_flag",
                 "params": {}, "severity": "HARD",
                 "message": "Homeownership required"},
            ]
        },

        "soft_rules": {"logic": "ALL", "rules": []},

        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 55,
            "deductions": []
        }
    }

    add_program("Tier 2 Startup Program", 5000, 75000, 24, 60, policy_tier2)


    # -------------------------------------------------------------------
    # PROGRAM 3 — Tier 3 (Full Financial Review)
    # -------------------------------------------------------------------
    policy_tier3 = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                # 2 years minimum  
                {"id": "tib_2yrs", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business",
                 "params": {"min": 2}, "severity": "HARD",
                 "message": "2+ years in business required"},

                # No California
                {"id": "no_CA", "type": "NOT_IN_LIST",
                 "field": "borrower.state",
                 "params": {"list": ["CA"]}, "severity": "HARD",
                 "message": "Citizens Bank does not lend in California"},

                # medical equipment must be bought by MD/DO/DDS/etc
                {"id": "medical_requires_license", "type": "BOOLEAN_IS_TRUE",
                 "field": "borrower.medical_license_flag",
                 "params": {}, "severity": "HARD",
                 "message": "Medical equipment requires a valid medical license"},
            ]
        },

        "soft_rules": {"logic": "ALL", "rules": []},

        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 50,
            "deductions": []
        }
    }

    add_program("Tier 3 Full Financials Program", 5000, 1000000, 24, 60, policy_tier3)

    db.commit()
    db.close()
    print("Citizens Bank seeded!")


def main():
    seed_citizens()


if __name__ == "__main__":
    main()
