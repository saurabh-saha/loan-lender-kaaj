import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

// -----------------------------
// Helpers
// -----------------------------
function formatUSD(value: string | number) {
  if (!value) return "";
  const num = Number(String(value).replace(/[^0-9]/g, ""));
  if (isNaN(num)) return "";
  return num.toLocaleString("en-US");
}

function parseUSD(value: string) {
  return Number(value.replace(/[^0-9]/g, "")) || 0;
}

// -----------------------------

interface BorrowerForm {
  business_name: string;
  industry: string;
  state: string;
  years_in_business: string;
  annual_revenue: string;
  medical_license_flag: boolean;
  paynet_score: string;
}

interface GuarantorForm {
  name: string;
  fico_score: string;
  homeowner_flag: boolean;
  bankruptcy_flag: boolean;
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
  const states = ["NY", "TX", "FL", "WA", "GA", "CA"];

  const industries = [
    "Construction",
    "Manufacturing",
    "Trucking",
    "Logging",
    "Commercial Services",
    "Industrial Machinery",
    "Woodworking",
    "General Business"
  ];
  
  const equipmentTypes = [
    "Class 8 Truck",
    "Trailer",
    "Reefer Trailer",
    "Machine Tool",
    "Woodworking Machine",
    "Industrial Equipment",
    "Commercial Vehicle",
    "General Equipment"
  ];
  
  const conditions = ["New", "Used"];
  
  const yearsList = Array.from({ length: 15 }, (_, i) => 2025 - i); // respects equipment age checks
  
  

  const API = "http://localhost:8000";

  const [borrower, setBorrower] = useState<BorrowerForm>({
    business_name: "",
    industry: industries[0],
    state: states[0],
    years_in_business: "",
    annual_revenue: "",
    medical_license_flag: false,
    paynet_score: "",
  });

  const [guarantor, setGuarantor] = useState<GuarantorForm>({
    name: "",
    fico_score: "",
    homeowner_flag: false,  
    bankruptcy_flag: false,
  });

  const [loan, setLoan] = useState<LoanForm>({
    amount: "",
    term_months: "",
    equipment_type: equipmentTypes[0],
    equipment_cost: "",
    equipment_year: yearsList[0].toString(),
    equipment_vendor: "",
    equipment_condition: conditions[0],
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  // -----------------------------
  // Random Data Button
  // -----------------------------
  function generateRandom() {
    setBorrower({
      business_name: "BizCorp " + Math.floor(Math.random() * 1000),
      industry: industries[Math.floor(Math.random() * industries.length)],
      state: states[Math.floor(Math.random() * states.length)],
      years_in_business: (Math.random() * 10 + 1).toFixed(1),
      annual_revenue: formatUSD(Math.floor(Math.random() * 900000 + 100000)),
      medical_license_flag: Math.random() > 0.5,
      paynet_score: (Math.random() * 300 + 500).toFixed(0),
    });

    setGuarantor({
      name: "John Doe " + Math.floor(Math.random() * 100),
      fico_score: (Math.random() * 200 + 600).toFixed(0),
      homeowner_flag: Math.random() > 0.5,
      bankruptcy_flag: Math.random() > 0.85, 
    });

    setLoan({
      amount: formatUSD(Math.floor(Math.random() * 200000 + 5000)),
      term_months: ["24", "36", "48", "60"][Math.floor(Math.random() * 4)],
      equipment_type: equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)],
      equipment_cost: formatUSD(Math.floor(Math.random() * 300000 + 10000)),
      equipment_year: yearsList[Math.floor(Math.random() * yearsList.length)].toString(),
      equipment_vendor: "Vendor " + Math.floor(Math.random() * 50),
      equipment_condition: conditions[Math.floor(Math.random() * conditions.length)],
    });
  }

  // -----------------------------
  // Submit Form
  // -----------------------------
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const payload = {
        borrower: {
          ...borrower,
          years_in_business: Number(borrower.years_in_business),
          annual_revenue: parseUSD(borrower.annual_revenue),
          medical_license_flag: borrower.medical_license_flag,
          paynet_score: Number(borrower.paynet_score),
        },
        guarantors: [
          {
            ...guarantor,
            fico_score: Number(guarantor.fico_score),
            homeowner_flag: guarantor.homeowner_flag,
            bankruptcy_flag: Boolean(guarantor.bankruptcy_flag),
          },
        ],
        loan_request: {
          ...loan,
          amount: parseUSD(loan.amount),
          term_months: Number(loan.term_months),
          equipment_cost: parseUSD(loan.equipment_cost),
          equipment_year: Number(loan.equipment_year),
        },
      };

