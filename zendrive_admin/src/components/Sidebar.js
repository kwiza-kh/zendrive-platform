import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome, FiTruck, FiTag, FiLayers,
  FiLogOut, FiMapPin, FiShare2, FiX, FiLock, FiImage,
} from "react-icons/fi";
import { useMobile } from "../context/MobileContext";

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
    label: "Content",
    items: [
      { to: "/banners", label: "Banners", icon: FiImage },
    ],
  },
  {
    label: "Customer",
    items: [
      { to: "/contact-info", label: "Contact Info", icon: FiMapPin },
      { to: "/social-media", label: "Social Media", icon: FiShare2 },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/security", label: "Change Password", icon: FiLock },
    ],
  },
];

export default function Sidebar() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("admin_user") || "null");
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";
  const { isMobile, sidebarOpen, closeSidebar } = useMobile();

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    closeSidebar();
    nav("/login");
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center justify-between">
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
          {isMobile && (
            <button
              onClick={closeSidebar}
              className="w-8 h-8 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-200"
              aria-label="Close sidebar"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25 px-3 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={isMobile ? closeSidebar : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex-shrink-0 transition-colors duration-150 ${isActive ? "text-accent" : ""}`}>
                        <Icon size={15} />
                      </span>
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            {initials}
          </div>
          {user && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate leading-none mb-0.5">
                {user.name}
              </p>
              <p className="text-[10px] text-white/35 truncate">{user.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:bg-white/[0.05] hover:text-white/70 transition-colors duration-150"
        >
          <FiLogOut size={14} />
          Sign out
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-200"
            onClick={closeSidebar}
          />
        )}
        <aside
          className={`fixed left-0 top-0 h-screen w-64 bg-ink-900 text-white flex flex-col z-40 transform transition-transform duration-300 ease-out shadow-lift ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-ink-900 text-white flex flex-col z-30 border-r border-white/[0.05]">
      {sidebarContent}
    </aside>
  );
}
