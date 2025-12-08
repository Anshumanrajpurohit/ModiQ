"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { CheckoutModal } from "@/components/CheckoutModal";
import type { CheckoutDetails } from "@/types/checkout";
import { buildWhatsAppOrderMessage, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_E164 } from "@/lib/utils";

export default function CartPage() {
  const { cartItems, orders, totalAmount, updateQuantity, removeFromCart, placeOrder } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

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
      <div className="space-y-10">
        <section className="rounded-3xl bg-[#FFFFFF] p-6 text-[#4A4A4A] shadow-xl shadow-[#4A4A4A]/10">
          <p className="text-sm uppercase tracking-[0.4em] text-[#A5B867]">Cart Overview</p>
          <h1 className="mt-3 text-3xl font-bold">Your selected hardware</h1>
          <p className="mt-2 text-sm text-[#999999]">
            Review quantities, adjust selections, and proceed to place or trace orders from a single dashboard.
          </p>
          <p className="mt-4 text-sm font-semibold text-[#4A4A4A]">
            WhatsApp / Call support: <a href={`tel:${SUPPORT_PHONE_E164}`} className="text-[#A5B867]">{SUPPORT_PHONE_DISPLAY}</a>
          </p>
        </section>

        <section className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg shadow-[#4A4A4A]/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#A5B867]">Cart</p>
            <h2 className="mt-2 text-2xl font-semibold">{cartItems.length ? "Items in your cart" : "Cart is empty"}</h2>
            </div>
            <Link
              href="/products"
              className="rounded-full border border-[#9B9B9B]/40 px-5 py-2 text-sm font-semibold text-[#4A4A4A] transition hover:border-[#A5B867]"
            >
              Continue shopping
            </Link>
          </div>
          <div className="mt-6 space-y-4">
          {cartItems.length ? (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-[#9B9B9B]/40 bg-[#F8F8F8] p-4 text-sm shadow-inner shadow-[#4A4A4A]/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-[#4A4A4A]">{item.name}</p>
                  {item.categoryLabel && (
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#666]">{item.categoryLabel}</p>
                  )}
                  <p className="text-xs uppercase tracking-[0.4em] text-[#A5B867]">{item.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-9 w-9 rounded-full border border-[#9B9B9B]/60 text-lg"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-base font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-9 w-9 rounded-full border border-[#9B9B9B]/60 text-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-base font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs uppercase tracking-[0.3em] text-[#999999] transition hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-[#9B9B9B]/40 px-4 py-8 text-center text-sm text-[#999999]">
              Add items from the catalog to see them here.
            </p>
          )}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg shadow-[#4A4A4A]/5">
          <p className="text-sm uppercase tracking-[0.4em] text-[#A5B867]">Place Order</p>
          <h2 className="mt-2 text-2xl font-semibold">Ready to confirm?</h2>
          <p className="mt-2 text-sm text-[#999999]">Subtotal</p>
          <p className="text-3xl font-bold text-[#4A4A4A]">₹{totalAmount.toLocaleString("en-IN")}</p>
          <button
            type="button"
            onClick={openCheckout}
            className="mt-6 w-full rounded-full bg-[#4A4A4A] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black"
          >
            Place Order
          </button>
          </div>
          <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg shadow-[#4A4A4A]/5">
          <p className="text-sm uppercase tracking-[0.4em] text-[#A5B867]">Trace Orders</p>
          <h2 className="mt-2 text-2xl font-semibold">Latest updates</h2>
          <div className="mt-4 space-y-4">
            {orders.length ? (
              orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-[#9B9B9B]/40 bg-[#F8F8F8] p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#4A4A4A]">{order.id}</p>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#A5B867]">{order.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#999999]">
                    {new Date(order.placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <p className="mt-2 text-sm font-semibold">Total: ₹{order.total.toLocaleString("en-IN")}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#6B6B6B]">
                    {order.items.map((item) => (
                      <li key={`${order.id}-${item.id}`}>{item.name} × {item.quantity}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-[#9B9B9B]/40 px-4 py-6 text-center text-sm text-[#999999]">
                Orders you place will show here with live status updates.
              </p>
            )}
          </div>
          </div>
        </section>
      </div>
      <CheckoutModal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmit={submitCheckout}
        isSubmitting={isSubmittingOrder}
      />
    </>
  );
}
