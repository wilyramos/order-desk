import Image from "next/image";
import Link from "next/link";
import { getOrders, ticketUrl } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/order";

const priceFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const STATUS_TEXT: Record<OrderStatus, (order: Order) => string> = {
  pendiente: () => "Pendiente de confirmación",
  confirmado: () => "Confirmado",
  enviado: () => "En camino",
  entregado: (order) => `Entregado el ${dateFormatter.format(new Date(order.updatedAt))}`,
  recogido: (order) => `Picked Up ${dateFormatter.format(new Date(order.updatedAt))}`,
  cancelado: () => "Cancelado",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pendiente: "text-[#b25000]",
  confirmado: "text-[#0066cc]",
  enviado: "text-[#5e3bd1]",
  entregado: "text-[#1d7f3c]",
  recogido: "text-[#1d7f3c]",
  cancelado: "text-[#c01818]",
};

const shortId = (id: string) => id.slice(-8).toUpperCase();

export default async function OrdersList({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { nuevo } = await searchParams;
  const orders = await getOrders();

  if (orders.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-2xl text-[#6e6e73]">Aún no tienes pedidos.</p>
        <Link href="/" className="mt-6 inline-block text-lg text-[#0066cc] hover:underline">
          Ir a la tienda ›
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {nuevo && (
        <div className="mb-10 flex items-center gap-5 rounded-3xl bg-[#e6f7ec] p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1d7f3c] text-xl text-white">
            ✓
          </span>
          <div>
            <p className="text-xl font-semibold">¡Gracias por tu compra!</p>
            <p className="text-[#1d1d1f]/70">
              Tu pedido Nº {shortId(nuevo)} se registró correctamente.
            </p>
          </div>
        </div>
      )}

      <ul className="grid gap-6">
        {orders.map((order) => {
          const isNew = order._id === nuevo;

          return (
            <li
              key={order._id}
              className={`rounded-3xl bg-[#f5f5f7] p-6 sm:p-8 ${isNew ? "ring-2 ring-[#0066cc]" : ""}`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-lg font-semibold ${STATUS_COLOR[order.status]}`}>
                  {STATUS_TEXT[order.status](order)}
                </p>
                <p className="text-sm text-[#6e6e73]">
                  Pedido Nº {shortId(order._id)} · {dateFormatter.format(new Date(order.createdAt))}
                </p>
              </div>

              <div className="mt-6 divide-y divide-black/10">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.product}-${index}`}
                    className="flex items-center gap-5 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl font-semibold text-gray-300">
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[17px] font-semibold text-[#1d1d1f]">{item.name}</p>
                      <p className="text-sm text-[#6e6e73]">
                        Cantidad: {item.quantity} · {priceFormatter.format(item.price)} c/u
                      </p>
                    </div>

                    <p className="shrink-0 text-[17px] font-semibold">
                      {priceFormatter.format(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-lg text-[#1d1d1f]">
                  Total <span className="font-semibold">{priceFormatter.format(order.total)}</span>
                </p>

                <div className="flex gap-6 text-[17px]">
                  <Link href={`/ordenes/${order._id}`} className="text-[#0066cc] hover:underline">
                    Ver detalle ›
                  </Link>
                  <a
                    href={ticketUrl(order._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0066cc] hover:underline"
                  >
                    Ver comprobante ›
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}