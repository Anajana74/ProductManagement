export const API = "http://localhost:5000";
export const imgUrl = (u) => (u ? API + u : null);

export const session = {
  token: () => localStorage.getItem("pm_token"),
  save: (r) => {
    localStorage.setItem("pm_token", r.token);
    localStorage.setItem("pm_user", JSON.stringify({ name: r.name, username: r.username, expiresAt: r.expiresAt }));
  },
  clear: () => { localStorage.removeItem("pm_token"); localStorage.removeItem("pm_user"); },
  user: () => {
    try {
      const u = JSON.parse(localStorage.getItem("pm_user"));
      if (!u || !session.token() || new Date(u.expiresAt) < new Date()) { session.clear(); return null; }
      return u;
    } catch { return null; }
  },
};

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (session.token()) headers.Authorization = "Bearer " + session.token();

  const res = await fetch(API + "/api" + path, { ...options, headers });
  if (res.status === 401 && path !== "/auth/login") {
    session.clear();
    window.location.href = "/login";
    throw new Error("Session expired. Please sign in again.");
  }
  if (!res.ok) {
    let msg = await res.text();
    try { const j = JSON.parse(msg); msg = j.title || msg; } catch {}
    throw new Error(msg || "Request failed (" + res.status + ")");
  }
  return res.status === 204 ? null : res.json();
}

const json = (method, body) => ({
  method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

export const api = {
  login: (creds) => request("/auth/login", json("POST", creds)),
  dashboard: () => request("/dashboard"),

  products: (params) => request("/products?" + new URLSearchParams(params)),
  product: (id) => request("/products/" + id),
  productSales: (id) => request(`/products/${id}/sales`),
  createProduct: (formData) => request("/products", { method: "POST", body: formData }),
  updateProduct: (id, formData) => request("/products/" + id, { method: "PUT", body: formData }),
  deleteProduct: (id) => request("/products/" + id, { method: "DELETE" }),

  categories: (search = "") => request("/categories?search=" + encodeURIComponent(search)),
  createCategory: (c) => request("/categories", json("POST", c)),
  updateCategory: (id, c) => request("/categories/" + id, json("PUT", c)),
  deleteCategory: (id) => request("/categories/" + id, { method: "DELETE" }),
};
