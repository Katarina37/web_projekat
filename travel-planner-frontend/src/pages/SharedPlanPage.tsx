import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { travelService } from "../services/TravelService";
import type { TravelPlan } from "../models/TravelPlan";
import type { Destination, CreateDestinationDto } from "../models/Destination";
import type { Activity, CreateActivityDto } from "../models/Activity";
import type { ChecklistItem } from "../models/ChecklistItem";

const SharedPlanPage = () => {
  const { token } = useParams();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [accessType, setAccessType] = useState<string>("view");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("destinations");

  const [destForm, setDestForm] = useState<CreateDestinationDto>({
    name: "", location: "", arrivalDate: "", departureDate: "", description: ""
  });
  const [actForm, setActForm] = useState<CreateActivityDto>({
    name: "", activityDate: "", activityTime: "", location: "", description: "", estimatedCost: 0, status: "planned"
  });
  const [checklistName, setChecklistName] = useState("");

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("sr-RS");

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "2px solid #e2e8f0", fontSize: 14,
    boxSizing: "border-box" as const, fontFamily: "inherit"
  };

  const statusColors: Record<string, string> = {
    planned: "#4f8ef7", reserved: "#f6ad55", completed: "#48bb78", cancelled: "#fc8181"
  };
  const statusLabels: Record<string, string> = {
    planned: "Planirano", reserved: "Rezervisano", completed: "Završeno", cancelled: "Otkazano"
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await travelService.getByToken(token!);
        setPlan(data.plan);
        setAccessType(data.accessType);
        setDestinations(await travelService.getDestinationsByToken(token!));
        setActivities(await travelService.getActivitiesByToken(token!));
        setChecklistItems(await travelService.getChecklistByToken(token!));
      } catch {
        setError("Plan nije pronađen ili je link istekao.");
      }
    };
    fetchData();
  }, [token]);

  if (error) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
      <h2 style={{ color: "#c53030" }}>{error}</h2>
    </div>
  );

  if (!plan) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p>Učitavanje...</p>
    </div>
  );

  const canEdit = accessType === "edit";

  const tabs = [
    { key: "destinations", label: "🗺️ Destinacije" },
    { key: "activities", label: "📅 Aktivnosti" },
    { key: "checklist", label: "✅ Checklist" },
  ];

  return (
    <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
        borderRadius: 16, padding: 32, marginBottom: 24, color: "white"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{plan.title}</h1>
            <p style={{ opacity: 0.85 }}>{plan.description}</p>
            <p style={{ opacity: 0.75, fontSize: 13, marginTop: 8 }}>
              📅 {formatDate(plan.startDate)} → {formatDate(plan.endDate)}
            </p>
          </div>
          <span style={{
            background: canEdit ? "#f6ad55" : "rgba(255,255,255,0.2)",
            padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700
          }}>
            {canEdit ? "✏️ Može uređivati" : "👁️ Samo pregled"}
          </span>
        </div>
        <p style={{ marginTop: 16, opacity: 0.9 }}>💰 Budžet: {plan.budget} €</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 24,
        background: "white", borderRadius: 12, padding: 4,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: "10px 16px", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: activeTab === tab.key
                ? "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)"
                : "transparent",
              color: activeTab === tab.key ? "white" : "#718096",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Destinations Tab */}
      {activeTab === "destinations" && (
        <div>
          {canEdit && (
            <div style={{
              background: "white", borderRadius: 16, padding: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24
            }}>
              <h3 style={{ marginBottom: 16, color: "#2d3748" }}>Dodaj destinaciju</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const dest = await travelService.createDestinationShared(token!, destForm);
                setDestinations([...destinations, dest]);
                setDestForm({ name: "", location: "", arrivalDate: "", departureDate: "", description: "" });
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <input placeholder="Naziv *" value={destForm.name} onChange={(e) => setDestForm({ ...destForm, name: e.target.value })} required style={inputStyle} />
                  <input placeholder="Lokacija" value={destForm.location} onChange={(e) => setDestForm({ ...destForm, location: e.target.value })} style={inputStyle} />
                  <input type="date" value={destForm.arrivalDate} onChange={(e) => setDestForm({ ...destForm, arrivalDate: e.target.value })} required style={inputStyle} />
                  <input type="date" value={destForm.departureDate} onChange={(e) => setDestForm({ ...destForm, departureDate: e.target.value })} required style={inputStyle} />
                  <textarea placeholder="Opis" value={destForm.description} onChange={(e) => setDestForm({ ...destForm, description: e.target.value })} style={{ ...inputStyle, gridColumn: "1 / -1", resize: "vertical" }} rows={2} />
                </div>
                <button type="submit" style={{
                  background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
                  color: "white", border: "none", borderRadius: 8,
                  padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}>
                  + Dodaj
                </button>
              </form>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {destinations.map((d) => (
              <div key={d.id} style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "16px 20px", borderRadius: "12px 12px 0 0" }}>
                  <h4 style={{ color: "white", fontWeight: 700 }}>{d.name}</h4>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>📍 {d.location || "Bez lokacije"}</p>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 13, color: "#718096" }}>{formatDate(d.arrivalDate)} → {formatDate(d.departureDate)}</p>
                  {d.description && <p style={{ fontSize: 13, color: "#4a5568", marginTop: 8 }}>📝 {d.description}</p>}
                  {canEdit && (
                    <button onClick={async () => {
                      await travelService.deleteDestinationShared(token!, d.id);
                      setDestinations(destinations.filter((x) => x.id !== d.id));
                    }} style={{
                      marginTop: 12, background: "#fff5f5", color: "#c53030",
                      border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer"
                    }}>
                      🗑️ Obriši
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === "activities" && (
        <div>
          {canEdit && (
            <div style={{
              background: "white", borderRadius: 16, padding: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24
            }}>
              <h3 style={{ marginBottom: 16, color: "#2d3748" }}>Dodaj aktivnost</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const actFormToSend = {
                  ...actForm,
                  activityTime: actForm.activityTime ? actForm.activityTime + ":00" : undefined
                };
                const act = await travelService.createActivityShared(token!, actFormToSend);
                setActivities([...activities, act]);
                setActForm({ name: "", activityDate: "", activityTime: "", location: "", description: "", estimatedCost: 0, status: "planned" });
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <input placeholder="Naziv *" value={actForm.name} onChange={(e) => setActForm({ ...actForm, name: e.target.value })} required style={inputStyle} />
                  <input placeholder="Lokacija" value={actForm.location} onChange={(e) => setActForm({ ...actForm, location: e.target.value })} style={inputStyle} />
                  <input type="date" value={actForm.activityDate} onChange={(e) => setActForm({ ...actForm, activityDate: e.target.value })} required style={inputStyle} />
                  <input type="time" value={actForm.activityTime} onChange={(e) => setActForm({ ...actForm, activityTime: e.target.value })} style={inputStyle} />
                  <input type="number" placeholder="Procijenjeni trošak (€)" value={actForm.estimatedCost || ""} onChange={(e) => setActForm({ ...actForm, estimatedCost: Number(e.target.value) })} min={0} style={inputStyle} />
                  <select value={actForm.status} onChange={(e) => setActForm({ ...actForm, status: e.target.value })} style={inputStyle}>
                    <option value="planned">Planirano</option>
                    <option value="reserved">Rezervisano</option>
                    <option value="completed">Završeno</option>
                    <option value="cancelled">Otkazano</option>
                  </select>
                </div>
                <button type="submit" style={{
                  background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
                  color: "white", border: "none", borderRadius: 8,
                  padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}>
                  + Dodaj
                </button>
              </form>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activities.map((a) => (
              <div key={a.id} style={{
                background: "white", borderRadius: 12, padding: "16px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 4, height: 48, borderRadius: 4, background: statusColors[a.status] || "#4f8ef7" }} />
                  <div>
                    <h4 style={{ color: "#2d3748", fontWeight: 600 }}>{a.name}</h4>
                    <p style={{ fontSize: 13, color: "#718096" }}>
                      📅 {formatDate(a.activityDate)} {a.activityTime && `• ⏰ ${a.activityTime}`}
                      {a.location && ` • 📍 ${a.location}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    background: statusColors[a.status] + "20",
                    color: statusColors[a.status],
                    padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600
                  }}>
                    {statusLabels[a.status]}
                  </span>
                  <span style={{ fontWeight: 700, color: "#276749" }}>{a.estimatedCost} €</span>
                  {canEdit && (
                    <button onClick={async () => {
                      await travelService.deleteActivityShared(token!, a.id);
                      setActivities(activities.filter((x) => x.id !== a.id));
                    }} style={{
                      background: "#fff5f5", color: "#c53030", border: "none",
                      borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer"
                    }}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === "checklist" && (
        <div>
          {canEdit && (
            <div style={{
              background: "white", borderRadius: 16, padding: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24
            }}>
              <h3 style={{ marginBottom: 16, color: "#2d3748" }}>Dodaj stavku</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const item = await travelService.createChecklistItemShared(token!, { name: checklistName });
                setChecklistItems([...checklistItems, item]);
                setChecklistName("");
              }} style={{ display: "flex", gap: 12 }}>
                <input
                  placeholder="Nova stavka..."
                  value={checklistName}
                  onChange={(e) => setChecklistName(e.target.value)}
                  required
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="submit" style={{
                  background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
                  color: "white", border: "none", borderRadius: 8,
                  padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}>
                  + Dodaj
                </button>
              </form>
            </div>
          )}

          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ color: "#2d3748", marginBottom: 16 }}>
              Lista ({checklistItems.filter(i => i.isCompleted).length}/{checklistItems.length})
            </h3>
            {checklistItems.length === 0 ? (
              <p style={{ color: "#718096", textAlign: "center", padding: 20 }}>Nema stavki na listi</p>
            ) : (
              checklistItems.map((item) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0", borderBottom: "1px solid #f0f4f8"
                }}>
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={async () => {
                      if (!canEdit) return;
                      const updated = await travelService.toggleChecklistItemShared(token!, item.id);
                      setChecklistItems(checklistItems.map((x) => x.id === item.id ? updated : x));
                    }}
                    style={{ width: 18, height: 18, cursor: canEdit ? "pointer" : "default" }}
                    readOnly={!canEdit}
                  />
                  <span style={{
                    flex: 1, fontSize: 15,
                    textDecoration: item.isCompleted ? "line-through" : "none",
                    color: item.isCompleted ? "#a0aec0" : "#2d3748"
                  }}>
                    {item.name}
                  </span>
                  {canEdit && (
                    <button onClick={async () => {
                      await travelService.deleteChecklistItemShared(token!, item.id);
                      setChecklistItems(checklistItems.filter((x) => x.id !== item.id));
                    }} style={{
                      background: "#fff5f5", color: "#c53030", border: "none",
                      borderRadius: 6, padding: "4px 10px", fontSize: 13, cursor: "pointer"
                    }}>
                      🗑️
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedPlanPage;