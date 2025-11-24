export function generateRandomPolicy() {
    // Field classification
    const numericFields = [
      "borrower.years_in_business",
      "borrower.annual_revenue",
      "guarantors[0].fico_score",
      "loan_request.amount",
      "loan_request.term_months"
    ];
  
    const stringFields = [
      "loan_request.equipment_type",
      "borrower.state",
      "borrower.industry"
    ];
  
    // Allowed lists
    const equipmentTypes = ["Excavator", "Truck", "Forklift", "Crane", "Bulldozer"];
    const states = ["CA", "TX", "FL", "NY", "WA", "GA"];
    const industries = [
      "Construction",
      "Manufacturing",
      "Logistics",
      "Retail",
      "Healthcare"
    ];
  
    /** Generate a safe random rule */
    function randomRule(idPrefix: string, severity: "HARD" | "SOFT") {
      const allFields = [...numericFields, ...stringFields];
      const field = allFields[Math.floor(Math.random() * allFields.length)];
  
      let type: string;
      let params: any = {};
  
      // If numeric → MIN or MAX
      if (numericFields.includes(field)) {
        type = Math.random() > 0.5 ? "MIN_VALUE" : "MAX_VALUE";
  
        if (type === "MIN_VALUE") {
          params = { min: Math.floor(Math.random() * 50000 + 1000) }; // realistic range
        } else {
          params = { max: Math.floor(Math.random() * 50000 + 5000) };
        }
      }
  
      // If string → IN_LIST or NOT_IN_LIST
      else {
        type = Math.random() > 0.5 ? "IN_LIST" : "NOT_IN_LIST";
  
        const source =
          field.includes("equipment")
            ? equipmentTypes
            : field.includes("state")
            ? states
            : industries;
  
        const size = Math.floor(Math.random() * source.length) || 1;
  
        params = { list: source.slice(0, size) };
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
  
    // Generate rules
    const hardRules = Array.from({ length: 3 }, () => randomRule("HARD", "HARD"));
    const softRules = Array.from({ length: 3 }, () => randomRule("SOFT", "SOFT"));
  
    // Scoring
    const scoring = {
      base_score: 100,
      min_accept_score: 60,
      deductions: [
        {
          ruleId: softRules[Math.floor(Math.random() * softRules.length)].id,
          points: Math.floor(Math.random() * 15 + 5)
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
  