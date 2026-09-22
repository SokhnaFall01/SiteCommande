"use client";

import { useState } from "react";

// Sélecteur de note en étoiles (produit un champ caché name="rating").
export function StarPicker({ defaultValue = 5 }: { defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Note">
      <input type="hidden" name="rating" value={value} />
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl leading-none"
            style={{ color: active ? "#f59e0b" : "#d1d5db" }}
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
