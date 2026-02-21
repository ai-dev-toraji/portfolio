import Link from "next/link";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Service", href: "#service" },
  { label: "Works", href: "#works" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0048A0] py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-8">
        {/* Footer Nav */}
        <nav className="flex flex-wrap justify-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs text-[#E9EEF5]/60 tracking-widest hover:text-[#FDD72C] transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Site Name */}
        <p className="text-[#E9EEF5] text-xs tracking-[0.5em] uppercase">
          MORI CORDER
        </p>

        {/* Copyright */}
        <p className="text-[#E9EEF5]/30 text-[10px] tracking-widest">
          &copy; {new Date().getFullYear()} MORI CORDER. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
