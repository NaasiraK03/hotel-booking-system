import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Valid email is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("email", response.data.email);
    if (response.data.role === "ADMIN") {
  navigate("/admin/dashboard");
} else {
  navigate("/rooms");
}
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <h2>GUEST LOGIN</h2>
      <p style={{ textAlign: "center", color: "#888", fontSize: "14px", marginBottom: "24px" }}>
        Login to your account
      </p>

      {error && <p className="error-message">{error}</p>}

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
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSubmit}>Login</button>

      <p style={{ textAlign: "center", fontSize: "13px", color: "#888", marginTop: "8px" }}>
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          style={{ color: "#c8a96e", cursor: "pointer", fontWeight: "600" }}
        >
          Sign up
        </span>
      </p>
    </div>
  );
}

export default LoginPage;