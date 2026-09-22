import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { config } from "./config";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type SaveResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

// Valide et enregistre une image uploadée dans public/uploads.
// Renvoie l'URL publique (/uploads/xxx.ext).
export async function saveUploadedImage(file: File): Promise<SaveResult> {
  if (!file || typeof file === "string") {
    return { ok: false, error: "Aucun fichier reçu." };
  }

  if (!config.uploads.allowedTypes.includes(file.type)) {
    return { ok: false, error: "Format non supporté (JPEG, PNG ou WebP)." };
  }

  const maxBytes = config.uploads.maxFileMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `Fichier trop volumineux (max ${config.uploads.maxFileMb} Mo).`,
    };
  }

  const ext = EXT_BY_TYPE[file.type] || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return { ok: true, url: `/uploads/${filename}` };
}
