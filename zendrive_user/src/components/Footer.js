import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiClock,
  FiExternalLink,
  FiPhone,
  FiMail,
  FiMapPin,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiLinkedin,
} from "react-icons/fi";
import { FaWhatsapp, FaTiktok, FaTelegramPlane } from "react-icons/fa";
import { contactInfoApi, socialMediaApi } from "../services/api";

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

const CONTACT_ICON = {
  address: FiMapPin,
  phone: FiPhone,
  email: FiMail,
  hours: FiClock,
};

const FALLBACK_CONTACTS = [
  { id: "address", kind: "address", value: "120 Highline Ave, Suite 800, New York, NY 10001", link: null },
  { id: "phone", kind: "phone", value: "+1 (555) 936-7483", link: "tel:+15559367483" },
  { id: "email", kind: "email", value: "hello@zendrive.com", link: "mailto:hello@zendrive.com" },
];

const contactHref = (item) => {
  if (item.link) return item.link;
  if (item.kind === "phone") return `tel:${item.value.replace(/[^+\d]/g, "")}`;
  if (item.kind === "email") return `mailto:${item.value}`;
  return null;
};

export default function Footer() {
  const [contacts, setContacts] = useState(FALLBACK_CONTACTS);
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    contactInfoApi
      .list()
      .then((response) => {
        const items = Array.isArray(response.data)
          ? response.data.filter((item) => ["address", "phone", "email", "hours"].includes(item.kind))
          : [];
        if (items.length > 0) setContacts(items);
      })
      .catch(() => {});

    socialMediaApi
      .list()
      .then((response) => {
        const enabledLinks = Array.isArray(response.data)
          ? response.data.filter((item) => item.url?.trim())
          : [];
        setSocials(enabledLinks);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-24 relative overflow-hidden bg-ink-900 text-zen-line">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <div className={`container-zen py-14 md:py-16 grid gap-10 md:grid-cols-2 ${
        socials.length > 0
          ? "lg:grid-cols-[1.35fr_0.72fr_1fr_1fr]"
          : "lg:grid-cols-[1.55fr_0.8fr_1fr]"
      }`}>
        <div className="max-w-md">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Zendrive" className="w-11 h-11 rounded-lg object-cover shadow-soft" />
            <div className="font-extrabold text-2xl">
              <span className="text-white">ZEN</span>
              <span className="text-accent">DRIVE</span>
            </div>
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-zen-line/80">
            Zendrive curates premium vehicles, from electric performance to executive grand tourers.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-accent transition-colors duration-200">Home</Link></li>
            <li><Link to="/cars" className="hover:text-accent transition-colors duration-200">Inventory</Link></li>
            <li><Link to="/contact" className="hover:text-accent transition-colors duration-200">Contact</Link></li>
          </ul>
        </nav>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Reach Us</h4>
          <ul className="space-y-3 text-sm text-zen-line/80">
            {contacts.map((item) => {
              const Icon = CONTACT_ICON[item.kind] || FiMapPin;
              const href = contactHref(item);
              return (
                <li key={item.id} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 text-accent flex-shrink-0" />
                  {href ? (
                    <a href={href} className="hover:text-white transition-colors duration-200 break-words">
                      {item.value}
                    </a>
                  ) : (
                    <span className="break-words">{item.value}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {socials.length > 0 && (
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Follow Us</h4>
            <div className="grid gap-2">
              {socials.map((item) => {
                const Icon = PLATFORM_ICON[item.platform] || FiExternalLink;
                const label = item.platform.charAt(0).toUpperCase() + item.platform.slice(1);
                return (
                  <a
                    key={item.platform}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2.5 text-sm font-medium text-zen-line/80 hover:border-accent/40 hover:bg-white/5 hover:text-white transition-all duration-200"
                  >
                    <Icon className="text-accent" size={16} />
                    <span>{label}</span>
                    <FiExternalLink size={12} className="ml-auto text-white/35" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10">
        <div className="container-zen py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zen-line/60">
          <p>&copy; {new Date().getFullYear()} Zendrive Motors. All rights reserved.</p>
          <p>Crafted for drivers who demand more.</p>
        </div>
      </div>
    </footer>
  );
}
