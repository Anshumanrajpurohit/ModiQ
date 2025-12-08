import { Reveal } from "@/components/Reveal";

export default function ContactPage() {
  return (
    <Reveal className="space-y-10 rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6 text-[#4A4A4A]">
      <div>
        <p className="text-3xl font-bold">Contact ModiQ</p>
        <p className="mt-3 text-sm text-[#999999]">
          Our advisors are ready with catalogs, mockups, and technical drawings for faster project approvals.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="text-sm text-[#999999]">Call</p>
          <p className="text-lg font-semibold">+91 86699 33603</p>
        </div>
        <div>
          <p className="text-sm text-[#999999]">Email</p>
          <p className="text-lg font-semibold">hello@modiqhardware.com</p>
        </div>
        <div>
          <p className="text-sm text-[#999999]">Visit</p>
          <p className="text-lg font-semibold">Plot 21, Industrial Estate, Mumbai</p>
        </div>
      </div>
      <div className="rounded-2xl border border-[#9B9B9B]/40 bg-[#FFFFFF] px-6 py-8 text-sm text-[#999999]">
        <p className="text-lg font-semibold text-[#4A4A4A]">Project Support</p>
        <p className="mt-3">
          Dedicated account managers coordinate sampling, specification matching, and logistics across India.
        </p>
      </div>
    </Reveal>
  );
}
