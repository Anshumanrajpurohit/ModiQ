"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  items: CartItem[];
  total: number;
  placedAt: string;
  status: "Processing" | "Confirmed" | "Dispatched";
};

type CartContextValue = {
  cartItems: CartItem[];
  orders: Order[];
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  placeOrder: () => { message: string };
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry,
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const placeOrder = () => {
    if (!cartItems.length) {
      return { message: "Your cart is empty." };
    }
    const orderId = `MOD-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      items: cartItems,
      total: totalAmount,
      placedAt: new Date().toISOString(),
      status: "Processing",
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    return { message: `Order ${orderId} placed successfully.` };
  };

  const value = useMemo(
    () => ({ cartItems, orders, totalAmount, addToCart, updateQuantity, removeFromCart, placeOrder }),
    [cartItems, orders, totalAmount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
