'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/app/data/products';

export interface CartItem {
  id: string; // Unikalny identyfikator pozycji (productId-color-size)
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  lastAddedItem: CartItem | null;
  addToCart: (product: Product, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearLastAddedItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Funkcja pomocnicza do generowania ID (poza komponentem, aby była dostępna wszędzie)
const getItemId = (product: Product, selectedColor?: string, selectedSize?: string): string => {
  return `${product.id}-${selectedColor || 'no-color'}-${selectedSize || 'no-size'}`;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Ładuj koszyk z localStorage przy inicjalizacji
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        // Upewnij się, że wszystkie elementy mają ID
        const cartWithIds = parsedCart.map(item => {
          if (!item.id) {
            return {
              ...item,
              id: getItemId(item.product, item.selectedColor, item.selectedSize)
            };
          }
          return item;
        });
        setCartItems(cartWithIds);
      } catch (error) {
        console.error('Błąd podczas ładowania koszyka:', error);
      }
    }
  }, []);

  // Zapisz koszyk do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product: Product, quantity: number, selectedColor?: string, selectedSize?: string) => {
    setCartItems(prev => {
      const itemId = getItemId(product, selectedColor, selectedSize);
      const existingItemIndex = prev.findIndex(item => item.id === itemId);

      let newItem: CartItem;
      if (existingItemIndex >= 0) {
        // Zwiększ ilość istniejącego produktu
        const updated = [...prev];
        updated[existingItemIndex].quantity += quantity;
        newItem = updated[existingItemIndex];
        return updated;
      } else {
        // Dodaj nowy produkt
        newItem = { 
          id: itemId,
          product, 
          quantity, 
          selectedColor, 
          selectedSize 
        };
        return [...prev, newItem];
      }
    });
    
    // Ustaw ostatnio dodany produkt (dla powiadomienia)
    const itemId = getItemId(product, selectedColor, selectedSize);
    setLastAddedItem({
      id: itemId,
      product,
      quantity,
      selectedColor,
      selectedSize
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price.replace(',', '.').replace(/\s/g, ''));
      return total + price * item.quantity;
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

