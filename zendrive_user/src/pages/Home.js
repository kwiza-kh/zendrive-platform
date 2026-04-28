import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiAward, FiShield, FiTruck, FiHeadphones, FiSearch } from "react-icons/fi";
import { carsApi, brandsApi } from "../services/api";
import CarCard from "../components/CarCard";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    carsApi.list({ is_featured: true, limit: 6 }).then((r) => setFeatured(r.data));
    carsApi.list({ sort: "newest", limit: 8 }).then((r) => setLatest(r.data));
    brandsApi.list().then((r) => setBrands(r.data));
  }, []);

  return (
    <div>
      {/* HERO BANNER */}
      <section className="bg-ink-900">
        <img
          src={require("../assets/banner.png")}
          alt="Zendrive Auto"
          className="w-full h-auto block"
        />
      </section>

      {/* HERO CONTENT */}
      <section className="relative bg-ink-900 text-white">
        <div className="container-zen py-16 md:py-20">
          <p className="section-eyebrow !text-accent">Zendrive · Est. 2026</p>
          <h1 className="font-display font-semibold text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-3xl">
            Drive the <span className="text-accent italic">Future</span>.<br />Own the Road.
          </h1>
          <p className="max-w-xl mt-6 text-lg text-white/80 leading-relaxed">
            From thunderous V8s to silent electric hypercars — Zendrive curates a hand-picked inventory of the world's most coveted vehicles.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/cars" className="btn-primary !px-8 !py-4 text-base">
              Browse Inventory <FiArrowRight />
            </Link>
            <Link to="/contact" className="btn !border-2 !border-white/30 !text-white !px-8 !py-4 hover:!bg-white hover:!text-ink-900">
              Book a Test Drive
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {[
              ["500+", "Premium Vehicles"],
              ["12K+", "Happy Drivers"],
              ["48", "Trusted Brands"],
              ["4.9★", "Customer Rating"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-4xl font-semibold text-accent">{n}</p>
                <p className="text-xs uppercase tracking-widest text-white/60 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK SEARCH */}
      <section className="container-zen -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-soft border border-zen-line p-6 md:p-8 grid md:grid-cols-4 gap-4">
          <div>
            <label className="label">Body Type</label>
            <select className="input">
              <option value="">All</option><option>Sedan</option><option>SUV</option>
              <option>Coupe</option><option>Truck</option>
            </select>
          </div>
          <div>
            <label className="label">Fuel</label>
            <select className="input">
              <option value="">All</option><option>Electric</option><option>Hybrid</option>
              <option>Gasoline</option><option>Diesel</option>
            </select>
          </div>
          <div>
            <label className="label">Max Price</label>
            <select className="input">
              <option value="">No limit</option>
              <option>$50,000</option><option>$100,000</option>
              <option>$200,000</option><option>$500,000</option>
            </select>
          </div>
          <div className="flex items-end">
            <Link to="/cars" className="btn-primary w-full !py-3">
              <FiSearch /> Search Inventory
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-zen py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-eyebrow">Why Zendrive</p>
          <h2 className="section-title">Built for those who want more.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            [FiAward, "Hand-picked Inventory", "Every car passes a 187-point Zendrive certification."],
            [FiShield, "5-Year Warranty", "Comprehensive coverage on certified pre-owned models."],
            [FiTruck, "Nationwide Delivery", "Door-to-door delivery in all 50 states, free over $80K."],
            [FiHeadphones, "Concierge Support", "Your dedicated specialist available 24/7."],
          ].map(([Icon, title, desc]) => (
            <div key={title} className="card p-7 text-center card-hover">
              <div className="w-14 h-14 mx-auto rounded-xl bg-ink-900 grid place-items-center mb-5">
                <Icon className="text-accent" size={26} />
              </div>
              <h3 className="font-bold text-ink-900 text-lg mb-2">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-white border-y border-zen-line py-24">
        <div className="container-zen">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="section-eyebrow">Showroom</p>
              <h2 className="section-title">Featured Vehicles</h2>
            </div>
            <Link to="/cars" className="font-semibold text-ink-900 hover:text-accent flex items-center gap-2">
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {featured.map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="container-zen py-24">
        <div className="text-center mb-12">
          <p className="section-eyebrow">Curated Marques</p>
          <h2 className="section-title">Top brands at Zendrive</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {brands.map((b) => (
            <Link
              key={b.id}
              to={`/cars?brand_id=${b.id}`}
              className="px-6 py-3 rounded-full bg-white border border-zen-line text-ink-800 font-semibold hover:bg-ink-900 hover:text-white hover:border-ink-900 transition"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST */}
      <section className="container-zen pb-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="section-eyebrow">Just Landed</p>
            <h2 className="section-title">Latest Arrivals</h2>
          </div>
          <Link to="/cars" className="font-semibold text-ink-900 hover:text-accent flex items-center gap-2">
            See more <FiArrowRight />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latest.map((c) => <CarCard key={c.id} car={c} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="container-zen pb-24">
        <div className="rounded-3xl bg-ink-900 text-white p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative">
            <p className="section-eyebrow">Ready when you are</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
              Your next car deserves a <span className="text-accent">grand entrance</span>.
            </h2>
          </div>
          <div className="relative">
            <p className="text-white/70 leading-relaxed mb-7">
              Schedule a private viewing or test drive at our flagship showroom — or let our concierge bring it to you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary !px-8">Book Now</Link>
              <Link to="/cars" className="btn !border-2 !border-white/30 !text-white !px-8 hover:!bg-white hover:!text-ink-900">Browse</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
