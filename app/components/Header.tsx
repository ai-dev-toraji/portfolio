"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Service", href: "#service" },
  { label: "Works", href: "#works" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#E9EEF5] border-b border-[#0048A0]/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-[#0048A0] text-sm font-bold tracking-widest border border-[#0048A0] px-4 py-1.5 hover:bg-[#0048A0] hover:text-white transition-colors duration-200">
          LOGO
        </Link>

        {/* PC Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-[#0048A0] tracking-wider hover:text-[#FDD72C] transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#FDD72C] after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* SP Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 z-50"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニューを開く"
        >
          <span
            className={`block w-6 h-0.5 bg-[#0048A0] transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#0048A0] transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#0048A0] transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* SP Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-[#0048A0] flex flex-col items-center justify-center gap-10 transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className="text-2xl text-[#E9EEF5] tracking-widest hover:text-[#FDD72C] transition-colors duration-200"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
