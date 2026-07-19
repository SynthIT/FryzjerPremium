"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { CartItem } from "@/lib/types/cartTypes";
import CartValidationMessages, {
    type CartChangeEntry,
} from "@/components/cart/CartValidationMessages";
import { X } from "lucide-react";
import { finalPrice } from "@/lib/utils";
import {
    saveCartCheckoutSelection,
    selectionTotal,
    splitCartItems,
} from "@/lib/cart/checkoutSelection";

function CartLine({
    item,
    checked,
    onToggle,
    onRemove,
    onQuantityChange,
}: {
    item: CartItem;
    checked: boolean;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
    onQuantityChange: (id: string, qty: number) => void;
}) {
    const itemTotal = (item.price * item.quantity).toFixed(2).replace(".", ",");
    const href =
        item.type === "kursy"
            ? `/kursy/${item.object.slug}`
            : `/produkt/${item.object.slug}`;

    return (
        <div
            className={`flex flex-wrap items-center gap-3 sm:gap-4 p-4 rounded-xl border bg-white/60 transition-colors ${
                checked
                    ? "border-[rgba(212,196,176,0.45)]"
                    : "border-gray-200 opacity-70"
            }`}>
            <label className="flex items-center shrink-0 cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(item.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]"
                    aria-label={`Zaznacz: ${item.object.nazwa}`}
                />
            </label>

            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Link href={href}>
                    {item.object.media && item.object.media.length > 0 ? (
                        <Image
                            src={item.object.media[0]?.path}
                            alt={item.object.media[0]?.alt || item.object.nazwa}
                            width={124}
                            height={124}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 p-2 text-center">
                            {item.object.nazwa}
                        </div>
                    )}
                </Link>
            </div>

            <div className="flex-1 min-w-0">
                <Link
                    href={href}
                    className="font-medium text-gray-900 hover:text-[#D2B79B] line-clamp-2">
                    {item.object.nazwa}
                </Link>
                {item.wariant && (
                    <p className="text-sm text-gray-500">
                        {item.wariant.typ}: {item.wariant.nazwa}
                    </p>
                )}
                <p className="text-sm text-gray-500">
                    Cena:{" "}
                    {finalPrice(
                        item.object.cena,
                        item.object.vat,
                        item.wariant,
                        item.object.promocje,
                    )}{" "}
                    zł
                </p>
                {item.type === "kursy" && (
                    <p className="text-xs text-[#8a735c] mt-0.5">
                        Bez wysyłki — dostęp online / bilet
                    </p>
                )}
            </div>

            <div className="flex flex-row gap-2">
                <p className="font-semibold text-[#D2B79B]">{itemTotal} zł</p>
            </div>

            <button
                type="button"
                className="p-2 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                onClick={() => onRemove(item.id)}
                aria-label="Usuń z koszyka">
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

            {item.type === "produkt" ? (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        onClick={() =>
                            onQuantityChange(item.id, item.quantity - 1)
                        }
                        aria-label="Zmniejsz ilość">
                        −
                    </button>
                    <input
                        className="border border-gray-300 rounded-lg p-1 max-w-[48px] text-center font-medium"
                        type="number"
                        max={100}
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                            onQuantityChange(
                                item.id,
                                parseInt(e.target.value, 10) || 1,
                            )
                        }
                    />
                    <button
                        type="button"
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        onClick={() =>
                            onQuantityChange(item.id, item.quantity + 1)
                        }
                        aria-label="Zwiększ ilość">
                        +
                    </button>
                </div>
            ) : (
                <span className="text-sm text-gray-500 w-[7.5rem] text-center">
                    ×{item.quantity}
                </span>
            )}
        </div>
    );
}

