"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    const timeout = setTimeout(() => {
      el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-[#E9EEF5] flex flex-col items-center justify-center overflow-hidden">
      {/* Background accent line */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 w-px h-full bg-[#0048A0]/8 -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-[#0048A0]/8 -translate-y-1/2" />
      </div>

      <div className="relative z-10 text-center px-6">
        <p className="text-[#0048A0] text-xs tracking-[0.4em] mb-6 uppercase">Frontend Developer</p>

        <h1 ref={titleRef} className="text-4xl md:text-7xl font-black text-[#0048A0] tracking-tight leading-tight mb-6">
          MORI<br />
          <span className="text-[#FDD72C] text-stroke">CORDER</span>
        </h1>

        <p className="text-[#0048A0]/60 text-sm md:text-base tracking-widest mb-10">
          Web制作 / フロントエンド開発
        </p>

        <a
          href="#works"
          className="inline-flex items-center gap-3 text-sm tracking-widest text-[#0048A0] border border-[#0048A0] px-8 py-3 hover:bg-[#0048A0] hover:text-white transition-all duration-300 group"
        >
          WORKS を見る
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&#8594;</span>
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <p className="text-[#0048A0]/40 text-[10px] tracking-widest uppercase">Scroll</p>
        <div className="w-px h-12 bg-gradient-to-b from-[#0048A0]/40 to-transparent" />
      </div>
    </section>
  );
}
