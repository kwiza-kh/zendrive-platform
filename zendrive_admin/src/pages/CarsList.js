import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api, { resolveImage, formatPrice } from "../services/api";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiTruck, FiCheckCircle, FiXCircle, FiStar } from "react-icons/fi";

const FILTERS = [
  { key: "all",      label: "All" },
  { key: "in_stock", label: "In Stock" },
  { key: "sold",     label: "Sold" },
  { key: "featured", label: "Featured" },
];

export default function CarsList() {
  const [cars, setCars]       = useState([]);
  const [q, setQ]             = useState("");
  const [filter, setFilter]   = useState("all");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/api/cars", { params: { limit: 200 } })
      .then((r) => setCars(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this car?")) return;
    await api.delete(`/api/cars/${id}`);
    load();
  };

  // Client-side filter + search
  const filtered = useMemo(() => {
    let list = cars;
    if (filter === "in_stock")  list = list.filter((c) => c.in_stock);
    if (filter === "sold")      list = list.filter((c) => !c.in_stock);
    if (filter === "featured")  list = list.filter((c) => c.is_featured);
    if (q.trim()) {
      const lq = q.toLowerCase();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(lq) ||
        (c.brand?.name || "").toLowerCase().includes(lq) ||
        c.slug.toLowerCase().includes(lq)
      );
    }
    return list;
  }, [cars, filter, q]);

  const stats = [
    { label: "Total",    value: cars.length,                              icon: FiTruck,       color: "text-ink-700" },
    { label: "In Stock", value: cars.filter((c) => c.in_stock).length,   icon: FiCheckCircle, color: "text-emerald-600" },
    { label: "Sold",     value: cars.filter((c) => !c.in_stock).length,  icon: FiXCircle,     color: "text-ink-500" },
    { label: "Featured", value: cars.filter((c) => c.is_featured).length,icon: FiStar,        color: "text-amber-500" },
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage vehicles listed on Zendrive.</p>
        </div>
        <Link to="/cars/new" className="btn-primary"><FiPlus /> Add Car</Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card px-4 py-3 flex items-center gap-3">
            <Icon size={18} className={color} />
            <div>
              <p className="text-xl font-bold leading-none">{value}</p>
              <p className="text-xs text-ink-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar: filter tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-zen-bg border border-zen-line rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === f.key
                  ? "bg-white shadow-sm text-ink-900"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {f.label}
              {f.key !== "all" && (
                <span className="ml-1.5 text-ink-400">
                  {f.key === "in_stock"  && cars.filter((c) => c.in_stock).length}
                  {f.key === "sold"      && cars.filter((c) => !c.in_stock).length}
                  {f.key === "featured"  && cars.filter((c) => c.is_featured).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Live search */}
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={14} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input pl-9 pr-8 text-sm"
            placeholder="Search by name, brand, slug…"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-zen-bg border-b border-zen-line">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                <th className="px-5 py-3 w-[300px]">Vehicle</th>
                <th className="px-4 py-3">Brand · Body</th>
                <th className="px-4 py-3">Year · Fuel</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zen-line">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-ink-400">
                      <div className="w-6 h-6 border-2 border-ink-300 border-t-accent rounded-full animate-spin" />
                      <span className="text-sm">Loading inventory…</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-ink-400">
                      <FiTruck size={28} className="text-ink-300" />
                      <p className="text-sm font-medium">
                        {q ? `No results for "${q}"` : "No vehicles found."}
                      </p>
                      {q && (
                        <button onClick={() => setQ("")} className="text-xs text-accent hover:underline">
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-zen-bg/50 transition-colors group">
                  {/* Vehicle */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveImage(c.image)}
                        alt={c.name}
                        className="w-16 h-11 object-cover rounded-lg border border-zen-line flex-shrink-0 bg-zen-bg"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/cars/${c.id}`}
                          className="font-semibold text-ink-900 hover:text-accent transition-colors truncate block"
                        >
                          {c.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-xs text-ink-400 truncate">{c.slug}</span>
                          {c.is_new && (
                            <span className="badge bg-accent/10 text-accent text-[10px]">NEW</span>
                          )}
                          {c.is_featured && (
                            <span className="badge bg-amber-50 text-amber-600 text-[10px]">★ FEATURED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Brand · Body */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-800">{c.brand?.name || "—"}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{c.body_type}</p>
                  </td>

                  {/* Year · Fuel */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-800">{c.year}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{c.fuel_type}</p>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    {c.discount_price ? (
                      <>
                        <p className="font-bold text-accent">{formatPrice(c.discount_price)}</p>
                        <p className="text-xs text-ink-400 line-through mt-0.5">{formatPrice(c.price)}</p>
                      </>
                    ) : (
                      <p className="font-bold text-ink-900">{formatPrice(c.price)}</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={c.in_stock ? "badge-success badge" : "badge-muted badge"}>
                      {c.in_stock ? "In stock" : "Sold"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/cars/${c.id}`}
                        className="btn-outline !px-2.5 !py-1.5"
                        title="Edit"
                      >
                        <FiEdit2 size={13} />
                      </Link>
                      <button
                        onClick={() => remove(c.id)}
                        className="btn !bg-red-50 !text-red-500 hover:!bg-red-100 !px-2.5 !py-1.5"
                        title="Delete"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 bg-zen-bg border-t border-zen-line">
            <p className="text-xs text-ink-500">
              Showing <span className="font-semibold text-ink-700">{filtered.length}</span>
              {filter !== "all" || q ? ` of ${cars.length}` : ""} vehicles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
