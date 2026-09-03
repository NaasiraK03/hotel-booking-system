import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("GUEST");
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim()) { setError("Name is required"); return false; }
    if (!email.trim() || !email.includes("@")) { setError("Valid email is required"); return false; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    try {
      await api.post("/auth/register", { name, email, password, role });
      setRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  // ── Success screen ───────────────────────────────────────
  if (registered) {
    return (
      <div className="login-container" style={{ textAlign: "center" }}>
        <div className="success-icon">✓</div>
        <h2>Registration Successful!</h2>
        <p style={{ color: "#888", marginBottom: "8px", fontSize: "14px" }}>
          Welcome, <strong style={{ color: "#1a1a2e" }}>{name}</strong>!
        </p>
        <p style={{ color: "#888", marginBottom: "28px", fontSize: "14px" }}>
          Your account has been created. Please log in to continue.
        </p>
        <button onClick={() => navigate("/login")}>
          Go to Login
        </button>
        <button
          onClick={() => navigate("/rooms")}
          style={{
            marginTop: "10px",
            background: "transparent",
            border: "1px solid #c8a96e",
            color: "#c8a96e",
          }}
        >
          Browse Rooms
        </button>
      </div>
    );
  }

  // ── Registration form ────────────────────────────────────
  return (
    <div className="login-container">
      <h2>Create Account</h2>
      {error && <p className="error-message">{error}</p>}

      <label>Full Name</label>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="off"
      />

      <label>Email</label>
      <input
        type="text"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="off"
      />

      <label>Password</label>
      <input
        type="password"
        placeholder="Min. 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />

      <button onClick={handleSubmit}>Create Account</button>

      <p style={{ textAlign: "center", fontSize: "13px", color: "#888", marginTop: "8px" }}>
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          style={{ color: "#c8a96e", cursor: "pointer", fontWeight: "600" }}
        >
          Log in
        </span>
      </p>
    </div>
  );
}

export default RegisterPage;