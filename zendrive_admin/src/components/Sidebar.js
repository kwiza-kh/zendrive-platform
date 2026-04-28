import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiTruck, FiTag, FiLayers, FiMessageSquare, FiLogOut, FiPlus, FiMapPin } from "react-icons/fi";

const items = [
  { to: "/", label: "Dashboard", icon: FiHome, end: true },
  { to: "/cars", label: "Inventory", icon: FiTruck },
  { to: "/brands", label: "Brands", icon: FiTag },
  { to: "/body-types", label: "Body Types", icon: FiLayers },
  { to: "/inquiries", label: "Inquiries", icon: FiMessageSquare },
  { to: "/contact-info", label: "Contact Info", icon: FiMapPin },
];

export default function Sidebar() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("admin_user") || "null");
  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    nav("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-ink-900 text-white flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Zendrive" className="w-9 h-9 rounded-lg object-cover" />
          <div className="font-extrabold tracking-tight text-lg">
            <span>ZEN</span><span className="text-accent">DRIVE</span>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-white/40 mt-3">Admin Console</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition ${
                isActive ? "bg-accent text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
        <NavLink
          to="/cars/new"
          className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-semibold border border-white/15 text-white hover:bg-white/5"
        >
          <FiPlus /> Add Car
        </NavLink>
      </nav>

      <div className="p-4 border-t border-white/10">
        {user && (
          <div className="text-sm mb-3">
            <p className="font-semibold">{user.name}</p>
            <p className="text-white/50 text-xs">{user.email}</p>
          </div>
        )}
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-white/80 hover:bg-white/5">
          <FiLogOut /> Sign out
        </button>
      </div>
    </aside>
  );
}
