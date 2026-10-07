import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../components/Auth";
import { useDialog } from "../components/Dialog";

export default function Login() {
  const { user, login } = useAuth();
  const dialog = useDialog();
  const nav = useNavigate();
  const [f, setF] = useState({ username: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!f.username.trim() || !f.password) { setError("Enter your username and password."); return; }
    setBusy(true); setError("");
    try {
      const r = await login(f.username.trim(), f.password);
      dialog.toast(`Welcome back, ${r.name}!`);
      nav("/", { replace: true });
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Cannot reach the server. Is the backend running?" : err.message);
    }
    setBusy(false);
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="hero-brand"><span className="logo">🧊</span>Product Management</div>
        <div>
          <h2>Manage your products,<br />all in one place.</h2>
          <p>Track inventory, organise categories and keep your catalogue up to date with a fast, simple dashboard.</p>
          <ul className="hero-list">
            <li><span>✓</span>Add, edit and delete products</li>
            <li><span>✓</span>Live stock and pricing control</li>
            <li><span>✓</span>Categories, search and filters</li>
            <li><span>✓</span>product insights</li>
          </ul>
        </div>
        <small style={{ color: "#a5b4fc" }}>© {new Date().getFullYear()} Product Management</small>
      </div>

      <div className="login-side">
        <div className="login-card">
          <h1>Welcome back 👋</h1>
          <p className="muted" style={{ marginBottom: 0 }}>Sign in to your admin account</p>
          <form onSubmit={submit} noValidate>
            <label>Username
              <div className="input-icon">
                <i>👤</i>
                <input className="input" autoFocus placeholder="Enter username" value={f.username}
                       onChange={(e) => setF({ ...f, username: e.target.value })} />
              </div>
            </label>
            <label>Password
              <div className="input-icon pw">
                <i>🔒</i>
                <input className="input" type={show ? "text" : "password"} placeholder="Enter password" value={f.password}
                       onChange={(e) => setF({ ...f, password: e.target.value })} />
                <button type="button" className="eye" onClick={() => setShow(!show)}>{show ? "🙈" : "👁️"}</button>
              </div>
            </label>
            {error && <div className="error" style={{ margin: 0 }}>{error}</div>}
            <button className="btn primary" disabled={busy}>{busy ? "Signing in..." : "Sign In"}</button>
          </form>
          <p className="login-hint">Default login: <b>admin</b> / <b>Admin@123</b></p>
        </div>
      </div>
    </div>
  );
}
