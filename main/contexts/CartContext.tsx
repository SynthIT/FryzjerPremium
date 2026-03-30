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

const getItemId = (product: string, wariant?: Warianty): string => {
    return `${product}_${wariant ? wariant.nazwa.replace(/ /g, "_") : "0"}`;
};

/** Jednoznaczny klucz linii koszyka (zgodny z addToCart). */
function lineIdForCartItem(item: CartItem): string {
    return getItemId(`${item.type}_${item.object.slug}`, item.wariant);
}

function newCartId(): string {
    const id = new Uint8Array(12);
    crypto.getRandomValues(id);
    return Array.from(id)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Ujednolica id linii i scala duplikaty (stary localStorage / zmiana formatu id).
 */
function normalizeAndMergeItems(items: CartItem[]): CartItem[] {
    const map = new Map<string, CartItem>();
    for (const raw of items) {
        if (!raw?.object?.slug || (raw.type !== "produkt" && raw.type !== "kursy")) {
            continue;
        }
        const id = lineIdForCartItem(raw);
        const cur = map.get(id);
        if (cur) {
            cur.quantity += Math.max(0, raw.quantity);
        } else {
            map.set(id, { ...raw, id });
        }
    }
    return Array.from(map.values());
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart>({ id: "", items: [] });
    const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
    /** Bez tego pierwszy zapis nadpisuje localStorage pustym stanem zanim zadziała odczyt. */
    const [cartHydrated, setCartHydrated] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const finish = (next: Cart) => {
            setCart(next);
            setCartHydrated(true);
        };

        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                const parsedCart: Cart = JSON.parse(savedCart);
                const id =
                    typeof parsedCart.id === "string" && parsedCart.id
                        ? parsedCart.id
                        : newCartId();
                const items = normalizeAndMergeItems(
                    Array.isArray(parsedCart.items) ? parsedCart.items : [],
                );
                finish({ id, items });
            } catch (error) {
                console.error("Błąd podczas ładowania koszyka:", error);
                finish({ id: newCartId(), items: [] });
            }
        } else {
            finish({ id: newCartId(), items: [] });
        }
    }, []);

    useEffect(() => {
        if (!cartHydrated || typeof window === "undefined") return;
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart, cartHydrated]);

    const addToCart = useCallback(
        (
            type: "produkt" | "kursy",
            object: Products | Courses,
            quantity: number,
            price: number,
            wariant?: Warianty,
        ) => {
            const itemId = getItemId(type + "_" + object.slug, wariant);
            const addQty = Math.max(0, quantity);

            setCart((prev) => {
                const existingItemIndex = prev.items.findIndex(
                    (item) => lineIdForCartItem(item) === itemId,
                );

                let newItem: CartItem;
                if (existingItemIndex >= 0) {
                    const updated = [...prev.items];
                    const row = { ...updated[existingItemIndex], id: itemId };
                    row.quantity += addQty;
                    updated[existingItemIndex] = row;
                    newItem = row;
                    return { ...prev, items: updated };
                }

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
                    quantity: addQty,
                    price,
                    wariant,
                };
                return { ...prev, items: [...prev.items, newItem] };
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
                quantity: addQty,
                price: price * (1 + object.vat / 100),
                wariant,
            });
        },
        [],
    );

    const removeFromCart = useCallback((itemId: string) => {
        setCart((prev) => ({
            ...prev,
            items: prev.items.filter(
                (item) => item.id !== itemId && lineIdForCartItem(item) !== itemId,
            ),
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
                    item.id === itemId || lineIdForCartItem(item) === itemId
                        ? { ...item, id: lineIdForCartItem(item), quantity }
                        : item,
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
                return {
                    ...parsedCart,
                    items: normalizeAndMergeItems(
                        Array.isArray(parsedCart.items) ? parsedCart.items : [],
                    ),
                };
            } catch (error) {
                console.error("Błąd podczas ładowania koszyka:", error);
                return { id: "", items: [] };
            }
        }
        return { id: "", items: [] };
    }, []);

    const refreshCart = useCallback(async (entry: Cart) => {
        const id =
            typeof entry.id === "string" && entry.id ? entry.id : newCartId();
        setCart({
            id,
            items: normalizeAndMergeItems(entry.items ?? []),
        });
        setCartHydrated(true);
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
