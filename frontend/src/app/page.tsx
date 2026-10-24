import { Suspense } from "react";
import Hero from "@/components/Hero";
import CategoryShortcuts from "@/components/CategoryShortcuts";
import ProductsGrid from "@/components/ProductsGrid";

function ProductsSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-x-6 gap-y-16 px-6 py-24 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-6">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
          <div className="h-64 w-full animate-pulse rounded-3xl bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <CategoryShortcuts />
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsGrid />
      </Suspense>
    </main>
  );
}