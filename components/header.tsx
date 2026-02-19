"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

const carpeDiemLinks = [
  { href: "/carpe-diem", label: "Carpe Diem" },
  { href: "/resource-collection", label: "Resource Collection" },
  { href: "/life-compass-calibration", label: "Life Compass" },
];

const aboutLinks = [
  { href: "/about", label: "About Sunday4K" },
  { href: "/blog", label: "Blog" },
];

function Dropdown({
  label,
  links,
}: {
  label: string;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-navy"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-brand-off-white hover:text-brand-navy"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [carpeDiemOpen, setCarpeDiemOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-cream/20 bg-brand-off-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-brand-navy">
          Sunday4K
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Dropdown label="Carpe Diem" links={carpeDiemLinks} />
          <Dropdown label="About" links={aboutLinks} />
          <Link
            href="/auth/login"
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            Login
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
            className="absolute right-0 top-0 flex h-full w-72 flex-col bg-brand-off-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="mb-8 self-end text-gray-700"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Carpe Diem accordion */}
            <button
              onClick={() => setCarpeDiemOpen(!carpeDiemOpen)}
              className="flex min-h-[44px] items-center justify-between border-b border-gray-100 text-base font-medium text-gray-700"
            >
              Carpe Diem
              <ChevronDown
                className={`h-4 w-4 transition-transform ${carpeDiemOpen ? "rotate-180" : ""}`}
              />
            </button>
            {carpeDiemOpen &&
              carpeDiemLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[40px] items-center pl-4 text-sm text-gray-500 hover:text-brand-navy"
                >
                  {link.label}
                </Link>
              ))}

            {/* About accordion */}
            <button
              onClick={() => setAboutOpen(!aboutOpen)}
              className="flex min-h-[44px] items-center justify-between border-b border-gray-100 text-base font-medium text-gray-700"
            >
              About
              <ChevronDown
                className={`h-4 w-4 transition-transform ${aboutOpen ? "rotate-180" : ""}`}
              />
            </button>
            {aboutOpen &&
              aboutLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[40px] items-center pl-4 text-sm text-gray-500 hover:text-brand-navy"
                >
                  {link.label}
                </Link>
              ))}

            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="mt-8 rounded-full border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
