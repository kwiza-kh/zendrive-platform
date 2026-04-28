import React, { useEffect, useState } from "react";
import api from "../services/api";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

export default function BodyTypes() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [err, setErr] = useState("");

  const load = () => api.get("/api/body-types").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setErr("");
    if (!name.trim()) return;
    try {
      await api.post("/api/body-types", { name: name.trim(), sort_order: items.length });
      setName(""); load();
    } catch (e) { setErr(e?.response?.data?.detail || "Add failed."); }
  };

  const startEdit = (b) => { setEditId(b.id); setEditName(b.name); setErr(""); };
  const cancelEdit = () => { setEditId(null); setEditName(""); };
  const saveEdit = async () => {
    setErr("");
    try {
      await api.put(`/api/body-types/${editId}`, { name: editName.trim() });
      cancelEdit(); load();
    } catch (e) { setErr(e?.response?.data?.detail || "Save failed."); }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete body type "${b.name}"? This cannot be undone.`)) return;
    setErr("");
    try {
      await api.delete(`/api/body-types/${b.id}`);
      load();
    } catch (e) { setErr(e?.response?.data?.detail || "Delete failed."); }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-display text-4xl mb-1">Body Types</h1>
      <p className="text-ink-500 mb-6">Manage the body categories used across the site (Sedan, SUV, Coupe…).</p>

      <form onSubmit={add} className="card p-5 grid sm:grid-cols-[1fr_auto] gap-3 mb-6">
        <input className="input" placeholder="New body type (e.g. Hatchback)" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary"><FiPlus /> Add</button>
      </form>

      {err && <p className="text-accent text-sm mb-4">{err}</p>}

      <div className="card divide-y divide-zen-line">
        {items.length === 0 ? (
          <p className="p-6 text-center text-ink-500">No body types yet.</p>
        ) : items.map((b) => (
          <div key={b.id} className="p-4 flex items-center justify-between gap-3">
            {editId === b.id ? (
              <>
                <input className="input flex-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="btn-primary !px-3" title="Save"><FiCheck /></button>
                  <button onClick={cancelEdit} className="btn-outline !px-3" title="Cancel"><FiX /></button>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold flex-1">{b.name}</p>
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
