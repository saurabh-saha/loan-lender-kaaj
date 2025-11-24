import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

interface BorrowerForm {
  business_name: string;
  industry: string;
  state: string;
  years_in_business: string;
  annual_revenue: string;
}

interface GuarantorForm {
  name: string;
  fico_score: string;
  bankruptcy_flag: boolean;
  delinquency_flag: boolean;
}

interface LoanForm {
  amount: string;
  term_months: string;
  equipment_type: string;
  equipment_cost: string;
  equipment_year: string;
  equipment_vendor: string;
  equipment_condition: string;
}

const INDUSTRIES = ["Construction", "Manufacturing", "Logistics", "Retail", "Healthcare"];
const STATES = ["CA", "NY", "TX", "FL", "WA"];
const EQUIPMENT_TYPES = ["Excavator", "Forklift", "Truck", "Bulldozer", "Crane"];
const CONDITIONS = ["New", "Used"];
const TERM_OPTIONS = ["24", "36", "48", "60"];

const API = "http://localhost:8000";

export default function ApplicationForm() {
  const [borrower, setBorrower] = useState<BorrowerForm>({
    business_name: "",
    industry: "",
    state: "",
    years_in_business: "",
    annual_revenue: ""
  });

  const [guarantor, setGuarantor] = useState<GuarantorForm>({
    name: "",
    fico_score: "",
    bankruptcy_flag: false,
    delinquency_flag: false
  });

  const [loan, setLoan] = useState<LoanForm>({
    amount: "",
    term_months: "",
    equipment_type: "",
    equipment_cost: "",
    equipment_year: "",
    equipment_vendor: "",
    equipment_condition: ""
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Random generator button logic
  function generateRandom() {
    setBorrower({
      business_name: "BizCorp " + Math.floor(Math.random() * 1000),
      industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
      state: STATES[Math.floor(Math.random() * STATES.length)],
      years_in_business: (Math.random() * 10 + 1).toFixed(1),
      annual_revenue: (Math.random() * 900000 + 100000).toFixed(0)
    });

    setGuarantor({
      name: "John Doe " + Math.floor(Math.random() * 100),
      fico_score: (Math.random() * 200 + 600).toFixed(0),
      bankruptcy_flag: false,
      delinquency_flag: false
    });

    setLoan({
      amount: (Math.random() * 200000 + 5000).toFixed(0),
      term_months: TERM_OPTIONS[Math.floor(Math.random() * TERM_OPTIONS.length)],
      equipment_type: EQUIPMENT_TYPES[Math.floor(Math.random() * EQUIPMENT_TYPES.length)],
      equipment_cost: (Math.random() * 300000 + 10000).toFixed(0),
      equipment_year: (Math.floor(Math.random() * 10) + 2015).toString(),
      equipment_vendor: "Vendor " + Math.floor(Math.random() * 50),
      equipment_condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
    });
  }

  function validate(): string | null {
    if (!borrower.business_name.trim()) return "Business name is required";
    if (!borrower.industry) return "Industry is required";
    if (!borrower.state) return "State is required";

    const years = Number(borrower.years_in_business);
    if (isNaN(years) || years < 0) return "Years in business must be a non-negative number";

    const revenue = Number(borrower.annual_revenue);
    if (isNaN(revenue) || revenue <= 0) return "Annual revenue must be a positive number";

    if (!guarantor.name.trim()) return "Guarantor name is required";

    const fico = Number(guarantor.fico_score);
    if (isNaN(fico) || fico < 300 || fico > 850) return "FICO score must be between 300 and 850";

    const amount = Number(loan.amount);
    if (isNaN(amount) || amount <= 0) return "Loan amount must be a positive number";

    if (!loan.term_months) return "Term in months is required";
    const term = Number(loan.term_months);
    if (isNaN(term) || term <= 0) return "Term months must be a positive number";

    if (!loan.equipment_type) return "Equipment type is required";

    const cost = Number(loan.equipment_cost);
    if (isNaN(cost) || cost <= 0) return "Equipment cost must be a positive number";

    if (loan.equipment_year) {
      const year = Number(loan.equipment_year);
      if (isNaN(year) || year < 1990 || year > new Date().getFullYear()) {
        return "Equipment year must be a valid year";
      }
    }

    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const payload = {
        borrower: {
          ...borrower,
          years_in_business: Number(borrower.years_in_business),
          annual_revenue: Number(borrower.annual_revenue),
        },
        guarantors: [
          {
            ...guarantor,
            fico_score: Number(guarantor.fico_score),
          },
        ],
        loan_request: {
          ...loan,
          amount: Number(loan.amount),
          term_months: Number(loan.term_months),
          equipment_cost: Number(loan.equipment_cost),
          equipment_year: loan.equipment_year
            ? Number(loan.equipment_year)
            : null,
        },
      };

      const res = await axios.post(`${API}/applications/`, payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Something went wrong");
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        Loan Application Form
      </h1>

      {/* 🔹 Random generator button */}
      <button
        type="button"
        onClick={generateRandom}
        style={{
          background: "#10b981",
          color: "white",
          padding: "0.6rem 1.0rem",
          borderRadius: "6px",
          marginBottom: "1.2rem",
          cursor: "pointer",
          fontSize: "1rem"
        }}
      >
        Generate Random Application
      </button>

      {error && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem",
            background: "#fee2e2",
            borderRadius: "6px",
            color: "#991b1b",
            fontSize: "0.9rem"
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          background: "#f9f9f9",
          padding: "1.5rem",
          borderRadius: "8px",
        }}
      >
        {/* Borrower Section */}
        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
            Borrower Information
          </h2>

          {/* Business Name */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Business Name</label>
            <input
              value={borrower.business_name}
              onChange={(e) =>
                setBorrower({ ...borrower, business_name: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Industry */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Industry</label>
            <select
              value={borrower.industry}
              onChange={(e) =>
                setBorrower({ ...borrower, industry: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            >
              <option value="">Select Industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>State</label>
            <select
              value={borrower.state}
              onChange={(e) =>
                setBorrower({ ...borrower, state: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            >
              <option value="">Select State</option>
              {STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Years in business */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Years in Business
            </label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={borrower.years_in_business}
              onChange={(e) =>
                setBorrower({ ...borrower, years_in_business: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Annual Revenue */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Annual Revenue
            </label>
            <input
              type="number"
              min={0}
              value={borrower.annual_revenue}
              onChange={(e) =>
                setBorrower({ ...borrower, annual_revenue: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
        </section>

        {/* Guarantor Section */}
        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
            Guarantor Information
          </h2>

          {/* Name */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Name</label>
            <input
              value={guarantor.name}
              onChange={(e) =>
                setGuarantor({ ...guarantor, name: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* FICO Score */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              FICO Score
            </label>
            <input
              type="number"
              min={300}
              max={850}
              value={guarantor.fico_score}
              onChange={(e) =>
                setGuarantor({ ...guarantor, fico_score: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Flags */}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
            <label>
              <input
                type="checkbox"
                checked={guarantor.bankruptcy_flag}
                onChange={(e) =>
                  setGuarantor({
                    ...guarantor,
                    bankruptcy_flag: e.target.checked
                  })
                }
                style={{ marginRight: "0.5rem" }}
              />
              Bankruptcy Flag
            </label>
            <label>
              <input
                type="checkbox"
                checked={guarantor.delinquency_flag}
                onChange={(e) =>
                  setGuarantor({
                    ...guarantor,
                    delinquency_flag: e.target.checked
                  })
                }
                style={{ marginRight: "0.5rem" }}
              />
              Delinquency Flag
            </label>
          </div>
        </section>

        {/* Loan Section */}
        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
            Loan Request
          </h2>

          {/* Amount */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Amount</label>
            <input
              type="number"
              min={0}
              value={loan.amount}
              onChange={(e) =>
                setLoan({ ...loan, amount: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Term Months */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Term (Months)
            </label>
            <select
              value={loan.term_months}
              onChange={(e) =>
                setLoan({ ...loan, term_months: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            >
              <option value="">Select Term</option>
              {TERM_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Type */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Equipment Type
            </label>
            <select
              value={loan.equipment_type}
              onChange={(e) =>
                setLoan({ ...loan, equipment_type: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            >
              <option value="">Select Equipment</option>
              {EQUIPMENT_TYPES.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Cost */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Equipment Cost
            </label>
            <input
              type="number"
              min={0}
              value={loan.equipment_cost}
              onChange={(e) =>
                setLoan({ ...loan, equipment_cost: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Equipment Year */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Equipment Year
            </label>
            <input
              type="number"
              value={loan.equipment_year}
              onChange={(e) =>
                setLoan({ ...loan, equipment_year: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Equipment Vendor */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Equipment Vendor
            </label>
            <input
              value={loan.equipment_vendor}
              onChange={(e) =>
                setLoan({ ...loan, equipment_vendor: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Equipment Condition */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Equipment Condition
            </label>
            <select
              value={loan.equipment_condition}
              onChange={(e) =>
                setLoan({ ...loan, equipment_condition: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            >
              <option value="">Select Condition</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </section>

        <button
          type="submit"
          style={{
            background: "#2563eb",
            color: "white",
            padding: "0.75rem",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Submit Application
        </button>
      </form>

      {/* Results */}
      {result && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#e0ffe0",
            borderRadius: "6px",
          }}
        >
          <strong>Application Submitted!</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
