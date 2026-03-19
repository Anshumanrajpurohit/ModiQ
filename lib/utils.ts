import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { CartItem } from "@/context/CartContext"
import type { CheckoutDetails } from "@/types/checkout"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SUPPORT_PHONE_E164 = "+918669933603"
export const SUPPORT_PHONE_DISPLAY = "+91 86699 33603"

type WhatsAppOrderMessageOptions = {
  orderNumber?: string | null
  totalAmount?: number | null
}

export function buildWhatsAppOrderMessage(
  details: CheckoutDetails,
  cartItems: CartItem[],
  options: WhatsAppOrderMessageOptions = {},
) {
  const header = [
    "Hi ModiQ,",
    "New order enquiry from the website:",
    options.orderNumber ? `Order: ${options.orderNumber}` : null,
    `Name: ${details.customerName}`,
    `Email: ${details.customerEmail}`,
    `Contact: ${details.contactNumber}`,
    `Delivery: ${details.deliveryAddress}`,
    typeof options.totalAmount === "number" ? `Total: INR ${options.totalAmount.toLocaleString("en-IN")}` : null,
    "",
    "Items:",
  ].filter(Boolean)

  const lines = cartItems.length
    ? cartItems.map((item, index) => {
        const categoryLabel = item.categoryLabel ?? item.id.split("-")[0] ?? "Category"
        return `${index + 1}. ${categoryLabel} - ${item.name} x ${item.quantity}`
      })
    : ["(cart was empty)"]

  return [...header, ...lines].join("\n")
}
