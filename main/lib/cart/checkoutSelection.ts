import type { Cart, CartItem } from "@/lib/types/cartTypes";

const STORAGE_KEY = "cartCheckoutSelection";

export function saveCartCheckoutSelection(ids: string[]) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function readCartCheckoutSelection(): string[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : null;
    } catch {
        return null;
    }
}

export function clearCartCheckoutSelection() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(STORAGE_KEY);
}

export function filterCartBySelection(
    cart: Cart,
    selectedIds: string[] | null,
): Cart {
    if (!selectedIds || selectedIds.length === 0) {
        return { ...cart, items: [] };
    }
    const set = new Set(selectedIds);
    return {
        ...cart,
        items: cart.items.filter((item) => set.has(item.id)),
    };
}

export function splitCartItems(items: CartItem[]) {
    const products = items.filter((i) => i.type === "produkt");
    const courses = items.filter((i) => i.type === "kursy");
    return { products, courses };
}

export function cartNeedsDelivery(items: CartItem[]): boolean {
    return items.some((i) => i.type === "produkt");
}

export function selectionTotal(items: CartItem[], selectedIds: Set<string>) {
    return items
        .filter((i) => selectedIds.has(i.id))
        .reduce((sum, i) => sum + i.price * i.quantity, 0);
}
