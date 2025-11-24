## Overview

This project implements a **loan underwriting and lender-matching platform** that evaluates business loan applications against multiple lender credit policies.

The system:

* Stores lender policies in a **normalized + JSON rule engine** format
* Accepts business loan applications
* Runs underwriting (rule checks + scoring)
* Produces lender matches
* Has a full React UI to view and manage applications, lenders, programs, and policies
* Includes a match results viewer with rule-level explanations

# 🛠️ **Tech Stack**

### **Backend**

* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* Docker Compose

### **Frontend**

* React + Vite + TypeScript
* Axios
* React Router DOM

---

# **Database Setup**

The project uses PostgreSQL via Docker Compose.

### Start DB, Backend, Frontend

```
docker compose up -d
```


Backend runs at:

```
http://localhost:8000
```

Frontend runs at:

```
http://localhost:5173
```

---

# ** Features**

### ✔ Loan Application Submission

Captures borrower info, guarantors, and loan request details.

### ✔ Lender + Program Management

Add / View lenders
Add / View lending programs

### ✔ Policy Builder

JSON-based rule engine with:

* Hard rules (must pass)
* Soft rules (score deductions)
* Rule types (MIN_VALUE, MAX_VALUE, IN_LIST, NOT_IN_LIST)
* Scoring configuration

Includes **random policy generator** for quick testing.

### ✔ Underwriting Engine

* Builds full application profile
* Evaluates all active lenders
* Computes rule results
* Scores soft rule deductions
* Stores match results
* Returns ranked lender list

### ✔ Match Results Page

Shows:

* Eligibility
* Fit score
* Reasons for rejection
* Rule-by-rule breakdown

---

# **Key API Endpoints**

```
http://localhost:8000/docs - APIs
```

---
