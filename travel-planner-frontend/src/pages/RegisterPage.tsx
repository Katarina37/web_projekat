import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/AuthService";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.register({ firstName, lastName, email, password });
      navigate("/login");
    } catch {
      setError("Greška prilikom registracije. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: 40,
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 48 }}>✈️</span>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#2d3748", marginTop: 8 }}>
            Kreirajte nalog
          </h2>
          <p style={{ color: "#718096", marginTop: 4 }}>Počnite planirati vaša putovanja</p>
        </div>

        {error && (
          <div style={{
            background: "#fff5f5", border: "1px solid #fc8181",
            borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#c53030"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#4a5568", fontSize: 14 }}>Ime</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Ime"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 8,
                  border: "2px solid #e2e8f0", fontSize: 15, boxSizing: "border-box"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#4a5568", fontSize: 14 }}>Prezime</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Prezime"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 8,
                  border: "2px solid #e2e8f0", fontSize: 15, boxSizing: "border-box"
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#4a5568", fontSize: 14 }}>Email adresa</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="vas@email.com"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 8,
                border: "2px solid #e2e8f0", fontSize: 15, boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#4a5568", fontSize: 14 }}>Lozinka</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 8,
                border: "2px solid #e2e8f0", fontSize: 15, boxSizing: "border-box"
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
              color: "white", border: "none", borderRadius: 8,
              fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Registracija..." : "Registruj se"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "#718096", fontSize: 14 }}>
          Već imate nalog?{" "}
          <Link to="/login" style={{ color: "#4f8ef7", fontWeight: 600, textDecoration: "none" }}>
            Prijavite se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;