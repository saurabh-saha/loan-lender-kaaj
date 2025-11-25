from app.db import SessionLocal
from app.models.lender_policy import Lender, LenderProgram, LenderPolicy

# -------------------------------------------------------------------------------------
# Stearns Bank — Equipment Finance
# Based on: EF Credit Box 4.14.2025 (Tier 1/2/3 FICO, TIB, Paynet + restrictions)
# -------------------------------------------------------------------------------------

RESTRICTED_INDUSTRIES = [
    "Gaming", "Gambling", "Hazmat", "Oil & Gas", "MSB", "Adult Entertainment",
    "Non-Essential", "Weapons", "Firearms", "Beauty", "Tanning", "Tattoo",
    "Piercing", "Aesthetic", "Real Estate", "OTR", "Restaurants", "Car Wash",
]


def seed_stearns():
    db = SessionLocal()

    # Prevent duplicate seeding
    existing = db.query(Lender).filter(Lender.name == "Stearns Bank Final").first()
    if existing:
        print("Stearns already seeded — skipping.")
        db.close()
        return

    # -----------------------------------------
    # LENDER
    # -----------------------------------------
    lender = Lender(name="Stearns Bank Final", active=True)
    db.add(lender)
    db.flush()

    # -----------------------------------------
    # Helper to add program + policy
    # -----------------------------------------
    def add_program(name, min_amt, max_amt, min_term, max_term, policy_json):
        program = LenderProgram(
            lender_id=lender.id,
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

    # =====================================================================================
    # TIER 1
    # =====================================================================================

    policy_tier1 = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                # FICO 725+
                {"id": "fico_725", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score", "params": {"min": 725},
                 "severity": "HARD", "message": "Minimum FICO 725 required"},
                # TIB 3+
                {"id": "tib_3", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business", "params": {"min": 3},
                 "severity": "HARD", "message": "Minimum 3 years in business"},
                # Paynet 685+
                {"id": "paynet_685", "type": "MIN_VALUE",
                 "field": "borrower.paynet_score", "params": {"min": 685},
                 "severity": "HARD", "message": "Minimum PayNet 685 required"},
                # No bankruptcy last 7 years
                {"id": "no_bk_7yrs", "type": "NOT_IN_LIST",
                 "field": "guarantors[0].bankruptcy_flag",
                 "params": {"list": [True]},
                 "severity": "HARD", "message": "No bankruptcies in last 7 years"},
                # Industry restrictions
                {"id": "restricted_industries", "type": "NOT_IN_LIST",
                 "field": "borrower.industry",
                 "params": {"list": RESTRICTED_INDUSTRIES},
                 "severity": "HARD", "message": "Restricted industry not allowed"},
            ]
        },
        "soft_rules": {"logic": "ALL", "rules": []},
        "scoring_config": {"base_score": 100, "min_accept_score": 70, "deductions": []}
    }

    add_program(
        "Tier 1",
        min_amt=5000,
        max_amt=500000,
        min_term=12,
        max_term=60,
        policy_json=policy_tier1
    )

    # =====================================================================================
    # TIER 2
    # =====================================================================================

    policy_tier2 = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "fico_710", "type": "MIN_VALUE",
                "field": "guarantors[0].fico_score", "params": {"min": 710},
                "severity": "HARD", "message": "Minimum FICO 710 required"},

                {"id": "tib_3", "type": "MIN_VALUE",
                "field": "borrower.years_in_business", "params": {"min": 3},
                "severity": "HARD", "message": "Minimum 3 years in business"},

                {"id": "paynet_675", "type": "MIN_VALUE",
                "field": "borrower.paynet_score", "params": {"min": 675},
                "severity": "HARD", "message": "Minimum PayNet 675 required"},

                {"id": "no_bk_7yrs", "type": "NOT_IN_LIST",
                "field": "guarantors[0].bankruptcy_flag",
                "params": {"list": [True]},
                "severity": "HARD", "message": "No bankruptcies in last 7 years"},

                {"id": "restricted", "type": "NOT_IN_LIST",
                "field": "borrower.industry",
                "params": {"list": RESTRICTED_INDUSTRIES},
                "severity": "HARD", "message": "Restricted industry not allowed"},
            ]
        },
        "soft_rules": {"logic": "ALL", "rules": []},
        "scoring_config": {"base_score": 100, "min_accept_score": 65, "deductions": []}
    }

    add_program(
        "Tier 2",
        min_amt=5000,
        max_amt=300000,
        min_term=12,
        max_term=60,
        policy_json=policy_tier2
    )

    # =====================================================================================
    # TIER 3
    # =====================================================================================

    policy_tier3 = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "fico_700", "type": "MIN_VALUE",
                "field": "guarantors[0].fico_score", "params": {"min": 700},
                "severity": "HARD", "message": "Minimum FICO 700 required"},

                {"id": "tib_2", "type": "MIN_VALUE",
                "field": "borrower.years_in_business", "params": {"min": 2},
                "severity": "HARD", "message": "Minimum 2 years in business"},

                {"id": "paynet_665", "type": "MIN_VALUE",
                "field": "borrower.paynet_score", "params": {"min": 665},
                "severity": "HARD", "message": "Minimum PayNet 665 required"},

                {"id": "no_bk_7yrs", "type": "NOT_IN_LIST",
                "field": "guarantors[0].bankruptcy_flag",
                "params": {"list": [True]},
                "severity": "HARD", "message": "No bankruptcies in last 7 years"},

                {"id": "restricted", "type": "NOT_IN_LIST",
                "field": "borrower.industry",
                "params": {"list": RESTRICTED_INDUSTRIES},
                "severity": "HARD", "message": "Restricted industry not allowed"},
            ]
        },
        "soft_rules": {"logic": "ALL", "rules": []},
        "scoring_config": {"base_score": 100, "min_accept_score": 60, "deductions": []}
    }


    add_program(
        "Tier 3",
        min_amt=5000,
        max_amt=150000,
        min_term=12,
        max_term=60,
        policy_json=policy_tier3
    )

    # -----------------------------------------
    # Commit
    # -----------------------------------------
    db.commit()
    db.close()
    print("Stearns Bank seeded successfully!")


def main():
    seed_stearns()


if __name__ == "__main__":
    main()
