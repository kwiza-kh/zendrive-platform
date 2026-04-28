import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatPrice } from "../services/api";
import { FiTruck, FiTag, FiMessageSquare, FiDollarSign, FiArrowRight } from "react-icons/fi";

export default function Dashboard() {
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [inq, setInq] = useState([]);

  useEffect(() => {
    api.get("/api/cars", { params: { limit: 200 } }).then((r) => setCars(r.data));
    api.get("/api/brands").then((r) => setBrands(r.data));
    api.get("/api/inquiries").then((r) => setInq(r.data)).catch(() => {});
  }, []);

  const totalValue = cars.reduce((s, c) => s + (c.discount_price || c.price), 0);
  const stats = [
    [FiTruck, "Vehicles", cars.length, "/cars"],
    [FiDollarSign, "Inventory Value", formatPrice(totalValue), "/cars"],
    [FiTag, "Brands", brands.length, "/brands"],
    [FiMessageSquare, "New Inquiries", inq.filter((i) => i.status === "new").length, "/inquiries"],
  ];

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl">Dashboard</h1>
        <p className="text-ink-500 mt-1">Here's what's happening at Zendrive today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map(([Icon, label, val, to]) => (
          <Link key={label} to={to} className="card p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-lg bg-ink-900 grid place-items-center"><Icon className="text-accent" /></div>
              <FiArrowRight className="text-ink-300" />
            </div>
            <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold mt-4">{label}</p>
            <p className="text-2xl font-bold mt-1">{val}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Latest Cars</h2>
            <Link to="/cars" className="text-sm font-semibold text-accent">Manage →</Link>
          </div>
          <ul className="divide-y divide-zen-line">
            {cars.slice(0, 6).map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-ink-500">{c.brand?.name} · {c.year}</p>
                </div>
                <p className="font-bold text-sm">{formatPrice(c.discount_price || c.price)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Recent Inquiries</h2>
            <Link to="/inquiries" className="text-sm font-semibold text-accent">View all →</Link>
          </div>
          {inq.length === 0 ? (
            <p className="text-sm text-ink-500">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-zen-line">
              {inq.slice(0, 6).map((i) => (
                <li key={i.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{i.name}</p>
                    <p className="text-xs text-ink-500">{i.email}</p>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${i.status === "new" ? "bg-accent text-white" : "bg-zen-line text-ink-700"}`}>{i.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
