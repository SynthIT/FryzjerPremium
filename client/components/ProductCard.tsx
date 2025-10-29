"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "./CartProvider";
import Link from "next/link";

export type Product = {
  id: string;
  title: string;
  brand: string;
  price: string;
  image: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const { add } = useCart();

  return (
    <Link href={`/product/${product.id}`} className="block" prefetch={false}>
    <div
      className="group relative w-72 shrink-0 snap-center overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-md backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-60 w-full overflow-hidden rounded-t-2xl">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 18rem, 18rem"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-wide text-zinc-600">{product.brand}</p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-black">{product.title}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-black">{product.price}</span>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(product, 1); }}
            className="rounded-full border border-black/10 bg-black px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-zinc-900 hover:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
          >
            Do koszyka
          </button>
        </div>
      </div>

      {/* subtle glow on hover */}
      <div
        className="absolute -inset-px -z-10 rounded-2xl opacity-0 ring-1 ring-black/10 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
    </div>
    </Link>
  );
}


