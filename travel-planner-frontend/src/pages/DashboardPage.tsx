import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { travelService } from "../services/TravelService";
import type { TravelPlan } from "../models/TravelPlan";

const DashboardPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await travelService.getAll(token!);
        setPlans(data);
      } catch {
        setError("Greška prilikom učitavanja planova.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm("Da li ste sigurni da želite obrisati ovaj plan?")) return;
    try {
      await travelService.delete(id, token!);
      setPlans(plans.filter((p) => p.id !== id));
    } catch {
      setError("Greška prilikom brisanja plana.");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sr-RS", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  return (
    <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2d3748" }}>Moja putovanja</h1>
          <p style={{ color: "#718096", marginTop: 4 }}>Upravljajte vašim planovima putovanja</p>
        </div>
        <button
          onClick={() => navigate("/plans/new")}
          style={{
            background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
            color: "white", border: "none", borderRadius: 10,
            padding: "12px 24px", fontSize: 15, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 15px rgba(79,142,247,0.4)",
          }}
        >
          ✈️ Novi plan
        </button>
      </div>

      {error && (
        <div style={{
          background: "#fff5f5", border: "1px solid #fc8181",
          borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#c53030"
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#718096" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <p>Učitavanje...</p>
        </div>
      ) : plans.length === 0 ? (
        <div style={{
          textAlign: "center", padding: 80,
          background: "white", borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
          <h3 style={{ color: "#2d3748", marginBottom: 8 }}>Nemate kreiranih planova</h3>
          <p style={{ color: "#718096", marginBottom: 24 }}>Kreirajte vaš prvi plan putovanja!</p>
          <button
            onClick={() => navigate("/plans/new")}
            style={{
              background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
              color: "white", border: "none", borderRadius: 10,
              padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}
          >
            Kreiraj plan
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 24
        }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{
              background: "white", borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{
                background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
                padding: "20px 24px",
              }}>
                <h3 style={{ color: "white", fontSize: 18, fontWeight: 700 }}>{plan.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>
                  {plan.description || "Bez opisa"}
                </p>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <div style={{
                    background: "#f0f4f8", borderRadius: 8, padding: "10px 14px", flex: 1
                  }}>
                    <div style={{ fontSize: 11, color: "#718096", fontWeight: 600, marginBottom: 2 }}>OD</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#2d3748" }}>{formatDate(plan.startDate)}</div>
                  </div>
                  <div style={{
                    background: "#f0f4f8", borderRadius: 8, padding: "10px 14px", flex: 1
                  }}>
                    <div style={{ fontSize: 11, color: "#718096", fontWeight: 600, marginBottom: 2 }}>DO</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#2d3748" }}>{formatDate(plan.endDate)}</div>
                  </div>
                </div>

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#f0fff4", borderRadius: 8, padding: "10px 14px", marginBottom: 20
                }}>
                  <span style={{ fontSize: 13, color: "#276749", fontWeight: 600 }}>💰 Budžet</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#276749" }}>{plan.budget} €</span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => navigate(`/plans/${plan.id}`)}
                    style={{
                      flex: 1, padding: "10px",
                      background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
                      color: "white", border: "none", borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: "pointer"
                    }}
                  >
                    Detalji
                  </button>
                  <button
                    onClick={() => navigate(`/plans/${plan.id}/edit`)}
                    style={{
                      padding: "10px 16px", background: "#edf2f7",
                      color: "#4a5568", border: "none", borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: "pointer"
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    style={{
                      padding: "10px 16px", background: "#fff5f5",
                      color: "#c53030", border: "none", borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: "pointer"
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;