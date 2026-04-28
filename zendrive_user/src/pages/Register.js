import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await register(form); navigate("/"); }
    catch (e) { setErr(e?.response?.data?.detail || "Registration failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="container-zen py-16 max-w-md">
      <div className="card p-8">
        <p className="section-eyebrow">Join Zendrive</p>
        <h1 className="font-display text-3xl mb-6">Create your account</h1>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Full name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Password</label><input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          {err && <p className="text-accent text-sm">{err}</p>}
          <button disabled={loading} className="btn-primary w-full !py-3.5">{loading ? "Creating…" : "Create account"}</button>
        </form>
        <p className="text-sm text-ink-500 mt-6 text-center">
          Already a member? <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
