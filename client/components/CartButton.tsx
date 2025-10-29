"use client";

import { useCart } from "./CartProvider";

export default function CartButton() {
  const { count, open } = useCart();
  return (
    <button
      onClick={open}
      className="relative rounded-full border border-black/20 bg-black/5 px-4 py-2 text-sm font-semibold text-black hover:bg-black/10"
    >
      Koszyk
      {count > 0 && (
        <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}


