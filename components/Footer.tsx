import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Catalog", href: "/products" },
  { label: "Cart", href: "/cart" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#9B9B9B]/40 bg-[#4A4A4A] py-10 text-[#FFFFFF]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:flex-row md:justify-between">
        <div>
          <p className="text-sm tracking-[0.3em] text-[#FFFFFF]">MODIQ HARDWARE</p>
          <p className="mt-3 max-w-sm text-sm text-[#9B9B9B]">
            Engineered hardware for modern interiors, blending precise motion, premium finishes, and long-term durability.
          </p>
          <div className="mt-4 text-sm text-[#FFFFFF]">
            <p>Contact</p>
            <p className="text-[#9B9B9B]">+91 86699 33603</p>
            <p className="text-[#9B9B9B]">hello@modiqhardware.com</p>
          </div>
        </div>
        <div>
          <p>Quick Links</p>
          <div className="mt-3 flex flex-col text-sm text-[#9B9B9B]">
            {quickLinks.map((link) => (
              <Link key={`${link.label}-${link.href}`} href={link.href} className="py-1 transition hover:text-[#A5B867]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p>Visit</p>
          <p className="mt-3 text-sm text-[#9B9B9B]">
            Plot 21, Industrial Estate, Mumbai, India
          </p>
          <a
            href="https://wa.me/918669933603"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#A5B867] px-4 py-2 text-sm text-[#A5B867] transition hover:bg-[#A5B867] hover:text-[#4A4A4A]"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Us
          </a>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-[#9B9B9B]">© {new Date().getFullYear()} ModiQ Hardware. All rights reserved.</p>
    </footer>
  );
}
