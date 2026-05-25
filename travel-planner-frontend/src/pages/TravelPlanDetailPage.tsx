import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { travelService } from "../services/TravelService";
import { financeService } from "../services/FinanceService";
import type { TravelPlan } from "../models/TravelPlan";
import type { Destination, CreateDestinationDto } from "../models/Destination";
import type { Activity, CreateActivityDto } from "../models/Activity";
import type { ChecklistItem } from "../models/ChecklistItem";
import type { Expense, CreateExpenseDto } from "../models/Expense";
import { generateTravelPlanPdf } from "../services/PdfService";

const TravelPlanDetailPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState("destinations");
  const [editingDestId, setEditingDestId] = useState<number | null>(null);
  const [editDestForm, setEditDestForm] = useState<CreateDestinationDto>({
    name: "", location: "", arrivalDate: "", departureDate: "", description: ""
  });

  const [destForm, setDestForm] = useState<CreateDestinationDto>({
    name: "", location: "", arrivalDate: "", departureDate: "", description: ""
  });
  const [actForm, setActForm] = useState<CreateActivityDto>({
    name: "", activityDate: "", activityTime: "", location: "", description: "", estimatedCost: 0, status: "planned"
  });
  const [checklistName, setChecklistName] = useState("");
  const [expForm, setExpForm] = useState<CreateExpenseDto>({
    name: "", category: "transport", amount: 0, expenseDate: "", description: ""
  });
  const [editingActId, setEditingActId] = useState<number | null>(null);
  const [editActForm, setEditActForm] = useState<CreateActivityDto>({
    name: "", activityDate: "", activityTime: "", location: "", description: "", estimatedCost: 0, status: "planned"
  });

  // Calendar view state
  const [activityView, setActivityView] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  useEffect(() => {
    const fetchData = async () => {
      const planData = await travelService.getById(Number(id), token!);
      setPlan(planData);
      setDestinations(await travelService.getDestinations(Number(id), token!));
      setActivities(await travelService.getActivities(Number(id), token!));
      setChecklistItems(await travelService.getChecklistItems(Number(id), token!));
      setExpenses(await financeService.getExpenses(Number(id), token!));
    };
    fetchData();
  }, [id]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = (plan?.budget || 0) - totalExpenses;
  const budgetPercent = plan ? Math.min((totalExpenses / plan.budget) * 100, 100) : 0;

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("sr-RS");

  const statusColors: Record<string, string> = {
    planned: "#4f8ef7", reserved: "#f6ad55", completed: "#48bb78", cancelled: "#fc8181"
  };
  const statusLabels: Record<string, string> = {
    planned: "Planirano", reserved: "Rezervisano", completed: "Završeno", cancelled: "Otkazano"
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "2px solid #e2e8f0", fontSize: 14,
    boxSizing: "border-box" as const, fontFamily: "inherit"
  };

  const tabs = [
    { key: "destinations", label: "🗺️ Destinacije" },
    { key: "activities", label: "📅 Aktivnosti" },
    { key: "checklist", label: "✅ Checklist" },
    { key: "expenses", label: "💰 Troškovi" },
  ];

  // ---------- Calendar helpers ----------
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay: (firstDay + 6) % 7, daysInMonth }; // ponedjeljak = 0
  };

  const getActivitiesForDay = (day: number) => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return activities.filter(a => a.activityDate.startsWith(dateStr));
  };

  // ---------- Activity card (reused in list view) ----------
  const ActivityCard = ({ a }: { a: Activity }) => (
    <div style={{
      background: "white", borderRadius: 12, padding: "16px 20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      display: "flex", justifyContent: "space-between", alignItems: "center"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 4, height: 48, borderRadius: 4,
          background: statusColors[a.status] || "#4f8ef7"
        }} />
        <div>
          <h4 style={{ color: "#2d3748", fontWeight: 600 }}>{a.name}</h4>
          <p style={{ fontSize: 13, color: "#718096" }}>
            📅 {formatDate(a.activityDate)} {a.activityTime && `• ⏰ ${a.activityTime}`}
            {a.location && ` • 📍 ${a.location}`}
          </p>
          {a.description && (
            <p style={{ fontSize: 13, color: "#4a5568", marginTop: 4 }}>📝 {a.description}</p>
          )}
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
        <button onClick={() => {
          setEditingActId(a.id);
          setEditActForm({
            name: a.name,
            activityDate: a.activityDate.split("T")[0],
            activityTime: a.activityTime ? a.activityTime.substring(0, 5) : "",
            location: a.location || "",
            description: a.description || "",
            estimatedCost: a.estimatedCost,
            status: a.status
          });
        }} style={{
          background: "#edf2f7", color: "#4a5568", border: "none",
          borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer"
        }}>
          ✏️
        </button>
        <button onClick={async () => {
          await travelService.deleteActivity(a.id, token!);
          setActivities(activities.filter((x) => x.id !== a.id));
        }} style={{
          background: "#fff5f5", color: "#c53030", border: "none",
          borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer"
        }}>
          🗑️
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "32px", maxWidth: 1000, margin: "0 auto" }}>
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          background: "none", border: "none", color: "#4f8ef7",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, marginBottom: 24
        }}
      >
        ← Nazad na dashboard
      </button>

      {plan && (
        <>
          {/* Plan Header */}
          <div style={{
            background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
            borderRadius: 16, padding: 32, marginBottom: 24, color: "white"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{plan.title}</h1>
                <p style={{ opacity: 0.85, fontSize: 15 }}>{plan.description || "Bez opisa"}</p>
                <p style={{ opacity: 0.75, fontSize: 13, marginTop: 8 }}>
                  📅 {formatDate(plan.startDate)} → {formatDate(plan.endDate)}
                </p>
              </div>
              <button
                onClick={() => navigate(`/plans/${id}/edit`)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)",
                  color: "white", padding: "10px 20px", borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}
              >
                ✏️ Uredi
              </button>
              <button
                onClick={() => generateTravelPlanPdf(plan, destinations, activities, checklistItems, expenses)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)",
                  color: "white", padding: "10px 20px", borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}
              >
                📄 Izvoz PDF
              </button>
            </div>

            {/* Budget Bar */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                <span>Potrošeno: {totalExpenses} €</span>
                <span>Budžet: {plan.budget} €</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: 8, height: 10 }}>
                <div style={{
                  background: budgetPercent > 90 ? "#fc8181" : "white",
                  height: 10, borderRadius: 8,
                  width: `${budgetPercent}%`, transition: "width 0.5s"
                }} />
              </div>
              <div style={{ textAlign: "right", marginTop: 6, fontSize: 14, opacity: 0.9 }}>
                Preostalo: <strong>{remainingBudget} €</strong>
              </div>
            </div>
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
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ───────────── Destinations Tab ───────────── */}
          {activeTab === "destinations" && (
            <div>
              <div style={{
                background: "white", borderRadius: 16, padding: 24,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24
              }}>
                <h3 style={{ marginBottom: 16, color: "#2d3748" }}>Dodaj destinaciju</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const dest = await travelService.createDestination(Number(id), destForm, token!);
                  setDestinations([...destinations, dest]);
                  setDestForm({ name: "", location: "", arrivalDate: "", departureDate: "", description: "" });
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <input placeholder="Naziv destinacije *" value={destForm.name} onChange={(e) => setDestForm({ ...destForm, name: e.target.value })} required style={inputStyle} />
                    <input placeholder="Lokacija" value={destForm.location} onChange={(e) => setDestForm({ ...destForm, location: e.target.value })} style={inputStyle} />
                    <input type="date" value={destForm.arrivalDate} onChange={(e) => setDestForm({ ...destForm, arrivalDate: e.target.value })} required style={inputStyle} />
                    <input type="date" value={destForm.departureDate} onChange={(e) => setDestForm({ ...destForm, departureDate: e.target.value })} required style={inputStyle} />
                    <textarea
                      placeholder="Opis / Napomene"
                      value={destForm.description}
                      onChange={(e) => setDestForm({ ...destForm, description: e.target.value })}
                      style={{ ...inputStyle, gridColumn: "1 / -1", resize: "vertical" }}
                      rows={2}
                    />
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

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 16 }}>
                {destinations.map((d) => (
                  <div key={d.id} style={{
                    background: "white", borderRadius: 12,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                  }}>
                    <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "16px 20px", borderRadius: "12px 12px 0 0" }}>
                      <h4 style={{ color: "white", fontWeight: 700 }}>{d.name}</h4>
                      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>📍 {d.location || "Bez lokacije"}</p>
                    </div>
                    <div style={{ padding: "16px 20px" }}>
                      <p style={{ fontSize: 13, color: "#718096" }}>
                        {formatDate(d.arrivalDate)} → {formatDate(d.departureDate)}
                      </p>
                      {d.description && (
                        <p style={{ fontSize: 13, color: "#4a5568", marginTop: 8 }}>📝 {d.description}</p>
                      )}

                      {editingDestId === d.id ? (
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const updated = await travelService.updateDestination(d.id, editDestForm, token!);
                          setDestinations(destinations.map((x) => x.id === d.id ? updated : x));
                          setEditingDestId(null);
                        }} style={{ marginTop: 12 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                            <input placeholder="Naziv *" value={editDestForm.name} onChange={(e) => setEditDestForm({ ...editDestForm, name: e.target.value })} required style={inputStyle} />
                            <input placeholder="Lokacija" value={editDestForm.location} onChange={(e) => setEditDestForm({ ...editDestForm, location: e.target.value })} style={inputStyle} />
                            <input type="date" value={editDestForm.arrivalDate} onChange={(e) => setEditDestForm({ ...editDestForm, arrivalDate: e.target.value })} required style={inputStyle} />
                            <input type="date" value={editDestForm.departureDate} onChange={(e) => setEditDestForm({ ...editDestForm, departureDate: e.target.value })} required style={inputStyle} />
                            <textarea placeholder="Opis" value={editDestForm.description} onChange={(e) => setEditDestForm({ ...editDestForm, description: e.target.value })} style={{ ...inputStyle, gridColumn: "1 / -1", resize: "vertical" }} rows={2} />
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button type="submit" style={{
                              background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
                              color: "white", border: "none", borderRadius: 6,
                              padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer"
                            }}>
                              Sačuvaj
                            </button>
                            <button type="button" onClick={() => setEditingDestId(null)} style={{
                              background: "#edf2f7", color: "#4a5568", border: "none",
                              borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer"
                            }}>
                              Otkaži
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button onClick={() => {
                            setEditingDestId(d.id);
                            setEditDestForm({
                              name: d.name,
                              location: d.location || "",
                              arrivalDate: d.arrivalDate.split("T")[0],
                              departureDate: d.departureDate.split("T")[0],
                              description: d.description || ""
                            });
                          }} style={{
                            background: "#edf2f7", color: "#4a5568", border: "none",
                            borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer"
                          }}>
                            ✏️ Uredi
                          </button>
                          <button onClick={async () => {
                            await travelService.deleteDestination(d.id, token!);
                            setDestinations(destinations.filter((x) => x.id !== d.id));
                          }} style={{
                            background: "#fff5f5", color: "#c53030", border: "none",
                            borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer"
                          }}>
                            🗑️ Obriši
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───────────── Activities Tab ───────────── */}
          {activeTab === "activities" && (
            <div>
              {/* Add Activity Form */}
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
                  const act = await travelService.createActivity(Number(id), actFormToSend, token!);
                  setActivities([...activities, act]);
                  setActForm({ name: "", activityDate: "", activityTime: "", location: "", description: "", estimatedCost: 0, status: "planned" });
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <input placeholder="Naziv aktivnosti *" value={actForm.name} onChange={(e) => setActForm({ ...actForm, name: e.target.value })} required style={inputStyle} />
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
                    <textarea
                      placeholder="Opis aktivnosti"
                      value={actForm.description}
                      onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                      style={{ ...inputStyle, gridColumn: "1 / -1", resize: "vertical" }}
                      rows={2}
                    />
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

              {/* List / Calendar toggle */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button
                  onClick={() => setActivityView("list")}
                  style={{
                    padding: "8px 20px", borderRadius: 8, border: "none",
                    fontWeight: 600, fontSize: 13, cursor: "pointer",
                    background: activityView === "list"
                      ? "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)"
                      : "#edf2f7",
                    color: activityView === "list" ? "white" : "#718096",
                    transition: "all 0.2s"
                  }}
                >
                  ☰ Lista
                </button>
                <button
                  onClick={() => setActivityView("calendar")}
                  style={{
                    padding: "8px 20px", borderRadius: 8, border: "none",
                    fontWeight: 600, fontSize: 13, cursor: "pointer",
                    background: activityView === "calendar"
                      ? "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)"
                      : "#edf2f7",
                    color: activityView === "calendar" ? "white" : "#718096",
                    transition: "all 0.2s"
                  }}
                >
                  📅 Kalendar
                </button>
              </div>

              {/* ── CALENDAR VIEW ── */}
              {activityView === "calendar" && (
                <div style={{
                  background: "white", borderRadius: 16, padding: 24,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                }}>
                  {/* Month navigation */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <button
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                      style={{
                        background: "#edf2f7", border: "none", borderRadius: 8,
                        padding: "8px 16px", cursor: "pointer", fontSize: 18, lineHeight: 1
                      }}
                    >
                      ‹
                    </button>
                    <h3 style={{ color: "#2d3748", fontWeight: 700, fontSize: 18, textTransform: "capitalize" }}>
                      {calendarMonth.toLocaleDateString("sr-RS", { month: "long", year: "numeric" })}
                    </h3>
                    <button
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                      style={{
                        background: "#edf2f7", border: "none", borderRadius: 8,
                        padding: "8px 16px", cursor: "pointer", fontSize: 18, lineHeight: 1
                      }}
                    >
                      ›
                    </button>
                  </div>

                  {/* Day-of-week headers */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                    {["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"].map((d) => (
                      <div key={d} style={{
                        textAlign: "center", fontSize: 12, fontWeight: 700,
                        color: "#718096", padding: "6px 0"
                      }}>
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  {(() => {
                    const { firstDay, daysInMonth } = getDaysInMonth(calendarMonth);
                    const today = new Date();
                    const cells: React.ReactNode[] = [];

                    // Empty cells before first day
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} style={{ minHeight: 80 }} />);
                    }

                    for (let day = 1; day <= daysInMonth; day++) {
                      const dayActivities = getActivitiesForDay(day);
                      const isToday =
                        today.getDate() === day &&
                        today.getMonth() === calendarMonth.getMonth() &&
                        today.getFullYear() === calendarMonth.getFullYear();

                      cells.push(
                        <div key={day} style={{
                          minHeight: 80,
                          border: `1px solid ${isToday ? "#4f8ef7" : "#e2e8f0"}`,
                          borderRadius: 8,
                          padding: "6px 8px",
                          background: isToday ? "#ebf8ff" : "white",
                        }}>
                          <div style={{
                            fontSize: 13,
                            fontWeight: isToday ? 700 : 500,
                            color: isToday ? "#4f8ef7" : "#4a5568",
                            marginBottom: 4
                          }}>
                            {day}
                          </div>
                          {dayActivities
                            .sort((a, b) => (a.activityTime || "").localeCompare(b.activityTime || ""))
                            .map((a) => (
                              <div
                                key={a.id}
                                title={`${a.name}${a.location ? ` • ${a.location}` : ""}${a.estimatedCost ? ` • ${a.estimatedCost} €` : ""}`}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  background: statusColors[a.status] + "22",
                                  color: statusColors[a.status],
                                  borderLeft: `3px solid ${statusColors[a.status]}`,
                                  borderRadius: "0 4px 4px 0",
                                  padding: "2px 5px",
                                  marginBottom: 2,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  cursor: "default"
                                }}
                              >
                                {a.activityTime ? a.activityTime.substring(0, 5) + " " : ""}
                                {a.name}
                              </div>
                            ))}
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                        {cells}
                      </div>
                    );
                  })()}

                  {/* Legend */}
                  <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                        <div style={{
                          width: 12, height: 12, borderRadius: 2,
                          background: statusColors[key],
                          opacity: 0.8
                        }} />
                        <span style={{ color: "#718096" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── LIST VIEW (grouped by date) ── */}
              {activityView === "list" && (
                <div>
                  {activities.length === 0 ? (
                    <div style={{
                      background: "white", borderRadius: 12, padding: 40,
                      textAlign: "center", color: "#a0aec0",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                    }}>
                      Nema aktivnosti. Dodaj prvu aktivnost iznad.
                    </div>
                  ) : (
                    (() => {
                      // Group by date
                      const grouped: Record<string, Activity[]> = {};
                      [...activities]
                        .sort((a, b) => a.activityDate.localeCompare(b.activityDate))
                        .forEach((a) => {
                          const key = a.activityDate.split("T")[0];
                          if (!grouped[key]) grouped[key] = [];
                          grouped[key].push(a);
                        });

                      return Object.entries(grouped).map(([date, acts]) => (
                        <div key={date} style={{ marginBottom: 24 }}>
                          {/* Date header */}
                          <div style={{
                            display: "flex", alignItems: "center", gap: 10,
                            marginBottom: 10
                          }}>
                            <div style={{
                              width: 3, height: 20, borderRadius: 2,
                              background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)"
                            }} />
                            <span style={{
                              fontSize: 13, fontWeight: 700, color: "#4f8ef7",
                              textTransform: "capitalize"
                            }}>
                              {new Date(date).toLocaleDateString("sr-Latn-RS", {
                                weekday: "long", day: "numeric", month: "long", year: "numeric"
                              })}
                            </span>
                            <span style={{
                              background: "#ebf8ff", color: "#4f8ef7",
                              borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600
                            }}>
                              {acts.length} {acts.length === 1 ? "aktivnost" : "aktivnosti"}
                            </span>
                          </div>

                          {/* Activity cards for this date */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {acts
                              .sort((a, b) => (a.activityTime || "").localeCompare(b.activityTime || ""))
                              .map((a) => (
                                <ActivityCard key={a.id} a={a} />
                              ))}
                          </div>
                        </div>
                      ));
                    })()
                  )}
                </div>
              )}

              {/* Edit Activity Modal */}
              {editingActId && (
                <div style={{
                  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                  background: "rgba(0,0,0,0.5)", display: "flex",
                  alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                  <div style={{
                    background: "white", borderRadius: 16, padding: 32,
                    width: "100%", maxWidth: 560, boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                  }}>
                    <h3 style={{ marginBottom: 20, color: "#2d3748" }}>✏️ Uredi aktivnost</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formToSend = {
                        ...editActForm,
                        activityTime: editActForm.activityTime ? editActForm.activityTime + ":00" : undefined
                      };
                      const updated = await travelService.updateActivity(editingActId, formToSend, token!);
                      setActivities(activities.map((x) => x.id === editingActId ? updated : x));
                      setEditingActId(null);
                    }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                        <input placeholder="Naziv *" value={editActForm.name} onChange={(e) => setEditActForm({ ...editActForm, name: e.target.value })} required style={inputStyle} />
                        <input placeholder="Lokacija" value={editActForm.location} onChange={(e) => setEditActForm({ ...editActForm, location: e.target.value })} style={inputStyle} />
                        <input type="date" value={editActForm.activityDate} onChange={(e) => setEditActForm({ ...editActForm, activityDate: e.target.value })} required style={inputStyle} />
                        <input type="time" value={editActForm.activityTime} onChange={(e) => setEditActForm({ ...editActForm, activityTime: e.target.value })} style={inputStyle} />
                        <input type="number" placeholder="Procijenjeni trošak (€)" value={editActForm.estimatedCost || ""} onChange={(e) => setEditActForm({ ...editActForm, estimatedCost: Number(e.target.value) })} min={0} style={inputStyle} />
                        <select value={editActForm.status} onChange={(e) => setEditActForm({ ...editActForm, status: e.target.value })} style={inputStyle}>
                          <option value="planned">Planirano</option>
                          <option value="reserved">Rezervisano</option>
                          <option value="completed">Završeno</option>
                          <option value="cancelled">Otkazano</option>
                        </select>
                        <textarea placeholder="Opis" value={editActForm.description} onChange={(e) => setEditActForm({ ...editActForm, description: e.target.value })} style={{ ...inputStyle, gridColumn: "1 / -1", resize: "vertical" }} rows={2} />
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button type="submit" style={{
                          flex: 1, background: "linear-gradient(135deg, #4f8ef7 0%, #38b2ac 100%)",
                          color: "white", border: "none", borderRadius: 8,
                          padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer"
                        }}>
                          Sačuvaj
                        </button>
                        <button type="button" onClick={() => setEditingActId(null)} style={{
                          padding: "12px 24px", background: "#edf2f7", color: "#4a5568",
                          border: "none", borderRadius: 8, fontSize: 15, cursor: "pointer"
                        }}>
                          Otkaži
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───────────── Checklist Tab ───────────── */}
          {activeTab === "checklist" && (
            <div>
              <div style={{
                background: "white", borderRadius: 16, padding: 24,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24
              }}>
                <h3 style={{ marginBottom: 16, color: "#2d3748" }}>Dodaj stavku</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const item = await travelService.createChecklistItem(Number(id), { name: checklistName }, token!);
                  setChecklistItems([...checklistItems, item]);
                  setChecklistName("");
                }} style={{ display: "flex", gap: 12 }}>
                  <input
                    placeholder="Nova stavka (npr. Pasoš, Karta...)"
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

              <div style={{
                background: "white", borderRadius: 16, padding: 24,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
              }}>
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
                          const updated = await travelService.toggleChecklistItem(item.id, token!);
                          setChecklistItems(checklistItems.map((x) => x.id === item.id ? updated : x));
                        }}
                        style={{ width: 18, height: 18, cursor: "pointer" }}
                      />
                      <span style={{
                        flex: 1, fontSize: 15,
                        textDecoration: item.isCompleted ? "line-through" : "none",
                        color: item.isCompleted ? "#a0aec0" : "#2d3748"
                      }}>
                        {item.name}
                      </span>
                      <button onClick={async () => {
                        await travelService.deleteChecklistItem(item.id, token!);
                        setChecklistItems(checklistItems.filter((x) => x.id !== item.id));
                      }} style={{
                        background: "#fff5f5", color: "#c53030", border: "none",
                        borderRadius: 6, padding: "4px 10px", fontSize: 13, cursor: "pointer"
                      }}>
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ───────────── Expenses Tab ───────────── */}
          {activeTab === "expenses" && (
            <div>
              <div style={{
                background: "white", borderRadius: 16, padding: 24,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24
              }}>
                <h3 style={{ marginBottom: 16, color: "#2d3748" }}>Dodaj trošak</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const exp = await financeService.createExpense(Number(id), expForm, token!);
                  setExpenses([...expenses, exp]);
                  setExpForm({ name: "", category: "transport", amount: 0, expenseDate: "", description: "" });
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <input placeholder="Naziv troška *" value={expForm.name} onChange={(e) => setExpForm({ ...expForm, name: e.target.value })} required style={inputStyle} />
                    <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} style={inputStyle}>
                      <option value="transport">🚗 Prevoz</option>
                      <option value="accommodation">🏨 Smještaj</option>
                      <option value="food">🍽️ Hrana</option>
                      <option value="tickets">🎟️ Ulaznice</option>
                      <option value="shopping">🛍️ Kupovina</option>
                      <option value="other">📦 Ostalo</option>
                    </select>
                    <input type="number" placeholder="Iznos (€) *" value={expForm.amount || ""} onChange={(e) => setExpForm({ ...expForm, amount: Number(e.target.value) })} required min={0} style={inputStyle} />
                    <input type="date" value={expForm.expenseDate} onChange={(e) => setExpForm({ ...expForm, expenseDate: e.target.value })} required style={inputStyle} />
                    <textarea
                      placeholder="Opis troška"
                      value={expForm.description}
                      onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                      style={{ ...inputStyle, gridColumn: "1 / -1", resize: "vertical" }}
                      rows={2}
                    />
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

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {expenses.map((exp) => (
                  <div key={exp.id} style={{
                    background: "white", borderRadius: 12, padding: "16px 20px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <h4 style={{ color: "#2d3748", fontWeight: 600 }}>{exp.name}</h4>
                      <p style={{ fontSize: 13, color: "#718096" }}>
                        {exp.category} • {formatDate(exp.expenseDate)}
                      </p>
                      {exp.description && (
                        <p style={{ fontSize: 13, color: "#4a5568", marginTop: 4 }}>📝 {exp.description}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "#276749" }}>{exp.amount} €</span>
                      <button onClick={async () => {
                        await financeService.deleteExpense(exp.id, token!);
                        setExpenses(expenses.filter((x) => x.id !== exp.id));
                      }} style={{
                        background: "#fff5f5", color: "#c53030", border: "none",
                        borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer"
                      }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TravelPlanDetailPage;