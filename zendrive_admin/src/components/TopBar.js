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
  "/banners": { title: "Banners", parent: null },
  "/security": { title: "Security", parent: null },
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
  const { isMobile, toggleSidebar } = useMobile();

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center px-4 lg:px-6 gap-3 flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-zen-line">
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 grid place-items-center rounded-lg text-ink-700 hover:bg-zen-bg transition-colors duration-150 flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <FiMenu size={19} />
        </button>
      )}

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {meta.parent && (
          <>
            <Link
              to={meta.parent.to}
              className="text-sm text-ink-400 hover:text-ink-700 transition-colors"
            >
              {meta.parent.label}
            </Link>
            <FiChevronRight size={13} className="text-ink-300 flex-shrink-0" />
          </>
        )}
        <span className="text-sm font-semibold text-ink-800 truncate">
          {meta.title}
        </span>
      </div>

      {showAddCar && (
        <Link to="/cars/new" className="btn-primary text-xs !py-1.5">
          <FiPlus size={13} /> Add Car
        </Link>
      )}
    </header>
  );
}
