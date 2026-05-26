import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiZap, FiSettings, FiUsers, FiActivity, FiShoppingCart, FiCheck } from "react-icons/fi";
import { resolveImage, formatPrice } from "../utils/constants";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CarCard({ car }) {
  const { user } = useAuth();
  const { addToCart, inCart } = useCart();
  const [adding, setAdding] = useState(false);
  const hasDiscount = car.discount_price && car.discount_price < car.price;
  const alreadyInCart = inCart(car.id);

  const handleCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || alreadyInCart) return;
    setAdding(true);
    try { await addToCart(car.id); } catch {}
    setAdding(false);
  };
  return (
    <Link to={`/cars/${car.slug}`} className="card card-hover group page-enter">
      <div className="relative h-56 bg-ink-900 overflow-hidden">
        <img
          src={resolveImage(car.image)}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/35 via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && <span className="badge-accent">Save {formatPrice(car.price - car.discount_price)}</span>}
          {car.is_new && !hasDiscount && <span className="badge-dark">New 2025</span>}
          {car.is_featured && <span className="badge-soft">Featured</span>}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-ink-900/80 backdrop-blur text-white text-xs font-semibold">
          {car.fuel_type === "Electric" ? <FiZap className="text-accent" /> : <FiActivity className="text-accent" />}
          {car.fuel_type}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold">{car.brand?.name || "Zendrive"}</p>
          <span className="text-xs text-ink-500">{car.year}</span>
        </div>
        <h3 className="font-display text-2xl text-ink-900 leading-tight group-hover:text-accent transition-colors duration-200 text-balance">
          {car.name}
        </h3>

        <div className="grid grid-cols-3 gap-2 mt-4 mb-5 text-xs text-ink-700">
          <div className="flex items-center gap-1.5"><FiActivity className="text-accent" /> {car.horsepower} HP</div>
          <div className="flex items-center gap-1.5"><FiSettings className="text-accent" /> {car.transmission}</div>
          <div className="flex items-center gap-1.5"><FiUsers className="text-accent" /> {car.seats} seats</div>
        </div>

        <div className="flex items-end justify-between border-t border-zen-line pt-4">
          <div>
            {hasDiscount ? (
              <>
                <p className="text-xs line-through text-ink-500">{formatPrice(car.price)}</p>
                <p className="text-2xl font-bold text-accent">{formatPrice(car.discount_price)}</p>
              </>
            ) : (
              <p className="text-2xl font-bold text-ink-900">{formatPrice(car.price)}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={handleCart}
                disabled={alreadyInCart || adding}
                className={`w-10 h-10 grid place-items-center rounded-full transition-all duration-200 ${
                  alreadyInCart
                    ? "bg-accent text-white"
                    : "text-ink-700 hover:bg-accent hover:text-white border border-zen-line"
                }`}
                aria-label={alreadyInCart ? "In cart" : "Add to cart"}
              >
                {alreadyInCart ? <FiCheck size={14} /> : <FiShoppingCart size={14} />}
              </button>
            )}
            <span className="text-sm font-semibold text-ink-700 group-hover:text-accent transition-colors duration-200">View →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
