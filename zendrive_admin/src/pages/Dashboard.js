import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatPrice } from "../services/api";
import { FiTruck, FiTag, FiDollarSign, FiArrowRight, FiCheckCircle, FiArrowUpRight } from "react-icons/fi";

function StatCard({ icon: Icon, label, value, to, accent = false }) {
  return (
    <Link to={to} className="card card-hover block p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg grid place-items-center ${accent ? "bg-accent/10" : "bg-ink-100"}`}>
          <Icon size={16} className={accent ? "text-accent" : "text-ink-500"} />
        </div>
        <FiArrowUpRight
          size={14}
          className="text-ink-300 group-hover:text-accent transition-colors duration-200"
        />
      </div>
      <p className="text-2xl font-bold text-ink-900 leading-none mb-1.5">{value}</p>
      <p className="text-xs uppercase tracking-[0.16em] text-ink-400 font-semibold">{label}</p>
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
  const inStock = cars.filter((c) => c.in_stock).length;
  const featured = cars.filter((c) => c.is_featured).length;
  const avgPrice = cars.length ? Math.round(totalValue / cars.length) : 0;

  const stats = [
    { icon: FiTruck, label: "Vehicles", value: cars.length, to: "/cars" },
    { icon: FiCheckCircle, label: "In Stock", value: inStock, to: "/cars", accent: true },
    { icon: FiTag, label: "Brands", value: brands.length, to: "/brands" },
    { icon: FiDollarSign, label: "Inventory Value", value: formatPrice(totalValue), to: "/cars" },
  ];

  return (
    <div className="page-content">
      <div className="mb-7">
        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-ink-500 mt-1">Overview of your Zendrive inventory.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, index) => (
          <div key={s.label} className="page-enter" style={{ animationDelay: `${index * 60}ms` }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Latest Cars */}
        <div className="lg:col-span-2 card flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zen-line">
            <h2 className="font-semibold text-sm text-ink-800">Latest Listings</h2>
            <Link
              to="/cars"
              className="text-xs font-semibold text-accent hover:text-accent-dark flex items-center gap-1 transition-colors duration-150"
            >
              Manage <FiArrowRight size={11} />
            </Link>
          </div>
          <ul className="divide-y divide-zen-line flex-1">
            {cars.slice(0, 7).map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-zen-bg/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/cars/${c.id}`}
                    className="font-semibold text-sm text-ink-800 hover:text-accent transition-colors truncate block"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-ink-400 mt-0.5">
                    {c.brand?.name} · {c.year} · {c.fuel_type}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <span className={`badge ${c.in_stock ? "badge-success" : "badge-muted"}`}>
                    {c.in_stock ? "In Stock" : "Sold"}
                  </span>
                  <p className="font-bold text-sm text-ink-900">
                    {formatPrice(c.discount_price || c.price)}
                  </p>
                </div>
              </li>
            ))}
            {cars.length === 0 && (
              <li className="px-5 py-12 text-center text-sm text-ink-400">
                No vehicles yet. <Link to="/cars/new" className="text-accent hover:underline">Add one →</Link>
              </li>
            )}
          </ul>
          {cars.length > 7 && (
            <div className="px-5 py-3 border-t border-zen-line bg-zen-bg/50">
              <Link to="/cars" className="text-xs text-ink-500 hover:text-accent transition-colors">
                View all {cars.length} vehicles →
              </Link>
            </div>
          )}
        </div>

        {/* Right column: quick stats */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400 mb-4">Inventory Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">Total Vehicles</span>
                <span className="text-sm font-bold text-ink-900">{cars.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">In Stock</span>
                <span className="text-sm font-bold text-emerald-600">{inStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">Sold</span>
                <span className="text-sm font-bold text-ink-500">{cars.length - inStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-600">Featured</span>
                <span className="text-sm font-bold text-amber-600">{featured}</span>
              </div>
              <div className="pt-3 border-t border-zen-line">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-600">Avg. Price</span>
                  <span className="text-sm font-bold text-ink-900">{formatPrice(avgPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400 mb-4">Brands</h3>
            <div className="space-y-2">
              {brands.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between">
                  <span className="text-sm text-ink-700 truncate">{b.name}</span>
                  <span className="text-xs text-ink-400 flex-shrink-0 ml-2">
                    {cars.filter((c) => c.brand?.id === b.id).length} cars
                  </span>
                </div>
              ))}
              {brands.length === 0 && (
                <p className="text-sm text-ink-400">No brands yet.</p>
              )}
            </div>
            {brands.length > 0 && (
              <Link
                to="/brands"
                className="mt-4 text-xs text-accent hover:text-accent-dark flex items-center gap-1 transition-colors"
              >
                Manage brands <FiArrowRight size={11} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
