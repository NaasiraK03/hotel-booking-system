import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../services/api";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("GUEST");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("role", response.data.role);
      navigate('/rooms'); 
    } catch (err) {
      setError("Invalid");
    }
  };

  return (
    <div className="login-container">
      <h2>Register</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="off"
      />

      <input
        type="text"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="off"
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
         autoComplete="new-password"
      />
 <input
        type="text"
        placeholder="role"
        value={"GUEST"}
        onChange={(e) => setRole(e.target.value)}
      />
      
      <button onClick={handleSubmit}>Register</button>
    </div>
  );
}
export default RegisterPage;
