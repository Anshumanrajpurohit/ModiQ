import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CartItem } from "@/context/CartContext"
import type { CheckoutDetails } from "@/types/checkout"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SUPPORT_PHONE_E164 = "+918669933603"
export const SUPPORT_PHONE_DISPLAY = "+91 86699 33603"

export function buildWhatsAppOrderMessage(details: CheckoutDetails, cartItems: CartItem[]) {
  const header = [
    "Hi ModiQ,",
    "New order enquiry from the website:",
    `Name: ${details.customerName}`,
    `Contact: ${details.contactNumber}`,
    `Delivery: ${details.deliveryAddress}`,
    "",
    "Items:",
  ]

  const lines = cartItems.length
    ? cartItems.map((item, index) => {
        const categoryLabel = item.categoryLabel ?? item.id.split("-")[0] ?? "Category"
        return `${index + 1}. ${categoryLabel} • ${item.name} × ${item.quantity}`
      })
    : ["(cart was empty)"]

  return [...header, ...lines].join("\n")
}
