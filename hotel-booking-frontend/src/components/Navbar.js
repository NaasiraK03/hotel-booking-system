import { useNavigate, Link, useLocation } from "react-router-dom";

function Navbar({ hotelName }) {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={token ? "/rooms" : "/"} className="brand-link">
          <span className="brand-icon">🏨</span>
          <span className="brand-name">{hotelName}</span>
        </Link>
      </div>

      <ul className="navbar-links">
        {token ? (
          <>
            <li>
              <Link to="/rooms" className={isActive("/rooms")}>Rooms</Link>
            </li>
            {role !== "ADMIN" && (
            <li>
              <Link to="/dashboard" className={isActive("/dashboard")}>My Bookings</Link>
            </li>)}
            {role === "ADMIN" && (
              <li>
                <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>
                  Admin Dashboard
                </Link>
              </li>
            )}
            <li className="navbar-divider" />
            <li className="navbar-user">
              <span className="user-email">{email}</span>
            </li>
            <li>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className={isActive("/login")}>Login</Link>
            </li>
            <li>
              <Link to="/register" className={isActive("/register")}>Register</Link>
            </li>
            <li>
              <Link to="/admin/login" className={isActive("/admin/login")}>
                Admin Login
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;