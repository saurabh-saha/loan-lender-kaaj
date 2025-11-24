import { useEffect, useState } from "react";
import axios from "axios";
import type { FormEvent } from "react";

interface Lender {
  id: number;
  name: string;
  active: boolean;
}

interface LenderForm {
  name: string;
  active: boolean;
}

const API = "http://localhost:8000";

export default function LendersPage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [form, setForm] = useState<LenderForm>({ name: "", active: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchLenders() {
    try {
      setError(null);
      const res = await axios.get<Lender[]>(`${API}/policies/lenders`);
      setLenders(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load lenders");
    }
  }

  useEffect(() => {
    fetchLenders();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        active: form.active,
      };
      const res = await axios.post<Lender>(`${API}/policies/lenders`, payload);
      setLenders((prev) => [...prev, res.data]);
      setForm({ name: "", active: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create lender");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        Lenders
      </h1>

      {/* Create Lender Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          background: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Add New Lender</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.25rem" }}>
            Name
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Active
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? "#9ca3af" : "#2563eb",
            color: "white",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            fontSize: "0.95rem",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : "Create Lender"}
        </button>

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              background: "#fee2e2",
              borderRadius: "6px",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}
      </form>

      {/* Lender List */}
      <section>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>Existing Lenders</h2>

        {lenders.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No lenders yet. Add one above.</p>
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
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem" }}>ID</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem" }}>Name</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem" }}>Active</th>
              </tr>
            </thead>
            <tbody>
              {lenders.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{l.id}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{l.name}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    {l.active ? "✅ Yes" : "❌ No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
