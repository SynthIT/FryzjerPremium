"use client";

import { useCart } from "./CartProvider";

export default function CartDrawer() {
  const { isOpen, close, items, remove, setQty, total } = useCart();

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md transform bg-white p-6 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Twój koszyk</h3>
          <button onClick={close} className="text-zinc-500 hover:text-black">✕</button>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-2">
          {items.length === 0 && (
            <p className="text-zinc-600">Koszyk jest pusty.</p>
          )}
          {items.map((i) => (
            <div key={i.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg border border-black/10 bg-white p-4">
              <div>
                <p className="text-sm text-zinc-600">{i.brand}</p>
                <p className="text-sm font-medium text-black">{i.title}</p>
                <p className="mt-1 text-sm text-black">{i.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(i.id, i.quantity - 1)} className="h-7 w-7 rounded bg-black/5">-</button>
                <span className="w-8 text-center">{i.quantity}</span>
                <button onClick={() => setQty(i.id, i.quantity + 1)} className="h-7 w-7 rounded bg-black/5">+</button>
              </div>
              <button onClick={() => remove(i.id)} className="text-sm text-rose-600 hover:text-rose-500">Usuń</button>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-black/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Suma</span>
            <span className="text-lg font-semibold">{total.toFixed(2)} zł</span>
          </div>
          <button className="mt-4 w-full rounded-full bg-black py-3 font-semibold text-white hover:bg-zinc-800">
            Przejdź do kasy
          </button>
        </div>
      </aside>
    </div>
  );
}


