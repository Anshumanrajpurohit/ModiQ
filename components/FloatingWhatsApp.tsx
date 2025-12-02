import Image from "next/image";
import WhatsAppIcon from "@/public/icons/whatsapp.svg";

export function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/919988011223?text=Hi%20ModiQ%2C%20I%20need%20help%20with%20architectural%20hardware."
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
