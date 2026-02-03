"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { Products, Warianty } from "@/lib/types/productTypes";

export interface CartItem {
    id: string;
    product: Products;
    quantity: number;
    price: number;
    wariant?: Warianty;
}

interface CartContextType {
    cartItems: CartItem[];
    lastAddedItem: CartItem | null;
    addToCart: (
        product: Products,
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Funkcja pomocnicza do generowania ID (poza komponentem, aby była dostępna wszędzie)
const getItemId = (product: string, wariant?: Warianty): string => {
    return `${product}_${wariant ? wariant.nazwa : "0"}`;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

    // Ładuj koszyk z localStorage przy inicjalizacji
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                function p(c: CartItem[]) {
                    setCartItems(c);
                }
                const parsedCart: CartItem[] = JSON.parse(savedCart);
                // Upewnij się, że wszystkie elementy mają ID
                const ci = parsedCart.map((item) => {
                    if (item.id) return item;
                    item.id = getItemId(item.product.slug, item.wariant);
                    return item;
                });
                p(ci);
            } catch (error) {
                console.error("Błąd podczas ładowania koszyka:", error);
            }
        }
    }, []);

    // Zapisz koszyk do localStorage przy każdej zmianie
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = useCallback(
        (
            product: Products,
            quantity: number,
            price: number,
            wariant?: Warianty,
        ) => {
            const itemId = getItemId(product.slug, wariant);
            setCartItems((prev) => {
                const existingItemIndex = prev.findIndex(
                    (item) => item.id === itemId,
                );

                let newItem: CartItem;
                if (existingItemIndex >= 0) {
                    // Zwiększ ilość istniejącego produktu
                    const updated = [...prev];
                    updated[existingItemIndex].quantity += quantity;
                    updated[existingItemIndex].price += price;
                    newItem = updated[existingItemIndex];
                    return updated;
                } else {
                    // Dodaj nowy produkt
                    newItem = {
                        id: itemId,
                        product: product,
                        quantity,
                        price,
                        wariant,
                    };
                    return [...prev, newItem];
                }
            });
            setLastAddedItem({
                id: itemId,
                product: product,
                quantity,
                price,
                wariant,
            });
        },
        [],
    );

    const removeFromCart = useCallback((itemId: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback(
        (itemId: string, quantity: number) => {
            if (quantity <= 0) {
                removeFromCart(itemId);
                return;
            }
            setCartItems((prev) =>
                prev.map((item) =>
                    item.id === itemId ? { ...item, quantity } : item,
                ),
            );
        },
        [removeFromCart],
    );

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const getTotalPrice = useCallback(() => {
        return cartItems.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }, [cartItems]);

    const getTotalItems = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    const clearLastAddedItem = useCallback(() => {
        setLastAddedItem(null);
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                lastAddedItem,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalPrice,
                getTotalItems,
                clearLastAddedItem,
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
