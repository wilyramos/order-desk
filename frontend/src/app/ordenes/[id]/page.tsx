import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getOrder } from "@/lib/orders";
import type { OrderStatus } from "@/types/order";
import InvoiceModal from "@/components/InvoiceModal";
import CardBrandLogo from "@/components/CardBrandLogo";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

const STEPS = ["Order Placed", "Processing", "Ready for Pickup", "Picked Up"];

const RANK: Record<OrderStatus, number> = {
  pendiente: 0,
  confirmado: 1,
  enviado: 2,
  entregado: 3,
  recogido: 3,
  cancelado: -1,
};

function headline(status: OrderStatus, updatedAt: string): string {
  const date = shortDate.format(new Date(updatedAt));
  switch (status) {
    case "pendiente":
      return "Order Placed";
    case "confirmado":
      return "Processing";
    case "enviado":
      return "Ready for Pickup";
    case "entregado":
      return `Delivered ${date}`;
    case "recogido":
      return `Picked Up ${date}`;
    case "cancelado":
      return "Canceled";
  }
}

const message: Record<OrderStatus, string> = {
  pendiente: "We've received your order and are reviewing it.",
  confirmado: "Your order is being prepared.",
  enviado: "Your order is ready for pickup.",
  entregado: "Your order has been delivered.",
  recogido: "Your item has been picked up.",
  cancelado: "This order has been canceled.",
};

