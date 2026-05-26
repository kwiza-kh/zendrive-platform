import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { carsApi, inquiriesApi } from "../services/api";
import { resolveImage, formatPrice } from "../utils/constants";
import { FiZap, FiSettings, FiUsers, FiActivity, FiCalendar, FiDroplet, FiCheck, FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CarDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart, inCart } = useCart();
  const [car, setCar] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [cartAdding, setCartAdding] = useState(false);

  useEffect(() => {
    carsApi.detail(slug).then((r) => {
      setCar(r.data);
      setActiveImg(0);
    }).catch(() => setCar(false));
  }, [slug]);

  if (car === false) {
    return (
      <div className="container-zen py-24 text-center">
        <h2 className="section-title">Car not found</h2>
        <Link to="/cars" className="btn-primary mt-6">Back to inventory</Link>
      </div>
    );
  }

  if (!car) return <div className="container-zen py-24 text-center text-ink-500">Loading...</div>;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await inquiriesApi.create({ ...form, car_id: car.id });
      setSent(true);
    } catch (error) {
      setErr(error?.response?.data?.detail || "Failed. Try again.");
    }
  };

  const hasDiscount = car.discount_price && car.discount_price < car.price;
  const gallery = [
    ...(car.image ? [car.image] : []),
    ...(car.images ? car.images.split(",").map((s) => s.trim()).filter(Boolean) : []),
  ];
  const shown = gallery[activeImg] || car.image;
  const specs = [
    [FiCalendar, "Year", car.year],
    [FiActivity, "Power", `${car.horsepower} HP`],
    [FiSettings, "Transmission", car.transmission],
    [FiZap, "Fuel", car.fuel_type],
    [FiUsers, "Seats", car.seats],
    [FiDroplet, "Color", car.color],
  ];

  return (
    <div className="container-zen py-10 page-enter">
      <Link to="/cars" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-accent mb-6 transition-colors duration-200">
        <FiArrowLeft /> Back to inventory
      </Link>

      <div className="grid lg:grid-cols-[1.28fr_0.92fr] gap-10">
        <div>
          <div className="rounded-[2rem] overflow-hidden bg-ink-900 shadow-soft">
            <img
              src={resolveImage(shown)}
              alt={car.name}
              className="w-full h-[260px] sm:h-[360px] lg:h-[500px] object-cover transition-transform duration-700 ease-out"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
              {gallery.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  onClick={() => setActiveImg(i)}
                  className={`rounded-xl overflow-hidden border transition-all duration-200 ${
                    i === activeImg ? "border-accent ring-2 ring-accent/20" : "border-transparent hover:border-zen-line"
                  }`}
                  type="button"
                >
                  <img src={resolveImage(src)} alt="" className="w-full aspect-[4/3] object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 card p-7 md:p-8">
            <h2 className="font-display text-3xl mb-4">Overview</h2>
            <p className="text-ink-700 leading-relaxed">{car.description}</p>

            <h3 className="font-bold mt-8 mb-4 uppercase tracking-widest text-xs text-accent">Specifications</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {specs.map(([Icon, k, v]) => (
                <div key={k} className="flex items-center justify-between p-4 bg-zen-bg rounded-2xl border border-zen-line">
                  <div className="flex items-center gap-2.5 text-ink-700">
                    <Icon className="text-accent" />
                    <span className="text-sm font-semibold">{k}</span>
                  </div>
                  <span className="font-bold text-ink-900">{v}</span>
                </div>
              ))}
            </div>

            <h3 className="font-bold mt-8 mb-4 uppercase tracking-widest text-xs text-accent">What's included</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                "Free nationwide delivery",
                "187-point inspection",
                "5-year limited warranty",
                "30-day return policy",
                "Full service history",
                "24/7 concierge support",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-ink-700">
                  <FiCheck className="text-accent" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit space-y-6">
          <div className="card p-7 md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-ink-500 font-semibold">{car.brand?.name}</p>
            <h1 className="font-display text-4xl text-ink-900 leading-tight mt-1 text-balance">{car.name}</h1>

            <div className="mt-5 flex items-end gap-3">
              {hasDiscount ? (
                <>
                  <p className="text-4xl font-bold text-accent">{formatPrice(car.discount_price)}</p>
                  <p className="text-xl line-through text-ink-500">{formatPrice(car.price)}</p>
                </>
              ) : (
                <p className="text-4xl font-bold text-ink-900">{formatPrice(car.price)}</p>
              )}
            </div>

            {user && (
              <button
                onClick={async () => {
                  if (inCart(car.id)) return;
                  setCartAdding(true);
                  try { await addToCart(car.id); } catch {}
                  setCartAdding(false);
                }}
                disabled={inCart(car.id) || cartAdding}
                className={`mt-5 w-full !py-3.5 flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 ${
                  inCart(car.id) ? "bg-accent text-white cursor-default" : "btn-outline"
                }`}
              >
                {inCart(car.id) ? (
                  <><FiCheck /> Added to Cart</>
                ) : cartAdding ? (
                  "Adding..."
                ) : (
                  <><FiShoppingCart /> Add to Cart</>
                )}
              </button>
            )}

            <div className="grid grid-cols-3 gap-2 mt-6">
              <div className="text-center bg-zen-bg rounded-2xl py-3 border border-zen-line">
                <p className="text-[10px] uppercase tracking-widest text-ink-500">Power</p>
                <p className="font-bold mt-0.5">{car.horsepower} HP</p>
              </div>
              <div className="text-center bg-zen-bg rounded-2xl py-3 border border-zen-line">
                <p className="text-[10px] uppercase tracking-widest text-ink-500">Body</p>
                <p className="font-bold mt-0.5">{car.body_type}</p>
              </div>
              <div className="text-center bg-zen-bg rounded-2xl py-3 border border-zen-line">
                <p className="text-[10px] uppercase tracking-widest text-ink-500">Year</p>
                <p className="font-bold mt-0.5">{car.year}</p>
              </div>
            </div>
          </div>

          <div className="card p-7 md:p-8">
            <h3 className="font-display text-2xl mb-1">Request this car</h3>
            <p className="text-sm text-ink-500 mb-5">A specialist will reach out within 30 minutes.</p>

            {sent ? (
              <div className="bg-accent/10 border border-accent/30 text-accent p-4 rounded-2xl text-sm font-semibold text-center">
                Inquiry received. We'll contact you soon.
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input className="input" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="input" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="input" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <textarea className="input min-h-[100px] resize-none" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                {err && <p className="text-accent text-sm">{err}</p>}
                <button className="btn-primary w-full !py-3.5">Request callback</button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
