import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import ApplicationForm from "./pages/ApplicationForm";
import LendersPage from "./pages/Lenders";
import ProgramsPage from "./pages/Programs";
import PolicyBuilder from "./pages/PolicyBuilder";
import UnderwritingRunner from "./pages/Underwriting";
import ResultsPage from "./pages/ResultsPage";

function App() {
  const linkStyle: React.CSSProperties = {
    textDecoration: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontWeight: 500,
  };

  return (
    <BrowserRouter>
      {/* Top Navigation */}
      <div
        style={{
          padding: "1rem",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "1rem",
          background: "#f9fafb",
        }}
      >
        <nav style={{ display: "flex", gap: "1rem" }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              ...linkStyle,
              color: isActive ? "white" : "#2563eb",
              background: isActive ? "#2563eb" : "transparent",
            })}
          >
            Application
          </NavLink>

          <NavLink
            to="/lenders"
            style={({ isActive }) => ({
              ...linkStyle,
              color: isActive ? "white" : "#2563eb",
              background: isActive ? "#2563eb" : "transparent",
            })}
          >
            Lenders
          </NavLink>

          <NavLink
            to="/programs"
            style={({ isActive }) => ({
              ...linkStyle,
              color: isActive ? "white" : "#2563eb",
              background: isActive ? "#2563eb" : "transparent",
            })}
          >
            Programs
          </NavLink>

          <NavLink
            to="/policies"
            style={({ isActive }) => ({
              ...linkStyle,
              color: isActive ? "white" : "#2563eb",
              background: isActive ? "#2563eb" : "transparent",
            })}
          >
            Policies
          </NavLink>
          
          <NavLink
            to="/underwriting"
            style={({ isActive }) => ({
              ...linkStyle,
              color: isActive ? "white" : "#2563eb",
              background: isActive ? "#2563eb" : "transparent",
            })}
          >
            Underwriting
          </NavLink>
        </nav>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<ApplicationForm />} />
        <Route path="/lenders" element={<LendersPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/policies" element={<PolicyBuilder />} />
        <Route path="/underwriting" element={<UnderwritingRunner />} />
        <Route path="/results/:matchRunId" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
