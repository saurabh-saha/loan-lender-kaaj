import { useEffect, useState } from "react";
import axios from "axios";
import type { FormEvent } from "react";
import { generateRandomPolicy } from "../utils/randomPolicy";

const API = "http://localhost:8000";

interface Lender {
  id: number;
  name: string;
}

interface Program {
  id: number;
  lender_id: number;
  name: string;
}

interface Rule {
  id: string;
  type: string;
  field: string;
  params: Record<string, any>;
  severity: string;
  message: string;
}

export default function PolicyBuilder() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  const [selectedLender, setSelectedLender] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");

  const [hardRules, setHardRules] = useState<Rule[]>([]);
  const [softRules, setSoftRules] = useState<Rule[]>([]);

  const [newRule, setNewRule] = useState<Rule>({
    id: "",
    type: "MIN_VALUE",
    field: "",
    params: { min: "" },
    severity: "HARD",
    message: ""
  });

  const [scoreConfig, setScoreConfig] = useState({
    base_score: 100,
    min_accept_score: 60,
    deduction_rule_id: "",
    deduction_points: 10
  });

  const [error, setError] = useState("");

  // Load lenders + programs
  useEffect(() => {
    axios.get(`${API}/policies/lenders`).then((res) => setLenders(res.data));
    axios.get(`${API}/policies/programs`).then((res) => setPrograms(res.data));
  }, []);

  // Add rule to appropriate bucket
  function addRule() {
    if (!newRule.id || !newRule.field || !newRule.message) {
      setError("Fill rule ID, field and message");
      return;
    }

    if (newRule.severity === "HARD") {
      setHardRules((prev) => [...prev, newRule]);
    } else {
      setSoftRules((prev) => [...prev, newRule]);
    }

    setNewRule({
      id: "",
      type: "MIN_VALUE",
      field: "",
      params: { min: "" },
      severity: "HARD",
      message: ""
    });
    setError("");
  }

  // Construct final payload
  const policyPayload = {
    lender_program_id: Number(selectedProgram),
    version: 1,
    is_active: true,
    policy_json: {
      hard_rules: {
        logic: "ALL",
        rules: hardRules
      },
      soft_rules: {
        logic: "ALL",
        rules: softRules
      },
      scoring_config: {
        base_score: Number(scoreConfig.base_score),
        min_accept_score: Number(scoreConfig.min_accept_score),
        deductions: scoreConfig.deduction_rule_id
          ? [
              {
                ruleId: scoreConfig.deduction_rule_id,
                points: Number(scoreConfig.deduction_points),
              }
            ]
          : []
      }
    }
  };

  async function submitPolicy(e: FormEvent) {
    e.preventDefault();
    if (!selectedProgram) {
      setError("Please select a program");
      return;
    }

    try {
      await axios.post(`${API}/policies/`, policyPayload);
      alert("Policy created!");
    } catch (err: any) {
      console.error(err);
      setError("Failed to create policy.");
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        Policy Builder
      </h1>

      {/* Select Lender */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontWeight: "bold" }}>Select Lender</label>
        <select
          value={selectedLender}
          onChange={(e) => {
            setSelectedLender(e.target.value);
            setSelectedProgram("");
          }}
          style={{ width: "100%", padding: "0.5rem" }}
        >
          <option value="">Choose lender</option>
          {lenders.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Select Program */}
      {selectedLender && (
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Select Program</label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">Choose program</option>
            {programs
              .filter((p) => p.lender_id === Number(selectedLender))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>
      )}
      
      <button
  type="button"
  onClick={() => {
    const randomPolicy = generateRandomPolicy();
    setHardRules(randomPolicy.hard_rules.rules);
    setSoftRules(randomPolicy.soft_rules.rules);
    setScoreConfig({
      base_score: randomPolicy.scoring_config.base_score,
      min_accept_score: randomPolicy.scoring_config.min_accept_score,
      deduction_rule_id: randomPolicy.scoring_config.deductions[0]?.ruleId || "",
      deduction_points: randomPolicy.scoring_config.deductions[0]?.points || 10
    });
  }}
  style={{
    background: "#10b981",
    color: "white",
    padding: "0.6rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "1rem"
  }}
>
  Generate Random Policy
  </button>
  
      {/* RULE BUILDER */}
      <div
        style={{
          background: "#f9fafb",
          padding: "1.25rem",
          borderRadius: "8px",
          marginTop: "1.5rem"
        }}
      >
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Add Rule</h2>

        {error && (
          <div style={{ background: "#fee2e2", padding: "0.75rem", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        {/* Rule fields */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Rule ID</label>
          <input
            value={newRule.id}
            onChange={(e) => setNewRule({ ...newRule, id: e.target.value })}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Rule Type</label>
          <select
            value={newRule.type}
            onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="MIN_VALUE">MIN_VALUE</option>
            <option value="MAX_VALUE">MAX_VALUE</option>
            <option value="IN_LIST">IN_LIST</option>
            <option value="NOT_IN_LIST">NOT_IN_LIST</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Field</label>
          <input
            value={newRule.field}
            onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {/* Params */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Params (min/max/list)</label>
          <input
            value={JSON.stringify(newRule.params)}
            onChange={(e) =>
              setNewRule({ ...newRule, params: JSON.parse(e.target.value) })
            }
            style={{ width: "100%", padding: "0.5rem" }}
          />
          <small>Example: {"{ \"min\": 700 }"} or {"{ \"list\": [\"CA\",\"TX\"] }"}</small>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Severity</label>
          <select
            value={newRule.severity}
            onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="HARD">HARD</option>
            <option value="SOFT">SOFT</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Message</label>
          <input
            value={newRule.message}
            onChange={(e) => setNewRule({ ...newRule, message: e.target.value })}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button
          onClick={addRule}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Add Rule
        </button>
      </div>

      {/* RULE LISTS */}
      <h3 style={{ marginTop: "2rem" }}>Hard Rules</h3>
      <pre>{JSON.stringify(hardRules, null, 2)}</pre>

      <h3>Soft Rules</h3>
      <pre>{JSON.stringify(softRules, null, 2)}</pre>

      {/* SCORING CONFIG */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Scoring Config</h2>

        <label>Base Score</label>
        <input
          value={scoreConfig.base_score}
          onChange={(e) =>
            setScoreConfig({ ...scoreConfig, base_score: Number(e.target.value) })
          }
          style={{ width: "100%", padding: "0.5rem" }}
        />

        <label>Minimum Accept Score</label>
        <input
          value={scoreConfig.min_accept_score}
          onChange={(e) =>
            setScoreConfig({
              ...scoreConfig,
              min_accept_score: Number(e.target.value),
            })
          }
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
        />

        <label>Deduction Rule ID</label>
        <input
          value={scoreConfig.deduction_rule_id}
          onChange={(e) =>
            setScoreConfig({ ...scoreConfig, deduction_rule_id: e.target.value })
          }
          style={{ width: "100%", padding: "0.5rem" }}
        />

        <label>Points Deducted</label>
        <input
          value={scoreConfig.deduction_points}
          onChange={(e) =>
            setScoreConfig({
              ...scoreConfig,
              deduction_points: Number(e.target.value),
            })
          }
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      {/* Final JSON Preview */}
      <h2 style={{ marginTop: "2rem" }}>Final Policy JSON</h2>
      <pre style={{ background: "#f3f4f6", padding: "1rem", borderRadius: "8px" }}>
        {JSON.stringify(policyPayload, null, 2)}
      </pre>

      {/* Submit */}
      <button
        onClick={submitPolicy}
        style={{
          marginTop: "2rem",
          background: "#16a34a",
          color: "white",
          padding: "0.8rem 1.5rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "1rem"
        }}
      >
        Create Policy
      </button>
    </div>
  );
}
