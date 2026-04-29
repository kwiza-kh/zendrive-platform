import React from "react";
import { useLocation, Link } from "react-router-dom";
import { FiPlus, FiChevronRight } from "react-icons/fi";

const routeMeta = {
  "/": { title: "Dashboard", parent: null },
  "/cars": { title: "Inventory", parent: null },
  "/cars/new": { title: "Add Car", parent: { label: "Inventory", to: "/cars" } },
  "/brands": { title: "Brands", parent: null },
  "/body-types": { title: "Body Types", parent: null },
  "/inquiries": { title: "Inquiries", parent: null },
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

  return (
    <header className="sticky top-0 z-20 h-14 bg-white border-b border-zen-line flex items-center px-6 gap-3 flex-shrink-0">
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
