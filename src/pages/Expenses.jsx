import { useMemo, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const today = new Date().toISOString().split("T")[0];

const CATEGORY_OPTIONS = [
  "Food",
  "Transport",
  "Study",
  "Rent",
  "Shopping",
  "Health",
  "Entertainment",
  "Other",
];

const ANALYSIS_PERIODS = {
  daily: "Daily",
  monthly: "Monthly",
  yearly: "Yearly",
};

const expenseDefaults = {
  category: "Food",
  price: "",
  quantity: "1",
  date: today,
  note: "",
};

const futureDefaults = {
  name: "",
  category: "Shopping",
  price: "",
  quantity: "1",
  targetDate: "",
  note: "",
};

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

function formatMoney(value) {
  return `BDT ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function getPeriodKey(dateString, period) {
  if (!dateString) return "Not set";
  if (period === "daily") return dateString;
  if (period === "monthly") return dateString.slice(0, 7);
  return dateString.slice(0, 4);
}

function periodLabel(key, period) {
  if (key === "Not set") return key;
  if (period === "daily") return formatDate(key);
  if (period === "monthly") {
    const [year, month] = key.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  }
  return key;
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 14px" }}>
      <div style={{ flex: 1, height: 1, background: "#d9dee7" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#667085", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#d9dee7" }} />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 10, marginTop: 2, color: "#667085" }}>{label}</div>
    </div>
  );
}

function AnalysisPanel({ expenses, period }) {
  const grouped = useMemo(() => {
    const map = {};
    expenses.forEach((expense) => {
      const key = getPeriodKey(expense.date, period);
      if (!map[key]) map[key] = { key, items: [], total: 0, categories: {} };
      const amount = Number(expense.price || 0) * Number(expense.quantity || 0);
      map[key].items.push(expense);
      map[key].total += amount;
      map[key].categories[expense.category] = (map[key].categories[expense.category] || 0) + amount;
    });
    return Object.values(map).sort((a, b) => {
      if (a.key === "Not set") return 1;
      if (b.key === "Not set") return -1;
      return b.key.localeCompare(a.key);
    });
  }, [expenses, period]);

  if (!expenses.length) {
    return <p style={emptyStyle}>No expenses to analyze yet.</p>;
  }

  const maxTotal = Math.max(...grouped.map((entry) => entry.total));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {grouped.map((entry) => {
        const barPercent = maxTotal > 0 ? (entry.total / maxTotal) * 100 : 0;
        const topCategory = Object.entries(entry.categories).sort((a, b) => b[1] - a[1])[0];

        return (
          <div key={entry.key} style={analysisCardStyle}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ minWidth: 110 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{periodLabel(entry.key, period)}</p>
                <p style={{ fontSize: 11, color: "#667085" }}>{entry.items.length} expense{entry.items.length !== 1 ? "s" : ""}</p>
              </div>
              <div style={{ flex: 1, minWidth: 130, height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${barPercent}%`, height: "100%", background: "#2563eb", borderRadius: 99 }} />
              </div>
              <span style={{ fontWeight: 800, color: "#111827", whiteSpace: "nowrap" }}>{formatMoney(entry.total)}</span>
              {topCategory && <span style={pillStyle}>Top: {topCategory[0]}</span>}
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {Object.entries(entry.categories)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => (
                  <span key={category} style={smallPillStyle}>
                    {category} - {formatMoney(amount)}
                  </span>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useLocalStorage("dashboard-expenses", [], 1);
  const [futureBuys, setFutureBuys] = useLocalStorage("dashboard-future-buys", [], 1);
  const [expenseForm, setExpenseForm] = useState({ ...expenseDefaults });
  const [futureForm, setFutureForm] = useState({ ...futureDefaults });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editingFutureId, setEditingFutureId] = useState(null);
  const [analysisPeriod, setAnalysisPeriod] = useState("daily");

  function setExpenseField(key, value) {
    setExpenseForm((current) => ({ ...current, [key]: value }));
  }

  function setFutureField(key, value) {
    setFutureForm((current) => ({ ...current, [key]: value }));
  }

  function saveExpense() {
    if (!expenseForm.category.trim() || Number(expenseForm.price) <= 0) return;
    const entry = {
      id: editingExpenseId || Date.now(),
      category: expenseForm.category.trim(),
      price: Number(expenseForm.price),
      quantity: Math.max(1, Number(expenseForm.quantity) || 1),
      date: expenseForm.date || today,
      note: expenseForm.note.trim(),
    };
    setExpenses((current) => (
      editingExpenseId
        ? current.map((expense) => (expense.id === editingExpenseId ? entry : expense))
        : [...current, entry]
    ));
    setExpenseForm({ ...expenseDefaults });
    setEditingExpenseId(null);
  }

  function startEditExpense(expense) {
    setEditingExpenseId(expense.id);
    setExpenseForm({
      category: expense.category || "Other",
      price: expense.price != null ? String(expense.price) : "",
      quantity: expense.quantity != null ? String(expense.quantity) : "1",
      date: expense.date || today,
      note: expense.note || "",
    });
  }

  function cancelExpenseEdit() {
    setEditingExpenseId(null);
    setExpenseForm({ ...expenseDefaults });
  }

  function deleteExpense(id) {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
    if (editingExpenseId === id) cancelExpenseEdit();
  }

  function saveFutureBuy() {
    if (!futureForm.name.trim() || Number(futureForm.price) <= 0) return;
    const entry = {
      id: editingFutureId || Date.now(),
      name: futureForm.name.trim(),
      category: futureForm.category,
      price: Number(futureForm.price),
      quantity: Math.max(1, Number(futureForm.quantity) || 1),
      targetDate: futureForm.targetDate,
      note: futureForm.note.trim(),
      bought: editingFutureId ? futureBuys.find((item) => item.id === editingFutureId)?.bought || false : false,
      addedDate: editingFutureId ? futureBuys.find((item) => item.id === editingFutureId)?.addedDate || today : today,
    };
    setFutureBuys((current) => (
      editingFutureId
        ? current.map((item) => (item.id === editingFutureId ? entry : item))
        : [...current, entry]
    ));
    setFutureForm({ ...futureDefaults });
    setEditingFutureId(null);
  }

  function startEditFuture(item) {
    setEditingFutureId(item.id);
    setFutureForm({
      name: item.name || "",
      category: item.category || "Shopping",
      price: item.price != null ? String(item.price) : "",
      quantity: item.quantity != null ? String(item.quantity) : "1",
      targetDate: item.targetDate || "",
      note: item.note || "",
    });
  }

  function cancelFutureEdit() {
    setEditingFutureId(null);
    setFutureForm({ ...futureDefaults });
  }

  function deleteFutureBuy(id) {
    setFutureBuys((current) => current.filter((item) => item.id !== id));
    if (editingFutureId === id) cancelFutureEdit();
  }

  function toggleBought(id) {
    setFutureBuys((current) => current.map((item) => (item.id === id ? { ...item, bought: !item.bought } : item)));
  }

  const sortedExpenses = [...expenses].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const sortedFutureBuys = [...futureBuys].sort((a, b) => (a.bought === b.bought ? (a.targetDate || "").localeCompare(b.targetDate || "") : a.bought ? 1 : -1));
  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.price || 0) * Number(expense.quantity || 0), 0);
  const todayTotal = expenses
    .filter((expense) => expense.date === today)
    .reduce((sum, expense) => sum + Number(expense.price || 0) * Number(expense.quantity || 0), 0);
  const monthTotal = expenses
    .filter((expense) => expense.date?.slice(0, 7) === today.slice(0, 7))
    .reduce((sum, expense) => sum + Number(expense.price || 0) * Number(expense.quantity || 0), 0);
  const futureTotal = futureBuys
    .filter((item) => !item.bought)
    .reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Expenses</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Total Spent" value={formatMoney(totalSpent)} />
        <StatCard label="Today" value={formatMoney(todayTotal)} />
        <StatCard label="This Month" value={formatMoney(monthTotal)} />
        <StatCard label="Future Buy" value={formatMoney(futureTotal)} />
      </div>

      <Divider label="ADD EXPENSE" />

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#111827" }}>
          {editingExpenseId ? "Edit expense" : "Add expense"}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ minWidth: 150 }}>
            <label style={labelStyle}>Category</label>
            <select value={expenseForm.category} onChange={(event) => setExpenseField("category", event.target.value)}>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={labelStyle}>Price</label>
            <input type="number" min="0" step="0.01" value={expenseForm.price} onChange={(event) => setExpenseField("price", event.target.value)} placeholder="0" />
          </div>
          <div style={{ minWidth: 100 }}>
            <label style={labelStyle}>Quantity</label>
            <input type="number" min="1" step="1" value={expenseForm.quantity} onChange={(event) => setExpenseField("quantity", event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={labelStyle}>Date</label>
            <input type="date" value={expenseForm.date} onChange={(event) => setExpenseField("date", event.target.value)} />
          </div>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Note</label>
            <input value={expenseForm.note} onChange={(event) => setExpenseField("note", event.target.value)} onKeyDown={(event) => event.key === "Enter" && saveExpense()} placeholder="Optional detail" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveExpense} style={buttonStyle}>{editingExpenseId ? "Save Changes" : "Add Expense"}</button>
            {editingExpenseId && <button onClick={cancelExpenseEdit} style={ghostButtonStyle}>Cancel</button>}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Expense List</div>
        {sortedExpenses.length === 0 ? (
          <p style={emptyStyle}>No expenses yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedExpenses.map((expense, index) => {
                  const total = Number(expense.price || 0) * Number(expense.quantity || 0);
                  return (
                    <tr key={expense.id}>
                      <td>{index + 1}</td>
                      <td>{formatDate(expense.date)}</td>
                      <td>{expense.category}</td>
                      <td>{formatMoney(expense.price)}</td>
                      <td>{expense.quantity}</td>
                      <td>{formatMoney(total)}</td>
                      <td>{expense.note || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => startEditExpense(expense)} style={ghostButtonStyle}>Edit</button>
                          <button onClick={() => deleteExpense(expense.id)} style={ghostButtonStyle}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Divider label="ANALYSIS" />
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(ANALYSIS_PERIODS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setAnalysisPeriod(key)}
            style={{
              fontSize: 12,
              padding: "6px 18px",
              borderRadius: 99,
              border: "1px solid #d0d5dd",
              cursor: "pointer",
              background: analysisPeriod === key ? "#111827" : "#ffffff",
              color: analysisPeriod === key ? "#ffffff" : "#475467",
              fontWeight: analysisPeriod === key ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <AnalysisPanel expenses={expenses} period={analysisPeriod} />

      <Divider label="FUTURE BUY" />

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#111827" }}>
          {editingFutureId ? "Edit future buy" : "Add future buy"}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={labelStyle}>Item</label>
            <input value={futureForm.name} onChange={(event) => setFutureField("name", event.target.value)} onKeyDown={(event) => event.key === "Enter" && saveFutureBuy()} placeholder="What do you want to buy?" />
          </div>
          <div style={{ minWidth: 140 }}>
            <label style={labelStyle}>Category</label>
            <select value={futureForm.category} onChange={(event) => setFutureField("category", event.target.value)}>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 110 }}>
            <label style={labelStyle}>Price</label>
            <input type="number" min="0" step="0.01" value={futureForm.price} onChange={(event) => setFutureField("price", event.target.value)} placeholder="0" />
          </div>
          <div style={{ minWidth: 90 }}>
            <label style={labelStyle}>Quantity</label>
            <input type="number" min="1" step="1" value={futureForm.quantity} onChange={(event) => setFutureField("quantity", event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={labelStyle}>Target Date</label>
            <input type="date" value={futureForm.targetDate} onChange={(event) => setFutureField("targetDate", event.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={labelStyle}>Note</label>
            <input value={futureForm.note} onChange={(event) => setFutureField("note", event.target.value)} placeholder="Store, model, reason" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveFutureBuy} style={buttonStyle}>{editingFutureId ? "Save Changes" : "Add Item"}</button>
            {editingFutureId && <button onClick={cancelFutureEdit} style={ghostButtonStyle}>Cancel</button>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sortedFutureBuys.length === 0 && <p style={emptyStyle}>No future buy items yet.</p>}
        {sortedFutureBuys.map((item, index) => {
          const total = Number(item.price || 0) * Number(item.quantity || 0);
          return (
            <div key={item.id} className="card" style={{ display: "flex", gap: 12, alignItems: "center", opacity: item.bought ? 0.58 : 1, marginBottom: 0 }}>
              <div style={numberBadgeStyle}>{index + 1}</div>
              <button
                onClick={() => toggleBought(item.id)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  padding: 0,
                  background: item.bought ? "#16a34a" : "#ffffff",
                  border: item.bought ? "1px solid #16a34a" : "2px solid #98a2b3",
                  color: "#ffffff",
                  fontSize: 10,
                  flexShrink: 0,
                }}
                title="Mark bought"
              >
                {item.bought ? "OK" : ""}
              </button>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: item.bought ? "#667085" : "#111827", textDecoration: item.bought ? "line-through" : "none" }}>{item.name}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 3 }}>
                  <span style={smallPillStyle}>{item.category}</span>
                  {item.targetDate && <span style={smallPillStyle}>Target {formatDate(item.targetDate)}</span>}
                  {item.note && <span style={smallPillStyle}>{item.note}</span>}
                </div>
              </div>
              <span style={{ fontWeight: 800, color: "#111827", whiteSpace: "nowrap" }}>{formatMoney(total)}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEditFuture(item)} style={ghostButtonStyle}>Edit</button>
                <button onClick={() => deleteFutureBuy(item.id)} style={ghostButtonStyle}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 11, color: "#667085", display: "block", marginBottom: 3 };
const emptyStyle = { fontSize: 13, color: "#667085", textAlign: "center", padding: "20px 0" };

const statCardStyle = {
  flex: 1,
  minWidth: 130,
  padding: "12px 14px",
  borderRadius: 10,
  background: "#ffffff",
  color: "#111827",
  textAlign: "center",
  border: "1px solid #d9dee7",
};

const analysisCardStyle = {
  border: "1px solid #d9dee7",
  borderRadius: 12,
  padding: 14,
  background: "#ffffff",
};

const buttonStyle = {
  alignSelf: "flex-end",
  background: "#111827",
  color: "#ffffff",
  border: "1px solid #111827",
  borderRadius: 8,
  padding: "9px 16px",
  cursor: "pointer",
  fontSize: 13,
};

const ghostButtonStyle = {
  background: "transparent",
  border: "1px solid #d0d5dd",
  cursor: "pointer",
  color: "#475467",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 12,
};

const pillStyle = {
  fontSize: 11,
  padding: "2px 8px",
  borderRadius: 99,
  background: "#f7f8fa",
  color: "#111827",
  border: "1px solid #d0d5dd",
  whiteSpace: "nowrap",
};

const smallPillStyle = {
  fontSize: 10,
  padding: "2px 7px",
  borderRadius: 99,
  background: "#eef4ff",
  color: "#475467",
  border: "1px solid #d0d5dd",
};

const numberBadgeStyle = {
  minWidth: 34,
  height: 34,
  borderRadius: 999,
  background: "#eef4ff",
  border: "1px solid #d0d5dd",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#111827",
  fontSize: 13,
  fontWeight: 700,
  flexShrink: 0,
};
