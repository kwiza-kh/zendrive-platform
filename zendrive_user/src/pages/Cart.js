import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { socialMediaApi } from "../services/api";
import { resolveImage, formatPrice } from "../utils/constants";
import { buildCartTelegramUrl } from "../utils/telegram";

export default function Cart() {
  const { items, total, loading, removeFromCart, clearCart } = useCart();
  const [telegramUrl, setTelegramUrl] = useState("");

  const effectivePrice = (car) =>
    car.discount_price && car.discount_price < car.price ? car.discount_price : car.price;

  useEffect(() => {
    socialMediaApi
      .list()
      .then((response) => {
        const telegram = Array.isArray(response.data)
          ? response.data.find((item) => item.platform === "telegram" && item.url?.trim())
          : null;
        setTelegramUrl(telegram?.url || "");
      })
      .catch(() => {});
  }, []);

  const telegramCheckoutUrl = useMemo(
    () => buildCartTelegramUrl(telegramUrl, items),
    [telegramUrl, items]
  );

  return (
    <div className="container-zen py-12 page-enter">
      <Link to="/cars" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-accent mb-8 transition-colors duration-200">
        <FiArrowLeft /> Continue browsing
      </Link>

      <div className="mb-8">
        <p className="section-eyebrow">Your Cart</p>
        <h1 className="section-title">Saved Vehicles</h1>
      </div>

      {loading ? (
        <div className="card p-8">
          <div className="h-5 w-40 skeleton rounded-full" />
          <div className="mt-6 space-y-4">
            <div className="h-28 skeleton rounded-2xl" />
            <div className="h-28 skeleton rounded-2xl" />
          </div>
        </div>
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
            {items.map((item, index) => {
              const car = item.car;
              if (!car) return null;
              return (
                <div key={item.id} className="card p-5 flex gap-4 sm:gap-5 card-hover page-enter" style={{ animationDelay: `${index * 60}ms` }}>
                  <Link to={`/cars/${car.slug}`} className="flex-shrink-0 w-24 h-16 sm:w-48 sm:h-32 rounded-lg overflow-hidden bg-ink-900">
                    <img src={resolveImage(car.image)} alt={car.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold">{car.brand?.name || "Zendrive"}</p>
                        <Link to={`/cars/${car.slug}`} className="font-display text-2xl text-ink-900 hover:text-accent transition-colors duration-200 leading-tight">
                          {car.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-9 h-9 grid place-items-center rounded-lg text-ink-500 hover:text-accent hover:bg-accent/10 transition-all duration-200"
                        aria-label="Remove"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-ink-500 flex-wrap">
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
              {telegramUrl && (
                <a
                  href={telegramCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full !py-3.5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0088cc] px-6 font-semibold text-white shadow-soft transition-all duration-200 hover:bg-[#0077b3] hover:-translate-y-0.5"
                >
                  <FaTelegramPlane size={18} />
                  Send to Telegram
                </a>
              )}
              <button
                onClick={clearCart}
                className="btn-primary w-full !py-3.5"
              >
                Clear saved vehicles
              </button>
              <p className="text-xs text-ink-500 text-center">Saved vehicles stay here until you remove them.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
