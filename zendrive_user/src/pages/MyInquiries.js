import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiClock, FiArrowLeft, FiInbox } from "react-icons/fi";
import { inquiriesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { resolveImage, formatPrice } from "../utils/constants";

const STATUS_STYLES = {
  new: "bg-accent/10 text-accent border-accent/20",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

export default function MyInquiries() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    inquiriesApi
      .myList()
      .then((r) => setInquiries(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="container-zen py-24 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-ink-900 grid place-items-center mb-6">
          <FiMail className="text-accent" size={32} />
        </div>
        <h2 className="section-title mb-3">Sign in to view your inquiries</h2>
        <p className="text-ink-500 mb-8">Track the status of your submitted inquiries.</p>
        <div className="flex justify-center gap-3">
          <Link to="/login" className="btn-primary">Sign in</Link>
          <Link to="/register" className="btn-outline">Create account</Link>
        </div>
      </div>
    );
  }

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="container-zen py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-accent mb-8">
        <FiArrowLeft /> Back to home
      </Link>

      <div className="mb-8">
        <p className="section-eyebrow">My Inquiries</p>
        <h1 className="section-title">Inquiry History</h1>
      </div>

      {loading ? (
        <div className="text-ink-500">Loading…</div>
      ) : inquiries.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-zen-line grid place-items-center mb-5">
            <FiInbox className="text-ink-500" size={24} />
          </div>
          <h3 className="font-display text-2xl mb-2">No inquiries yet</h3>
          <p className="text-ink-500 mb-6">When you submit an inquiry, it will appear here.</p>
          <Link to="/cars" className="btn-primary">Browse inventory</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="card p-6">
              <div className="flex items-start gap-5">
                {inq.car ? (
                  <Link to={`/cars/${inq.car.slug}`} className="flex-shrink-0 w-40 h-28 rounded-lg overflow-hidden bg-ink-900">
                    <img src={resolveImage(inq.car.image)} alt={inq.car.name} className="w-full h-full object-cover" />
                  </Link>
                ) : (
                  <div className="flex-shrink-0 w-40 h-28 rounded-lg bg-ink-900 grid place-items-center">
                    <FiMail className="text-ink-500" size={28} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {inq.car ? (
                        <Link to={`/cars/${inq.car.slug}`} className="font-display text-xl text-ink-900 hover:text-accent transition">
                          {inq.car.name}
                        </Link>
                      ) : (
                        <p className="font-display text-xl text-ink-900">General Inquiry</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-ink-500">
                        <FiClock size={12} />
                        <span>{fmtDate(inq.created_at)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${STATUS_STYLES[inq.status] || STATUS_STYLES.new}`}>
                      {STATUS_LABELS[inq.status] || inq.status}
                    </span>
                  </div>
                  {inq.car && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-500">
                      <span>{inq.car.year}</span>
                      <span>{inq.car.fuel_type}</span>
                      <span>{formatPrice(inq.car.discount_price && inq.car.discount_price < inq.car.price ? inq.car.discount_price : inq.car.price)}</span>
                    </div>
                  )}
                  {inq.message && (
                    <p className="mt-3 text-sm text-ink-700 leading-relaxed line-clamp-2">{inq.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
