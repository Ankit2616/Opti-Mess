import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import loginLogo from "../assets/user.png";
import { shellStyles } from "../components/layoutStyles";
import { api } from "../services/api";
import { storeAuth } from "../services/auth";

const developmentUsers = [
  { role: "student", label: "Login as Student", username: "student", password: "student123", path: "/student-dashboard" },
  { role: "worker", label: "Login as Worker", username: "worker", password: "worker123", path: "/worker-dashboard" },
  { role: "dean", label: "Login as Dean", username: "dean", password: "dean123", path: "/dean-dashboard" },
  { role: "superadmin", label: "Login as Super Admin", username: "superadmin", password: "superadmin123", path: "/admin-dashboard" },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(entry) {
    try {
      setError("");
      setLoadingRole(entry.role);
      const response = await api.login({
        username: entry.username,
        password: entry.password,
      });
      storeAuth(response);
      navigate(entry.path, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoadingRole("");
    }
  }

  return (
    <AppShell portalTitle="NITJ Mess Development Login" navLabel="| ROLE SELECTION - NITJ |">
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div
          style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "430px",
            margin: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", textAlign: "center", marginBottom: "2rem" }}>
            <img src={loginLogo} alt="Login Logo" style={{ width: "60px", display: "block" }} />
            <h1
              style={{
                fontSize: "26px",
                color: "#003a6a",
                fontWeight: "bold",
                fontFamily: "Arial, sans-serif",
                marginLeft: "30px",
              }}
            >
              NITJ Mess Role Login
            </h1>
          </div>

          <p style={{ marginBottom: "10px", color: "#333" }}>
            Development-only quick login with backend JWT authentication.
          </p>

          {developmentUsers.map((entry) => (
            <button
              key={entry.role}
              type="button"
              onClick={() => handleLogin(entry)}
              disabled={loadingRole === entry.role}
              style={{ ...shellStyles.button, marginTop: "10px" }}
            >
              {loadingRole === entry.role ? "Signing in..." : entry.label}
            </button>
          ))}

          {error ? (
            <p style={{ color: "#990000", marginTop: "15px", textAlign: "center" }}>{error}</p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
