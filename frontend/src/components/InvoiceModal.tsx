import Link from "next/link";

export default function InvoiceModal({ orderId }: { orderId: string }) {
  return (
    <Link
      href={`/ordenes/${orderId}/factura`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#0066cc] hover:underline"
    >
      View invoice ›
    </Link>
  );
}