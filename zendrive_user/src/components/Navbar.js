import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiSearch, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Inventory" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f4ee]/82 backdrop-blur-2xl shadow-[0_16px_36px_-32px_rgba(18,20,22,0.38)]">
      <div className="container-zen flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="Zendrive"
            className="w-10 h-10 rounded-lg object-cover shadow-soft group-hover:scale-105 transition duration-200"
          />
          <div className="font-extrabold tracking-[-0.01em] text-xl">
            <span className="text-ink-900">ZEN</span>
            <span className="text-accent">DRIVE</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-accent bg-white/90 shadow-[0_0_0_1px_rgba(207,31,43,0.12),0_12px_28px_-22px_rgba(18,20,22,0.4)]"
                    : "text-ink-700 hover:text-accent hover:bg-white/70"
                }`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/cars")}
            className="w-10 h-10 grid place-items-center rounded-lg text-ink-700 hover:bg-white hover:text-accent transition-all duration-200 hover:shadow-soft"
            aria-label="Search"
          >
            <FiSearch size={18} />
          </button>
          <Link
            to="/cart"
            className="relative w-10 h-10 grid place-items-center rounded-lg text-ink-700 hover:bg-white hover:text-accent transition-all duration-200 hover:shadow-soft"
            aria-label="Cart"
          >
            <FiShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center ring-2 ring-[#f7f4ee]">
                {count}
              </span>
            )}
          </Link>
          <Link to="/cars" className="btn-primary !px-5 !py-2.5 text-sm">Browse Cars</Link>
        </div>

        <button
          className="md:hidden w-10 h-10 grid place-items-center rounded-lg text-ink-900 hover:bg-white hover:text-accent transition-all duration-200 hover:shadow-soft"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-black/5 bg-[#f7f4ee]/96 backdrop-blur-xl">
          <div className="container-zen py-4 flex flex-col gap-1 animate-fade-up">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive ? "bg-accent text-white shadow-soft" : "text-ink-800 hover:bg-zen-line"
                  }`
                }
                end={l.to === "/"}
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-3 mt-2 border-t border-zen-line flex gap-2">
              <Link to="/cart" onClick={() => setOpen(false)} className="btn-outline flex-1 !py-2.5 relative">
                Cart{count > 0 && ` (${count})`}
              </Link>
              <Link to="/cars" onClick={() => setOpen(false)} className="btn-primary flex-1 !py-2.5">Browse Cars</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
