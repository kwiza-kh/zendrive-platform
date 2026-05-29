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
      const { data } = await api.post("/api/admin/login", form);
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
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between bg-ink-900 p-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Zendrive" className="w-9 h-9 rounded-lg object-cover" />
          <div className="font-extrabold tracking-tight text-lg text-white">
            ZEN<span className="text-accent">DRIVE</span>
          </div>
        </div>
        <div>
          <p className="text-3xl font-display font-bold text-white leading-snug tracking-tight mb-3">
            Admin Console
          </p>
          <p className="text-sm text-white/40 leading-relaxed">
            Manage your vehicle inventory, brand listings,<br />and site content from one place.
          </p>
        </div>
        <p className="text-xs text-white/20">© {new Date().getFullYear()} Zendrive. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-zen-bg">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo.png" alt="Zendrive" className="w-8 h-8 rounded-lg object-cover" />
            <div className="font-extrabold tracking-tight text-lg">
              ZEN<span className="text-accent">DRIVE</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-ink-900 mb-1 tracking-tight">Sign in</h1>
          <p className="text-sm text-ink-400 mb-8">Enter your admin credentials to continue.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label" htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                className="input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                className="input"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {err && (
              <div className="text-sm text-accent bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {err}
              </div>
            )}

            <button disabled={loading} className="btn-primary w-full justify-center !py-2.5 mt-2">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
