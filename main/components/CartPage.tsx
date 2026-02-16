"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import "@/app/globals.css";
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
    const [done, setDone] = useState<boolean>(false);
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
        if(!done) {
            validate();
            setDone(true);
        };
    }, [user, getCart, refreshCart, done,setDone]);
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
            <div className="cart-page">
                <div className="cart-page-container">
                    <div className="breadcrumbs">
                        <Link href="/" className="breadcrumb-link">
                            Strona główna
                        </Link>
                        <span className="breadcrumb-separator">&gt;</span>
                        <span className="breadcrumb-current">Koszyk</span>
                    </div>

                    <div className="empty-cart">
                        <div className="empty-cart-icon">
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
                        <h2 className="empty-cart-title">
                            Twój koszyk jest pusty
                        </h2>
                        <p className="empty-cart-description">
                            Dodaj produkty do koszyka, aby kontynuować zakupy.
                        </p>
                        <Link href="/products" className="empty-cart-button">
                            Przejdź do sklepu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-page-container">
                <div className="breadcrumbs">
                    <Link href="/" className="breadcrumb-link">
                        Strona główna
                    </Link>
                    <span className="breadcrumb-separator">&gt;</span>
                    <span className="breadcrumb-current">Koszyk</span>
                </div>

                <div className="cart-content">
                    <div className="cart-items-section">
                        <h1 className="cart-title">Twój koszyk</h1>

                        <div className="cart-items-list">
                            {items.map((item) => {
                                const productPrice = item.price;
                                const itemTotal = (productPrice * item.quantity)
                                    .toFixed(2)
                                    .replace(".", ",");

                                return (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item-image">
                                            <Link
                                                href={`/product/${item.product.slug}`}>
                                                {item.product.media && item.product.media.length > 0 ? (
                                                    <Image
                                                        src={
                                                            item.product
                                                                .media[0]?.path
                                                        }
                                                        alt={
                                                            item.product
                                                                .media[0]?.alt
                                                        }
                                                        width={124}
                                                        height={124}
                                                        className="cart-item-img"
                                                    />
                                                ) : (
                                                    <div className="cart-item-placeholder">
                                                        <span>
                                                            {item.product.nazwa}
                                                        </span>
                                                    </div>
                                                )}
                                            </Link>
                                        </div>

                                        <div className="cart-item-details">
                                            <Link
                                                href={`/product/${item.product.slug}`}
                                                className="cart-item-name">
                                                {item.product.nazwa}
                                            </Link>
                                            <div className="cart-item-options">
                                                <span className="cart-item-option">
                                                    {item.wariant?.typ}:{" "}
                                                    {item.wariant?.nazwa}
                                                </span>
                                            </div>
                                            <div className="cart-item-price">
                                                <span className="cart-item-current-price">
                                                    {itemTotal} zł
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            className="cart-item-remove"
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

                                        <div className="cart-item-quantity">
                                            <div className="quantity-selector-cart">
                                                <button
                                                    className="quantity-button-cart"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            -1,
                                                        )
                                                    }
                                                    aria-label="Zmniejsz ilość">
                                                    −
                                                </button>
                                                <span className="quantity-value-cart">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="quantity-button-cart"
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

                    <div className="cart-summary">
                        <div className="cart-summary-card">
                            <h2 className="cart-summary-title">
                                Podsumowanie zamówienia
                            </h2>

                            <div className="cart-summary-row">
                                <span className="cart-summary-label">
                                    Suma częściowa
                                </span>
                                <span className="cart-summary-value">
                                    {formattedSubtotal} zł
                                </span>
                            </div>
                            <div className="cart-summary-row">
                                <div className="flex flex-col">
                                    <span className="cart-summary-label">
                                        Koszt dostawy*
                                    </span>
                                    <span className="w-xs">
                                        <sub>
                                            * - koszt dostawy zostanie
                                            przeliczony w następnym etapie
                                        </sub>
                                    </span>
                                </div>
                                <span className="cart-summary-value">
                                    0,00 zł
                                </span>
                            </div>

                            <div className="cart-summary-divider"></div>

                            <div className="cart-summary-row cart-summary-total">
                                <span className="cart-summary-label">
                                    Razem
                                </span>
                                <span className="cart-summary-value">
                                    {formattedSubtotal} zł
                                </span>
                            </div>
                            <Link
                                href={`/kasa`}
                                className="cart-checkout-button">
                                Przejdź do kasy
                            </Link>

                            <Link
                                href="/products"
                                className="cart-continue-shopping">
                                Kontynuuj zakupy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
