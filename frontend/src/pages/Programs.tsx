import { useEffect, useState } from "react";
import axios from "axios";
import type { FormEvent } from "react";

interface Lender {
  id: number;
  name: string;
  active: boolean;
}

interface Program {
  id: number;
  lender_id: number;
  name: string;
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
}

interface ProgramForm {
  lender_id: string;
  name: string;
  min_amount: string;
  max_amount: string;
  min_term_months: string;
  max_term_months: string;
}

const API = "http://localhost:8000";

// Ensure numbers only
function onlyNumbers(value: string) {
  return value.replace(/[^0-9]/g, "");
}

// Clamp within range
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function ProgramsPage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [form, setForm] = useState<ProgramForm>({
    lender_id: "",
    name: "",
    min_amount: "",
    max_amount: "",
    min_term_months: "",
    max_term_months: ""
  });

  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      const lenderRes = await axios.get(`${API}/policies/lenders`);
      setLenders(lenderRes.data);

      const programsRes = await axios.get(`${API}/policies/programs`);
      setPrograms(programsRes.data);
    } catch (err: any) {
      setError("Failed to load data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.lender_id) {
      setError("Please select a lender");
      return;
    }

    try {
      const payload = {
        lender_id: Number(form.lender_id),
        name: form.name,
        min_amount: Number(form.min_amount),
        max_amount: Number(form.max_amount),
        min_term_months: Number(form.min_term_months),
        max_term_months: Number(form.max_term_months),
      };

      const res = await axios.post(`${API}/policies/programs`, payload);
      setPrograms((prev) => [...prev, res.data]);

      setForm({
        lender_id: "",
        name: "",
        min_amount: "",
        max_amount: "",
        min_term_months: "",
        max_term_months: ""
      });
    } catch (err: any) {
      setError("Error creating program");
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        Lender Programs
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "2rem",
          background: "#f9f9f9",
          padding: "1.5rem",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          Add New Program
        </h2>

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              background: "#fee2e2",
              padding: "0.75rem",
              borderRadius: "6px",
              color: "#b91c1c"
            }}
          >
            {error}
          </div>
        )}

        {/* Lender Dropdown */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Lender</label>
          <select
            value={form.lender_id}
            onChange={(e) => setForm({ ...form, lender_id: e.target.value })}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">Select Lender</option>
            {lenders.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Program Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Program Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        {/* Amount inputs */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {/* Min Amount */}
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Min Loan Amount ($)
            </label>
            <input
              value={form.min_amount}
              onChange={(e) => {
                const cleaned = onlyNumbers(e.target.value);
                setForm({ ...form, min_amount: cleaned });
              }}
              onBlur={() => {
                const num = Number(form.min_amount || 0);
                const safe = clamp(num, 1000, 1000000);
                setForm({ ...form, min_amount: safe.toString() });
              }}
              style={{ width: "100%", padding: "0.5rem" }}
              required
            />
          </div>

          {/* Max Amount */}
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Max Loan Amount ($)
            </label>
            <input
              value={form.max_amount}
              onChange={(e) => {
                const cleaned = onlyNumbers(e.target.value);
                setForm({ ...form, max_amount: cleaned });
              }}
              onBlur={() => {
                const num = Number(form.max_amount || 0);
                const safe = clamp(num, 5000, 2000000);
                setForm({ ...form, max_amount: safe.toString() });
              }}
              style={{ width: "100%", padding: "0.5rem" }}
              required
            />
          </div>
        </div>

        {/* Terms */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          {/* Min Term */}
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Min Term (months)
            </label>
            <input
              value={form.min_term_months}
              onChange={(e) => {
                const cleaned = onlyNumbers(e.target.value);
                setForm({ ...form, min_term_months: cleaned });
              }}
              onBlur={() => {
                const num = Number(form.min_term_months || 0);
                const safe = clamp(num, 12, 60);
                setForm({ ...form, min_term_months: safe.toString() });
              }}
              style={{ width: "100%", padding: "0.5rem" }}
              required
            />
          </div>

          {/* Max Term */}
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontWeight: "bold" }}>
              Max Term (months)
            </label>
            <input
              value={form.max_term_months}
              onChange={(e) => {
                const cleaned = onlyNumbers(e.target.value);
                setForm({ ...form, max_term_months: cleaned });
              }}
              onBlur={() => {
                const num = Number(form.max_term_months || 0);
                const safe = clamp(num, 24, 120);
                setForm({ ...form, max_term_months: safe.toString() });
              }}
              style={{ width: "100%", padding: "0.5rem" }}
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          style={{
            marginTop: "1.5rem",
            background: "#2563eb",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Create Program
        </button>
      </form>

      {/* Program list */}
      <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>
        Existing Programs
      </h2>

      {programs.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No programs yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead style={{ background: "#e5e7eb" }}>
            <tr>
              <th style={{ padding: "0.5rem" }}>ID</th>
              <th style={{ padding: "0.5rem" }}>Lender</th>
              <th style={{ padding: "0.5rem" }}>Name</th>
              <th style={{ padding: "0.5rem" }}>Amount Range</th>
              <th style={{ padding: "0.5rem" }}>Term Range</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: "0.5rem" }}>{p.id}</td>
                <td style={{ padding: "0.5rem" }}>
                  {lenders.find((l) => l.id === p.lender_id)?.name}
                </td>
                <td style={{ padding: "0.5rem" }}>{p.name}</td>
                <td style={{ padding: "0.5rem" }}>
                  ${p.min_amount} - ${p.max_amount}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  {p.min_term_months} - {p.max_term_months} months
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
