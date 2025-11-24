import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

interface LoanRequest {
  id: number;
  borrower_id: number;
  amount: number;
  term_months: number;
  equipment_type: string;
}

interface UnderwritingResponse {
    id: number;                 // match run id
    loan_request_id: number;    // the application associated
    status: string;             // RUNNING / COMPLETE
  }
  

export default function UnderwritingRunner() {
  const [applications, setApplications] = useState<LoanRequest[]>([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [result, setResult] = useState<UnderwritingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load all loan requests
  useEffect(() => {
    axios
      .get(`${API}/applications`)
      .then((res) => setApplications(res.data))
      .catch(() => setError("Failed to load applications"));
  }, []);

  async function runUnderwriting() {
    if (!selectedApp) {
      setError("Please select an application");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API}/underwriting/run/${selectedApp}`
      );
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to run underwriting");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1.25rem" }}>
        Run Underwriting
      </h1>

      {/* Select application */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: "bold", marginBottom: "0.5rem", display: "block" }}>
          Select Application
        </label>
        <select
          value={selectedApp}
          onChange={(e) => setSelectedApp(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        >
          <option value="">Choose...</option>
          {applications.map((app) => (
            <option key={app.id} value={app.id}>
              #{app.id} – {app.equipment_type} (${app.amount})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={runUnderwriting}
        disabled={loading}
        style={{
          background: loading ? "#9ca3af" : "#2563eb",
          color: "white",
          padding: "0.6rem 1.2rem",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "1rem",
        }}
      >
        {loading ? "Running..." : "Run Underwriting"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "1rem",
            background: "#fee2e2",
            padding: "0.75rem",
            borderRadius: "6px",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {/* Underwriting Result */}
      {result && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#ecfdf5",
            borderRadius: "6px",
          }}
        >
          <h2>Underwriting Started</h2>
          <p><strong>Match Run ID:</strong> {result.id}</p>

          <button
            onClick={() =>
              window.location.href = `/results/${result.id}`
            }
            style={{
              background: "#059669",
              color: "white",
              padding: "0.6rem 1.2rem",
              borderRadius: "6px",
              marginTop: "1rem",
            }}
          >
            View Results
          </button>
        </div>
      )}
    </div>
  );
}
