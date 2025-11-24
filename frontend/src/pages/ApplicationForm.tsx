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
  const [error, setError] = useState<any>(null);

  const API = "http://localhost:8000";

  // 🔹 Random generator button logic
  function generateRandom() {
    const industries = ["Construction", "Manufacturing", "Retail", "Transport", "Healthcare"];
    const states = ["CA", "NY", "TX", "FL", "WA"];
    const equipmentTypes = ["Excavator", "Forklift", "Truck", "Bulldozer", "Crane"];
    const conditions = ["New", "Used"];

    setBorrower({
      business_name: "BizCorp " + Math.floor(Math.random() * 1000),
      industry: industries[Math.floor(Math.random() * industries.length)],
      state: states[Math.floor(Math.random() * states.length)],
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
      term_months: ["24", "36", "48", "60"][Math.floor(Math.random() * 4)],
      equipment_type: equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)],
      equipment_cost: (Math.random() * 300000 + 10000).toFixed(0),
      equipment_year: (Math.floor(Math.random() * 10) + 2015).toString(),
      equipment_vendor: "Vendor " + Math.floor(Math.random() * 50),
      equipment_condition: conditions[Math.floor(Math.random() * conditions.length)],
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

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
      setError(err.response?.data || err.message || "Something went wrong");
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

          {Object.entries(borrower).map(([key, value]) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>
                {key.replace(/_/g, " ")}
              </label>
              <input
                value={value}
                onChange={(e) =>
                  setBorrower({ ...borrower, [key]: e.target.value })
                }
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
          ))}
        </section>

        {/* Guarantor Section */}
        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
            Guarantor Information
          </h2>

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

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              FICO Score
            </label>
            <input
              value={guarantor.fico_score}
              onChange={(e) =>
                setGuarantor({ ...guarantor, fico_score: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
        </section>

        {/* Loan Section */}
        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
            Loan Request
          </h2>

          {Object.entries(loan).map(([key, value]) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>
                {key.replace(/_/g, " ")}
              </label>
              <input
                value={value}
                onChange={(e) =>
                  setLoan({ ...loan, [key]: e.target.value })
                }
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
          ))}
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

      {error && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#ffe0e0",
            borderRadius: "6px",
          }}
        >
          <strong>Error:</strong>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
