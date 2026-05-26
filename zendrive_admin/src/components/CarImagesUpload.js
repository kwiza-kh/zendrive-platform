import React, { useRef, useState } from "react";
import { resolveImage } from "../services/api";
import api from "../services/api";
import { FiUpload, FiX, FiStar, FiArrowLeft, FiArrowRight, FiLoader } from "react-icons/fi";

export default function CarImagesUpload({ cover, extras, onChange, disabled }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const list = [
    ...(cover ? [cover] : []),
    ...(extras ? extras.split(",").map((s) => s.trim()).filter(Boolean) : []),
  ];

  const commit = (next) => {
    const [c, ...rest] = next;
    onChange({ cover: c || "", extras: rest.join(",") });
  };

  const pick = () => inputRef.current?.click();

  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    setErr("");
    try {
      const uploaded = [];
      for (const f of files) {
        if (f.size > 10 * 1024 * 1024) {
          setErr(`${f.name}: max 10 MB.`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", f);
        const { data } = await api.post("/api/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded.push(data.url);
      }
      commit([...list, ...uploaded]);
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const removeAt = (i) => {
    const next = list.slice();
    next.splice(i, 1);
    commit(next);
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = list.slice();
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  const setCover = (i) => {
    if (i === 0) return;
    const next = list.slice();
    const [picked] = next.splice(i, 1);
    next.unshift(picked);
    commit(next);
  };

  return (
    <div>
      <label className="label">
        Photos{" "}
        {list.length > 0 && (
          <span className="text-ink-500 font-normal">
            · {list.length} image{list.length !== 1 ? "s" : ""} (first is the cover)
          </span>
        )}
      </label>

      <div
        className="border-2 border-dashed border-zen-line rounded-2xl p-4 bg-zen-bg/30"
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          if (!e.dataTransfer.files?.length) return;
          inputRef.current.files = e.dataTransfer.files;
          upload({ target: inputRef.current });
        }}
      >
        {list.length === 0 ? (
          <div className="py-8 text-center text-sm text-ink-500">
            Drop images here, paste a URL below, or click upload.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {list.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className={`relative group rounded-2xl overflow-hidden border ${
                  i === 0 ? "border-accent ring-2 ring-accent/30" : "border-zen-line"
                } bg-white`}
              >
                <img src={resolveImage(url)} alt="" className="w-full aspect-[4/3] object-cover" />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 text-[10px] font-bold uppercase tracking-wider bg-accent text-white px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center gap-1 p-1.5">
                  <button
                    type="button"
                    disabled={disabled || i === 0}
                    onClick={() => move(i, -1)}
                    className="w-7 h-7 rounded bg-white/90 grid place-items-center disabled:opacity-30 hover:bg-white"
                    title="Move left"
                  >
                    <FiArrowLeft size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || i === list.length - 1}
                    onClick={() => move(i, 1)}
                    className="w-7 h-7 rounded bg-white/90 grid place-items-center disabled:opacity-30 hover:bg-white"
                    title="Move right"
                  >
                    <FiArrowRight size={13} />
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setCover(i)}
                      className="w-7 h-7 rounded bg-white/90 grid place-items-center hover:bg-white"
                      title="Set as cover"
                    >
                      <FiStar size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeAt(i)}
                    className="w-7 h-7 rounded bg-accent text-white grid place-items-center hover:opacity-90"
                    title="Remove"
                  >
                    <FiX size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button
            type="button"
            onClick={pick}
            className="btn-outline"
            disabled={disabled || busy}
          >
            {busy ? <><FiLoader className="animate-spin" /> Uploading...</> : <><FiUpload /> Upload images</>}
          </button>
          <UrlAdder disabled={disabled || busy} onAdd={(u) => commit([...list, u])} />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={upload}
        />

        {err && <p className="text-accent text-xs mt-2">{err}</p>}
      </div>
    </div>
  );
}

function UrlAdder({ onAdd, disabled }) {
  const [v, setV] = useState("");
  const submit = () => {
    const u = v.trim();
    if (!u) return;
    onAdd(u);
    setV("");
  };

  return (
    <div className="flex items-center gap-2 flex-1 min-w-[220px]">
      <input
        className="input !py-2 text-sm"
        placeholder="...or paste image URL and press Enter"
        value={v}
        disabled={disabled}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
      />
      <button type="button" onClick={submit} disabled={disabled || !v.trim()} className="btn-outline !py-2 text-sm">Add</button>
    </div>
  );
}
