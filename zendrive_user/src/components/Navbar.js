import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiLogOut, FiSearch, FiShoppingCart } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Inventory" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zen-line">
      <div className="container-zen flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="Zendrive"
            className="w-10 h-10 rounded-lg object-cover shadow-soft group-hover:scale-105 transition"
          />
          <div className="font-sans font-extrabold tracking-tight text-xl">
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
                `px-4 py-2 text-sm font-semibold rounded-md transition ${
                  isActive ? "text-accent" : "text-ink-700 hover:text-accent"
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
            className="w-10 h-10 grid place-items-center rounded-md text-ink-700 hover:bg-zen-line transition"
            aria-label="Search"
          >
            <FiSearch size={18} />
          </button>
          <Link
            to="/cart"
            className="relative w-10 h-10 grid place-items-center rounded-md text-ink-700 hover:bg-zen-line transition"
            aria-label="Cart"
          >
            <FiShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/my-inquiries" className="flex items-center gap-2 px-3 py-2 rounded-md bg-zen-line/60 hover:bg-zen-line transition">
                <FiUser className="text-ink-700" />
                <span className="text-sm font-semibold text-ink-800">{user.name.split(" ")[0]}</span>
              </Link>
              <button onClick={logout} className="btn-ghost" aria-label="Logout">
                <FiLogOut />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/cars" className="btn-primary !px-5 !py-2.5 text-sm">Browse Cars</Link>
            </>
          )}
        </div>

        <button
          className="md:hidden w-10 h-10 grid place-items-center rounded-md text-ink-900 hover:bg-zen-line transition"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-zen-line bg-white">
          <div className="container-zen py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-semibold ${
                    isActive ? "bg-accent text-white" : "text-ink-800 hover:bg-zen-line"
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
              {user ? (
                <>
                  <Link to="/my-inquiries" onClick={() => setOpen(false)} className="btn-outline flex-1 !py-2.5">My Inquiries</Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="btn-outline flex-1 !py-2.5">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline flex-1 !py-2.5">Sign in</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 !py-2.5">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
