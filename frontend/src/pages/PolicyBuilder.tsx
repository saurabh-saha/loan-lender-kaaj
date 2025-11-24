import { useEffect, useState } from "react";
import axios from "axios";
import type { FormEvent } from "react";
import { generateRandomPolicy } from "../utils/randomPolicy";

const API = "http://localhost:8000";

const FIELD_OPTIONS = [
  "borrower.years_in_business",
  "borrower.annual_revenue",
  "guarantors[0].fico_score",
  "loan_request.amount",
  "loan_request.term_months",
  "loan_request.equipment_type",
  "borrower.state",
  "borrower.industry"
];

const RULE_TYPES = ["MIN_VALUE", "MAX_VALUE", "IN_LIST", "NOT_IN_LIST"];

const LIST_OPTIONS: Record<string, string[]> = {
  "loan_request.equipment_type": ["Excavator", "Truck", "Forklift", "Crane", "Bulldozer"],
  "borrower.state": ["CA", "TX", "FL", "NY", "WA", "GA"],
  "borrower.industry": ["Construction", "Manufacturing", "Logistics", "Retail", "Healthcare"]
};

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
    params: {},
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

  function autoGenerateRuleId() {
    return `${newRule.severity}_${Math.floor(Math.random() * 100000)}`;
  }

  function updateParams(ruleType: string, field: string) {
    if (ruleType === "MIN_VALUE") return { min: 0 };
    if (ruleType === "MAX_VALUE") return { max: 0 };

    // IN_LIST / NOT_IN_LIST
    const list = LIST_OPTIONS[field] || [];
    return { list };
  }

  function addRule() {
    if (!newRule.type || !newRule.field) {
      setError("Fill rule type and field");
      return;
    }

    const ruleToSave = {
      ...newRule,
      id: newRule.id || autoGenerateRuleId(),
      message: newRule.message || `Failed ${newRule.type} check on ${newRule.field}`
    };

    if (newRule.severity === "HARD") setHardRules((prev) => [...prev, ruleToSave]);
    else setSoftRules((prev) => [...prev, ruleToSave]);

    setNewRule({
      id: "",
      type: "MIN_VALUE",
      field: "",
      params: {},
      severity: "HARD",
      message: ""
    });

    setError("");
  }

  const policyPayload = {
    lender_program_id: Number(selectedProgram),
    version: 1,
    is_active: true,
    policy_json: {
      hard_rules: { logic: "ALL", rules: hardRules },
      soft_rules: { logic: "ALL", rules: softRules },
      scoring_config: {
        base_score: Number(scoreConfig.base_score),
        min_accept_score: Number(scoreConfig.min_accept_score),
        deductions: scoreConfig.deduction_rule_id
          ? [{ ruleId: scoreConfig.deduction_rule_id, points: Number(scoreConfig.deduction_points) }]
          : []
      }
    }
  };

  async function submitPolicy(e: FormEvent) {
    e.preventDefault();
    try {
      await axios.post(`${API}/policies/`, policyPayload);
      alert("Policy created!");
    } catch {
      setError("Failed to create policy");
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        Policy Builder
      </h1>

      {/* LENDER SELECTOR */}
      <div>
        <label>Select Lender</label>
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

      {/* PROGRAM SELECT */}
      {selectedLender && (
        <div style={{ marginTop: "1rem" }}>
          <label>Select Program</label>
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

      {/* RANDOM POLICY GENERATOR */}
      <button
        type="button"
        onClick={() => {
          const rp = generateRandomPolicy();
          setHardRules(rp.hard_rules.rules);
          setSoftRules(rp.soft_rules.rules);
          setScoreConfig({
            base_score: rp.scoring_config.base_score,
            min_accept_score: rp.scoring_config.min_accept_score,
            deduction_rule_id: rp.scoring_config.deductions[0]?.ruleId || "",
            deduction_points: rp.scoring_config.deductions[0]?.points || 10
          });
        }}
        style={{
          marginTop: "1rem",
          background: "#10b981",
          color: "white",
          padding: "0.6rem 1rem",
          borderRadius: "6px"
        }}
      >
        Generate Random Policy
      </button>

      {/* RULE BUILDER */}
      <div style={{ marginTop: "2rem", background: "#f9fafb", padding: "1.25rem", borderRadius: "8px" }}>
        <h2>Add Rule</h2>

        {/* FIELD SELECT */}
        <div>
          <label>Field</label>
          <select
            value={newRule.field}
            onChange={(e) => {
              const field = e.target.value;
              const params = updateParams(newRule.type, field);
              setNewRule({ ...newRule, field, params });
            }}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">Choose field</option>
            {FIELD_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* RULE TYPE */}
        <div style={{ marginTop: "1rem" }}>
          <label>Rule Type</label>
          <select
            value={newRule.type}
            onChange={(e) => {
              const type = e.target.value;
              const params = updateParams(type, newRule.field);
              setNewRule({ ...newRule, type, params });
            }}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            {RULE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* PARAM UI */}
        {newRule.type === "MIN_VALUE" && (
          <div style={{ marginTop: "1rem" }}>
            <label>Minimum Value</label>
            <input
              type="number"
              value={newRule.params.min}
              onChange={(e) =>
                setNewRule({ ...newRule, params: { min: Number(e.target.value) } })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
        )}

        {newRule.type === "MAX_VALUE" && (
          <div style={{ marginTop: "1rem" }}>
            <label>Maximum Value</label>
            <input
              type="number"
              value={newRule.params.max}
              onChange={(e) =>
                setNewRule({ ...newRule, params: { max: Number(e.target.value) } })
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
        )}

        {(newRule.type === "IN_LIST" || newRule.type === "NOT_IN_LIST") && (
          <div style={{ marginTop: "1rem" }}>
            <label>Allowed List</label>
            <select
              multiple
              value={newRule.params.list || []}
              onChange={(e) =>
                setNewRule({
                  ...newRule,
                  params: {
                    list: Array.from(e.target.selectedOptions).map((o) => o.value)
                  }
                })
              }
              style={{ width: "100%", padding: "0.5rem", height: "6rem" }}
            >
              {(LIST_OPTIONS[newRule.field] || []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Severity */}
        <div style={{ marginTop: "1rem" }}>
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

        {/* Add Rule */}
        <button
          onClick={addRule}
          style={{
            marginTop: "1rem",
            background: "#2563eb",
            color: "white",
            padding: "0.6rem 1rem",
            borderRadius: "6px"
          }}
        >
          Add Rule
        </button>
      </div>

      {/* RULE PREVIEW */}
      <h3 style={{ marginTop: "2rem" }}>Hard Rules</h3>
      <pre>{JSON.stringify(hardRules, null, 2)}</pre>

      <h3>Soft Rules</h3>
      <pre>{JSON.stringify(softRules, null, 2)}</pre>

      {/* SUBMIT */}
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
