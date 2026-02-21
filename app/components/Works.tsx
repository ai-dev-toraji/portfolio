import Link from "next/link";
import Image from "next/image";

const works = [
  { id: 1, title: "Work 01", category: "Web Design" },
  { id: 2, title: "Work 02", category: "WordPress" },
  { id: 3, title: "Work 03", category: "Frontend" },
  { id: 4, title: "Work 04", category: "Web Design" },
  { id: 5, title: "Work 05", category: "Coding" },
  { id: 6, title: "Work 06", category: "Frontend" },
];

export default function Works() {
  return (
    <section id="works" className="bg-[#0048A0] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <h2 className="text-center text-[#FDD72C] text-4xl md:text-5xl font-black tracking-[0.3em] mb-16">
          WORKS
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {works.map((work) => (
            <div
              key={work.id}
              className="relative group overflow-hidden bg-[#C8C8C8] aspect-[4/3] cursor-pointer"
            >
              {/* Placeholder image area */}
              <div className="w-full h-full bg-[#C8C8C8] flex items-center justify-center">
                <span className="text-white/40 text-sm tracking-widest">{work.title}</span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[#0048A0]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                <p className="text-white text-lg font-bold tracking-widest">{work.title}</p>
                <p className="text-[#FDD72C] text-xs tracking-widest uppercase">{work.category}</p>
              </div>

              {/* Grid border accent */}
              <div className="absolute inset-0 border border-[#6B8FC4]/40 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/works"
            className="inline-flex items-center gap-4 text-sm tracking-[0.3em] text-[#0048A0] bg-[#E9EEF5] border border-[#E9EEF5] px-10 py-4 hover:bg-transparent hover:text-[#E9EEF5] transition-all duration-300 group"
          >
            一覧を見る
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">&#8594;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
