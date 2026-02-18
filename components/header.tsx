"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/carpe-diem", label: "Carpe Diem" },
  { href: "/life-compass-calibration", label: "Life Compass" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-light-purple/30 bg-brand-off-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-brand-purple">
          Sunday4K
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-brand-purple"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="rounded-lg border border-brand-purple px-4 py-2 text-sm font-medium text-brand-purple transition-colors hover:bg-brand-purple hover:text-white"
          >
            Sign In
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-700 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20"
          onClick={() => setMobileOpen(false)}
        >
          <nav
            className="absolute right-0 top-0 flex h-full w-72 flex-col bg-brand-off-white p-6 shadow-xl transition-transform duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="mb-8 self-end text-gray-700"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center border-b border-gray-100 text-base font-medium text-gray-700 transition-colors hover:text-brand-purple"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="mt-8 rounded-lg bg-brand-purple px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-brand-purple/90"
            >
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
