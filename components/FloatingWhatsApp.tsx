import Image from "next/image";
import WhatsAppIcon from "@/public/icons/whatsapp.svg";
import { SUPPORT_PHONE_E164 } from "@/lib/utils";

export function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${SUPPORT_PHONE_E164.replace("+", "")}?text=Hi%20ModiQ%2C%20I%27d%20like%20to%20place%20an%20order.`}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#A5B867] px-4 py-3 text-sm font-semibold text-[#4A4A4A] shadow-2xl shadow-[#4A4A4A]/20 transition hover:scale-105"
      aria-label="Chat on WhatsApp"
      target="_blank"
      rel="noreferrer"
    >
      <Image
        src={WhatsAppIcon}
        alt="WhatsApp"
        width={24}
        height={24}
        className="h-6 w-6"
      />
    </a>
  );
}
