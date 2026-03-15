"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categoryLabel?: string;
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
  discountCode: string | null;
  discountPercent: number;
  discountAmount: number;
  discountedTotal: number;
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  applyTrendDiscountCode: (code: string | null) => Promise<void>;
  clearDiscount: () => void;
  placeOrder: () => { message: string };
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity: entry.quantity + item.quantity,
                categoryLabel: entry.categoryLabel ?? item.categoryLabel,
              }
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

  const discountAmount = useMemo(
    () => totalAmount * (discountPercent / 100),
    [discountPercent, totalAmount],
  );

  const discountedTotal = useMemo(
    () => totalAmount - discountAmount,
    [discountAmount, totalAmount],
  );

  const clearDiscount = useCallback(() => {
    setDiscountCode(null);
    setDiscountPercent(0);
  }, []);

  const applyTrendDiscountCode = useCallback(async (code: string | null) => {
    const normalizedCode = code?.trim().toUpperCase() ?? "";
    if (!normalizedCode) {
      clearDiscount();
      return;
    }

    if (normalizedCode === discountCode) {
      return;
    }

    try {
      const response = await fetch(`/api/trends?code=${encodeURIComponent(normalizedCode)}`);
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.trend) {
        clearDiscount();
        return;
      }

      setDiscountCode(body.trend.discountCode ?? normalizedCode);
      setDiscountPercent(body.trend.discountPercent ?? 0);
    } catch {
      clearDiscount();
    }
  }, [clearDiscount, discountCode]);

  const placeOrder = () => {
    if (!cartItems.length) {
      return { message: "Your cart is empty." };
    }
    const orderId = `MOD-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      items: cartItems,
      total: discountedTotal,
      placedAt: new Date().toISOString(),
      status: "Processing",
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    return { message: `Order ${orderId} placed successfully.` };
  };

  const value: CartContextValue = {
    cartItems,
    orders,
    totalAmount,
    discountCode,
    discountPercent,
    discountAmount,
    discountedTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    applyTrendDiscountCode,
    clearDiscount,
    placeOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
