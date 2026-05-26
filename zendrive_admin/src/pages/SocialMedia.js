import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  FiInstagram, FiFacebook, FiTwitter, FiYoutube,
  FiLinkedin, FiExternalLink, FiAlertCircle,
} from "react-icons/fi";
import { FaWhatsapp, FaTiktok, FaTelegramPlane } from "react-icons/fa";

const PLATFORM_META = {
  instagram: { label: "Instagram", Icon: FiInstagram, color: "from-purple-500 to-pink-500", placeholder: "https://instagram.com/yourpage" },
  facebook: { label: "Facebook", Icon: FiFacebook, color: "from-blue-600 to-blue-500", placeholder: "https://facebook.com/yourpage" },
  twitter: { label: "Twitter / X", Icon: FiTwitter, color: "from-sky-500 to-sky-400", placeholder: "https://twitter.com/yourpage" },
  youtube: { label: "YouTube", Icon: FiYoutube, color: "from-red-600 to-red-500", placeholder: "https://youtube.com/@yourchannel" },
  linkedin: { label: "LinkedIn", Icon: FiLinkedin, color: "from-blue-700 to-blue-600", placeholder: "https://linkedin.com/company/yourpage" },
  tiktok: { label: "TikTok", Icon: FaTiktok, color: "from-zinc-900 to-zinc-700", placeholder: "https://tiktok.com/@yourpage" },
  telegram: { label: "Telegram", Icon: FaTelegramPlane, color: "from-cyan-500 to-cyan-400", placeholder: "https://t.me/yourchannel" },
  whatsapp: { label: "WhatsApp", Icon: FaWhatsapp, color: "from-green-500 to-green-400", placeholder: "https://wa.me/15559367483" },
};

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${checked ? "bg-accent" : "bg-zen-line"}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SocialMedia() {
  const [items, setItems] = useState([]);
  const [dirty, setDirty] = useState({});
  const [saving, setSaving] = useState(null);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(null);

  const load = () =>
    api.get("/api/social-media/all").then((r) => {
      setItems(r.data);
      setDirty({});
    });

  useEffect(() => { load(); }, []);

  const patch = (platform, key, value) => {
    setDirty((d) => ({
      ...d,
      [platform]: { ...(d[platform] || {}), [key]: value },
    }));
  };

  const getVal = (item, key) =>
    dirty[item.platform]?.[key] !== undefined
      ? dirty[item.platform][key]
      : item[key];

  const buildPayload = (item) => {
    const changes = dirty[item.platform] || {};
    return {
      url: getVal(item, "url"),
      enabled: getVal(item, "enabled"),
      sort_order: getVal(item, "sort_order"),
      ...changes,
    };
  };

  const save = async (platform) => {
    const item = items.find((entry) => entry.platform === platform);
    const changes = dirty[platform];
    if (!changes || !item) return;

    const payload = buildPayload(item);
    setSaving(platform);
    setErr("");
    try {
      await api.put(`/api/social-media/${platform}`, payload);
      setDirty((current) => {
        const next = { ...current };
        delete next[platform];
        return next;
      });
      setItems((current) =>
        current.map((entry) =>
          entry.platform === platform ? { ...entry, ...payload } : entry
        )
      );
      setSaved(platform);
      setTimeout(() => setSaved((p) => (p === platform ? null : p)), 1800);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(null);
    }
  };

  const hasDirty = (platform) => !!dirty[platform];

  return (
    <div className="page-content max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Social Media</h1>
        <p className="page-subtitle">
          Enable platforms and set links. Only enabled platforms appear on the website footer.
        </p>
      </div>

      {err && (
        <div className="mb-5 flex items-center gap-2 text-sm text-accent bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <FiAlertCircle size={15} className="flex-shrink-0" /> {err}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, index) => {
          const meta = PLATFORM_META[item.platform] || {
            label: item.platform,
            Icon: FiExternalLink,
            color: "from-ink-700 to-ink-600",
            placeholder: "https://",
          };
          const { label, Icon, color, placeholder } = meta;
          const enabled = getVal(item, "enabled");
          const url = getVal(item, "url");
          const isDirty = hasDirty(item.platform);
          const isSaving = saving === item.platform;
          const isSaved = saved === item.platform;

          return (
            <div
              key={item.platform}
              className={`card p-4 transition-all duration-200 page-enter ${enabled ? "ring-1 ring-accent/20" : ""}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} grid place-items-center flex-shrink-0 shadow-soft`}>
                    <Icon size={18} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="font-semibold text-sm">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${enabled ? "text-accent" : "text-ink-500"}`}>
                          {enabled ? "Enabled" : "Disabled"}
                        </span>
                        <Toggle
                          checked={enabled}
                          disabled={isSaving}
                          onChange={(v) => patch(item.platform, "enabled", v)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:w-64">
                  <input
                    className="input flex-1 text-sm min-w-0"
                    placeholder={placeholder}
                    value={url}
                    disabled={isSaving}
                    onChange={(e) => patch(item.platform, "url", e.target.value)}
                  />
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline !px-2.5 !py-2 flex-shrink-0"
                      title="Open link"
                    >
                      <FiExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {(isDirty || isSaved) && (
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-zen-line pt-3">
                  {isSaved && (
                    <span className="text-xs text-emerald-600 font-semibold">Saved</span>
                  )}
                  {isDirty && (
                    <button
                      onClick={() => save(item.platform)}
                      disabled={isSaving}
                      className="btn-primary !py-1.5 !text-xs"
                    >
                      {isSaving ? "Saving..." : "Save changes"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
