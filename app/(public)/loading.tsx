import { Header } from "@/components/Header";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="container-page py-6">
        <div className="mb-8 h-72 animate-pulse rounded-3xl bg-white/[0.04]" />
        <div className="mb-5 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-28 shrink-0 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-square animate-pulse bg-white/[0.04]" />
              <div className="space-y-2 p-3">
                <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-4 w-full animate-pulse rounded bg-white/[0.06]" />
                <div className="h-6 w-24 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-9 w-full animate-pulse rounded-xl bg-white/[0.06]" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
