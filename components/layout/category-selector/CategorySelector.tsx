"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CategoryWithCount } from "@/api/microCMS/works/types";

type CategorySelectorProps = {
  categories: CategoryWithCount[];
  totalCount: number;
};

export default function CategorySelector({ categories, totalCount }: CategorySelectorProps) {
  const pathname = usePathname();

  const isActive = (value: string) => pathname === `/works/categories/${value}`;

  const isAll = pathname === "/works";

  const baseClass = "px-4 py-2 text-sm tracking-wide text-left border-b border-white/30 transition-colors duration-200";
  const activeClass = "text-(--color-accent)";
  const inactiveClass = "text-white hover:text-(--color-accent)";

  return (
    <div className="flex flex-col md:mb-16 md:sticky top-20 self-start">
      <Link
        href="/works"
        className={`${baseClass} ${isAll ? activeClass : inactiveClass}`}
      >
        すべて（{totalCount}）
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.value}
          href={`/works/categories/${cat.value}`}
          className={`${baseClass} ${isActive(cat.value) ? activeClass : inactiveClass}`}
        >
          {cat.label}（{cat.totalCount}）
        </Link>
      ))}
    </div>
  );
}
