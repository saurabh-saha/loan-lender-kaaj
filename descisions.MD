---

# Loan Lender Matching System**

This document explains the major engineering decisions, simplifying assumptions, and areas for future improvement for the **Loan Underwriting & Lender Matching System**.

---

# 1. **Policy Modeling Decisions**

### **1.1 Chosen Approach: JSON-Based Rule Engine**

Lender credit boxes vary wildly. To avoid rigid SQL schemas requiring migrations for every new policy change, I used a **JSON rule engine** with:

* `hard_rules` (ALL must pass)
* `soft_rules` (affect fit score)
* `scoring_config` (base score, minimum acceptance score, deductions)

Each rule has:

```json
{
  "id": "min_fico",
  "type": "MIN_VALUE",
  "field": "guarantor.primary.fico_score",
  "params": { "min": 680 },
  "severity": "HARD",
  "message": "Minimum FICO score is 680"
}
```

This makes the system:

* Easy to extend
* Easy to edit
* Suitable for programmatic PDF-to-policy parsing
* Flexible enough for any lender guideline

### **1.2 Criteria Supported**

Included according to assignment:

* FICO min/max
* PayNet min
* Time in business
* Loan amount limits
* Industry approvals/denials
* State restrictions
* Equipment types
* Revenue & financial checks

The `field` path approach allows extensibility without schema changes.

---

# 2. **Underwriting Engine Decisions**

### **2.1 Application Profile**

The backend aggregates:

* Borrower
* Guarantors
* Business credit
* Loan request

into a single dictionary used by the rule evaluator.
This flattening ensures rules operate on a unified predictable structure.

### **2.2 Rule Evaluation Strategy**

Rules are evaluated with:

* Dynamic field resolution (`borrower.years_in_business`)
* Strict hard-rule enforcement
* Soft-rule scoring deductions

### **2.3 Fit Score**

If soft rules exist:

```
fit_score = base_score - deductions
```

Else:

```
fit_score = base_score
```

### **2.4 Ranking**

Lenders are ranked by:

1. Eligible first
2. Highest fit score next

---

# 3. **Schema Decisions**

### **3.1 Normalized Entities**

We used:

* Lender
* Lender Program
* Lender Policy
* Borrower
* Guarantor
* Loan Request
* Business Credit
* Match Run
* Match Result

Each entity is separate to keep the system modifiable:

* Lenders can have multiple programs
* Each program has its own policy version
* Policies can be activated/deactivated

---

# 4. **Simplifications Made**

### **4.1 PDF Parsing**

A full NLP-based PDF parser (e.g., with LangChain or OCR) was not implemented due to time.
Instead, the system is structured to accept **policy JSON** output from an external PDF parser.

### **4.2 Multi-Guarantor Scoring**

Only primary guarantor is used for certain checks (FICO).

### **4.3 No Hatchet Orchestration**

Underwriting runs synchronously; designed so workflow engines can plug in later.

---

# 5. **What More To do**

### **5.1 Real PDF Extraction Engine**

* Use LLM parsing agents
* Auto-map text → rules
* Auto-detect equipment restrictions
* Generate policy JSON automatically

### **5.2 Hatchet Workflow Integration**

* Parallel lender evaluation
* Retries for external credit pulls
* Background job tracking
* Progress dashboard

### **5.3 UI Improvements**

* Fit score gauge
* Color-coded rule breakdown
* “Best lender match” card
* Export results to PDF

### **5.4 Unit Tests**

* Rule evaluator
* Policy scoring
* Field resolver
* End-to-end underwriting tests

### **5.5 Historical Policy Versioning**

* Activate/deactivate policy versions
* Audit trail for guideline changes

---