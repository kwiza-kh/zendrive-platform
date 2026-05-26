import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiLinkedin } from "react-icons/fi";
import { FaWhatsapp, FaTiktok, FaTelegramPlane } from "react-icons/fa";
import { socialMediaApi } from "../services/api";

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

export default function Footer() {
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    socialMediaApi.list().then((r) => setSocials(r.data)).catch(() => {});
  }, []);

  return (
    <footer className="mt-24 relative overflow-hidden bg-ink-900 text-zen-line">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl float-gentle" />
        <div className="absolute left-1/4 bottom-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="container-zen py-16 grid gap-10 md:grid-cols-4 relative">
        <div className="md:col-span-2 max-w-xl">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Zendrive" className="w-11 h-11 rounded-xl object-cover shadow-soft" />
            <div className="font-extrabold tracking-tight text-2xl">
              <span className="text-white">ZEN</span>
              <span className="text-accent">DRIVE</span>
            </div>
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-zen-line/80 text-balance">
            Zendrive curates the world's finest vehicles, from electric performance to executive grand tourers.
            Drive smarter. Drive bolder.
          </p>

          {socials.length > 0 && (
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              {socials.map((s) => {
                const Icon = PLATFORM_ICON[s.platform];
                if (!Icon) return null;
                return (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}
                    className="w-10 h-10 grid place-items-center rounded-full bg-white/10 hover:bg-accent transition-all duration-200 text-white hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/cars" className="hover:text-accent transition-colors duration-200">All Inventory</Link></li>
            <li><Link to="/cars?body_type=SUV" className="hover:text-accent transition-colors duration-200">SUVs</Link></li>
            <li><Link to="/cars?fuel_type=Electric" className="hover:text-accent transition-colors duration-200">Electric</Link></li>
            <li><Link to="/about" className="hover:text-accent transition-colors duration-200">About Zendrive</Link></li>
            <li><Link to="/contact" className="hover:text-accent transition-colors duration-200">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Reach Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5"><FiMapPin className="mt-0.5 text-accent flex-shrink-0" /> 120 Highline Ave, Suite 800<br />New York, NY 10001</li>
            <li className="flex items-center gap-2.5"><FiPhone className="text-accent" /> +1 (555) 936-7483</li>
            <li className="flex items-center gap-2.5"><FiMail className="text-accent" /> hello@zendrive.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-zen py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zen-line/60">
          <p>© {new Date().getFullYear()} Zendrive Motors. All rights reserved.</p>
          <p>Crafted for drivers who demand more.</p>
        </div>
      </div>
    </footer>
  );
}
