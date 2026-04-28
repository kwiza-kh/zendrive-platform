import React, { useEffect, useRef, useState } from "react";
import api, { resolveImage } from "../services/api";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiUpload, FiLoader } from "react-icons/fi";

function LogoUpload({ value, onChange, disabled }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = () => inputRef.current?.click();

  const handle = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErr("Max 5 MB."); return; }
    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/api/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Upload failed.");
    } finally { setBusy(false); }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg border border-zen-line bg-zen-bg overflow-hidden grid place-items-center flex-shrink-0">
        {value ? (
          <img src={resolveImage(value)} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] text-ink-500">No logo</span>
        )}
      </div>
      <input
        className="input flex-1"
        placeholder="Logo URL or upload →"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || busy}
      />
      <button
        type="button"
        onClick={pick}
        className="btn-outline !px-3 whitespace-nowrap"
        disabled={disabled || busy}
        title="Upload image"
      >
        {busy ? <FiLoader className="animate-spin" /> : <FiUpload />}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="btn-outline !px-3"
          disabled={disabled || busy}
          title="Clear logo"
        >
          <FiX />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handle}
      />
      {err && <p className="text-accent text-xs ml-2">{err}</p>}
    </div>
  );
}

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [err, setErr] = useState("");

  const load = () => api.get("/api/brands").then((r) => setBrands(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setErr("");
    if (!name.trim()) return;
    try {
      await api.post("/api/brands", { name: name.trim(), logo: logo.trim() || null });
      setName(""); setLogo(""); load();
    } catch (e) { setErr(e?.response?.data?.detail || "Add failed."); }
  };

  const startEdit = (b) => {
    setEditId(b.id); setEditName(b.name); setEditLogo(b.logo || ""); setErr("");
  };
  const cancelEdit = () => { setEditId(null); setEditName(""); setEditLogo(""); };

  const saveEdit = async () => {
    setErr("");
    try {
      await api.put(`/api/brands/${editId}`, { name: editName.trim(), logo: editLogo.trim() || null });
      cancelEdit(); load();
    } catch (e) { setErr(e?.response?.data?.detail || "Save failed."); }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete brand "${b.name}"? This cannot be undone.`)) return;
    setErr("");
    try {
      await api.delete(`/api/brands/${b.id}`);
      load();
    } catch (e) { setErr(e?.response?.data?.detail || "Delete failed."); }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-display text-4xl mb-1">Brands</h1>
      <p className="text-ink-500 mb-6">Manage the marques displayed on Zendrive.</p>

      <form onSubmit={add} className="card p-5 space-y-3 mb-6">
        <input className="input" placeholder="New brand name" value={name} onChange={(e) => setName(e.target.value)} />
        <LogoUpload value={logo} onChange={setLogo} />
        <div className="flex justify-end">
          <button className="btn-primary"><FiPlus /> Add brand</button>
        </div>
      </form>

      {err && <p className="text-accent text-sm mb-4">{err}</p>}

      <div className="card divide-y divide-zen-line">
        {brands.length === 0 ? (
          <p className="p-6 text-center text-ink-500">No brands yet.</p>
        ) : brands.map((b) => (
          <div key={b.id} className="p-4 flex items-center justify-between gap-3">
            {editId === b.id ? (
              <div className="flex-1 space-y-2">
                <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <LogoUpload value={editLogo} onChange={setEditLogo} />
                <div className="flex gap-2 justify-end pt-1">
                  <button onClick={saveEdit} className="btn-primary !px-3"><FiCheck /> Save</button>
                  <button onClick={cancelEdit} className="btn-outline !px-3"><FiX /> Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {b.logo ? (
                    <img src={resolveImage(b.logo)} alt={b.name} className="w-10 h-10 rounded-lg object-cover border border-zen-line" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-ink-900 grid place-items-center text-accent font-display font-bold">{b.name[0]}</div>
                  )}
                  <p className="font-semibold truncate">{b.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-500">#{b.id}</span>
                  <button onClick={() => startEdit(b)} className="btn-outline !px-3" title="Edit"><FiEdit2 /></button>
                  <button onClick={() => remove(b)} className="btn-outline !px-3 hover:!border-accent hover:!text-accent" title="Delete"><FiTrash2 /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
