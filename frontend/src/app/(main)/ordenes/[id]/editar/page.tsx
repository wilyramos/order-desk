import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/orders";
import EditOrderForm from "@/components/EditOrderForm";

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  if (order.status === "cancelado") {
    return (
      <div className="py-24 text-center">
        <p className="text-2xl text-[#6e6e73]">This order was canceled and can&apos;t be edited.</p>
        <Link href={`/ordenes/${order._id}`} className="mt-6 inline-block text-[#0066cc] hover:underline">
          ‹ Back to order
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-14 text-center">
        <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">Edit your order.</h1>
        <p className="mt-4 text-[17px] text-[#6e6e73]">
          Order Number: {order._id.slice(-10).toUpperCase()}
        </p>
      </header>

      <EditOrderForm order={order} />

      <div className="mt-12 text-center">
        <Link href={`/ordenes/${order._id}`} className="text-[17px] text-[#0066cc] hover:underline">
          ‹ Back to order
        </Link>
      </div>
    </div>
  );
}

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="bg-white px-6 pb-24 pt-20 text-[#1d1d1f]">
      <Suspense fallback={<p className="text-center text-[#6e6e73]">Loading order...</p>}>
        <EditContent params={params} />
      </Suspense>
    </main>
  );
}