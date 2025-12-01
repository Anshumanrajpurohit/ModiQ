"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const fields: Array<{ label: string; name: keyof FormState; type: string }> = [
  { label: "Name", name: "name", type: "text" },
  { label: "Business Name", name: "business", type: "text" },
  { label: "Phone", name: "phone", type: "tel" },
  { label: "City", name: "city", type: "text" },
  { label: "Product Code", name: "product", type: "text" },
  { label: "Quantity", name: "quantity", type: "number" },
];

type FormState = {
  name: string;
  business: string;
  phone: string;
  city: string;
  product: string;
  quantity: string;
  message: string;
};

function FormContent({ prefillProduct }: { prefillProduct: string }) {
  const [formState, setFormState] = useState<FormState>(() => ({
    name: "",
    business: "",
    phone: "",
    city: "",
    product: prefillProduct,
    quantity: "",
    message: "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    Object.entries(formState).forEach(([key, value]) => {
      if (!value.trim()) {
        nextErrors[key] = "Required";
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(false);
    if (!validate()) return;
    setSuccess(true);
    setFormState({
      name: "",
      business: "",
      phone: "",
      city: "",
      product: prefillProduct,
      quantity: "",
      message: "",
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <form
      className="space-y-4 rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6 text-[#4A4A4A] shadow-2xl shadow-[#4A4A4A]/10"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="flex flex-col text-sm">
            {field.label}
            <input
              type={field.type}
              name={field.name}
              value={formState[field.name]}
              onChange={handleChange}
              className="mt-2 rounded-2xl border border-[#9B9B9B]/60 bg-[#FFFFFF] px-4 py-3 text-sm text-[#4A4A4A] placeholder:text-[#9B9B9B] focus:border-[#A5B867]"
              placeholder={field.label}
            />
            {errors[field.name] && (
              <span className="mt-1 text-xs text-[#4A4A4A]">{errors[field.name]}</span>
            )}
          </label>
        ))}
      </div>
      <label className="flex flex-col text-sm">
        Message
        <textarea
          name="message"
          value={formState.message}
          onChange={handleChange}
          className="mt-2 min-h-[120px] rounded-2xl border border-[#9B9B9B]/60 bg-[#FFFFFF] px-4 py-3 text-sm text-[#4A4A4A] placeholder:text-[#9B9B9B] focus:border-[#A5B867]"
          placeholder="Project details, finishing preferences, delivery timelines..."
        />
        {errors.message && <span className="mt-1 text-xs text-[#4A4A4A]">{errors.message}</span>}
      </label>
      <button
        type="submit"
        className="w-full rounded-full bg-[#A5B867] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#4A4A4A] transition hover:bg-[#FFFFFF]"
      >
        Submit Enquiry
      </button>
      {success && (
        <p className="rounded-2xl border border-[#A5B867] bg-[#A5B867]/15 px-4 py-3 text-center text-sm text-[#4A4A4A]">
          Thank you! Our sales team will reach out within 24 hours.
        </p>
      )}
    </form>
  );
}

export function EnquiryForm() {
  const params = useSearchParams();
  const productQuery = params.get("product") ?? "";
  const formKey = productQuery || "default";
  return <FormContent key={formKey} prefillProduct={productQuery} />;
}
