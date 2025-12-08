"use client";

import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { useCart } from "@/context/CartContext";
import { CheckoutModal } from "@/components/CheckoutModal";
import type { CheckoutDetails } from "@/types/checkout";
import { buildWhatsAppOrderMessage, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_E164 } from "@/lib/utils";

type ProductPurchasePanelProps = {
  productName: string;
  productId: string;
  priceLabel: string;
  unitPrice: number;
  categoryLabel: string;
};
export function ProductPurchasePanel({ productName, productId, priceLabel, unitPrice, categoryLabel }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const { cartItems, orders, addToCart, placeOrder } = useCart();

  const normaliseQuantity = (value: number) => (Number.isNaN(value) || value < 1 ? 1 : Math.floor(value));

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuantity(normaliseQuantity(Number(event.target.value)));
  };

  const handleAddToCart = () => {
    if (quantity < 1) return;
    addToCart({ id: productId, name: productName, price: unitPrice, quantity, categoryLabel });
    setQuantity(1);
  };

  const openCheckout = () => {
    if (!cartItems.length) {
      window.alert("Your cart is empty. Add products before placing an order.");
      return;
    }
    setIsCheckoutOpen(true);
  };

  const submitCheckout = (details: CheckoutDetails) => {
    if (!cartItems.length) {
      window.alert("Your cart is empty. Add products before placing an order.");
      setIsCheckoutOpen(false);
      return;
    }
    setIsSubmittingOrder(true);
    const message = buildWhatsAppOrderMessage(details, cartItems);
    const whatsappUrl = `https://wa.me/${SUPPORT_PHONE_E164.replace("+", "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    placeOrder();
    setIsSubmittingOrder(false);
    setIsCheckoutOpen(false);
  };

  return (
    <>
      <section className="text-[#4A4A4A]">
      <div className="flex flex-col gap-3 border-b border-[#F0F0F0] pb-5">
        <p className="text-xs uppercase tracking-[0.4em] text-[#A5B867]">Quick Order</p>
        <h3 className="text-2xl font-semibold">{productName}</h3>
        <p className="text-sm text-[#9B9B9B]">SKU: {productId}</p>
        <p className="text-sm font-medium text-[#4A4A4A]">Price reference: {priceLabel}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-[#9B9B9B]">Quantity</span>
          <div className="flex items-center rounded-full border border-[#9B9B9B]/60 bg-white">
            <button
              type="button"
              onClick={handleDecrement}
              className="h-10 w-10 rounded-full text-lg font-semibold text-[#4A4A4A] transition hover:bg-[#F5F5F5]"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={handleInputChange}
              className="w-16 border-x border-[#9B9B9B]/60 bg-transparent text-center text-base font-semibold text-[#4A4A4A] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleIncrement}
              className="h-10 w-10 rounded-full text-lg font-semibold text-[#4A4A4A] transition hover:bg-[#F5F5F5]"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-full bg-[#A5B867] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#4A4A4A] transition hover:bg-[#4A4A4A] hover:text-white"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#9B9B9B]/40 bg-[#F8F8F8] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Cart</p>
            <span className="text-xs text-[#9B9B9B]">{cartItems.length} item(s)</span>
          </div>
          {cartItems.length ? (
            <ul className="space-y-2 text-sm">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-[#9B9B9B]/40 bg-[#FFFFFF] px-4 py-2"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-[#A5B867]">Qty: {item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#999999]">Your cart is empty.</p>
          )}
          <button
            type="button"
            onClick={openCheckout}
            className="mt-4 w-full rounded-full bg-[#4A4A4A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#000000]"
          >
            Place Order
          </button>
          <Link href="/cart" className="mt-3 inline-flex w-full justify-center text-xs font-semibold text-[#A5B867]">
            View full cart →
          </Link>
          <p className="mt-2 text-[11px] text-[#999999]">
            Need help? WhatsApp
            {" "}
            <a href={`https://wa.me/${SUPPORT_PHONE_E164.replace("+", "")}`} target="_blank" rel="noreferrer" className="text-[#A5B867]">
              {SUPPORT_PHONE_DISPLAY}
            </a>
          </p>
        </div>
        <div className="space-y-3 border border-transparent md:border-l md:border-[#E5E5E5] md:pl-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Orders</p>
            <span className="text-xs text-[#9B9B9B]">{orders.length} order(s)</span>
          </div>
          {orders.length ? (
            <ul className="space-y-2 text-sm">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-2xl border border-[#9B9B9B]/40 bg-[#FFFFFF] px-4 py-2"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#A5B867]">
                    <span>{order.id}</span>
                    <span>{order.status}</span>
                  </div>
                  <p className="text-sm text-[#4A4A4A]">{order.items[0]?.name ?? "Order"}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#999999]">Orders will appear here once placed.</p>
          )}
        </div>
      </div>
      </section>
      <CheckoutModal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmit={submitCheckout}
        isSubmitting={isSubmittingOrder}
      />
    </>
  );
}
