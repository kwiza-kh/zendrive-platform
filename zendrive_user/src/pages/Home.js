import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiAward, FiShield, FiTruck, FiHeadphones, FiSearch, FiStar } from "react-icons/fi";
import { carsApi, brandsApi } from "../services/api";
import CarCard from "../components/CarCard";
import { resolveImage } from "../utils/constants";
import bannerImage from "../assets/banner.png";

const STATS = [
  ["500+", "Premium Vehicles"],
  ["12K+", "Happy Drivers"],
  ["48", "Trusted Brands"],
  ["4.9/5", "Customer Rating"],
];

const BENEFITS = [
  [FiAward, "Hand-picked Inventory", "Every car passes a 187-point Zendrive certification."],
  [FiShield, "5-Year Warranty", "Comprehensive coverage on certified pre-owned models."],
  [FiTruck, "Nationwide Delivery", "Door-to-door delivery in all 50 states, free over $80K."],
  [FiHeadphones, "Concierge Support", "Your dedicated specialist available 24/7."],
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [featuredRes, latestRes, brandsRes] = await Promise.allSettled([
        carsApi.list({ is_featured: true, limit: 6 }),
        carsApi.list({ sort: "newest", limit: 8 }),
        brandsApi.list(),
      ]);

      if (cancelled) return;
      if (featuredRes.status === "fulfilled") setFeatured(featuredRes.value.data);
      if (latestRes.status === "fulfilled") setLatest(latestRes.value.data);
      if (brandsRes.status === "fulfilled") setBrands(brandsRes.value.data);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-enter">
      <section className="container-zen pt-8 md:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-zen-line bg-ink-900 shadow-[0_28px_80px_-30px_rgba(15,23,42,0.45)]">
          <img
            src={bannerImage}
            alt="Zendrive showroom banner"
            className="block w-full h-auto"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.34))]" />
        </div>
      </section>

      <section className="container-zen pt-6 md:pt-8">
        <div className="hero-frame">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.28),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.58))]" />
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:72px_72px]" />

          <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-12 p-7 sm:p-10 md:p-14 lg:p-16 items-end">
            <div className="max-w-3xl">
              <p className="section-eyebrow !text-white/70">Zendrive - Est. 2026</p>
              <h1 className="font-display font-semibold text-5xl md:text-7xl leading-[0.95] tracking-tight text-balance">
                Drive the <span className="text-accent italic">Future</span>.
                <br />
                Own the Road.
              </h1>
              <p className="max-w-xl mt-6 text-lg text-white/80 leading-relaxed text-balance">
                From thunderous V8s to silent electric hypercars, Zendrive curates a hand-picked inventory of the world's most coveted vehicles.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link to="/cars" className="btn-primary !px-8 !py-4 text-base shadow-glow">
                  Browse Inventory <FiArrowRight />
                </Link>
                <Link to="/contact" className="btn !border border-white/20 !bg-white/10 !text-white !px-8 !py-4 hover:!bg-white hover:!text-ink-900">
                  Contact Us
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl">
                {STATS.map(([n, l], index) => (
                  <div key={l} className="page-enter" style={{ animationDelay: `${index * 90}ms` }}>
                    <p className="font-display text-4xl font-semibold text-accent">{n}</p>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-white/60 mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:pb-4">
              <div className="absolute -inset-4 bg-white/10 rounded-[2rem] blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-sm p-5 sm:p-6 shadow-[0_28px_80px_-30px_rgba(15,23,42,0.68)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">This week</p>
                    <h2 className="mt-1 font-display text-3xl text-white">Curated arrivals</h2>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    <FiStar className="text-accent" />
                    Editor's pick
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {latest.slice(0, 3).map((car, index) => (
                    <Link
                      key={car.id}
                      to={`/cars/${car.slug}`}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 hover:bg-white/20 transition-all duration-200"
                      style={{ animationDelay: `${index * 110}ms` }}
                    >
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-900">
                        <img src={resolveImage(car.image)} alt={car.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/60">{car.brand?.name || "Zendrive"}</p>
                        <p className="truncate font-display text-xl text-white">{car.name}</p>
                        <p className="text-sm text-white/65">{car.year} | {car.fuel_type}</p>
                      </div>
                      <FiArrowRight className="text-white/70" />
                    </Link>
                  ))}
                  {latest.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-sm text-white/70">
                      Loading featured arrivals...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-zen -mt-8 relative z-10">
        <div className="surface-panel p-5 md:p-7 grid gap-4 md:grid-cols-[1.1fr_1fr_1fr_auto] items-end">
          <div>
            <label className="label">Body Type</label>
            <select className="input">
              <option value="">All</option>
              <option>Sedan</option>
              <option>SUV</option>
              <option>Coupe</option>
              <option>Truck</option>
            </select>
          </div>
          <div>
            <label className="label">Fuel</label>
            <select className="input">
              <option value="">All</option>
              <option>Electric</option>
              <option>Hybrid</option>
              <option>Gasoline</option>
              <option>Diesel</option>
            </select>
          </div>
          <div>
            <label className="label">Max Price</label>
            <select className="input">
              <option value="">No limit</option>
              <option>$50,000</option>
              <option>$100,000</option>
              <option>$200,000</option>
              <option>$500,000</option>
            </select>
          </div>
          <div className="flex items-end">
            <Link to="/cars" className="btn-primary w-full !py-3">
              <FiSearch /> Search Inventory
            </Link>
          </div>
        </div>
      </section>

      <section className="container-zen py-24">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] items-end">
          <div>
            <p className="section-eyebrow">Why Zendrive</p>
            <h2 className="section-title max-w-xl">Built for drivers who want more than a listing.</h2>
          </div>
          <p className="text-ink-700 max-w-2xl leading-relaxed">
            The experience is designed to feel like a premium showroom with precise browsing tools, fast filtering, and an editorial level presentation for every vehicle.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {BENEFITS.map(([Icon, title, desc], index) => (
            <div key={title} className="card card-hover p-7 page-enter" style={{ animationDelay: `${index * 90}ms` }}>
              <div className="w-14 h-14 rounded-2xl bg-ink-900 grid place-items-center mb-5">
                <Icon className="text-accent" size={26} />
              </div>
              <h3 className="font-semibold text-ink-900 text-lg mb-2">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/80 border-y border-zen-line py-24 backdrop-blur-sm">
        <div className="container-zen">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="section-eyebrow">Showroom</p>
              <h2 className="section-title">Featured Vehicles</h2>
            </div>
            <Link to="/cars" className="font-semibold text-ink-900 hover:text-accent flex items-center gap-2 transition-colors duration-200">
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {featured.map((c, index) => (
              <div key={c.id} className="page-enter" style={{ animationDelay: `${index * 80}ms` }}>
                <CarCard car={c} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-zen py-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="section-eyebrow">Curated Marques</p>
            <h2 className="section-title">Top brands at Zendrive</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {brands.map((b, index) => (
            <Link
              key={b.id}
              to={`/cars?brand_id=${b.id}`}
              className="px-6 py-3 rounded-full bg-white border border-zen-line text-ink-800 font-semibold hover:bg-ink-900 hover:text-white hover:border-ink-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-zen pb-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="section-eyebrow">Just Landed</p>
            <h2 className="section-title">Latest Arrivals</h2>
          </div>
          <Link to="/cars" className="font-semibold text-ink-900 hover:text-accent flex items-center gap-2 transition-colors duration-200">
            See more <FiArrowRight />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latest.map((c, index) => (
            <div key={c.id} className="page-enter" style={{ animationDelay: `${index * 70}ms` }}>
              <CarCard car={c} />
            </div>
          ))}
        </div>
      </section>

      <section className="container-zen pb-24">
        <div className="rounded-[2rem] bg-ink-900 text-white p-10 md:p-16 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-accent/25 blur-3xl float-gentle" />
          <div className="relative">
            <p className="section-eyebrow">Ready when you are</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-balance">
              Your next car deserves a <span className="text-accent">grand entrance</span>.
            </h2>
          </div>
          <div className="relative">
            <p className="text-white/70 leading-relaxed mb-7 text-balance">
              Schedule a private viewing or test drive at our flagship showroom, or let our concierge bring it to you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="btn-primary !px-8">Book Now</Link>
              <Link to="/cars" className="btn !border border-white/20 !bg-white/10 !text-white !px-8 hover:!bg-white hover:!text-ink-900">Browse</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
