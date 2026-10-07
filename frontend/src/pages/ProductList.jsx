import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, imgUrl } from "../api";
import { useDialog } from "../components/Dialog";

const PAGE_SIZE = 10;

export default function ProductList() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const dialog = useDialog();

  const load = useCallback(() => {
    const params = { page, pageSize: PAGE_SIZE };
    if (q) params.search = q;
    if (cat) params.categoryId = cat;
    if (status) params.status = status;
    api.products(params).then(setData).catch((e) => setError(e.message));
  }, [q, cat, status, page]);

  useEffect(() => { api.categories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const remove = async (p) => {
    const ok = await dialog.confirm({ title: "Delete product?", message: `"${p.name}" will be permanently removed. This can't be undone.`, confirmText: "Yes, delete", danger: true });
    if (!ok) return;
    try { await api.deleteProduct(p.id); dialog.toast("Product deleted"); load(); }
    catch (e) { dialog.toast(e.message, "error"); }
  };

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const from = data.total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const reset = (setter) => (e) => { setter(e.target.value); setPage(1); };

  return (
    <div className="page-fill">
      <div className="row-between">
        <div><h1>Products</h1><p className="muted">Manage your products</p></div>
        <Link to="/products/add" className="btn primary">+ Add Product</Link>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="filters">
        <input className="input" placeholder="🔍 Search products..." value={q} onChange={reset(setQ)} />
        <select className="input" value={cat} onChange={reset(setCat)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" value={status} onChange={reset(setStatus)}>
          <option value="">All Status</option><option>Active</option><option>Inactive</option><option>Out of Stock</option>
        </select>
      </div>
      <div className="card fill-card">
        <div className="table-scroll">
        <table className="table compact">
          <thead><tr><th>#</th><th>Image</th><th>Product Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {data.items.map((p, i) => (
              <tr key={p.id}>
                <td>{from + i}</td>
                <td><span className="thumb">{p.imageUrl ? <img src={imgUrl(p.imageUrl)} alt="" /> : "📦"}</span></td>
                <td><Link to={`/products/${p.id}`}>{p.name}</Link></td>
                <td>{p.sku}</td><td>{p.category}</td><td>₹{p.price.toLocaleString()}</td><td>{p.stock}</td>
                <td><span className={"badge " + (p.status === "Active" ? "green" : "red")}>{p.status}</span></td>
                <td>
                  <Link to={`/products/edit/${p.id}`} className="icon-btn blue">✏️</Link>
                  <button className="icon-btn red" onClick={() => remove(p)}>🗑️</button>
                </td>
              </tr>
            ))}
            {!data.items.length && <tr><td colSpan="9" className="center muted">No products found</td></tr>}
          </tbody>
        </table>
        </div>
        <div className="row-between">
          <small className="muted">Showing {from} to {from + data.items.length - (data.items.length ? 1 : 0)} of {data.total} products</small>
          <div className="pager">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === page ? "active" : ""} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button disabled={page === pages} onClick={() => setPage(page + 1)}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
