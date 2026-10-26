import { Suspense } from "react";
import OrdersList from "@/components/OrdersList";

function OrdersSkeleton() {
  return (
    <div className="mx-auto grid max-w-[980px] gap-8">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-2xl bg-white border border-[#d2d2d7]" />
      ))}
    </div>
  );
}

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string }>;
}) {
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-12 md:px-6 md:pt-16 text-[#1d1d1f]">
      <div className="mx-auto max-w-[980px]">
        <header className="mb-10 md:mb-14">
          <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f] sm:text-5xl">
            Artículos del pedido.
          </h1>
        </header>

        <Suspense fallback={<OrdersSkeleton />}>
          <OrdersList searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}