"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  children,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
}
