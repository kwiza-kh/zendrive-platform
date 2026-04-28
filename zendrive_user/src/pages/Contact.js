import React, { useEffect, useState } from "react";
import { FiPhone, FiMail, FiMapPin, FiClock, FiExternalLink, FiInfo } from "react-icons/fi";
import { inquiriesApi, contactInfoApi } from "../services/api";

const ICONS = {
  address: FiMapPin,
  phone: FiPhone,
  email: FiMail,
  hours: FiClock,
  other: FiInfo,
};

const FALLBACK = [
  { id: "f1", kind: "address", label: "Showroom", value: "120 Highline Ave, Suite 800, NY 10001", link: "https://www.google.com/maps/search/?api=1&query=120+Highline+Ave+Suite+800+NY+10001" },
  { id: "f2", kind: "phone", label: "Phone", value: "+1 (555) 936-7483", link: "tel:+15559367483" },
  { id: "f3", kind: "email", label: "Email", value: "hello@zendrive.com", link: "mailto:hello@zendrive.com" },
  { id: "f4", kind: "hours", label: "Hours", value: "Mon–Sat: 9am – 8pm · Sun: 10am – 6pm", link: null },
];

const buildLink = (item) => {
  if (item.link) return item.link;
  if (item.kind === "address") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.value)}`;
  }
  if (item.kind === "phone") return `tel:${item.value.replace(/[^+\d]/g, "")}`;
  if (item.kind === "email") return `mailto:${item.value}`;
  return null;
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState(FALLBACK);

  useEffect(() => {
    contactInfoApi
      .list()
      .then((r) => {
        if (Array.isArray(r.data) && r.data.length > 0) setItems(r.data);
      })
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await inquiriesApi.create(form); setSent(true); }
    catch (e) { setErr(e?.response?.data?.detail || "Failed. Try again."); }
  };

  return (
    <div className="container-zen py-16">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="section-eyebrow">Get in touch</p>
        <h1 className="section-title">Talk to a Zendrive specialist.</h1>
        <p className="mt-4 text-ink-500">Schedule a test drive, ask about a model, or just say hi.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10">
        <div className="space-y-4">
          {items.map((it) => {
            const Icon = ICONS[it.kind] || FiInfo;
            const href = buildLink(it);
            const isLink = !!href;
            return (
              <div key={it.id} className="card p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-ink-900 grid place-items-center flex-shrink-0">
                  <Icon className="text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold">{it.label}</p>
                  {isLink ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="font-semibold text-ink-900 mt-0.5 inline-flex items-center gap-1.5 hover:text-accent break-words"
                    >
                      <span className="break-words">{it.value}</span>
                      {href.startsWith("http") && <FiExternalLink className="flex-shrink-0" />}
                    </a>
                  ) : (
                    <p className="font-semibold text-ink-900 mt-0.5 break-words">{it.value}</p>
                  )}
                  {it.kind === "address" && isLink && (
                    <p className="text-xs text-ink-500 mt-1">Click to open in maps</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={submit} className="card p-8 space-y-4">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent grid place-items-center mb-5 text-3xl text-white">✓</div>
              <h3 className="font-display text-2xl mb-2">Thank you!</h3>
              <p className="text-ink-500">We'll be in touch within 30 minutes.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="label">Message</label><textarea className="input min-h-[140px] resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
              {err && <p className="text-accent text-sm">{err}</p>}
              <button className="btn-primary w-full !py-3.5">Send message</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
