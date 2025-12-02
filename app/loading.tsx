export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F0] px-6 text-center text-[#4A4A4A]">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.6em] text-[#A5B867]">ModiQ</p>
        <p className="text-lg font-semibold">Preparing the next page…</p>
        <div className="flex items-center justify-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#A5B867]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#A5B867]" style={{ animationDelay: "0.15s" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#A5B867]" style={{ animationDelay: "0.3s" }} />
        </div>
        <p className="text-sm text-[#9B9B9B]">You can keep scrolling once the content loads.</p>
      </div>
    </div>
  );
}
