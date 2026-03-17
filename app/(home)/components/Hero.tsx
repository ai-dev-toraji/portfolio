"use client";


import { useEffect, useState } from "react";
import Image from "next/image";

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-(--color-sub) flex flex-col items-center justify-center overflow-hidden">
      {/* Background accent line */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 w-px h-full bg-(--color-primary)/8 -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-(--color-primary)/8 -translate-y-1/2" />
      </div>

      <div className="relative z-10 text-center px-6">
        <p className="text-(--color-primary)/60 text-xs tracking-[0.4em] mb-6 uppercase">Frontend Developer</p>

        <h1 className={`transition-all duration-700 ease-out text-4xl md:text-7xl font-black text-(--color-primary) tracking-tight leading-tight mb-6 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <Image src="/logo.svg" alt="NEXTORA" width={400} height={74} />
        </h1>

        <p className="text-(--color-accent) text-sm font-bold md:text-base tracking-widest">
          Webサイト制作 / フロントエンド開発
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <p className="text-(--color-primary)/40 text-[10px] tracking-widest uppercase">Scroll</p>
        <div className="w-px h-12 bg-gradient-to-b from-(--color-primary)/40 to-transparent" />
      </div>
    </section>
  );
}
