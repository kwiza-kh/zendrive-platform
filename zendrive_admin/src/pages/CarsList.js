import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { resolveImage, formatPrice } from "../services/api";
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";

export default function CarsList() {
  const [cars, setCars] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/api/cars", { params: { q: q || undefined, limit: 200 } })
      .then((r) => setCars(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this car?")) return;
    await api.delete(`/api/cars/${id}`);
    load();
  };

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl">Inventory</h1>
          <p className="text-ink-500 mt-1">{cars.length} vehicles in stock.</p>
        </div>
        <Link to="/cars/new" className="btn-primary"><FiPlus /> Add Car</Link>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-2 mb-5">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-10" placeholder="Search by name…" />
        </div>
        <button className="btn-dark">Search</button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zen-bg border-b border-zen-line">
            <tr className="text-left text-xs uppercase tracking-wider text-ink-500">
              <th className="p-4">Car</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Body</th>
              <th className="p-4">Year</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zen-line">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-ink-500">Loading…</td></tr>
            ) : cars.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-ink-500">No cars yet.</td></tr>
            ) : cars.map((c) => (
              <tr key={c.id} className="hover:bg-zen-bg/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={resolveImage(c.image)} alt="" className="w-14 h-10 object-cover rounded border border-zen-line" />
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-ink-500">{c.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">{c.brand?.name || "—"}</td>
                <td className="p-4">{c.body_type}</td>
                <td className="p-4">{c.year}</td>
                <td className="p-4 font-bold">{formatPrice(c.discount_price || c.price)}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${c.in_stock ? "bg-emerald-100 text-emerald-700" : "bg-zen-line text-ink-700"}`}>
                    {c.in_stock ? "In stock" : "Sold"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex gap-1">
                    <Link to={`/cars/${c.id}`} className="btn-outline !px-2.5 !py-1.5"><FiEdit2 size={14} /></Link>
                    <button onClick={() => remove(c.id)} className="btn !bg-red-50 !text-red-600 hover:!bg-red-100 !px-2.5 !py-1.5"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
