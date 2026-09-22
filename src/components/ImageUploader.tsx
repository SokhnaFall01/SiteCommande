"use client";

import { useRef, useState } from "react";

type Props = {
  name: string; // nom du champ caché (URLs séparées par des retours à la ligne)
  max?: number; // nombre maximum d'images
  initial?: string[];
  maxDim?: number; // dimension max (px) après redimensionnement
  aspect?: "square" | "banner";
};

// Redimensionne et compresse une image côté client avant l'upload.
async function resizeImage(file: File, maxDim: number): Promise<Blob> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || file),
      "image/jpeg",
      0.82
    );
  });
}

export function ImageUploader({
  name,
  max = 3,
  initial = [],
  maxDim = 1280,
  aspect = "square",
}: Props) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = max - urls.length;

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;
    setError(null);

    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      setError(`Vous pouvez ajouter ${max} photo(s) au maximum.`);
    }

    setBusy(true);
    const added: string[] = [];
    for (const file of toUpload) {
      try {
        if (!file.type.startsWith("image/")) {
          setError("Seules les images sont acceptées.");
          continue;
        }
        const blob = await resizeImage(file, maxDim);
        const fd = new FormData();
        fd.append("file", blob, "photo.jpg");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Échec de l'upload.");
          continue;
        }
        added.push(data.url);
      } catch {
        setError("Échec de l'upload d'une image.");
      }
    }
    setUrls((prev) => [...prev, ...added].slice(0, max));
    setBusy(false);
  }

  function removeAt(i: number) {
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  const previewCls =
    aspect === "banner"
      ? "h-24 w-full object-cover"
      : "h-24 w-24 object-cover";

  return (
    <div>
      <input type="hidden" name={name} value={urls.join("\n")} />

      <div className="flex flex-wrap gap-3">
        {urls.map((src, i) => (
          <div key={i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className={`rounded-lg border border-gray-200 ${previewCls}`}
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white shadow"
              aria-label="Supprimer"
            >
              ✕
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-400 hover:text-brand-500 disabled:opacity-60"
          >
            {busy ? (
              <span className="text-xs">Envoi…</span>
            ) : (
              <>
                <span className="text-2xl leading-none">+</span>
                <span className="mt-1 text-xs">Ajouter</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={max > 1}
        onChange={onSelect}
        className="hidden"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-gray-500">
        {max > 1 ? `Jusqu'à ${max} photos.` : "Une image."} Les images sont
        automatiquement redimensionnées.
      </p>
    </div>
  );
}
