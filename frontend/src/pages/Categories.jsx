import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { useDialog } from "../components/Dialog";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const dialog = useDialog();

  const load = useCallback(() => {
    api.categories(q).then(setItems).catch((e) => setError(e.message));
  }, [q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const run = async (fn, msg) => {
    try { await fn(); dialog.toast(msg); load(); } catch (e) { dialog.toast(e.message, "error"); }
  };

  const add = async () => {
    const name = await dialog.prompt({ title: "Add category", message: "Enter a name for the new category.", placeholder: "e.g. Electronics", confirmText: "Add" });
    if (name) run(() => api.createCategory({ name, isActive: true }), "Category added");
  };
  const edit = async (c) => {
    const name = await dialog.prompt({ title: "Edit category", message: "Update the category name.", defaultValue: c.name, confirmText: "Save" });
    if (name) run(() => api.updateCategory(c.id, { name, isActive: c.status === "Active" }), "Category updated");
  };
  const toggle = (c) => run(() => api.updateCategory(c.id, { name: c.name, isActive: c.status !== "Active" }),
    c.status === "Active" ? "Category deactivated" : "Category activated");
  const remove = async (c) => {
    const ok = await dialog.confirm({ title: "Delete category?", message: `"${c.name}" will be removed.`, confirmText: "Yes, delete", danger: true });
    if (ok) run(() => api.deleteCategory(c.id), "Category deleted");
  };

  return (
    <div className="page-fill">
      <div className="row-between">
        <div><h1>Categories</h1><p className="muted">Manage product categories</p></div>
        <button className="btn primary" onClick={add}>+ Add Category</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="filters"><input className="input" placeholder="🔍 Search categories..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="card fill-card">
        <div className="table-scroll">
          <table className="table compact">
            <thead><tr><th>#</th><th>Category Name</th><th>Total Products</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {items.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td><td>{c.name}</td><td>{c.totalProducts}</td>
                  <td><span style={{ cursor: "pointer" }} title="Click to toggle" onClick={() => toggle(c)}
                        className={"badge " + (c.status === "Active" ? "green" : "red")}>{c.status}</span></td>
                  <td>
                    <button className="icon-btn blue" onClick={() => edit(c)}>✏️</button>
                    <button className="icon-btn red" onClick={() => remove(c)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan="5" className="center muted">No categories found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="row-between">
          <small className="muted">Total {items.length} categories</small>
        </div>
      </div>
    </div>
  );
}