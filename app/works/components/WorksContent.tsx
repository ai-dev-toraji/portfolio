"use client";

import { useState } from "react";
import SectionTitle from "@/components/ui/section-title";
import WorksCard from "./WorksCard";

const categories = ["LP", "静的コーディング", "WordPress構築", "フロントエンド開発", "改修", "保守・運用"];

const works = [
  { id: 1, title: "ダミーサイト", tags: ["タグ", "タグ"], categories: ["LP", "静的コーディング"] },
  { id: 2, title: "ダミーサイト", tags: ["タグ", "タグ"], categories: ["LP"] },
  { id: 3, title: "ダミーサイト", tags: ["タグ", "タグ"], categories: ["静的コーディング","WordPress構築"] },
  { id: 4, title: "ダミーサイト", tags: ["タグ", "タグ"], categories: ["静的コーディング","WordPress構築","保守・運用"] },
  { id: 5, title: "ダミーサイト", tags: ["タグ", "タグ"], categories: ["フロントエンド開発"] },
  { id: 6, title: "ダミーサイト", tags: ["タグ", "タグ"], categories: ["改修"] },
  { id: 7, title: "ダミーサイト", tags: ["タグ", "タグ"], categories: ["保守・運用"] },
];


export default function WorksContent() {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredWorks =
    activeCategories.length > 0
      ? works.filter((work) => work.categories.some((c) => activeCategories.includes(c)))
      : works;

  return (
    <section className="bg-(--color-sub) py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        {/* Title */}
        <SectionTitle color="primary" as="h1">WORK</SectionTitle>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center mb-16 ">
          <button
            onClick={() => setActiveCategories([])}
            className={`px-4 py-2 text-sm tracking-wide border-l border-r border-(--color-primary)/30 transition-colors duration-200 ${
              activeCategories.length === 0
                ? "text-(--color-primary)"
                : "text-(--color-text) hover:text-(--color-primary) cursor-pointer"
            }`}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 text-sm tracking-wide border-r border-(--color-primary)/30 transition-colors duration-200 ${
                activeCategories.includes(cat)
                  ? "text-(--color-primary)"
                  : "text-(--color-text) hover:text-(--color-primary) cursor-pointer"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {filteredWorks.map((work) => (
            <WorksCard key={work.id} title={work.title} tags={work.tags} categories={work.categories} />
          ))}
        </div>
      </div>
    </section>
  );
}
