import React, { useEffect, useRef, useState } from "react";
import { resolveImage, bannersApi, uploadImage } from "../services/api";
import { FiPlus, FiTrash2, FiAlertCircle, FiImage, FiEdit2, FiCheck, FiX } from "react-icons/fi";

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

const EMPTY = { title: "", subtitle: "", image: "", link: "", is_active: true, sort_order: 0 };

function ImageUploadArea({ src, uploading, onClick }) {
  return (
    <div
      className="relative border-2 border-dashed border-zen-line rounded-xl overflow-hidden cursor-pointer hover:border-accent/50 transition-colors bg-zen-bg w-full"
      style={{ aspectRatio: "420 / 170" }}
      onClick={onClick}
    >
      {src ? (
        <img src={resolveImage(src)} alt="preview" className="absolute inset-0 w-full h-full object-contain" />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-ink-400 gap-2">
          <FiImage size={28} />
          <span className="text-sm">{uploading ? "Uploading…" : "Click to upload image"}</span>
          <span className="text-xs text-ink-300">Recommended: 420 × 170</span>
        </div>
      )}
      {uploading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
          <span className="text-sm text-ink-600">Uploading…</span>
        </div>
      )}
    </div>
  );
}

export default function Banners() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editUploading, setEditUploading] = useState(false);
  const fileRef = useRef();
  const editFileRef = useRef();

  const load = () =>
    bannersApi.listAll().then((r) => setItems(r.data)).catch(() => setErr("Failed to load banners."));

  useEffect(() => { load(); }, []);

  const handleUpload = async (file, setUploadingFlag, onSuccess) => {
    setUploadingFlag(true);
    try {
      const r = await uploadImage(file);
      onSuccess(r.data.url);
    } catch {
      setErr("Image upload failed.");
    } finally {
      setUploadingFlag(false);
    }
  };

  const create = async () => {
    if (!form.image) { setErr("Please upload an image first."); return; }
    setSaving(true); setErr("");
    try {
      await bannersApi.create(form);
      setForm(EMPTY);
      setAdding(false);
      load();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to create banner.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    setErr("");
    try {
      await bannersApi.remove(id);
      setItems((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      setErr(e?.response?.data?.detail || "Delete failed.");
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setEditForm({
      title: item.title || "",
      subtitle: item.subtitle || "",
      image: item.image,
      link: item.link || "",
      is_active: item.is_active,
      sort_order: item.sort_order,
    });
    setErr("");
  };

  const saveEdit = async (id) => {
    setSaving(true); setErr("");
    try {
      const r = await bannersApi.update(id, editForm);
      setItems((prev) => prev.map((b) => (b.id === id ? r.data : b)));
      setEditId(null);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Homepage Banners</h1>
          <p className="page-subtitle">
            Images scroll automatically on the homepage. Active banners show in order.
          </p>
        </div>
        <button
          onClick={() => { setAdding(true); setErr(""); setForm(EMPTY); }}
          className="btn-primary"
        >
          <FiPlus size={15} /> Add Banner
        </button>
      </div>

      {err && (
        <div className="mb-5 flex items-center gap-2 text-sm text-accent bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <FiAlertCircle size={15} className="flex-shrink-0" /> {err}
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="card p-6 mb-6 ring-1 ring-accent/20">
          <h2 className="font-semibold text-ink-900 mb-4">New Banner</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Banner Image *</label>
              <ImageUploadArea
                src={form.image}
                uploading={uploading}
                onClick={() => fileRef.current?.click()}
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, setUploading, (url) => setForm((f) => ({ ...f, image: url })));
                  e.target.value = "";
                }}
              />
            </div>
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                placeholder="e.g. Premium Luxury Fleet"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Subtitle</label>
              <input
                className="input"
                placeholder="Short description line"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Link (optional)</label>
              <input
                className="input"
                placeholder="https://..."
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input
                className="input"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="label mb-0">Active</label>
              <Toggle checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-zen-line">
            <button onClick={create} disabled={saving || uploading} className="btn-primary">
              {saving ? "Saving…" : "Add Banner"}
            </button>
            <button
              onClick={() => { setAdding(false); setForm(EMPTY); setErr(""); }}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {items.length === 0 && !adding && (
          <div className="card p-12 text-center text-ink-400">
            <FiImage size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No banners yet. Click "Add Banner" to get started.</p>
          </div>
        )}

        {items.map((item, index) => {
          const isEditing = editId === item.id;
          return (
            <div
              key={item.id}
              className={`card overflow-hidden page-enter transition-opacity ${item.is_active ? "" : "opacity-55"}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isEditing ? (
                <div className="p-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="label">Banner Image</label>
                      <ImageUploadArea
                        src={editForm.image}
                        uploading={editUploading}
                        onClick={() => editFileRef.current?.click()}
                      />
                      <input
                        ref={editFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(file, setEditUploading, (url) => setEditForm((f) => ({ ...f, image: url })));
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <div>
                      <label className="label">Title</label>
                      <input
                        className="input"
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="label">Subtitle</label>
                      <input
                        className="input"
                        value={editForm.subtitle}
                        onChange={(e) => setEditForm((f) => ({ ...f, subtitle: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="label">Link</label>
                      <input
                        className="input"
                        value={editForm.link}
                        onChange={(e) => setEditForm((f) => ({ ...f, link: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="label">Sort Order</label>
                      <input
                        className="input"
                        type="number"
                        value={editForm.sort_order}
                        onChange={(e) => setEditForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="label mb-0">Active</label>
                      <Toggle
                        checked={editForm.is_active}
                        onChange={(v) => setEditForm((f) => ({ ...f, is_active: v }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-zen-line">
                    <button
                      onClick={() => saveEdit(item.id)}
                      disabled={saving || editUploading}
                      className="btn-primary !py-2 !text-sm"
                    >
                      <FiCheck size={14} /> {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button
                      onClick={() => { setEditId(null); setErr(""); }}
                      className="btn-outline !py-2 !text-sm"
                    >
                      <FiX size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div
                    className="relative rounded-lg overflow-hidden flex-shrink-0 bg-zen-bg border border-zen-line"
                    style={{ width: 168, aspectRatio: "420 / 170" }}
                  >
                    <img
                      src={resolveImage(item.image)}
                      alt={item.title || "banner"}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 truncate">
                      {item.title || <span className="text-ink-400 font-normal italic">No title</span>}
                    </p>
                    {item.subtitle && (
                      <p className="text-sm text-ink-500 truncate mt-0.5">{item.subtitle}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-ink-400">Order: {item.sort_order}</span>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline truncate max-w-[160px]"
                        >
                          {item.link}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="btn-outline !px-3 !py-2"
                      title="Edit"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="btn-outline !px-3 !py-2 !text-accent !border-accent/30 hover:!bg-red-50"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
