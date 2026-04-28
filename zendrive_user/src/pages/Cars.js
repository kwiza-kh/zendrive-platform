import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { carsApi, brandsApi, bodyTypesApi } from "../services/api";
import CarCard from "../components/CarCard";
import { FiSearch, FiX } from "react-icons/fi";

const FUEL_TYPES = ["Electric", "Hybrid", "Gasoline", "Diesel"];

export default function Cars() {
  const [params, setParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [bodyTypes, setBodyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get("q") || "");

  const filters = {
    q: params.get("q") || undefined,
    brand_id: params.get("brand_id") || undefined,
    body_type: params.get("body_type") || undefined,
    fuel_type: params.get("fuel_type") || undefined,
    sort: params.get("sort") || "newest",
  };

  useEffect(() => {
    brandsApi.list().then((r) => setBrands(r.data));
    bodyTypesApi.list().then((r) => setBodyTypes(r.data.map((b) => b.name)));
  }, []);

  useEffect(() => {
    setLoading(true);
    carsApi.list(filters).then((r) => { setCars(r.data); setLoading(false); });
    // eslint-disable-next-line
  }, [params]);

  const setFilter = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next);
  };

  const clearAll = () => setParams({});
  const activeCount = [...params.keys()].filter((k) => k !== "sort").length;

  return (
    <div className="container-zen py-12">
      <div className="mb-8">
        <p className="section-eyebrow">Inventory</p>
        <h1 className="section-title">Find your Zendrive.</h1>
      </div>

      {/* Search bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); setFilter("q", q); }}
        className="flex gap-2 mb-6"
      >
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, model, or keyword…"
            className="input pl-11"
          />
        </div>
        <button className="btn-primary !px-7">Search</button>
      </form>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Filters */}
        <aside className="card p-6 h-fit sticky top-24">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-ink-900">Filters</h3>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-accent font-semibold flex items-center gap-1">
                <FiX size={14} /> Clear
              </button>
            )}
          </div>

          <div className="mb-6">
            <p className="label">Brand</p>
            <select className="input" value={filters.brand_id || ""} onChange={(e) => setFilter("brand_id", e.target.value)}>
              <option value="">All brands</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="mb-6">
            <p className="label">Body Type</p>
            <div className="flex flex-wrap gap-2">
              {bodyTypes.map((b) => (
                <button
                  key={b}
                  onClick={() => setFilter("body_type", filters.body_type === b ? "" : b)}
                  className={`chip ${filters.body_type === b ? "!bg-ink-900 !text-white !border-ink-900" : ""}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="label">Fuel</p>
            <div className="flex flex-wrap gap-2">
              {FUEL_TYPES.map((b) => (
                <button
                  key={b}
                  onClick={() => setFilter("fuel_type", filters.fuel_type === b ? "" : b)}
                  className={`chip ${filters.fuel_type === b ? "!bg-accent !text-white !border-accent" : ""}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label">Sort</p>
            <select className="input" value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        </aside>

        {/* Results */}
        <section>
          <p className="text-sm text-ink-500 mb-4">{loading ? "Loading…" : `${cars.length} vehicles found`}</p>
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card h-96 animate-pulse bg-zen-line/40" />
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="card p-16 text-center">
              <h3 className="font-display text-2xl mb-2">No vehicles match your filters.</h3>
              <button onClick={clearAll} className="btn-primary mt-4">Reset filters</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {cars.map((c) => <CarCard key={c.id} car={c} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
