import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import PrintableReceipt from "@/components/PrintableReceipt";
import PrintButton from "@/components/PrintButton";

async function ReceiptContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  return <PrintableReceipt order={order} />;
}

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <Suspense fallback={<p style={{ textAlign: "center", padding: "48px 0" }}>Loading receipt...</p>}>
        <ReceiptContent params={params} />
      </Suspense>
      <div className="print:hidden" style={{ textAlign: "center", padding: "24px 0" }}>
        <PrintButton />
      </div>
    </main>
  );
}