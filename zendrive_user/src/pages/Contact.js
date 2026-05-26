import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiExternalLink,
  FiInfo,
  FiArrowRight,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiLinkedin,
} from "react-icons/fi";
import { FaWhatsapp, FaTiktok, FaTelegramPlane } from "react-icons/fa";
import { contactInfoApi, socialMediaApi } from "../services/api";

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
  { id: "f4", kind: "hours", label: "Hours", value: "Mon-Sat: 9am - 8pm / Sun: 10am - 6pm", link: null },
];

const PLATFORM_ICON = {
  instagram: FiInstagram,
  facebook: FiFacebook,
  twitter: FiTwitter,
  youtube: FiYoutube,
  linkedin: FiLinkedin,
  whatsapp: FaWhatsapp,
  tiktok: FaTiktok,
  telegram: FaTelegramPlane,
};

const buildLink = (item) => {
  if (item.link) return item.link;
  if (item.kind === "address") return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.value)}`;
  if (item.kind === "phone") return `tel:${item.value.replace(/[^+\d]/g, "")}`;
  if (item.kind === "email") return `mailto:${item.value}`;
  return null;
};

const buildMapEmbedUrl = (item) => {
  if (!item || item.kind !== "address") return null;
  const fallbackQuery = item.value || "";
  const rawLink = item.link?.trim();

  if (!rawLink) {
    return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
  }

  try {
    const url = new URL(rawLink);
    const host = url.hostname.replace(/^www\./, "");
    const isGoogleMaps = host.includes("google.com") || host.includes("maps.google");
    if (isGoogleMaps) {
      const query =
        url.searchParams.get("query") ||
        url.searchParams.get("q") ||
        url.searchParams.get("destination") ||
        fallbackQuery;
      return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    }
  } catch (_) {}

  return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
};

function ContactDetail({ item }) {
  const Icon = ICONS[item.kind] || FiInfo;
  const href = buildLink(item);
  const isLink = !!href;

  return (
    <article className="rounded-2xl border border-zen-line bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-ink-900 grid place-items-center flex-shrink-0">
          <Icon className="text-accent" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.28em] text-ink-500 font-bold">{item.label}</p>
          {isLink ? (
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 font-semibold text-ink-900 hover:text-accent transition-colors break-words"
            >
              <span>{item.value}</span>
              {href.startsWith("http") && <FiExternalLink className="flex-shrink-0" size={14} />}
            </a>
          ) : (
            <p className="mt-1 font-semibold text-ink-900 break-words">{item.value}</p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Contact() {
  const [items, setItems] = useState(FALLBACK);
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    contactInfoApi
      .list()
      .then((r) => {
        if (Array.isArray(r.data) && r.data.length > 0) setItems(r.data);
      })
      .catch(() => {});
    socialMediaApi
      .list()
      .then((r) => {
        if (Array.isArray(r.data)) setSocials(r.data);
      })
      .catch(() => {});
  }, []);

  const visibleItems = useMemo(() => (items.length > 0 ? items : FALLBACK), [items]);
  const primaryAddress = useMemo(
    () => visibleItems.find((it) => it.kind === "address") || FALLBACK[0],
    [visibleItems]
  );
  const mapHref = buildLink(primaryAddress);
  const mapSrc = buildMapEmbedUrl(primaryAddress);

  return (
    <div className="page-enter">
      <section className="container-zen pt-8 md:pt-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-end">
          <div className="max-w-3xl">
            <p className="section-eyebrow">Get in touch</p>
            <h1 className="section-title text-balance">Talk to a Zendrive specialist.</h1>
            <p className="mt-4 text-ink-700 max-w-2xl leading-relaxed text-balance">
              Schedule a test drive, ask about a model, or book a showroom visit. We usually reply the same day.
            </p>
          </div>
          <div className="flex lg:justify-end">
            <Link to="/cars" className="btn-outline !px-5 !py-3">
              Browse inventory <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-zen py-10 md:py-14 pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] items-start">
          <aside className="surface-panel p-5 md:p-6">
            <p className="section-eyebrow mb-2">Contact details</p>
            <h2 className="font-display text-3xl text-ink-900">Reach Zendrive</h2>
            <div className="mt-6 grid gap-3">
              {visibleItems.map((item, index) => (
                <div key={item.id} className="page-enter" style={{ animationDelay: `${index * 70}ms` }}>
                  <ContactDetail item={item} />
                </div>
              ))}
            </div>

            {socials.length > 0 && (
              <div className="mt-7 border-t border-zen-line pt-6">
                <p className="text-xs uppercase tracking-[0.22em] text-ink-500 font-bold">Social media</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {socials.map((social) => {
                    const Icon = PLATFORM_ICON[social.platform] || FiExternalLink;
                    const label = social.platform.charAt(0).toUpperCase() + social.platform.slice(1);
                    return (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-2xl border border-zen-line bg-white px-4 py-3 font-semibold text-ink-900 transition-all duration-200 hover:border-accent/30 hover:text-accent hover:shadow-soft"
                      >
                        <span className="w-9 h-9 rounded-xl bg-ink-900 grid place-items-center text-accent flex-shrink-0">
                          <Icon size={16} />
                        </span>
                        <span className="truncate">{label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          <div className="surface-panel overflow-hidden">
            <div className="p-5 md:p-6 border-b border-zen-line">
              <p className="section-eyebrow mb-2">Visit us</p>
              <h2 className="font-display text-3xl text-ink-900">Showroom map</h2>
              <p className="mt-2 text-sm text-ink-500 break-words">
                {primaryAddress.label}: {primaryAddress.value}
              </p>
            </div>
            <div className="bg-zen-bg">
              {mapSrc ? (
                <iframe
                  title="Zendrive showroom map"
                  src={mapSrc}
                  className="block w-full h-[420px] md:h-[560px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="h-[420px] md:h-[560px] grid place-items-center p-8 text-center text-ink-500">
                  Map preview is unavailable.
                </div>
              )}
            </div>
            {mapHref && (
              <div className="p-5 md:p-6 border-t border-zen-line">
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-dark w-full sm:w-auto"
                >
                  Open in Maps <FiExternalLink />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
