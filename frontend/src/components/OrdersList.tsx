import Image from "next/image";
import Link from "next/link";
import { getOrders, ticketUrl } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/order";

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const STATUS_TEXT: Record<OrderStatus, (order: Order) => string> = {
  pendiente: () => "Procesando",
  confirmado: () => "Pedido confirmado",
  enviado: () => "En camino",
  entregado: (order) => `Entregado el ${dateFormatter.format(new Date(order.updatedAt))}`,
  recogido: (order) => `Recogido el ${dateFormatter.format(new Date(order.updatedAt))}`,
  cancelado: () => "Cancelado",
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
      <div className="rounded-2xl bg-white p-12 text-center border border-[#d2d2d7]">
        <p className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">Aún no tienes pedidos.</p>
        <p className="mt-2 text-base text-[#6e6e73]">
          Aquí solo aparecerán las compras de los últimos 18 meses.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-full bg-[#0071e3] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0077ed]"
        >
          Explorar productos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {nuevo && (
        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 border border-[#d2d2d7]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1d7f3c] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-[#1d1d1f]">¡Gracias por tu pedido!</p>
            <p className="text-sm text-[#6e6e73]">
              Número de pedido: <span className="font-medium text-[#1d1d1f]">W{shortId(nuevo)}</span>
            </p>
          </div>
        </div>
      )}

      <ul className="space-y-6 md:space-y-8">
        {orders.map((order) => {
          const mainItem = order.items[0];
          const extraCount = order.items.length - 1;

          return (
            <li
              key={order._id}
              className="overflow-hidden rounded-2xl bg-white border border-[#d2d2d7]"
            >
              {/* Barra superior del pedido (Metadatos) */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d2d2d7] bg-[#f5f5f7]/30 px-6 py-4">
                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="text-xs text-[#6e6e73]">Fecha del pedido</p>
                    <p className="text-sm font-medium text-[#1d1d1f]">
                      {dateFormatter.format(new Date(order.createdAt))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6e6e73]">Total</p>
                    <p className="text-sm font-medium text-[#1d1d1f]">
                      {priceFormatter.format(order.total)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end">
                  <p className="text-xs text-[#6e6e73]">Número de pedido <span className="font-medium text-[#1d1d1f]">W{shortId(order._id)}</span></p>
                  <a
                    href={ticketUrl(order._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#0071e3] hover:underline"
                  >
                    Ver recibo
                  </a>
                </div>
              </div>

              {/* Contenido principal del pedido */}
              <div className="flex flex-col gap-6 px-6 py-8 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  {/* Imagen del producto */}
                  <div className="relative h-32 w-32 shrink-0 md:h-40 md:w-40">
                    {mainItem?.image ? (
                      <Image
                        src={mainItem.image}
                        alt={mainItem.name}
                        fill
                        sizes="(max-width: 768px) 128px, 160px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#f5f5f7] text-4xl font-light text-[#86868b]">
                        {mainItem?.name.charAt(0) ?? "A"}
                      </div>
                    )}
                  </div>

                  {/* Detalles del producto y Estado */}
                  <div className="flex flex-col justify-center pt-2 md:pt-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] md:text-3xl">
                      {STATUS_TEXT[order.status](order)}
                    </h2>
                    <p className="mt-2 text-base text-[#1d1d1f]">
                      {mainItem?.name}
                    </p>
                    <p className="mt-1 text-sm text-[#6e6e73]">
                      Cantidad: {mainItem?.quantity}
                    </p>

                    {extraCount > 0 && (
                      <p className="mt-2 text-sm text-[#0071e3]">
                        + {extraCount} artículo{extraCount === 1 ? "" : "s"} más
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex w-full shrink-0 flex-col gap-3 md:w-56 md:pt-4">
                  <Link
                    href={`/ordenes/${order._id}`}
                    className="flex w-full items-center justify-center rounded-full bg-[#0071e3] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0077ed]"
                  >
                    Seguir envío
                  </Link>
                  <Link
                    href={`/ordenes/${order._id}`}
                    className="flex w-full items-center justify-center rounded-full bg-[#e8e8ed] px-4 py-2.5 text-sm font-medium text-[#1d1d1f] transition hover:bg-[#d2d2d7]"
                  >
                    Ver detalles del pedido
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}