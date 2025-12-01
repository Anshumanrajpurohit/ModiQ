"use client";

import { useState } from "react";

type SpecDetailListProps = {
  title: string;
  items: string[];
};

export function SpecDetailList({ title, items }: SpecDetailListProps) {
  const [activeDetail, setActiveDetail] = useState<string | null>(null);

  const closeDetail = () => setActiveDetail(null);

  return (
    <>
      <div>
        <p className="text-sm text-[#A5B867]">{title}</p>
        <ul className="mt-3 space-y-2 text-sm text-[#4A4A4A]">
          {items.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => setActiveDetail(item)}
                className="w-full rounded-2xl border border-[#9B9B9B]/40 bg-[#FFFFFF] px-4 py-3 text-left transition hover:border-[#A5B867]"
                aria-label={`View details for ${item}`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {activeDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} detail`}
          onClick={closeDetail}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6 text-[#4A4A4A] shadow-2xl shadow-[#000]/30"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-[#A5B867]">{title}</p>
            <p className="mt-4 text-base font-semibold">{activeDetail}</p>
            <p className="mt-2 text-sm text-[#999999]">
              Tap anywhere outside or use the button below to return to the specification list.
            </p>
            <button
              type="button"
              onClick={closeDetail}
              className="mt-6 w-full rounded-full bg-[#4A4A4A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
            >
              Close Detail
            </button>
          </div>
        </div>
      )}
    </>
  );
}
