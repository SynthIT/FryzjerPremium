"use client";

import { useRef } from "react";
import ProductCard from "./ProductCard";
import { products } from "../data/products";

export default function Products() {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section id="products" className="mx-auto max-w-[1400px] px-6 py-24">
      <div className="mb-8 flex items-end justify-between">
        <div className="w-full">
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-400/50 to-transparent" />
            <p className="uppercase tracking-[0.35em] text-zinc-600 text-base md:text-lg lg:text-xl font-medium">Polecane</p>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-400/50 to-transparent" />
          </div>
          <h2 className="mt-3 text-center text-4xl font-semibold tracking-tight">Bestsellery</h2>
          <p className="mt-2 hidden text-center text-base text-zinc-600 md:block">Najczęściej wybierane przez naszych klientów</p>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl backdrop-blur md:p-8">
      {/* Mobile: poziomy slider */}
      <div className="relative md:hidden">
        <button
          aria-label="Poprzednie"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/20 bg-black/5 p-3 hover:bg-black/10"
        >
          ‹
        </button>
        <div
          ref={scroller}
          className="hide-scrollbar relative flex snap-x gap-6 overflow-x-auto py-2"
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <button
          aria-label="Następne"
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/20 bg-black/5 p-3 hover:bg-black/10"
        >
          ›
        </button>
      </div>

      {/* Desktop: czytelna siatka 3 kolumny */}
      <div className="hidden gap-6 md:grid md:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar { scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}


