import React from "react";
import { Link } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-zen-line mt-24">
      <div className="container-zen py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Zendrive" className="w-11 h-11 rounded-lg object-cover" />
            <div className="font-extrabold tracking-tight text-2xl">
              <span className="text-white">ZEN</span>
              <span className="text-accent">DRIVE</span>
            </div>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-zen-line/80">
            Zendrive curates the world's finest vehicles — from electric performance to executive grand tourers.
            Drive smarter. Drive bolder.
          </p>
          <div className="flex items-center gap-3 mt-6">
            {[FiInstagram, FiFacebook, FiTwitter, FiYoutube].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 grid place-items-center rounded-full bg-white/5 hover:bg-accent transition text-white">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/cars" className="hover:text-accent transition">All Inventory</Link></li>
            <li><Link to="/cars?body_type=SUV" className="hover:text-accent transition">SUVs</Link></li>
            <li><Link to="/cars?fuel_type=Electric" className="hover:text-accent transition">Electric</Link></li>
            <li><Link to="/about" className="hover:text-accent transition">About Zendrive</Link></li>
            <li><Link to="/contact" className="hover:text-accent transition">Contact</Link></li>
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
