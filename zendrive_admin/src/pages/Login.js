import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "admin@zendrive.com", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", form);
      if (!data.user.is_admin) {
        setErr("This account is not an admin.");
        setLoading(false);
        return;
      }
      localStorage.setItem("admin_token", data.access_token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      nav("/");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-ink-900 p-4">
      <div className="card !bg-white p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="Zendrive" className="w-10 h-10 rounded-lg object-cover" />
          <div className="font-extrabold tracking-tight text-xl">
            <span>ZEN</span><span className="text-accent">DRIVE</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1">Admin Sign in</h1>
        <p className="text-sm text-ink-500 mb-6">Manage your Zendrive inventory.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="admin-email">Email</label>
            <input id="admin-email" className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="admin-password">Password</label>
            <input id="admin-password" className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {err && <p className="text-accent text-sm">{err}</p>}
          <button disabled={loading} className="btn-primary w-full !py-3 justify-center">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
