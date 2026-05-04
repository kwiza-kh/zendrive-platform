import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiArrowLeft, FiShoppingCart, FiCheck } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { inquiriesApi } from "../services/api";
import { resolveImage, formatPrice } from "../utils/constants";

export default function Cart() {
  const { user } = useAuth();
  const { items, total, loading, removeFromCart, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  if (!user) {
    return (
      <div className="container-zen py-24 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-ink-900 grid place-items-center mb-6">
          <FiShoppingCart className="text-accent" size={32} />
        </div>
        <h2 className="section-title mb-3">Sign in to view your cart</h2>
        <p className="text-ink-500 mb-8">Save cars you love and submit inquiries all at once.</p>
        <div className="flex justify-center gap-3">
          <Link to="/login" className="btn-primary">Sign in</Link>
          <Link to="/register" className="btn-outline">Create account</Link>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="container-zen py-24 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-accent grid place-items-center mb-6">
          <FiCheck className="text-white" size={32} />
        </div>
        <h2 className="section-title mb-3">Inquiry submitted!</h2>
        <p className="text-ink-500 mb-8">A Zendrive specialist will contact you within 30 minutes.</p>
        <Link to="/cars" className="btn-primary">Continue browsing</Link>
      </div>
    );
  }

  const submitInquiry = async () => {
    setSubmitting(true); setErr("");
    try {
      const carNames = items.map((i) => i.car?.name).filter(Boolean).join(", ");
      await inquiriesApi.create({
        name: user.name,
        email: user.email,
        message: `I'm interested in the following vehicles: ${carNames}`,
      });
      await clearCart();
      setSent(true);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const effectivePrice = (car) =>
    car.discount_price && car.discount_price < car.price ? car.discount_price : car.price;

  return (
    <div className="container-zen py-12">
      <Link to="/cars" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-accent mb-8">
        <FiArrowLeft /> Continue browsing
      </Link>

      <div className="mb-8">
        <p className="section-eyebrow">Your Cart</p>
        <h1 className="section-title">Saved Vehicles</h1>
      </div>

      {loading ? (
        <div className="text-ink-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-zen-line grid place-items-center mb-5">
            <FiShoppingCart className="text-ink-500" size={24} />
          </div>
          <h3 className="font-display text-2xl mb-2">Your cart is empty</h3>
          <p className="text-ink-500 mb-6">Browse our inventory and add cars you love.</p>
          <Link to="/cars" className="btn-primary">Browse inventory</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-4">
            {items.map((item) => {
              const car = item.car;
              if (!car) return null;
              return (
                <div key={item.id} className="card p-5 flex gap-5">
                  <Link to={`/cars/${car.slug}`} className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden bg-ink-900">
                    <img src={resolveImage(car.image)} alt={car.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold">{car.brand?.name || "Zendrive"}</p>
                        <Link to={`/cars/${car.slug}`} className="font-display text-2xl text-ink-900 hover:text-accent transition leading-tight">
                          {car.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-9 h-9 grid place-items-center rounded-md text-ink-500 hover:text-accent hover:bg-accent/10 transition"
                        aria-label="Remove"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-ink-500">
                      <span>{car.year}</span>
                      <span>{car.fuel_type}</span>
                      <span>{car.transmission}</span>
                      <span>{car.horsepower} HP</span>
                    </div>
                    <p className="text-xl font-bold text-ink-900 mt-3">{formatPrice(effectivePrice(car))}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="card p-7 space-y-5">
              <h3 className="font-display text-2xl">Order Summary</h3>
              <div className="space-y-3">
                {items.map((item) => {
                  const car = item.car;
                  if (!car) return null;
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-700 truncate mr-2">{car.name}</span>
                      <span className="font-semibold text-ink-900 whitespace-nowrap">{formatPrice(effectivePrice(car))}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-zen-line pt-4 flex items-center justify-between">
                <span className="font-bold text-ink-900">Total</span>
                <span className="text-2xl font-bold text-accent">{formatPrice(total)}</span>
              </div>
              {err && <p className="text-accent text-sm">{err}</p>}
              <button
                onClick={submitInquiry}
                disabled={submitting}
                className="btn-primary w-full !py-3.5"
              >
                {submitting ? "Submitting…" : "Submit Inquiry"}
              </button>
              <p className="text-xs text-ink-500 text-center">A specialist will reach out within 30 minutes.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
