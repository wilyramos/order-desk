// File: frontend/src/app/(main)/ordenes/[id]/page.tsx

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

const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/Lima" });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/Lima" });

const STEPS = ["Order Placed", "Processing", "Ready for Pickup", "Picked Up"];

const RANK: Record<OrderStatus, number> = {
  pendiente: 0,
  confirmado: 1,
  enviado: 2,
  entregado: 3,
  recogido: 3,
  cancelado: -1,
};

function headline(status: OrderStatus, updatedAt: string, pickedUpAt?: string | null): string {
  const targetDate = pickedUpAt ? new Date(pickedUpAt) : new Date(updatedAt);
  const dateStr = shortDate.format(targetDate);
  switch (status) {
    case "pendiente":
      return "Order Placed";
    case "confirmado":
      return "Processing";
    case "enviado":
      return "Ready for Pickup";
    case "entregado":
      return `Delivered ${dateStr}`;
    case "recogido":
      return `Picked Up ${dateStr}`;
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

function extractModel(name: string): string {
  if (!name) return "";
  // 1. Cortar si tiene un guión o coma ("iPhone 17 - Lavanda" -> "iPhone 17")
  const baseName = name.split(/[-,]/)[0].trim();

  // 2. Coincidir con el modelo principal (ej. "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max")
  const match = baseName.match(/(iPhone\s+\d+(\s+(Pro\s+Max|Pro|Plus))?)/i);
  if (match) return match[0];

  // Si no coincide con el patrón iPhone estándar, devolver el texto previo al guión
  return baseName;
}

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user[0]}····@${domain}`;
  return `${user[0]}········${user[user.length - 1]}@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone) return phone;
  const last4 = phone.slice(-2);
  return `········${last4}`;
}

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

  const number = order.orderNumber || `W${order._id.slice(-9).toUpperCase()}`;
  const [first] = order.items;
  const subtotal = order.subtotal ?? (order.total - (order.tax ?? 0));
  const tax = order.tax ?? 0;
  const last4 = order.paymentLast4 || "6390";

  return (
    <div className="mx-auto max-w-[980px] pt-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between pb-8">
        <div>
          <h1 className="text-[32px] font-semibold leading-tight tracking-tight sm:text-[38px]">
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

      {first && (
        <section className="grid items-center gap-8 pb-16 pt-12 md:grid-cols-5">
          <div className="md:col-span-2 flex justify-center items-center">
            <div className="relative h-[250px] w-full max-w-[240px]">
              {first.image ? (
                <Image src={first.image} alt={first.name} fill sizes="260px" className="object-contain" priority />
              ) : (
                <div className="flex h-full items-center justify-center text-8xl font-semibold text-gray-200">
                  {first.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col justify-center">
            <span className="text-[17px] font-medium text-[#e30000]">
              {extractModel(first.name)}
            </span>
            <h2 className="text-[36px] font-semibold leading-tight tracking-tight md:text-[42px]">
              {headline(order.status, order.updatedAt, order.pickedUpAt)}
            </h2>
            <ProgressBar status={order.status} />
            <p className="mt-6 text-[17px] text-[#1d1d1f]">{message[order.status]}</p>
          </div>
        </section>
      )}

      <section className="border-t border-black/10 py-10 text-[14px]">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex justify-between gap-4 font-semibold text-[#1d1d1f]">
              <span>{first?.name || "iPhone 18 Pro 256GB Glacier"}</span>
              <span className="shrink-0">{money.format(first ? first.price * first.quantity : order.total)}</span>
            </div>
            <div className="mt-8 border-t border-black/10 pt-4">
              <a
                href="https://www.apple.com/shop/open/salespolicies"
                target="_blank"
                rel="noreferrer"
                className="text-[#0066cc] hover:underline"
              >
                Request a return
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              <Image src="/bag.jpg" alt="Bag Icon" width={20} height={20} className="object-contain" />
            </div>
            <div>
              <p className="font-semibold text-[#1d1d1f]">In-store pickup location:</p>
              <p className="text-[#6e6e73]">{order.location?.name || "Apple Fifth Avenue"}</p>
              <p className="text-[#6e6e73]">{order.location?.address}</p>
              <p className="text-[#6e6e73]">NEW YORK, NY 10153-0023</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="mt-0.5 text-[#1d1d1f]">
              <PersonIcon />
            </span>
            <div>
              <p className="font-semibold text-[#1d1d1f]">Pickup contact:</p>
              <p className="text-[#6e6e73]">{order.customer.name}</p>
              <p className="text-[#6e6e73]">{maskPhone(order.customer.phone)}</p>
              <p className="text-[#6e6e73] break-all">{maskEmail(order.customer.email)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 py-12 max-w-3xl">
        <h2 className="mb-8 text-[28px] font-semibold tracking-tight text-[#1d1d1f]">
          Payment summary
        </h2>

        <div className="grid gap-10 text-[14px] md:grid-cols-3">
          <div>
            <p className="mb-3 font-semibold text-[#1d1d1f]">Pay in full with:</p>
            <div className="flex items-center gap-2">
              <CardBrandLogo brand={order.paymentCardBrand || "Visa"} />
              <span className="text-[#1d1d1f] font-medium">····{last4}</span>
            </div>
          </div>

          <div>
            <p className="mb-1 font-semibold text-[#1d1d1f]">Billing address:</p>
            <p className="text-[#1d1d1f]">{order.customer.name}</p>
            <p className="text-[#6e6e73] whitespace-pre-line">{order.customer.address}</p>
          </div>

          <div>
            <p className="mb-1 font-semibold text-[#1d1d1f]">Contact information:</p>
            <p className="break-all text-[#6e6e73]">{maskEmail(order.customer.email)}</p>
            <p className="text-[#6e6e73]">{maskPhone(order.customer.phone)}</p>
            <Link
              href={`/ordenes/${order._id}/editar`}
              className="mt-3 inline-block text-[#0066cc] hover:underline"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="mt-16 text-[15px] space-y-4 max-w-xl">
          <div className="flex justify-between text-[#1d1d1f]">
            <span>Subtotal</span>
            <span>{money.format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#1d1d1f]">
            <span>VAT / Tax</span>
            <span>{money.format(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-4 text-[17px] font-bold text-[#1d1d1f]">
            <span>Your total</span>
            <span>{money.format(order.total)}</span>
          </div>
        </div>
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