"use client";

import { useCart } from "./CartProvider";
import type { Product } from "../data/products";

export default function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <button
      onClick={() => add(product, 1)}
      className="rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-zinc-900"
    >
      Dodaj do koszyka
    </button>
  );
}


