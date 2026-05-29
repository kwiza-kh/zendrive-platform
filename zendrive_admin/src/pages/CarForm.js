import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import CarImagesUpload from "../components/CarImagesUpload";

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const empty = {
  name: "", slug: "", brand_id: "", body_type: "Sedan",
  year: 2025, mileage_km: 0,
  price: 0, discount_price: "", description: "", image: "", images: "",
  is_featured: false, is_new: true, in_stock: true,
};

export default function CarForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(empty);
  const [brands, setBrands] = useState([]);
  const [bodyTypes, setBodyTypes] = useState([]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/api/brands").then((r) => setBrands(r.data));
    api.get("/api/body-types").then((r) => setBodyTypes(r.data));
    if (isEdit) {
      api.get("/api/cars", { params: { limit: 500 } }).then((r) => {
        const c = r.data.find((x) => String(x.id) === String(id));
        if (c) setForm({ ...empty, ...c, brand_id: c.brand_id || "", discount_price: c.discount_price ?? "" });
      });
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onName = (v) => { set("name", v); if (!isEdit) set("slug", slugify(v)); };

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setSaving(true);
    const payload = {
      ...form,
      year: Number(form.year), mileage_km: Number(form.mileage_km),
      price: Number(form.price),
      discount_price: form.discount_price === "" || form.discount_price === null ? null : Number(form.discount_price),
      brand_id: form.brand_id ? Number(form.brand_id) : null,
    };
    try {
      if (isEdit) await api.put(`/api/cars/${id}`, payload);
      else await api.post("/api/cars", payload);
      nav("/cars");
    } catch (e) { setErr(e?.response?.data?.detail || "Save failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-content max-w-4xl">
      <Link to="/cars" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-accent mb-5 transition-colors"><FiArrowLeft size={14} /> Back to Inventory</Link>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? "Edit Car" : "Add Car"}</h1>
        <p className="page-subtitle">Fill in vehicle details to publish it on Zendrive.</p>
      </div>

      <form onSubmit={submit} className="card p-6 lg:p-8 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="label">Name</label><input className="input" required value={form.name} onChange={(e) => onName(e.target.value)} /></div>
          <div><label className="label">Slug</label><input className="input" required value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Brand</label>
            <select className="input" value={form.brand_id} onChange={(e) => set("brand_id", e.target.value)}>
              <option value="">— None —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Body Type</label>
            <select className="input" value={form.body_type} onChange={(e) => set("body_type", e.target.value)}>
              {bodyTypes.length === 0
                ? ["Sedan","SUV","Coupe","Truck","Convertible","Wagon"].map((x) => <option key={x}>{x}</option>)
                : bodyTypes.map((x) => <option key={x.id} value={x.name}>{x.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="label">Year</label><input className="input" type="number" value={form.year} onChange={(e) => set("year", e.target.value)} /></div>
          <div><label className="label">Mileage (km)</label><input className="input" type="number" value={form.mileage_km} onChange={(e) => set("mileage_km", e.target.value)} /></div>
        </div>
        <CarImagesUpload
          cover={form.image}
          extras={form.images}
          onChange={({ cover, extras }) => setForm((f) => ({ ...f, image: cover, images: extras }))}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="label">Price (USD)</label><input className="input" type="number" required value={form.price} onChange={(e) => set("price", e.target.value)} /></div>
          <div><label className="label">Discount Price (optional)</label><input className="input" type="number" value={form.discount_price} onChange={(e) => set("discount_price", e.target.value)} /></div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[120px] resize-none" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-5 pt-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_new} onChange={(e) => set("is_new", e.target.checked)} /> New</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.in_stock} onChange={(e) => set("in_stock", e.target.checked)} /> In Stock</label>
        </div>

        {err && <p className="text-accent text-sm">{err}</p>}
        <div className="flex gap-3 pt-2 border-t border-zen-line">
          <button disabled={saving} className="btn-primary"><FiSave /> {saving ? "Saving…" : isEdit ? "Save changes" : "Create car"}</button>
          <Link to="/cars" className="btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
