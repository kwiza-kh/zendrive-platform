import React from "react";
import { useLocation, Link } from "react-router-dom";
import { FiPlus, FiChevronRight, FiMenu } from "react-icons/fi";
import { useMobile } from "../context/MobileContext";

const routeMeta = {
  "/": { title: "Dashboard", parent: null },
  "/cars": { title: "Inventory", parent: null },
  "/cars/new": { title: "Add Car", parent: { label: "Inventory", to: "/cars" } },
  "/brands": { title: "Brands", parent: null },
  "/body-types": { title: "Body Types", parent: null },
  "/contact-info": { title: "Contact Info", parent: null },
  "/social-media": { title: "Social Media", parent: null },
};

function resolveRoute(pathname) {
  if (routeMeta[pathname]) return routeMeta[pathname];
  if (/^\/cars\/\d+$/.test(pathname)) {
    return { title: "Edit Car", parent: { label: "Inventory", to: "/cars" } };
  }
  return { title: "Admin", parent: null };
}

export default function TopBar() {
  const { pathname } = useLocation();
  const meta = resolveRoute(pathname);
  const showAddCar = pathname === "/cars";
  const isDashboard = pathname === "/";
  const { isMobile, toggleSidebar } = useMobile();

  return (
    <header
      className={`sticky top-0 z-20 h-14 flex items-center px-4 lg:px-6 gap-3 flex-shrink-0 transition-colors duration-200 ${
        isDashboard
          ? "bg-transparent border-b border-transparent shadow-none"
          : "bg-white/85 backdrop-blur-xl border-b border-white/70 shadow-[0_8px_28px_-28px_rgba(15,23,42,0.55)]"
      }`}
    >
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 grid place-items-center rounded-full text-ink-700 hover:bg-zen-bg transition-all duration-200 flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <FiMenu size={20} />
        </button>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {meta.parent && (
          <>
            <Link
              to={meta.parent.to}
              className="text-sm text-ink-500 hover:text-ink-900 transition-colors"
            >
              {meta.parent.label}
            </Link>
            <FiChevronRight size={14} className="text-ink-300 flex-shrink-0" />
          </>
        )}
        <span className="text-sm font-semibold text-ink-900 truncate">
          {meta.title}
        </span>
      </div>

      {/* Actions */}
      {showAddCar && (
        <Link to="/cars/new" className="btn-primary text-xs !py-1.5">
          <FiPlus size={14} /> Add Car
        </Link>
      )}
    </header>
  );
}
