import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getOrder, ticketUrl } from "@/lib/orders";
import type { OrderStatus } from "@/types/order";
import InvoiceModal from "@/components/InvoiceModal";
import CardBrandLogo from "@/components/CardBrandLogo";

const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
});

const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

const STEPS = ["Order Placed", "Processing", "Ready for Pickup", "Picked Up"];

// Posición de cada estado en la barra
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

    const number = order._id.slice(-10).toUpperCase();
    const [first, ...rest] = order.items;
    const subtotal = order.subtotal ?? order.total / 1.18;
    const tax = order.tax ?? order.total - subtotal;
    const card =
        order.paymentLast4 && order.paymentCardBrand
            ? `${order.paymentCardBrand} ···${order.paymentLast4}`
            : "Card on file";

    return (
        <div className="mx-auto max-w-[860px]">
            {/* Encabezado */}
            <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="text-[44px] font-semibold leading-tight tracking-tight md:text-[52px]">
                    Details of your order.
                </h1>
                <div className="text-right text-[12px] leading-relaxed text-[#1d1d1f]">
                    <p>Order Number: {number}</p>
                    <p>Order Placed: {longDate.format(new Date(order.createdAt))}</p>

                    <InvoiceModal orderId={order._id} />
                </div>
            </header>

            {/* Producto principal y estado */}
            {first && (
                <section className="grid items-center gap-12 py-16 md:grid-cols-2">
                    <div className="relative mx-auto h-[300px] w-full max-w-[260px]">
                        {first.image ? (
                            <Image src={first.image} alt={first.name} fill sizes="260px" className="object-contain" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-8xl font-semibold text-gray-200">
                                {first.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-[13px] text-[#1d1d1f]">{first.name}</p>
                        <h2 className="mt-1 text-[40px] font-semibold leading-tight tracking-tight md:text-[46px]">
                            {headline(order.status, order.updatedAt)}
                        </h2>
                        <ProgressBar status={order.status} />
                        <p className="mt-6 text-[19px] text-[#1d1d1f]">{message[order.status]}</p>
                    </div>
                </section>
            )}

            {/* Detalles: producto, entrega y contacto */}
            <section className="grid gap-10 border-t border-black/10 py-10 text-[15px] md:grid-cols-3">
                <div>
                    {order.items.map((item, index) => (
                        <div key={`${item.product}-${index}`} className="mb-4 flex justify-between gap-4">
                            <span>
                                {item.name}
                                {item.quantity > 1 && <span className="text-[#6e6e73]"> × {item.quantity}</span>}
                            </span>
                            <span className="shrink-0">{money.format(item.price * item.quantity)}</span>
                        </div>
                    ))}
                    <div className="mt-4 border-t border-black/10 pt-4">
                        <a href="#" className="text-[#0066cc] hover:underline">
                            Check return eligibility
                        </a>
                    </div>
                </div>

                <div className="flex gap-3">
                    <span className="mt-0.5 text-[#1d1d1f]">
                        <BagIcon />
                    </span>
                    <div>
                        <p className="font-semibold">Pickup location:</p>
                        <p>Apple</p>
                        <p className="text-[#6e6e73]">Online store</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <span className="mt-0.5 text-[#1d1d1f]">
                        <PersonIcon />
                    </span>
                    <div>
                        <p className="font-semibold">Pickup contact:</p>
                        <p>{order.customer.name}</p>
                        <p className="text-[#6e6e73]">{order.customer.phone}</p>
                        <p className="text-[#6e6e73]">{order.customer.email}</p>
                    </div>
                </div>
            </section>

            {/* Resumen de pago */}
            <section className="border-t border-black/10 py-16">
                <h2 className="mb-8 text-[24px] font-semibold tracking-tight">Payment Summary</h2>

                <div className="grid gap-10 text-[15px] md:grid-cols-3">
                   
                   <div className="flex items-center gap-3">
  {order.paymentMethod === "card" || !order.paymentMethod ? (
    <>
      <CardBrandLogo brand={order.paymentCardBrand} />
      <span>{card}</span>
    </>
  ) : (
    <span>{card}</span>
  )}
</div>

                    <div>
                        <p className="mb-3 font-semibold">Bills to:</p>
                        <p>{order.customer.name}</p>
                        <p className="text-[#1d1d1f]">{order.customer.address}</p>
                    </div>

                    <div>
                        <p className="mb-3 font-semibold">Contact information:</p>
                        <p className="break-all">{order.customer.email}</p>
                        <p>{order.customer.phone}</p>
                        <Link href={`/ordenes/${order._id}/editar`} className="mt-2 inline-block text-[#0066cc] hover:underline">
                            Edit
                        </Link>
                    </div>
                </div>

                <div className="mt-12 ml-auto max-w-[480px] space-y-3 text-[15px]">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{money.format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Estimated Tax</span>
                        <span>{money.format(tax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-black/10 pt-4 text-[17px] font-semibold">
                        <span>Total</span>
                        <span>{money.format(order.total)}</span>
                    </div>
                </div>

                {rest.length > 0 && (
                    <p className="mt-10 text-sm text-[#6e6e73]">
                        This order includes {rest.length} more item{rest.length > 1 ? "s" : ""}.
                    </p>
                )}
            </section>
        </div>
    );
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <main className="bg-white px-6 pb-24 pt-16 text-[#1d1d1f]">
            <Suspense fallback={<p className="text-center text-[#6e6e73]">Loading order...</p>}>
                <OrderDetail params={params} />
            </Suspense>
        </main>
    );
}