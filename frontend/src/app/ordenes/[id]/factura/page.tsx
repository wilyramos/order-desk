import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import InvoiceView from "@/components/invoice/InvoiceView";

async function InvoiceContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  return <InvoiceView order={order} />;
}

export default function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Cargando factura...</p>}>
      <InvoiceContent params={params} />
    </Suspense>
  );
}