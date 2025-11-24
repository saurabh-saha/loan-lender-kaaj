import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

interface MatchResult {
  lender_id: number;
  lender_program_id: number;
  eligible: boolean;
  fit_score: number;
  reasons: string[];
  rule_results: {
    hard: any[];
    soft: any[];
  };
}

interface MatchRun {
  id: number;
  loan_request_id: number;
  status: string;
  results: MatchResult[];
}

export default function ResultsPage() {
  const { matchRunId } = useParams();
  const [data, setData] = useState<MatchRun | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/underwriting/runs/${matchRunId}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load match results"));
  }, [matchRunId]);

  if (error)
    return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;

  if (!data)
    return <div style={{ padding: "2rem" }}>Loading results...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Match Results for Run #{data.id}</h1>
      <p>Status: {data.status}</p>

      <h2 style={{ marginTop: "2rem" }}>Lender Evaluations</h2>

      {data.results.map((r, idx) => (
        <div
          key={idx}
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "8px"
          }}
        >
          <h3>
            Lender {r.lender_id} (Program {r.lender_program_id})
          </h3>
          <p>
            <strong>Eligible:</strong>{" "}
            {r.eligible ? "✔ YES" : "❌ NO"}
          </p>
          <p>
            <strong>Fit Score:</strong> {r.fit_score}
          </p>

          {!r.eligible && (
            <>
              <p><strong>Reasons:</strong></p>
              <ul>
                {r.reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </>
          )}

          <details style={{ marginTop: "1rem" }}>
            <summary>Rule Results</summary>
            <pre>{JSON.stringify(r.rule_results, null, 2)}</pre>
          </details>
        </div>
      ))}
    </div>
  );
}
