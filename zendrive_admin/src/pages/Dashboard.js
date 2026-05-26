import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatPrice } from "../services/api";
import { FiTruck, FiTag, FiDollarSign, FiArrowRight, FiArrowUpRight } from "react-icons/fi";

function StatCard({ icon: Icon, label, value, to, color = "bg-ink-900" }) {
  return (
    <Link to={to} className="card card-hover block h-full p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} grid place-items-center shadow-soft`}>
          <Icon size={18} className="text-accent" />
        </div>
        <FiArrowUpRight
          size={16}
          className="text-ink-300 group-hover:text-accent transition-colors duration-200"
        />
      </div>
      <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold">{label}</p>
      <p className="text-2xl font-bold mt-1 text-ink-900">{value}</p>
    </Link>
  );
}

export default function Dashboard() {
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    api.get("/api/cars", { params: { limit: 200 } }).then((r) => setCars(r.data));
    api.get("/api/brands").then((r) => setBrands(r.data));
  }, []);

  const totalValue = cars.reduce((s, c) => s + (c.discount_price || c.price), 0);

  const stats = [
    { icon: FiTruck, label: "Vehicles", value: cars.length, to: "/cars" },
    { icon: FiDollarSign, label: "Inventory Value", value: formatPrice(totalValue), to: "/cars" },
    { icon: FiTag, label: "Brands", value: brands.length, to: "/brands" },
  ];

  return (
    <div className="page-content">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, index) => (
          <div key={s.label} className="page-enter" style={{ animationDelay: `${index * 80}ms` }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zen-line">
            <h2 className="font-semibold text-sm">Latest Cars</h2>
            <Link to="/cars" className="text-xs font-semibold text-accent hover:text-accent-dark flex items-center gap-1 transition-colors duration-200">
              Manage <FiArrowRight size={12} />
            </Link>
          </div>
          <ul className="divide-y divide-zen-line flex-1">
            {cars.slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{c.name}</p>
                  <p className="text-xs text-ink-500">{c.brand?.name} · {c.year}</p>
                </div>
                <p className="font-bold text-sm text-ink-900 ml-4 flex-shrink-0">
                  {formatPrice(c.discount_price || c.price)}
                </p>
              </li>
            ))}
            {cars.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-ink-500">No cars yet.</li>
            )}
          </ul>
        </div>

        <div className="card flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zen-line">
            <h2 className="font-semibold text-sm">Recent activity</h2>
            <Link to="/cars" className="text-xs font-semibold text-accent hover:text-accent-dark flex items-center gap-1 transition-colors duration-200">
              View inventory <FiArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center py-8 px-5 text-center">
            <p className="text-sm text-ink-500">Track inventory, brands, and car listings from here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
