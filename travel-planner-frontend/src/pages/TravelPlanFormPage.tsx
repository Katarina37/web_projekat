import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { travelService } from "../services/TravelService";
import type { CreateTravelPlanDto } from "../models/TravelPlan";

const TravelPlanFormPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState<CreateTravelPlanDto>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: 0,
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      travelService.getById(Number(id), token!).then((plan) => {
        setForm({
          title: plan.title,
          description: plan.description || "",
          startDate: plan.startDate.split("T")[0],
          endDate: plan.endDate.split("T")[0],
          budget: plan.budget,
          notes: plan.notes || "",
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("Krajnji datum ne može biti prije početnog datuma.");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await travelService.update(Number(id), form, token!);
      } else {
        await travelService.create(form, token!);
      }
      navigate("/dashboard");
    } catch {
      setError("Greška prilikom čuvanja plana.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 8,
    border: "2px solid #e2e8f0", fontSize: 15,
    boxSizing: "border-box" as const, outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block", marginBottom: 6,
    fontWeight: 600, color: "#4a5568", fontSize: 14
  };

  return (
    <div style={{ padding: "32px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "none", border: "none", color: "#4f8ef7",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, marginBottom: 16
          }}
        >
          ← Nazad na dashboard
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#2d3748" }}>
          {isEdit ? "✏️ Uredi plan putovanja" : "✈️ Novi plan putovanja"}
        </h1>
        <p style={{ color: "#718096", marginTop: 4 }}>
          {isEdit ? "Izmjenite podatke o putovanju" : "Unesite detalje vašeg putovanja"}
        </p>
      </div>
      <div style={{
        background: "white", borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: 32
      }}>
        {error && (
          <div style={{
            background: "#fff5f5", border: "1px solid #fc8181",
            borderRadius: 8, padding: "12px 16px", marginBottom: 24, color: "#c53030"
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Naziv putovanja *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="npr. Ljetovanje u Grčkoj"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Opis</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Kratki opis putovanja..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Početni datum *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Krajnji datum *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Budžet (€) *</label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              required
              min={0}
              placeholder="0"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Napomene</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Dodatne napomene..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: "14px",
                background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 16, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Čuvanje..." : isEdit ? "Sačuvaj izmjene" : "Kreiraj plan"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "14px 24px", background: "#edf2f7",
                color: "#4a5568", border: "none", borderRadius: 8,
                fontSize: 16, fontWeight: 600, cursor: "pointer"
              }}
            >
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TravelPlanFormPage;