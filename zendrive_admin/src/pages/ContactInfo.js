import React, { useEffect, useState } from "react";
import api from "../services/api";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiExternalLink, FiMapPin, FiPhone, FiMail, FiClock, FiInfo } from "react-icons/fi";

const KINDS = [
  { value: "address", label: "Address", icon: FiMapPin },
  { value: "phone", label: "Phone", icon: FiPhone },
  { value: "email", label: "Email", icon: FiMail },
  { value: "hours", label: "Hours", icon: FiClock },
  { value: "other", label: "Other", icon: FiInfo },
];

const iconFor = (k) => (KINDS.find((x) => x.value === k) || KINDS[4]).icon;

const emptyForm = { kind: "address", label: "", value: "", link: "", sort_order: 0 };

const mapsLink = (addr) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr || "")}`;

export default function ContactInfo() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [err, setErr] = useState("");

  const load = () =>
    api.get("/api/contact-info").then((r) => setItems(r.data));
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.label.trim() || !form.value.trim()) {
      setErr("Label and value are required.");
      return;
    }
    try {
      await api.post("/api/contact-info", {
        ...form,
        label: form.label.trim(),
        value: form.value.trim(),
        link: form.link.trim() || null,
        sort_order: Number(form.sort_order) || 0,
      });
      setForm(emptyForm);
      load();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Add failed.");
    }
  };

  const startEdit = (it) => {
    setEditId(it.id);
    setEditForm({
      kind: it.kind || "other",
      label: it.label || "",
      value: it.value || "",
      link: it.link || "",
      sort_order: it.sort_order || 0,
    });
    setErr("");
  };
  const cancelEdit = () => {
    setEditId(null);
    setEditForm(emptyForm);
  };

  const saveEdit = async () => {
    setErr("");
    try {
      await api.put(`/api/contact-info/${editId}`, {
        ...editForm,
        label: editForm.label.trim(),
        value: editForm.value.trim(),
        link: editForm.link.trim() || null,
        sort_order: Number(editForm.sort_order) || 0,
      });
      cancelEdit();
      load();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Save failed.");
    }
  };

  const remove = async (it) => {
    if (!window.confirm(`Delete "${it.label}"?`)) return;
    setErr("");
    try {
      await api.delete(`/api/contact-info/${it.id}`);
      load();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Delete failed.");
    }
  };

  const RowForm = ({ data, setData, isAddress }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_100px] gap-3">
        <select
          className="input"
          value={data.kind}
          onChange={(e) => setData({ ...data, kind: e.target.value })}
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Label (e.g. Showroom)"
          value={data.label}
          onChange={(e) => setData({ ...data, label: e.target.value })}
        />
        <input
          className="input"
          type="number"
          placeholder="Order"
          value={data.sort_order}
          onChange={(e) => setData({ ...data, sort_order: e.target.value })}
        />
      </div>
      <input
        className="input"
        placeholder={
          data.kind === "address"
            ? "Address (e.g. 120 Highline Ave, NY 10001)"
            : "Value"
        }
        value={data.value}
        onChange={(e) => setData({ ...data, value: e.target.value })}
      />
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder={
            data.kind === "address"
              ? "Map link (Google Maps URL) — leave empty to auto-generate"
              : data.kind === "phone"
              ? "tel:+15559367483 (optional)"
              : data.kind === "email"
              ? "mailto:hello@zendrive.com (optional)"
              : "Optional URL"
          }
          value={data.link}
          onChange={(e) => setData({ ...data, link: e.target.value })}
        />
        {isAddress && (
          <button
            type="button"
            className="btn-outline whitespace-nowrap"
            title="Generate Google Maps link from value"
            onClick={() =>
              setData({ ...data, link: mapsLink(data.value) })
            }
          >
            <FiMapPin /> Auto map link
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-content max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Contact Info</h1>
        <p className="page-subtitle">
          Manage every public contact entry shown on the website, including
          showroom address, phone, email, hours, and the map link used on the
          Contact page.
        </p>
      </div>

      <form onSubmit={submit} className="card p-5 space-y-3 mb-6">
        <RowForm
          data={form}
          setData={setForm}
          isAddress={form.kind === "address"}
        />
        {form.kind === "address" && (
          <p className="text-xs text-ink-500">
            Leave the map link empty to auto-generate one from the address, or
            paste any Google Maps / map service URL you want the public page to
            use.
          </p>
        )}
        <div className="flex justify-end">
          <button className="btn-primary">
            <FiPlus /> Add entry
          </button>
        </div>
      </form>

      {err && <p className="text-accent text-sm mb-4">{err}</p>}

      <div className="card divide-y divide-zen-line">
        {items.length === 0 ? (
          <p className="p-6 text-center text-ink-500">No entries yet.</p>
        ) : (
          items.map((it) => {
            const Icon = iconFor(it.kind);
            return (
              <div key={it.id} className="p-4">
                {editId === it.id ? (
                  <div className="space-y-3">
                    <RowForm
                      data={editForm}
                      setData={setEditForm}
                      isAddress={editForm.kind === "address"}
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={saveEdit} className="btn-primary !px-3">
                        <FiCheck /> Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn-outline !px-3"
                      >
                        <FiX /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-ink-900 grid place-items-center text-accent flex-shrink-0">
                        <Icon />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold">
                          {it.label}
                        </p>
                        <p className="font-semibold text-ink-900 break-words">
                          {it.value}
                        </p>
                        {it.link && (
                          <a
                            href={it.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent inline-flex items-center gap-1 mt-1 hover:underline break-all"
                          >
                            <FiExternalLink /> {it.link}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-ink-500">
                        #{it.sort_order}
                      </span>
                      <button
                        onClick={() => startEdit(it)}
                        className="btn-outline !px-3"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => remove(it)}
                        className="btn-outline !px-3 hover:!border-accent hover:!text-accent"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
