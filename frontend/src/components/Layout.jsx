import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./Auth";
import { useDialog } from "./Dialog";

const links = [
  ["/", "🏠", "Dashboard"],
  ["/products", "📦", "Products"],
  ["/categories", "🏷️", "Categories"],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const dialog = useDialog();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    const ok = await dialog.confirm({
      title: "Log out?", message: "You will need to sign in again to access the dashboard.", confirmText: "Log out",
    });
    if (!ok) return;
    logout();
    dialog.toast("Logged out successfully");
    nav("/login", { replace: true });
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span className="logo">🧊</span><b>Product<br />Management</b></div>
        <nav>
          {links.map(([to, icon, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <button className="nav-link logout" onClick={handleLogout}><span>🚪</span>Logout</button>
      </aside>
      <div className="main">
        <header className="topbar" style={{ justifyContent: "flex-end" }}>
          <div className="topbar-right">
            <div className="user-menu" ref={menuRef}>
              <button className="user-btn" onClick={() => setOpen(!open)}>
                <span className="avatar">{user.name?.[0]?.toUpperCase() || "A"}</span>
                <span>{user.name} ▾</span>
              </button>
              {open && (
                <div className="dropdown">
                  <div className="dd-head"><b>{user.name}</b><small>@{user.username}</small></div>
                  <button onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <section className="content"><Outlet /></section>
      </div>
    </div>
  );
}