function ProgressBar({ status }: { status: OrderStatus }) {
  if (status === "cancelado") return null;

  const current = RANK[status];
  const percent = (current / (STEPS.length - 1)) * 100;

  return (
    <div className="mt-6">
      <div className="relative h-1 w-full rounded-full bg-black/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#1d7f3c]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-[12px] text-[#6e6e73]">
        {STEPS.map((label, index) => (
          <span key={label} className={index === current ? "font-semibold text-[#1d1d1f]" : ""}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 7h12l1 13H5L6 7Z" strokeLinejoin="round" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 18.2a7 7 0 0 1 11 0" />
    </svg>
  );
}

async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const number = order.invoiceNumber || `W${order._id.slice(-9).toUpperCase()}`;
  const [first, ...rest] = order.items;
  const subtotal = order.subtotal ?? order.total;
  const tax = order.tax ?? 0;

  const card =
    order.paymentMethod === "cash"
      ? "Cash"
      : order.paymentMethod === "transfer"
      ? "Bank Transfer"
      : order.paymentLast4
      ? `${order.paymentCardBrand || "Visa"} ···· ${order.paymentLast4}`
      : "Visa ···· 8107";

  return (
    <div className="mx-auto max-w-[860px]">
      {/* Encabezado estilo Apple */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[40px] font-semibold leading-tight tracking-tight sm:text-[48px]">
            Details of your order.
          </h1>
        </div>
        <div className="flex flex-col gap-1 text-left sm:text-right text-[13px] leading-relaxed text-[#1d1d1f]">
          <p className="font-medium">Order Number: {number}</p>
          <p className="text-[#6e6e73]">Order Placed: {longDate.format(new Date(order.createdAt))}</p>
          <div className="mt-2 flex flex-wrap gap-3 sm:justify-end">
            <InvoiceModal orderId={order._id} />
            <Link
              href={`/ordenes/${order._id}/recibo`}
              target="_blank"
              className="text-[#0066cc] hover:underline"
            >
              Print receipt ›
            </Link>
          </div>
        </div>
      </header>

      {/* Producto principal y Estado */}
      {first && (
        <section className="grid items-center gap-12 py-12 md:grid-cols-2 border-b border-black/10">
          <div className="relative mx-auto h-[280px] w-full max-w-[260px]">
            {first.image ? (
              <Image src={first.image} alt={first.name} fill sizes="260px" className="object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl font-semibold text-gray-200">
                {first.name.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <p className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-wider">{first.name}</p>
            <h2 className="mt-1 text-[36px] font-semibold leading-tight tracking-tight md:text-[42px]">
              {headline(order.status, order.updatedAt)}
            </h2>
            <ProgressBar status={order.status} />
            <p className="mt-6 text-[17px] text-[#1d1d1f]">{message[order.status]}</p>
          </div>
        </section>
      )}

      {/* Lista de Items e Información de Recojo */}
      <section className="grid gap-10 py-10 text-[15px] md:grid-cols-3 border-b border-black/10">
        <div>
          <p className="mb-3 font-semibold text-[#1d1d1f]">Items Ordered</p>
          {order.items.map((item, index) => (
            <div key={`${item.product}-${index}`} className="mb-4">
              <div className="flex justify-between gap-4">
                <span className="font-medium text-[#1d1d1f]">
                  {item.name}
                  {item.quantity > 1 && <span className="text-[#6e6e73]"> × {item.quantity}</span>}
                </span>
                <span className="shrink-0 font-medium">{money.format(item.price * item.quantity)}</span>
              </div>
              <div className="mt-1 text-[12px] text-[#6e6e73] space-y-0.5">
                <p>Part Number: {item.sku || "MJQ64LL/A"}</p>
                {item.serialNumber && <p>Serial Number: {item.serialNumber}</p>}
                {item.imei && <p>IMEI: {item.imei}</p>}
              </div>
            </div>
          ))}
          <div className="mt-4 border-t border-black/10 pt-4">
            <a href="https://www.apple.com/legal/sales-support/sales-policies/retail_us.html" target="_blank" rel="noreferrer" className="text-[#0066cc] hover:underline text-[13px]">
              Check return eligibility ›
            </a>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="mt-0.5 text-[#1d1d1f]">
            <BagIcon />
          </span>
          <div>
            <p className="font-semibold">Pickup Location:</p>
            <p>{order.location?.name || "Apple Rockingham Park"}</p>
            <p className="text-[#6e6e73] text-[13px]">99 Rockingham Park Blvd.</p>
            <p className="text-[#6e6e73] text-[13px]">Salem, NH 03079</p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="mt-0.5 text-[#1d1d1f]">
            <PersonIcon />
          </span>
          <div>
            <p className="font-semibold">Pickup Contact:</p>
            <p>{order.customer.name}</p>
            <p className="text-[#6e6e73] text-[13px]">{order.customer.phone}</p>
            <p className="text-[#6e6e73] text-[13px] break-all">{order.customer.email}</p>
          </div>
        </div>
      </section>

      {/* Resumen de Pago */}
      <section className="py-12">
        <h2 className="mb-8 text-[22px] font-semibold tracking-tight">Payment Summary</h2>

        <div className="grid gap-10 text-[15px] md:grid-cols-3">
          <div className="flex items-start gap-3">
            {order.paymentMethod === "card" || !order.paymentMethod ? (
              <>
                <CardBrandLogo brand={order.paymentCardBrand || "Visa"} />
                <div>
                  <p className="font-semibold">Payment Method</p>
                  <p className="text-[#6e6e73] text-[13px]">{card}</p>
                </div>
              </>
            ) : (
              <div>
                <p className="font-semibold">Payment Method</p>
                <p className="text-[#6e6e73] text-[13px]">{card}</p>
              </div>
            )}
          </div>

          <div>
            <p className="mb-1 font-semibold">Billing Address:</p>
            <p>{order.customer.name}</p>
            <p className="text-[#6e6e73] text-[13px]">{order.customer.address}</p>
          </div>

          <div>
            <p className="mb-1 font-semibold">Contact Information:</p>
            <p className="break-all text-[13px]">{order.customer.email}</p>
            <p className="text-[13px] text-[#6e6e73]">{order.customer.phone}</p>
            <Link
              href={`/ordenes/${order._id}/editar`}
              className="mt-3 inline-block text-[#0066cc] hover:underline text-[13px]"
            >
              Edit details ›
            </Link>
          </div>
        </div>

        {/* Desglose de Totales */}
        <div className="mt-10 ml-auto max-w-[400px] space-y-2 text-[15px]">
          <div className="flex justify-between text-[#6e6e73]">
            <span>Subtotal</span>
            <span className="text-[#1d1d1f] font-medium">{money.format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#6e6e73]">
            <span>Tax</span>
            <span className="text-[#1d1d1f] font-medium">{money.format(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-3 text-[19px] font-semibold text-[#1d1d1f]">
            <span>Total</span>
            <span>{money.format(order.total)}</span>
          </div>
        </div>

        {rest.length > 0 && (
          <p className="mt-8 text-sm text-[#6e6e73]">
            This order includes {rest.length} additional item{rest.length > 1 ? "s" : ""}.
          </p>
        )}
      </section>
    </div>
  );
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="bg-white px-6 pb-24 pt-12 text-[#1d1d1f]">
      <Suspense fallback={<p className="text-center text-[#6e6e73] py-20">Loading order details...</p>}>
        <OrderDetail params={params} />
      </Suspense>
    </main>
  );
}