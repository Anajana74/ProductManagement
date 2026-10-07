import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { api.dashboard().then(setD).catch((e) => setError(e.message)); }, []);

  if (error) return <div className="card error">{error}</div>;
  if (!d) return <p className="muted">Loading...</p>;

  const stats = [
    ["Total Products", d.totalProducts, "📦", "#e0edff"],
    ["Active Products", d.activeProducts, "✅", "#dcfce7"],
    ["Out of Stock", d.outOfStock, "🛍️", "#fee2e2"],
    ["Total Categories", d.totalCategories, "📄", "#ede9fe"],
  ];
  const max = Math.max(1, ...d.overview.map((m) => m.count));

  return (
    <>
      <h1>Dashboard</h1>
      <p className="muted">Welcome back, Admin!</p>
      <div className="stats">
        {stats.map(([label, value, icon, bg]) => (
          <div className="card stat" key={label}>
            <div className="stat-icon" style={{ background: bg }}>{icon}</div>
            <div><small className="muted">{label}</small><h2>{value}</h2></div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Product Overview</h3>
          <div className="bars">
            {d.overview.map((m) => (
              <div className="bar-col" key={m.month}>
                <small>{m.count}</small>
                <div className="bar" style={{ height: (m.count / max) * 170 + 4 }} />
                <small>{m.month}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="row-between"><h3>Recent Products</h3><Link to="/products">View All</Link></div>
          <table className="table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
            <tbody>
              {d.recentProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td><td>{p.category}</td><td>₹{p.price.toLocaleString()}</td><td>{p.stock}</td>
                  <td><span className={"badge " + (p.status === "Active" ? "green" : "red")}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
