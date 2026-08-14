import { useNavigate, Link } from "react-router-dom";

function Navbar({ hotelName }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>{hotelName}</h2>
      <ul>
        {token ? (
          <>
            <li>
              <span style={{ color: "#e94560" }}>
                Welcome, {localStorage.getItem("email")}
              </span>
            </li>
            <li>
              <Link to="/rooms">Rooms</Link>
            </li>
            {localStorage.getItem("role") === "ADMIN" && (
              <li>
                <Link to="/admin/dashboard">Admin Dashboard</Link>
              </li>
            )}
            <li>
              <button onClick={handleLogout} className="logout-btn-link">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/admin/login">Admin Login</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
