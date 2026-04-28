import React from "react";
import { Link } from "react-router-dom";
import { FiAward, FiUsers, FiGlobe, FiTrendingUp } from "react-icons/fi";

export default function About() {
  return (
    <div>
      <section className="bg-ink-900 text-white py-24">
        <div className="container-zen max-w-3xl">
          <p className="section-eyebrow">Our Story</p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold leading-tight">
            Cars are not products. <span className="text-accent italic">They're stories.</span>
          </h1>
          <p className="mt-6 text-white/70 text-lg leading-relaxed">
            Zendrive was founded on a simple idea — buying a premium car should be as exciting as driving one.
            We blend a curator's eye with a concierge's care to make ownership effortless.
          </p>
        </div>
      </section>

      <section className="container-zen py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="section-eyebrow">The Zendrive Way</p>
          <h2 className="section-title">A different kind of dealership.</h2>
          <p className="mt-5 text-ink-700 leading-relaxed">
            Every Zendrive vehicle goes through a 187-point inspection by master technicians.
            Every customer is paired with a personal advisor. Every transaction is transparent — no hidden fees, no pressure tactics.
          </p>
          <Link to="/cars" className="btn-dark mt-7">Explore our inventory</Link>
        </div>
        <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200" alt="" className="rounded-2xl shadow-soft" />
      </section>

      <section className="bg-white border-y border-zen-line py-24">
        <div className="container-zen grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            [FiAward, "12+ years", "Industry experience"],
            [FiUsers, "12,000+", "Drivers served"],
            [FiGlobe, "All 50 states", "Nationwide reach"],
            [FiTrendingUp, "98%", "Satisfaction rate"],
          ].map(([Icon, n, l]) => (
            <div key={l} className="text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-ink-900 grid place-items-center mb-4">
                <Icon className="text-accent" size={24} />
              </div>
              <p className="font-display text-3xl font-semibold text-ink-900">{n}</p>
              <p className="text-sm text-ink-500 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