      const res = await axios.post(`${API}/applications/`, payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data || err.message);
    }
  }

  // -----------------------------
  // Component UI
  // -----------------------------
  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        Loan Application Form
      </h1>

      <button
        type="button"
        onClick={generateRandom}
        style={{
          background: "#10b981",
          color: "white",
          padding: "0.6rem 1rem",
          borderRadius: "6px",
          marginBottom: "1.2rem",
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
        {/* ------------------- Borrower ------------------- */}
        <section>
          <h2 style={{ fontSize: "1.3rem" }}>Borrower</h2>

          {/* Business Name */}
          <div>
            <label>Business Name</label>
            <input
              value={borrower.business_name}
              onChange={(e) =>
                setBorrower({ ...borrower, business_name: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Industry dropdown */}
          <div>
            <label>Industry</label>
            <select
              value={borrower.industry}
              onChange={(e) =>
                setBorrower({ ...borrower, industry: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            >
              {industries.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* State dropdown */}
          <div>
            <label>State</label>
            <select
              value={borrower.state}
              onChange={(e) => setBorrower({ ...borrower, state: e.target.value })}
              style={{ width: "100%", padding: "0.5rem" }}
            >
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Years in Business */}
          <div>
            <label>Years in Business</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={borrower.years_in_business}
              onChange={(e) =>
                setBorrower({ ...borrower, years_in_business: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Annual Revenue (USD formatted) */}
          <div>
            <label>Annual Revenue (USD)</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>$&nbsp;</span>
              <input
                type="text"
                value={borrower.annual_revenue}
                onChange={(e) =>
                    setBorrower({
                    ...borrower,
                    annual_revenue: formatUSD(e.target.value),
                    })
                }
                onBlur={() => {
                    const num = parseUSD(borrower.annual_revenue);
                    if (num > 10000000) {
                    setBorrower({ ...borrower, annual_revenue: formatUSD(10000000) });
                    }
                }}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <label style={{ fontWeight: "bold" }}>
              Medical License (for medical equipment?)
            </label>
            <input
              type="checkbox"
              checked={borrower.medical_license_flag}
              onChange={(e) =>
                setBorrower({ ...borrower, medical_license_flag: e.target.checked })
              }
              style={{ marginLeft: "0.5rem" }}
            />
          </div>

          <div>
            <label>PayNet Score (0–900)</label>
            <input
              type="number"
              min="0"
              max="900"
              value={borrower.paynet_score}
              onChange={(e) =>
                setBorrower({ ...borrower, paynet_score: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

        </section>

        {/* ------------------- Guarantor ------------------- */}
        <section>
          <h2 style={{ fontSize: "1.3rem" }}>Guarantor</h2>

          <div>
            <label>Name</label>
            <input
              value={guarantor.name}
              onChange={(e) =>
                setGuarantor({ ...guarantor, name: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div>
            <label>FICO Score (300–850)</label>
            <input
              type="number"
              min="300"
              max="850"
              value={guarantor.fico_score}
              onChange={(e) =>
                setGuarantor({ ...guarantor, fico_score: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <label style={{ fontWeight: "bold" }}>Homeowner?</label>
            <input
              type="checkbox"
              checked={guarantor.homeowner_flag}
              onChange={(e) =>
                setGuarantor({ ...guarantor, homeowner_flag: e.target.checked })
              }
              style={{ marginLeft: "0.5rem" }}
            />
          </div>

          {/* Bankruptcy Flag */}
          <div style={{ marginTop: "0.5rem" }}>
            <label>
              <input
                type="checkbox"
                checked={guarantor.bankruptcy_flag}
                onChange={(e) =>
                  setGuarantor({ ...guarantor, bankruptcy_flag: e.target.checked })
                }
              />
              &nbsp; Bankruptcy in last 7 years
            </label>
          </div>


        </section>

        {/* ------------------- Loan ------------------- */}
        <section>
          <h2 style={{ fontSize: "1.3rem" }}>Loan Request</h2>

          {/* Loan Amount */}
          <div>
            <label>Loan Amount (USD)</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>$&nbsp;</span>
              <input
                value={loan.amount}
                onChange={(e) =>
                    setLoan({ ...loan, amount: formatUSD(e.target.value) })
                }
                onBlur={() => {
                    const num = parseUSD(loan.amount);
                    if (num > 1000000) setLoan({ ...loan, amount: formatUSD(1000000) });
                    if (num < 1000) setLoan({ ...loan, amount: formatUSD(1000) });
                }}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
          </div>

          {/* Term */}
          <div>
            <label>Term (Months)</label>
            <select
              value={loan.term_months}
              onChange={(e) =>
                setLoan({ ...loan, term_months: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            >
              <option value="">Select</option>
              {[24, 36, 48, 60].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Equipment type dropdown */}
          <div>
            <label>Equipment Type</label>
            <select
              value={loan.equipment_type}
              onChange={(e) =>
                setLoan({ ...loan, equipment_type: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            >
              {equipmentTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Equipment cost (USD) */}
          <div>
            <label>Equipment Cost (USD)</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>$&nbsp;</span>
              <input
                value={loan.equipment_cost}
                onChange={(e) =>
                    setLoan({ ...loan, equipment_cost: formatUSD(e.target.value) })
                }
                onBlur={() => {
                    const num = parseUSD(loan.equipment_cost);
                    if (num > 2000000) setLoan({ ...loan, equipment_cost: formatUSD(2000000) });
                    if (num < 1000) setLoan({ ...loan, equipment_cost: formatUSD(1000) });
                }}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
          </div>

          {/* Equipment year */}
          <div>
            <label>Equipment Year</label>
            <select
              value={loan.equipment_year}
              onChange={(e) =>
                setLoan({ ...loan, equipment_year: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            >
              {yearsList.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label>Vendor</label>
            <input
              value={loan.equipment_vendor}
              onChange={(e) =>
                setLoan({ ...loan, equipment_vendor: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          {/* Condition */}
          <div>
            <label>Condition</label>
            <select
              value={loan.equipment_condition}
              onChange={(e) =>
                setLoan({ ...loan, equipment_condition: e.target.value })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            >
              {conditions.map((c) => (
                <option key={c}>{c}</option>
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
          }}
        >
          Submit Application
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#e0ffe0" }}>
          <strong>Application Submitted!</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#ffe0e0" }}>
          <strong>Error:</strong>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
