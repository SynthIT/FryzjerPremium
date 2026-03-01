"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { CartItem } from "@/lib/types/cartTypes";

export default function CartPage() {
    const {
        getCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        refreshCart,
    } = useCart();
    const { user } = useUser();
    const [items, setItems] = useState<CartItem[]>([]);
    useEffect(() => {
        async function validate() {
            await fetch("/api/v1/users/cart", {
                method: "POST",
                body: JSON.stringify({ userId: user, koszyk: getCart() }),
            })
                .then((res) => res.json())
                .then((validation) => {
                    if (validation.status === 0) {
                        if (validation.changedEntries) {
                            validation.changedEntries.forEach(
                                (entry: { reason: string; item: CartItem }) => {
                                    console.log(entry.reason);
                                },
                            );
                        }
                        refreshCart(validation.koszyk);
                        setItems(validation.koszyk.items);
                    } else {
                        setItems(getCart().items);
                    }
                })
                .catch(() => setItems(getCart().items));
        }
        validate();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run only on mount
    }, []);
    const handleQuantityChange = useCallback(
        (itemId: string, delta: number) => {
            const item = items.find((item) => item.id === itemId);
            if (item) {
                const newQuantity = Math.max(1, item.quantity + delta);
                updateQuantity(itemId, newQuantity);
            }
        },
        [items, updateQuantity],
    );

    const handleRemove = useCallback(
        (itemId: string) => {
            removeFromCart(itemId);
        },
        [removeFromCart],
    );

    const subtotal = getTotalPrice();

    const formattedSubtotal = subtotal.toFixed(2).replace(".", ",");

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6">
                        <Link href="/" className="text-[#D2B79B] hover:underline">Strona główna</Link>
                        <span>&gt;</span>
                        <span className="text-gray-900">Koszyk</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="text-[#D2B79B] mb-4">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                width="80"
                                height="80">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Twój koszyk jest pusty
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-md">
                            Dodaj produkty do koszyka, aby kontynuować zakupy.
                        </p>
                        <Link href="/products" className="inline-block px-8 py-3 rounded-xl font-semibold text-black bg-[#D2B79B] hover:bg-[#b89a7f] transition-colors">
                            Przejdź do sklepu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="text-[#D2B79B] hover:underline">Strona główna</Link>
                    <span>&gt;</span>
                    <span className="text-gray-900">Koszyk</span>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Twój koszyk</h1>
                        <div className="space-y-4">
                            {items.map((item) => {
                                const productPrice = item.price;
                                const itemTotal = (productPrice * item.quantity)
                                    .toFixed(2)
                                    .replace(".", ",");

                                return (
                                    <div key={item.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60">
                                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            <Link
                                                href={`/${item.type}/${item.object.slug}`}>
                                                {item.object.media && item.object.media.length > 0 ? (
                                                    <Image
                                                        src={
                                                            item.object
                                                                .media[0]?.path
                                                        }
                                                        alt={
                                                            item.object
                                                                .media[0]?.alt
                                                        }
                                                        width={124}
                                                        height={124}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 p-2">
                                                        <span>
                                                            {item.object.nazwa}
                                                        </span>
                                                    </div>
                                                )}
                                            </Link>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/${item.type}/${item.object.slug}`}
                                                className="font-medium text-gray-900 hover:text-[#D2B79B] line-clamp-2">
                                                {item.object.nazwa}
                                            </Link>
                                            {item.wariant && (
                                                <p className="text-sm text-gray-500">{item.wariant.typ}: {item.wariant.nazwa}</p>
                                            )}
                                            <p className="font-semibold text-[#D2B79B]">{itemTotal} zł</p>
                                        </div>

                                        <button
                                            type="button"
                                            className="p-2 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                                            onClick={() =>
                                                handleRemove(item.id)
                                            }
                                            aria-label="Usuń produkt">
                                            <svg
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                width="18"
                                                height="18">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            -1,
                                                        )
                                                    }
                                                    aria-label="Zmniejsz ilość">
                                                    −
                                                </button>
                                                <span className="min-w-[2rem] text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            1,
                                                        )
                                                    }
                                                    aria-label="Zwiększ ilość">
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="lg:w-80 shrink-0">
                        <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Podsumowanie zamówienia</h2>
                            <div className="flex justify-between py-2 text-sm">
                                <span className="text-gray-600">Suma częściowa</span>
                                <span className="font-medium">{formattedSubtotal} zł</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-gray-600">Koszt dostawy*
                                    </span>
                                    <span className="text-xs text-gray-500 block">
                                        <sub>
                                            * - koszt dostawy zostanie
                                            przeliczony w następnym etapie
                                        </sub>
                                    </span>
                                </div>
                                <span className="font-medium">0,00 zł</span>
                            </div>
                            <div className="border-t border-gray-200 my-4 pt-4 flex justify-between font-bold">
                                <span>Razem</span>
                                <span>{formattedSubtotal} zł</span>
                            </div>
                            <Link href="/kasa" className="block w-full py-3 text-center rounded-xl font-semibold bg-[#D2B79B] text-black hover:bg-[#b89a7f] transition-colors mb-3">
                                Przejdź do kasy
                            </Link>
                            <Link href="/products" className="block w-full py-2 text-center text-sm text-[#D2B79B] hover:underline">
                                Kontynuuj zakupy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
