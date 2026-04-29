import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome, FiTruck, FiTag, FiLayers,
  FiMessageSquare, FiLogOut, FiMapPin, FiShare2,
} from "react-icons/fi";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: FiHome, end: true },
    ],
  },
  {
    label: "Catalog",
    items: [
      { to: "/cars", label: "Inventory", icon: FiTruck },
      { to: "/brands", label: "Brands", icon: FiTag },
      { to: "/body-types", label: "Body Types", icon: FiLayers },
    ],
  },
  {
    label: "Customer",
    items: [
      { to: "/inquiries", label: "Inquiries", icon: FiMessageSquare },
      { to: "/contact-info", label: "Contact Info", icon: FiMapPin },
      { to: "/social-media", label: "Social Media", icon: FiShare2 },
    ],
  },
];

export default function Sidebar() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("admin_user") || "null");
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    nav("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-ink-900 text-white flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Zendrive"
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
          />
          <div>
            <div className="font-extrabold tracking-tight text-base leading-none">
              ZEN<span className="text-accent">DRIVE</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-white/35 mt-1">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/10 text-white border-l-[3px] border-accent pl-[9px]"
                        : "text-white/60 hover:bg-white/6 hover:text-white/90 border-l-[3px] border-transparent pl-[9px]"
                    }`
                  }
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          {user && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate leading-none mb-0.5">
                {user.name}
              </p>
              <p className="text-[11px] text-white/40 truncate">{user.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/6 hover:text-white/80 transition-colors"
        >
          <FiLogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
