"use client";

import Link from "next/link";
import CartButton from "./CartButton";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-40 w-full border-b border-black/10 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl">
          <Logo variant="nav" />
        </Link>
        <nav className="hidden gap-8 text-sm text-zinc-700 md:flex">
          <Link href="#images" className="hover:text-black">Zdjęcia</Link>
          <Link href="#products" className="hover:text-black">Produkty</Link>
          <Link href="#gallery" className="hover:text-black">Galeria</Link>
          <Link href="#blog" className="hover:text-black">Blog</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="#book"
            className="hidden rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 md:block"
          >
            Rezerwuj online
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}


