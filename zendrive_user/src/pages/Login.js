import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await login(form.email, form.password); navigate("/"); }
    catch (e) { setErr(e?.response?.data?.detail || "Login failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="container-zen py-16 max-w-md">
      <div className="card p-8">
        <p className="section-eyebrow">Welcome back</p>
        <h1 className="font-display text-3xl mb-6">Sign in to Zendrive</h1>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Password</label><input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          {err && <p className="text-accent text-sm">{err}</p>}
          <button disabled={loading} className="btn-primary w-full !py-3.5">{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="text-sm text-ink-500 mt-6 text-center">
          New here? <Link to="/register" className="text-accent font-semibold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
