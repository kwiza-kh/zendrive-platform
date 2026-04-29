import React, { useEffect, useState } from "react";
import api from "../services/api";

const STATUSES = ["new", "contacted", "closed"];

export default function Inquiries() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/api/inquiries").then((r) => setList(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const update = async (id, status) => {
    await api.put(`/api/inquiries/${id}`, null, { params: { status } });
    load();
  };

  return (
    <div className="page-content max-w-6xl">
      <div className="page-header">
        <h1 className="page-title">Inquiries</h1>
        <p className="page-subtitle">Customer messages and test-drive requests.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zen-bg border-b border-zen-line">
            <tr className="text-left text-xs uppercase tracking-wider text-ink-500">
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Message</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zen-line">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-ink-500">Loading…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-ink-500">No inquiries yet.</td></tr>
            ) : list.map((i) => (
              <tr key={i.id} className="align-top hover:bg-zen-bg/60 transition-colors">
                <td className="px-5 py-3.5 font-semibold">{i.name}</td>
                <td className="px-5 py-3.5 text-xs">
                  <p>{i.email}</p>
                  {i.phone && <p className="text-ink-500 mt-0.5">{i.phone}</p>}
                </td>
                <td className="px-5 py-3.5 max-w-md">
                  <p className="text-ink-700 line-clamp-3 text-sm">{i.message || "—"}</p>
                  {i.car_id && <p className="text-xs text-accent mt-1">Car #{i.car_id}</p>}
                </td>
                <td className="px-5 py-3.5">
                  <select value={i.status} onChange={(e) => update(i.id, e.target.value)} className="input !py-1.5 !text-xs uppercase font-bold !w-auto">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-500 whitespace-nowrap">{new Date(i.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
