import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
      padding: "0 32px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 2px 12px rgba(79,142,247,0.3)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div
        onClick={() => navigate("/dashboard")}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
      >
        <span style={{ fontSize: 28 }}>✈️</span>
        <span style={{ color: "white", fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>
          TravelPlanner
        </span>
      </div>
      {isAuthenticated && (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "white", fontSize: 14 }}>
            👤 {user?.firstName} {user?.lastName}
          </span>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "white",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Odjavi se
          </button>
        </div>
      )}
      {isAuthenticated && user?.role === "admin" && (
        <button
          onClick={() => navigate("/admin")}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.4)",
            color: "white", padding: "8px 16px", borderRadius: 8,
            cursor: "pointer", fontSize: 14, fontWeight: 600,
          }}
        >
          Admin panel
        </button>
      )}
    </nav>
  );
};

export default Navbar;