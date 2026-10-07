import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, imgUrl } from "../api";
import { useDialog } from "../components/Dialog";

const empty = { name: "", sku: "", categoryId: "", price: "", stock: "", description: "", isActive: true };

function Field({ label, span, error, children }) {
  return (
    <label className={"span-" + span + (error ? " has-error" : "")}>
      <span>{label} <span className="req">*</span></span>{children}
      {error && <small className="field-err">{error}</small>}
    </label>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const dialog = useDialog();
  const editing = Boolean(id);
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.categories().then(setCategories).catch((e) => dialog.toast(e.message, "error"));
    if (editing) {
      api.product(id).then((p) => {
        setForm({ name: p.name, sku: p.sku, categoryId: p.categoryId, price: p.price, stock: p.stock,
                  description: p.description || "", isActive: p.isActive });
        setPreview(imgUrl(p.imageUrl));
      }).catch((e) => dialog.toast(e.message, "error"));
    }
    // eslint-disable-next-line
  }, [id, editing]);

  const set = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: "" }); };

  const pickImage = async (e) => {
    const f = e.target.files[0];
    e.target.value = ""; // allows choosing the same file again
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) {
      await dialog.alert({ title: "Unsupported file type", message: "Please choose a PNG or JPG image.", confirmText: "OK, got it" });
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      const mb = (f.size / (1024 * 1024)).toFixed(1);
      await dialog.alert({ title: "Image is too large", message: `Your image is ${mb} MB. The maximum allowed size is 2 MB. Please choose a smaller image.`, confirmText: "OK, got it" });
      return;
    }
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Product name is required";
    if (!form.sku.trim()) er.sku = "SKU is required";
    if (!form.categoryId) er.categoryId = "Select a category";
    if (form.price === "" || +form.price < 0) er.price = "Enter a valid price";
    if (form.stock === "" || +form.stock < 0) er.stock = "Enter a valid quantity";
    setErrors(er);
    return !Object.keys(er).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("Name", form.name); fd.append("Sku", form.sku); fd.append("CategoryId", form.categoryId);
    fd.append("Price", form.price); fd.append("Stock", form.stock);
    fd.append("Description", form.description); fd.append("IsActive", form.isActive);
    if (file) fd.append("Image", file);
    try {
      editing ? await api.updateProduct(id, fd) : await api.createProduct(fd);
      dialog.toast(editing ? "Product updated successfully" : "Product added successfully");
      nav("/products");
    } catch (err) { dialog.toast(err.message, "error"); }
    setSaving(false);
  };

  return (
    <>
      <div className="form-head">
        <div className="form-head-icon">{editing ? "✏️" : "➕"}</div>
        <div><h1>{editing ? "Edit Product" : "Add New Product"}</h1>
          <p className="muted" style={{ margin: 0 }}>{editing ? "Update product details" : "Fill in the product details"}</p></div>
      </div>
      <form className="card pf" onSubmit={submit} noValidate>
        <div className="pf-grid">
          <Field name="name" error={errors.name} label="Product Name" span="3">
            <input className="input" name="name" placeholder="Enter product name" value={form.name} onChange={set} />
          </Field>
          <Field name="sku" error={errors.sku} label="Product SKU" span="3">
            <input className="input" name="sku" placeholder="Enter SKU" value={form.sku} onChange={set} />
          </Field>
          <Field name="categoryId" error={errors.categoryId} label="Category" span="2">
            <select className="input" name="categoryId" value={form.categoryId} onChange={set}>
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field name="price" error={errors.price} label="Price (₹)" span="2">
            <input className="input" type="number" min="0" step="0.01" name="price" placeholder="Enter price" value={form.price} onChange={set} />
          </Field>
          <Field name="stock" error={errors.stock} label="Stock Quantity" span="2">
            <input className="input" type="number" min="0" name="stock" placeholder="Enter quantity" value={form.stock} onChange={set} />
          </Field>
          <label className="span-4 grow">Description
            <textarea className="input" name="description" placeholder="Enter product description" value={form.description} onChange={set} />
          </label>
          <div className="span-2 grow">
            <span className="lbl">Product Image</span>
            <label className="upload">
              {preview ? <img src={preview} alt="preview" /> : <><span className="up-icon">⬆️</span>Click to upload image<small>PNG, JPG (Max 2MB)</small></>}
              <input type="file" accept="image/png,image/jpeg" hidden onChange={pickImage} />
            </label>
          </div>
        </div>
        <div className="pf-footer">
          <div className="status-toggle">
            <span className="lbl" style={{ margin: 0 }}>Status</span>
            <div className="seg">
              <button type="button" className={form.isActive ? "on" : ""} onClick={() => setForm({ ...form, isActive: true })}>● Active</button>
              <button type="button" className={!form.isActive ? "on off" : ""} onClick={() => setForm({ ...form, isActive: false })}>● Inactive</button>
            </div>
          </div>
          <div className="actions">
            <button type="button" className="btn" onClick={() => nav("/products")}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving..." : editing ? "Update Product" : "Save Product"}</button>
          </div>
        </div>
      </form>
    </>
  );
}