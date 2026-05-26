import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import type { User } from "../models/User";

const AdminPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    const fetchUsers = async () => {
      try {
        const data = await authService.getAllUsers(token!);
        setUsers(data);
      } catch {
        setError("Greška prilikom učitavanja korisnika.");
      }
    };
    fetchUsers();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm("Da li ste sigurni da želite obrisati ovog korisnika?")) return;
    try {
      await authService.deleteUser(id, token!);
      setUsers(users.filter((u) => u.id !== id));
    } catch {
      setError("Greška prilikom brisanja korisnika.");
    }
  };

  const handleMakeAdmin = async (id: number) => {
    try {
      await authService.makeAdmin(id, token!);
      setUsers(users.map((u) => u.id === id ? { ...u, role: "admin" } : u));
    } catch {
      setError("Greška prilikom dodjele admin uloge.");
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2d3748" }}>
          👑 Admin panel
        </h1>
        <p style={{ color: "#718096", marginTop: 4 }}>Upravljanje korisničkim nalozima</p>
      </div>

      {error && (
        <div style={{
          background: "#fff5f5", border: "1px solid #fc8181",
          borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#c53030"
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: "white", borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
          padding: "16px 24px"
        }}>
          <h3 style={{ color: "white", fontWeight: 700 }}>
            Svi korisnici ({users.length})
          </h3>
        </div>
        {users.map((u) => (
          <div key={u.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 24px", borderBottom: "1px solid #f0f4f8"
          }}>
            <div>
              <h4 style={{ color: "#2d3748", fontWeight: 600 }}>
                {u.firstName} {u.lastName}
              </h4>
              <p style={{ fontSize: 13, color: "#718096" }}>{u.email}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                background: u.role === "admin" ? "#ebf8ff" : "#f0fff4",
                color: u.role === "admin" ? "#2b6cb0" : "#276749",
                padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700
              }}>
                {u.role === "admin" ? "👑 Admin" : "👤 Korisnik"}
              </span>
              {u.role !== "admin" && (
                <button onClick={() => handleMakeAdmin(u.id)} style={{
                  background: "#ebf8ff", color: "#2b6cb0", border: "none",
                  borderRadius: 6, padding: "6px 12px", fontSize: 13,
                  fontWeight: 600, cursor: "pointer"
                }}>
                  Postavi adminom
                </button>
              )}
              <button onClick={() => handleDelete(u.id)} style={{
                background: "#fff5f5", color: "#c53030", border: "none",
                borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer"
              }}>
                🗑️ Obriši
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;