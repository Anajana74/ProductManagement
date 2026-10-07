import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { RequireAuth } from "./components/Auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/add" element={<ProductForm />} />
        <Route path="/products/edit/:id" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/reports" element={<div className="card">Reports - coming soon</div>} />
        <Route path="/settings" element={<div className="card">Settings - coming soon</div>} />
      </Route>
    </Routes>
  );
}
