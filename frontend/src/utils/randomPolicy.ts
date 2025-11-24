export function generateRandomPolicy() {
    const fields = [
      "borrower.years_in_business",
      "borrower.annual_revenue",
      "guarantors[0].fico_score",
      "loan_request.amount",
      "loan_request.term_months",
      "loan_request.equipment_type",
      "borrower.state",
      "borrower.industry"
    ];
  
    const equipmentTypes = ["Excavator", "Truck", "Forklift", "Crane", "Bulldozer"];
    const states = ["CA", "TX", "FL", "NY", "WA", "GA"];
    const industries = ["Construction", "Manufacturing", "Logistics", "Retail", "Healthcare"];
  
    function randomRule(idPrefix: string, severity: "HARD" | "SOFT") {
      const field = fields[Math.floor(Math.random() * fields.length)];
  
      const type = ["MIN_VALUE", "MAX_VALUE", "IN_LIST", "NOT_IN_LIST"][
        Math.floor(Math.random() * 4)
      ];
  
      let params: any = {};
  
      if (type === "MIN_VALUE") {
        params = { min: Math.floor(Math.random() * 200000 + 1000) };
      } else if (type === "MAX_VALUE") {
        params = { max: Math.floor(Math.random() * 300000 + 20000) };
      } else if (type === "IN_LIST" || type === "NOT_IN_LIST") {
        params = {
          list: field.includes("equipment")
            ? equipmentTypes.slice(0, Math.floor(Math.random() * equipmentTypes.length))
            : field.includes("state")
            ? states.slice(0, Math.floor(Math.random() * states.length))
            : industries.slice(0, Math.floor(Math.random() * industries.length))
        };
      }
  
      return {
        id: `${idPrefix}_${Math.floor(Math.random() * 100000)}`,
        type,
        field,
        params,
        severity,
        message: `Failed ${type} check on ${field}`
      };
    }
  
    // Generate random sets of rules
    const hardRules = Array.from({ length: 3 }, () => randomRule("HARD", "HARD"));
    const softRules = Array.from({ length: 3 }, () => randomRule("SOFT", "SOFT"));
  
    // Generate scoring config
    const scoring = {
      base_score: 100,
      min_accept_score: 60,
      deductions: [
        {
          ruleId: softRules[Math.floor(Math.random() * softRules.length)].id,
          points: Math.floor(Math.random() * 20 + 5)
        }
      ]
    };
  
    return {
      hard_rules: {
        logic: "ALL",
        rules: hardRules
      },
      soft_rules: {
        logic: "ALL",
        rules: softRules
      },
      scoring_config: scoring
    };
  }
  