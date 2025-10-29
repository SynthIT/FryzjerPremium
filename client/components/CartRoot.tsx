"use client";

import { CartProvider } from "./CartProvider";
import CartDrawer from "./CartDrawer";

export default function CartRoot({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}


