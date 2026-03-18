import Link from "next/link";
import Image from "next/image";

const navItems = [
  { label: "About", href: "/about" },
  { label: "Service", href: "/service" },
  { label: "Works", href: "/works" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-(--color-primary) py-12 border-t border-(--color-sub)">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-8">
        {/* Footer Nav */}
        <nav className="flex flex-wrap justify-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs text-white tracking-widest hover:text-(--color-accent) transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/">
          <Image src="/logo-white.svg" alt="NEXTORA" width={200} height={50} />
        </Link>
        <p className="text-white text-[10px] tracking-widest">
          &copy; {new Date().getFullYear()} NEXTORA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
