import React, { useState } from "react";
import { FiLock, FiAlertCircle, FiCheck } from "react-icons/fi";
import { adminApi } from "../services/api";

export default function PasswordChange() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaved(false);

    if (!form.current_password || !form.new_password) {
      setErr("All fields are required.");
      return;
    }
    if (form.new_password.length < 8) {
      setErr("New password must be at least 8 characters.");
      return;
    }
    if (form.new_password !== form.confirm_password) {
      setErr("New password confirmation does not match.");
      return;
    }

    setLoading(true);
    try {
      await adminApi.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSaved(true);
      setForm({ current_password: "", new_password: "", confirm_password: "" });
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/login";
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Password update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Security</h1>
        <p className="page-subtitle">
          Update the admin password. You will be signed out after a successful change.
        </p>
      </div>

      {err && (
        <div className="mb-5 flex items-center gap-2 text-sm text-accent bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <FiAlertCircle size={15} className="flex-shrink-0" /> {err}
        </div>
      )}

      {saved && (
        <div className="mb-5 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
          <FiCheck size={15} className="flex-shrink-0" /> Password updated.
        </div>
      )}

      <form onSubmit={submit} className="card p-6 space-y-4">
        <div>
          <label className="label" htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            type="password"
            className="input"
            value={form.current_password}
            onChange={(e) => setForm({ ...form, current_password: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            className="input"
            value={form.new_password}
            onChange={(e) => setForm({ ...form, new_password: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            className="input"
            value={form.confirm_password}
            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
          />
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={loading}>
            <FiLock /> {loading ? "Saving..." : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
}
