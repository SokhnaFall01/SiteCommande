"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input readOnly value={url} className="input font-mono text-xs" />
      <button type="button" onClick={copy} className="btn-outline whitespace-nowrap">
        {copied ? "Copié ✓" : "Copier le lien"}
      </button>
    </div>
  );
}
