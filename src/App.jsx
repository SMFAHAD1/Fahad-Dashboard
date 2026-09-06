import { useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import Academic from "./pages/Academic";
import Books from "./pages/Books";
import JobPrep from "./pages/JobPrep";
import Movies from "./pages/Movies";
import MyPlan from "./pages/MyPlan";
import University from "./pages/University";
import { useLocalStorage } from "./hooks/useLocalStorage";

const pages = [
  {
    path: "/academic",
    label: "Academic",
    description: "Track terms, courses, CGPA, tests, and tasks.",
    accent: "Sky ledger",
    element: <Academic />,
  },
  {
    path: "/my-plan",
    label: "My Plan",
    description: "Manage personal goals with weekly, monthly, and yearly analysis.",
    accent: "Focus map",
    element: <MyPlan />,
  },
  {
    path: "/movies",
    label: "Movies",
    description: "Save what you watch, ratings, dates, and yearly viewing trends.",
    accent: "Watch log",
    element: <Movies />,
  },
  {
    path: "/job-prep",
    label: "Job Prep",
    description: "Track applications, skills, learning resources, and progress.",
    accent: "Career board",
    element: <JobPrep />,
  },
  {
    path: "/books",
    label: "Books",
    description: "Keep reading logs and a buy list in one place.",
    accent: "Reading room",
    element: <Books />,
  },
  {
    path: "/university",
    label: "University",
    description: "Organize masters and PhD targets, deadlines, and requirements.",
    accent: "Study atlas",
    element: <University />,
  },
];

function Home() {
  return (
    <div className="home-layout">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="hero-kicker">Personal command center</p>
          <h2>One home for study, career, books, movies, and long-term plans.</h2>
          <p className="hero-text">
            Fahad Dashboard brings all six trackers into a single calm space so
            each part of your life stays organized without switching tools.
          </p>
          <div className="hero-actions">
            <NavLink to="/academic" className="hero-primary">
              Open Academic
            </NavLink>
            <NavLink to="/university" className="hero-secondary">
              Explore University
            </NavLink>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <strong>6</strong>
            <span>Connected pages</span>
          </div>
          <div className="hero-stat">
            <strong>Today</strong>
            <span>Make space for what matters</span>
          </div>
        </div>
      </section>

      <section className="home-grid">
        {pages.map((page) => (
          <NavLink key={page.path} to={page.path} className="home-card">
            <span className="home-card-kicker">{page.accent}</span>
            <h2>{page.label}</h2>
            <p>{page.description}</p>
            <span className="home-card-link">Open page</span>
          </NavLink>
        ))}
      </section>
    </div>
  );
}

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const account = JSON.parse(localStorage.getItem("fahad-dashboard-account") || "null");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || password.length < 6) {
      setError("Enter a valid email and a password with at least 6 characters.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("Add your name to create your workspace.");
        return;
      }
      if (account) {
        setError("An account already exists on this device. Sign in instead.");
        return;
      }
      localStorage.setItem(
        "fahad-dashboard-account",
        JSON.stringify({ name: name.trim(), email: normalizedEmail, password })
      );
      onLogin({ name: name.trim(), email: normalizedEmail });
      return;
    }

    if (!account || account.email !== normalizedEmail || account.password !== password) {
      setError("Those details do not match an account on this device.");
      return;
    }
    onLogin({ name: account.name, email: account.email });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-mark">FD</div>
        <p className="eyebrow">Fahad Dashboard</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your workspace"}</h1>
        <p className="auth-copy">
          {mode === "login"
            ? "Sign in to keep your plans, study notes, and lists together."
            : "Set up a private dashboard for the things you are building."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Your name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Fahad" />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit">{mode === "login" ? "Sign in" : "Create account"}</button>
        </form>

        <button className="auth-switch" type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
        <p className="auth-note">Your account is stored on this device.</p>
      </section>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useLocalStorage("fahad-dashboard-session", null);

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">FD</span>
          <div>
            <strong>Fahad Dashboard</strong>
            <span>{session.name}'s personal workspace</span>
          </div>
        </NavLink>

        <div className="account-bar">
          <span>{session.email}</span>
          <button type="button" onClick={() => setSession(null)}>Log out</button>
        </div>

        <nav className="nav-list">
          {pages.map((page) => (
            <NavLink
              key={page.path}
              to={page.path}
              className={({ isActive }) =>
                `nav-link${isActive ? " nav-link-active" : ""}`
              }
            >
              {page.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content-area">
        <header className="page-header">
          <div>
            <p className="eyebrow">Fahad Dashboard</p>
            <h1>Calm workspace, all in one place</h1>
          </div>
          <p className="header-copy">
            A personal dashboard for academics, planning, entertainment,
            career preparation, reading, and university applications.
          </p>
        </header>

        <section className="page-panel">
          <Routes>
            <Route path="/" element={<Home />} />
            {pages.map((page) => (
              <Route key={page.path} path={page.path} element={page.element} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
