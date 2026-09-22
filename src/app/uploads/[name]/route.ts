import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Sert les images uploadées en les lisant sur le disque.
// Nécessaire car Next.js ne sert pas de façon fiable les fichiers ajoutés à
// /public après le build (ex. sur un volume Docker monté).
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { name: string } }
) {
  const name = params.name;

  // Sécurité : nom de fichier simple uniquement (pas de traversée de dossier)
  if (!name || name.includes("..") || !/^[A-Za-z0-9._-]+$/.test(name)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = name.split(".").pop()?.toLowerCase() || "";
  const type = CONTENT_TYPES[ext];
  if (!type) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
