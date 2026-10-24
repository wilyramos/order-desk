import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import PrintButton from "@/components/PrintButton";
import Logo from "@/components/Logo";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

const TAX_RATE = 0.18;

async function InvoiceContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const orderNumber = order._id.slice(-10).toUpperCase();
  const invoiceNumber = order.invoiceNumber || `INV-${orderNumber}`;
  const created = new Date(order.createdAt);

  const subtotal = order.subtotal ?? order.total / (1 + TAX_RATE);
  const tax = order.tax ?? order.total - subtotal;
  const amountDue = order.amountDue ?? order.total;

  const card =
    order.paymentMethod === "cash"
      ? "Cash on pickup"
      : order.paymentMethod === "transfer"
        ? "Bank transfer"
        : order.paymentLast4
          ? `${order.paymentCardBrand || "Card"} XXXXXXXXXXXX${order.paymentLast4}`
          : "Card on file";

  return (
    <article className="mx-auto w-full max-w-[800px] bg-white px-14 py-12 text-[#000] print:max-w-none print:p-0">
      {/* Encabezado */}
    
    <header className="flex items-center gap-3">
  <Logo size={28} />
  <div>
    <p className="text-[22px] font-semibold tracking-tight">Apple</p>
    <p className="mt-1 text-[16px] font-semibold">Invoice Receipt</p>
    <p className="mt-3 text-[12px]">Do Not Pay</p>
  </div>
</header>

      {/* Número y fecha del pedido */}
      <section className="mt-8 grid grid-cols-2 gap-x-10 text-[13px]">
        <div>
          <p className="font-semibold">Order Number:</p>
          <p className="mt-1">{orderNumber}</p>
        </div>
        <div>
          <p className="font-semibold">Order Date:</p>
          <p className="mt-1">{longDate.format(created)}</p>
        </div>
      </section>

      {/* Cliente y ubicación */}
      <section className="mt-8 grid grid-cols-2 gap-x-10 text-[13px] leading-[1.45]">
        <div>
          <p className="font-semibold">Sold To:</p>
          <p className="mt-1">{order.customer.name}</p>
          <p>{order.customer.address}</p>
        </div>
        <div>
          <p className="font-semibold">Location:</p>
          <p className="mt-1">{order.location?.name || "Apple"}</p>
          <p>{order.location?.address || "Online store"}</p>
          <p>{order.customer.email}</p>
          <p>{order.customer.phone}</p>
        </div>
      </section>

      <p className="mt-4 text-[11px]">Customer No: {order.customerNumber || "—"}</p>

      {/* Detalle del pedido */}
      <section className="mt-10">
        <p className="text-[16px] font-semibold">Order Details</p>

        <table className="mt-4 w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b-[1.5px] border-black text-left font-semibold">
              <th className="pb-1 pr-3 align-bottom font-semibold">Product Name</th>
              <th className="pb-1 pr-3 align-bottom font-semibold">Product<br />Number</th>
              <th className="pb-1 pr-3 text-right align-bottom font-semibold">Item<br />Price</th>
              <th className="pb-1 pr-3 text-right align-bottom font-semibold">Quantity<br />Ordered</th>
              <th className="pb-1 pr-3 text-right align-bottom font-semibold">Quantity<br />Fulfilled</th>
              <th className="pb-1 text-right align-bottom font-semibold">Extended<br />Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={`${item.product}-${index}`} className="align-top">
                <td className="py-2 pr-3 uppercase">{item.name}</td>
                <td className="py-2 pr-3">{item.sku || "—"}</td>
                <td className="py-2 pr-3 text-right">{money.format(item.price)}</td>
                <td className="py-2 pr-3 text-right">{item.quantity}</td>
                <td className="py-2 pr-3 text-right">{item.quantityFulfilled ?? 0}</td>
                <td className="py-2 text-right">{money.format(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {order.items.map((item, index) => (
          <p key={`serial-${index}`} className="mt-1 pl-6 text-[13px]">
            Serial No.: ({item.serialNumber || "Pending"})
          </p>
        ))}

        <p className="mt-6 text-[13px]">
          Items will be invoiced once they have shipped or are ready for pickup.
        </p>

        {/* Totales */}
        <div className="ml-auto mt-4 w-[330px] text-[13px]">
          <div className="flex justify-between py-[3px]">
            <span className="font-semibold">Subtotal</span>
            <span>{money.format(subtotal)}</span>
          </div>
          <div className="flex justify-between py-[3px]">
            <span className="font-semibold">Sales Tax</span>
            <span>{money.format(tax)}</span>
          </div>
          <div className="flex justify-between py-[3px]">
            <span className="font-semibold">Total</span>
            <span>{money.format(order.total)}</span>
          </div>
          <div className="flex justify-between py-[3px]">
            <span className="font-semibold">Amount Due</span>
            <span>{money.format(amountDue)}</span>
          </div>
        </div>
      </section>

      {/* Métodos de pago */}
      <section className="mt-12">
        <p className="border-b-[1.5px] border-black pb-1 text-[16px] font-semibold">Payment Methods</p>
        <p className="mt-3 text-[13px]">
          {money.format(order.total)} charged to {card}
        </p>
        <p className="mt-1 text-[13px]">For a total of {money.format(order.total)}</p>
      </section>

      {/* Información adicional */}
      <section className="mt-12">
        <p className="text-[16px] font-semibold">Additional Information</p>

        <table className="mt-3 w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b-[1.5px] border-black text-left font-semibold">
              <th className="pb-1 pr-3 font-semibold">Invoice Number</th>
              <th className="pb-1 pr-3 font-semibold">Invoice Date</th>
              <th className="pb-1 font-semibold">Terms</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pt-2 pr-3">{invoiceNumber}</td>
              <td className="pt-2 pr-3">{longDate.format(created)}</td>
              <td className="pt-2">{order.paymentTerms || "Credit Card"}</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-6 text-[11px]">
          This order is subject to Apple&apos;s Sales and Refunds Policies.
        </p>
      </section>
    </article>
  );
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="min-h-screen bg-[#f5f5f7] py-10 print:bg-white print:py-0">
      <Suspense fallback={<p className="text-center text-[13px] text-[#6e6e73]">Loading invoice...</p>}>
        <InvoiceContent params={params} />
      </Suspense>
      <PrintButton />
    </main>
  );
}