import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, imgUrl } from "../api";
import { useDialog } from "../components/Dialog";

export default function ProductDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [sales, setSales] = useState(null);
  const [error, setError] = useState("");
  const dialog = useDialog();

  useEffect(() => {
    api.product(id).then(setP).catch((e) => setError(e.message));
    api.productSales(id).then(setSales).catch(() => {});
  }, [id]);

  const remove = async () => {
    const ok = await dialog.confirm({ title: "Delete product?", message: `"${p.name}" will be permanently removed. This can't be undone.`, confirmText: "Yes, delete", danger: true });
    if (!ok) return;
    try { await api.deleteProduct(id); dialog.toast("Product deleted"); nav("/products"); }
    catch (e) { dialog.toast(e.message, "error"); }
  };

  if (error) return <div className="card error">{error}</div>;
  if (!p) return <p className="muted">Loading...</p>;

  return (
    <>
      <div className="row-between">
        <h1>Product Details</h1>
        <Link to="/products" className="btn">← Back to Products</Link>
      </div>
      <div className="card details">
        <div className="hero-img">{p.imageUrl ? <img src={imgUrl(p.imageUrl)} alt={p.name} /> : "📦"}</div>
        <div>
          <h2>{p.name} <span className={"badge " + (p.status === "Active" ? "green" : "red")}>{p.status}</span></h2>
          <p><b>SKU:</b> {p.sku}</p>
          <p><b>Category:</b> {p.category}</p>
          <p><b>Price:</b> ₹{p.price.toLocaleString()}</p>
          <p><b>Stock Quantity:</b> {p.stock}</p>
          <p><b>Description:</b><br />{p.description}</p>
          <div className="actions left">
            <Link to={`/products/edit/${p.id}`} className="btn primary">✏️ Edit Product</Link>
            <button className="btn danger" onClick={remove}>🗑️ Delete Product</button>
          </div>
        </div>
      </div>
      {sales && (
        <div className="card">
          <h3>Sales</h3>
          <p><b>Units sold:</b> {sales.unitsSold} &nbsp;|&nbsp; <b>Revenue:</b> ₹{sales.revenue.toLocaleString()}</p>
          {sales.sales.length > 0 && (
            <table className="table">
              <thead><tr><th>Date</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
              <tbody>
                {sales.sales.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.soldAt).toLocaleDateString()}</td><td>{s.quantity}</td>
                    <td>₹{s.unitPrice.toLocaleString()}</td><td>₹{s.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