export default function CartPage() {
    const {
        getCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
    } = useCart();
    const { user, setUserAsEmail } = useUser();
    const [items, setItems] = useState<CartItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [cartMessages, setCartMessages] = useState<CartChangeEntry[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editModalData, setEditModalData] = useState({
        email: "",
        id: getCart().id,
    });

    useEffect(() => {
        async function validate() {
            if (!user) {
                const local = getCart().items;
                setItems(local);
                setSelectedIds(new Set(local.map((i) => i.id)));
                return;
            }
            try {
                const res = await fetch("/api/v1/users/cart", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user, koszyk: getCart() }),
                });
                const validation = await res.json();
                if (validation.status === 0) {
                    const entries = Array.isArray(validation.changedEntries)
                        ? (validation.changedEntries as CartChangeEntry[])
                        : [];
                    setCartMessages(entries);
                    refreshCart(validation.koszyk);
                    const nextItems: CartItem[] =
                        validation.koszyk.items ?? [];
                    setItems(nextItems);
                    setSelectedIds((prev) => {
                        const next = new Set(
                            nextItems
                                .map((i) => i.id)
                                .filter((id) => prev.size === 0 || prev.has(id)),
                        );
                        if (next.size === 0) {
                            nextItems.forEach((i) => next.add(i.id));
                        }
                        return next;
                    });
                } else {
                    setCartMessages([]);
                    const local = getCart().items;
                    setItems(local);
                    setSelectedIds(new Set(local.map((i) => i.id)));
                }
            } catch {
                setCartMessages([]);
                const local = getCart().items;
                setItems(local);
                setSelectedIds(new Set(local.map((i) => i.id)));
            }
        }
        validate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const { products, courses } = useMemo(
        () => splitCartItems(items),
        [items],
    );

    const handleRemove = useCallback(
        (itemId: string) => {
            removeFromCart(itemId);
            setItems((prev) => prev.filter((item) => item.id !== itemId));
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        },
        [removeFromCart],
    );

    const handleQuantityChange = useCallback(
        (itemId: string, delta: number) => {
            if (delta < 1) return handleRemove(itemId);
            const item = items.find((i) => i.id === itemId);
            if (!item) return;
            const newQuantity = Math.max(1, delta);
            updateQuantity(itemId, newQuantity);
            setItems((prev) =>
                prev.map((i) =>
                    i.id === itemId ? { ...i, quantity: newQuantity } : i,
                ),
            );
        },
        [items, updateQuantity, handleRemove],
    );

    const toggleItem = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSection = useCallback((sectionItems: CartItem[], on: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const item of sectionItems) {
                if (on) next.add(item.id);
                else next.delete(item.id);
            }
            return next;
        });
    }, []);

    const selectedSubtotal = selectionTotal(items, selectedIds);
    const formattedSubtotal = selectedSubtotal.toFixed(2).replace(".", ",");
    const selectedCount = selectedIds.size;
    const hasProductsSelected = products.some((p) => selectedIds.has(p.id));
    const hasCoursesSelected = courses.some((c) => selectedIds.has(c.id));

    const goToCheckout = useCallback(() => {
        if (selectedCount === 0) {
            alert("Zaznacz przynajmniej jedną pozycję do zamówienia");
            return;
        }
        saveCartCheckoutSelection(Array.from(selectedIds));
        window.location.href = "/kasa";
    }, [selectedCount, selectedIds]);

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6">
                        <Link href="/" className="text-[#D2B79B] hover:underline">
                            Strona główna
                        </Link>
                        <span>&gt;</span>
                        <span className="text-gray-900">Koszyk</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <CartValidationMessages
                            messages={cartMessages}
                            onDismiss={() => setCartMessages([])}
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Twój koszyk jest pusty
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-md">
                            Dodaj produkty lub kursy, aby kontynuować.
                        </p>
                        <Link
                            href="/produkty"
                            className="inline-block px-8 py-3 rounded-xl font-semibold text-black bg-[#D2B79B] hover:bg-[#b89a7f] transition-colors">
                            Przejdź do sklepu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
            {showEditModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
                    <div className="bg-white p-4 rounded-lg w-full max-w-md flex flex-col gap-4">
                        <div className="flex items-center justify-between w-full">
                            <h2 className="text-lg font-bold text-gray-900">
                                Edytuj adres email
                            </h2>
                            <button
                                type="button"
                                className="text-sm text-gray-500"
                                onClick={() => setShowEditModal(false)}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <input
                            type="email"
                            value={editModalData.email}
                            onChange={(e) =>
                                setEditModalData((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                            className="w-full p-2 rounded-lg border border-gray-300 text-gray-900"
                        />
                        <button
                            type="button"
                            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                            onClick={() => {
                                fetch("/api/v1/payments/edit?scope=email", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        email: editModalData.email,
                                        id: editModalData.id,
                                    }),
                                })
                                    .then((res) => res.json())
                                    .then((data) => {
                                        if (data.status === 0) {
                                            setShowEditModal(false);
                                            setUserAsEmail(editModalData.email);
                                        } else {
                                            alert(data.error);
                                        }
                                    });
                            }}>
                            Zapisz
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-[1200px] mx-auto">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="text-[#D2B79B] hover:underline">
                        Strona główna
                    </Link>
                    <span>&gt;</span>
                    <span className="text-gray-900">Koszyk</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 min-w-0 space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Twój koszyk
                            </h1>
                            {user?.includes("@") && (
                                <div className="mb-4 flex items-center gap-2">
                                    <p className="text-gray-600 text-sm">
                                        Zakupy na adres email: {user}
                                    </p>
                                    <button
                                        type="button"
                                        className="text-sm text-blue-500 hover:underline"
                                        onClick={() => setShowEditModal(true)}>
                                        Edytuj...
                                    </button>
                                </div>
                            )}
                            <CartValidationMessages
                                messages={cartMessages}
                                onDismiss={() => setCartMessages([])}
                            />
                            <p className="text-sm text-gray-500">
                                Zaznacz pozycje, które chcesz zamówić. Kursy nie
                                wymagają dostawy — możesz rozliczyć je osobno od
                                produktów.
                            </p>
                        </div>

                        {products.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Produkty
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            (z dostawą)
                                        </span>
                                    </h2>
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={products.every((p) =>
                                                selectedIds.has(p.id),
                                            )}
                                            onChange={(e) =>
                                                toggleSection(
                                                    products,
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]"
                                        />
                                        Zaznacz wszystkie
                                    </label>
                                </div>
                                <div className="space-y-3">
                                    {products.map((item) => (
                                        <CartLine
                                            key={item.id}
                                            item={item}
                                            checked={selectedIds.has(item.id)}
                                            onToggle={toggleItem}
                                            onRemove={handleRemove}
                                            onQuantityChange={
                                                handleQuantityChange
                                            }
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {courses.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Kursy
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            (bez dostawy)
                                        </span>
                                    </h2>
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={courses.every((c) =>
                                                selectedIds.has(c.id),
                                            )}
                                            onChange={(e) =>
                                                toggleSection(
                                                    courses,
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]"
                                        />
                                        Zaznacz wszystkie
                                    </label>
                                </div>
                                <div className="space-y-3">
                                    {courses.map((item) => (
                                        <CartLine
                                            key={item.id}
                                            item={item}
                                            checked={selectedIds.has(item.id)}
                                            onToggle={toggleItem}
                                            onRemove={handleRemove}
                                            onQuantityChange={
                                                handleQuantityChange
                                            }
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="lg:w-80 shrink-0">
                        <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Podsumowanie
                            </h2>
                            <div className="flex justify-between py-2 text-sm">
                                <span className="text-gray-600">
                                    Zaznaczone ({selectedCount})
                                </span>
                                <span className="font-medium">
                                    {formattedSubtotal} zł
                                </span>
                            </div>
                            <div className="flex justify-between py-2 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-gray-600">
                                        Koszt dostawy*
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {hasProductsSelected
                                            ? "* przeliczany w kasie (tylko produkty)"
                                            : hasCoursesSelected
                                              ? "* nie dotyczy — same kursy"
                                              : "* zaznacz pozycje"}
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {hasProductsSelected ? "—" : "0,00 zł"}
                                </span>
                            </div>
                            <div className="border-t border-gray-200 my-4 pt-4 flex justify-between font-bold">
                                <span>Razem</span>
                                <span>{formattedSubtotal} zł</span>
                            </div>
                            <button
                                type="button"
                                onClick={goToCheckout}
                                disabled={selectedCount === 0}
                                className="block w-full py-3 text-center rounded-xl font-semibold bg-[#D2B79B] text-black hover:bg-[#b89a7f] transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                Przejdź do kasy
                                {selectedCount > 0
                                    ? ` (${selectedCount})`
                                    : ""}
                            </button>
                            <Link
                                href="/produkty"
                                className="block w-full py-2 text-center text-sm text-[#D2B79B] hover:underline">
                                Kontynuuj zakupy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
