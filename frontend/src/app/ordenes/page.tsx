import { Suspense } from "react";
import OrdersList from "@/components/OrdersList";

function OrdersSkeleton() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-3xl bg-[#f5f5f7]" />
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
    <main className="bg-white px-6 pb-24 pt-20 text-[#1d1d1f]">
      <header className="mb-14 text-center">
        <p className="text-xl font-medium text-[#6e6e73]">Tu cuenta</p>
        <h1 className="mt-1 text-5xl font-semibold tracking-tight md:text-6xl">Mis pedidos</h1>
      </header>

      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}