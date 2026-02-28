"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { Products, Warianty } from "@/lib/types/productTypes";
import { CartItem, Cart } from "@/lib/types/cartTypes";
import { Courses } from "@/lib/types/coursesTypes";
import { Promos } from "@/lib/types/shared";


interface CartContextType {
    getCart: () => Cart;
    lastAddedItem: CartItem | null;
    addToCart: (
        type: "produkt" | "kursy",
        object: Products | Courses,
        quantity: number,
        price: number,
        wariant?: Warianty,
    ) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
    clearLastAddedItem: () => void;
    refreshCart: (entry: Cart) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Funkcja pomocnicza do generowania ID (poza komponentem, aby była dostępna wszędzie)
const getItemId = (product: string, wariant?: Warianty): string => {
    return `${product}_${wariant ? wariant.nazwa.replace(" ", "_") : "0"}`;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart>({ id: "", items: [] });
    const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

    // Ładuj koszyk z localStorage przy inicjalizacji
    useEffect(() => {
        if (typeof window === "undefined") return;
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                function p(c: Cart) {
                    setCart(c);
                }
                const parsedCart: Cart = JSON.parse(savedCart);
                // Upewnij się, że wszystkie elementy mają ID
                if (parsedCart.items.length == 0) return;
                const ci = parsedCart.items.map((item) => {
                    if (item.id) return item;
                    item.id = getItemId(item.object.slug!, item.wariant);
                    return item;
                });
                parsedCart.items = ci;
                p(parsedCart);
            } catch (error) {
                console.error("Błąd podczas ładowania koszyka:", error);
            }
        } else {
            const id = new Uint8Array(12);
            crypto.getRandomValues(id);
            const cartId = Array.from(id)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            function a(c: Cart) {
                setCart(c);
            }
            console.log(cartId);
            a({ id: cartId, items: [] });
        }
    }, []);

    // Zapisz koszyk do localStorage przy każdej zmianie
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback(
        (
            type: "produkt" | "kursy",
            object: Products | Courses,
            quantity: number,
            price: number,
            wariant?: Warianty,
        ) => {
            const itemId = getItemId(type + "_" + object.slug, wariant);
            setCart((prev) => {
                const existingItemIndex = prev.items.findIndex(
                    (item) => item.id === itemId,
                );

                let newItem: CartItem;
                if (existingItemIndex >= 0) {
                    // Zwiększ ilość istniejącego produktu
                    const updated = [...prev.items];
                    updated[existingItemIndex].quantity += quantity;
                    updated[existingItemIndex].price += price;
                    newItem = updated[existingItemIndex];
                    return { ...prev, items: updated };
                } else {
                    // Dodaj nowy produkt
                    newItem = {
                        id: itemId,
                        type,
                        object: {
                            vat: object.vat,
                            promocje: object.promocje as Promos | undefined,
                            slug: object.slug,
                            nazwa: object.nazwa,
                            media: object.media,
                            cena: object.cena,
                            sku: object.sku || "",
                        },
                        quantity,
                        price,
                        wariant,
                    };
                    return { ...prev, items: [...prev.items, newItem] };
                }
            });
            setLastAddedItem({
                id: itemId,
                type,
                object: {
                    vat: object.vat,
                    promocje: object.promocje as Promos | undefined,
                    slug: object.slug,
                    nazwa: object.nazwa,
                    media: object.media,
                    cena: object.cena,
                    sku: object.sku ?? "",
                },
                quantity,
                price,
                wariant,
            });
        },
        [],
    );

    const removeFromCart = useCallback((itemId: string) => {
        setCart((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
        }));
    }, []);

    const updateQuantity = useCallback(
        (itemId: string, quantity: number) => {
            if (quantity <= 0) {
                removeFromCart(itemId);
                return;
            }
            setCart((prev) => ({
                ...prev,
                items: prev.items.map((item) =>
                    item.id === itemId ? { ...item, quantity } : item,
                ),
            }));
        },
        [removeFromCart],
    );

    const clearCart = useCallback(() => {
        setCart({ id: cart.id, items: [] });
    }, [cart.id]);

    const getTotalPrice = useCallback(() => {
        return cart.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }, [cart.items]);

    const getTotalItems = useCallback(() => {
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    }, [cart.items]);

    const clearLastAddedItem = useCallback(() => {
        setLastAddedItem(null);
    }, []);

    const getCart = useCallback(() => {
        if (typeof window === "undefined") return { id: "", items: [] };
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                const parsedCart: Cart = JSON.parse(savedCart);
                return parsedCart;
            } catch (error) {
                console.error("Błąd podczas ładowania koszyka:", error);
                return { id: "", items: [] };
            }
        } else {
            return { id: "", items: [] };
        }
    }, []);

    const refreshCart = useCallback(async (entry: Cart) => {
        console.log(entry);
        setCart(entry);
    }, []);

    return (
        <CartContext.Provider
            value={{
                getCart,
                lastAddedItem,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalPrice,
                getTotalItems,
                clearLastAddedItem,
                refreshCart,
            }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
