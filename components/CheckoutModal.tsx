"use client"

import { useEffect, useState, type FormEvent } from "react"
import type { CheckoutDetails } from "@/types/checkout"

type CheckoutModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (details: CheckoutDetails) => void
  isSubmitting?: boolean
}

const emptyDetails: CheckoutDetails = {
  customerName: "",
  contactNumber: "",
  deliveryAddress: "",
}

export function CheckoutModal({ open, onClose, onSubmit, isSubmitting }: CheckoutModalProps) {
  const [formState, setFormState] = useState<CheckoutDetails>(emptyDetails)

  useEffect(() => {
    if (open) {
      setFormState(emptyDetails)
    }
  }, [open])

  if (!open) {
    return null
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formState.customerName || !formState.contactNumber || !formState.deliveryAddress) {
      return
    }
    onSubmit(formState)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg space-y-4 rounded-3xl border border-white/10 bg-[#121212] p-6 text-white"
      >
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#c4d677]">Finalize request</p>
            <h2 className="text-2xl font-semibold">Delivery details</h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/70" aria-label="Close checkout form">
            ✕
          </button>
        </header>
        <label className="block text-sm">
          Full name
          <input
            type="text"
            required
            value={formState.customerName}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, customerName: event.target.value }))
            }
            className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-2"
            placeholder="Jatin Sharma"
          />
        </label>
        <label className="block text-sm">
          Contact number
          <input
            type="tel"
            required
            inputMode="tel"
            value={formState.contactNumber}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, contactNumber: event.target.value }))
            }
            className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-2"
            placeholder="+91 86699 33603"
          />
        </label>
        <label className="block text-sm">
          Delivery address
          <textarea
            required
            rows={4}
            value={formState.deliveryAddress}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, deliveryAddress: event.target.value }))
            }
            className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-2"
            placeholder="Studio / Project name, street, city, PIN"
          />
        </label>
        <p className="text-xs text-white/60">
          We will share this bundle via WhatsApp and call you back on the provided number for confirmation.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/20 px-4 py-2 text-sm text-white/80"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-2xl bg-gradient-to-r from-[#a8b965] to-[#c4d677] px-4 py-2 text-sm font-semibold text-[#121212] disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Send on WhatsApp"}
          </button>
        </div>
      </form>
    </div>
  )
}
