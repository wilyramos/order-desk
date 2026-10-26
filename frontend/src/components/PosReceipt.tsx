import Code39Barcode from "@/components/Code39Barcode";
import { orderBarcodeValue } from "@/lib/code39";
import type { Order } from "@/types/order";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const headerDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const authDate = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const returnDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const RETURN_DAYS = 14;

export default function PosReceipt({ order }: { order: Order }) {
  const created = new Date(order.createdAt);
  const returnBy = new Date(created.getTime() + RETURN_DAYS * 24 * 60 * 60 * 1000);

  const subtotal = order.subtotal ?? order.total / 1.18;
  const tax = order.tax ?? order.total - subtotal;
  const number = order._id.slice(-10).toUpperCase();
  const barcode = orderBarcodeValue(order);

  const method = order.paymentMethod ?? "card";
  const brand = order.paymentCardBrand || "Card";
  const paidVia =
    method === "cash" ? "Cash" : method === "transfer" ? "Bank Transfer" : `${brand} Credit`;

  return (
<article className="receipt mx-auto w-full bg-white px-6 py-8 font-sans text-[12px] leading-snug text-black">      {/* Encabezado de la tienda */}
      <header className="text-[12px] leading-relaxed">
        <p className="text-[16px] font-semibold tracking-tight">Apple Order Desk</p>
        <p>Online Store</p>
        <p>support@apple-order-desk.local</p>
      </header>

      <p className="mt-4 border-t-[1.5px] border-black pt-3">{headerDate.format(created)}</p>

      {/* Productos */}
      <section className="mt-4 border-t-[1.5px] border-black pt-3">
        {order.items.map((item, index) => (
          <div key={`${item.product}-${index}`} className="mb-3">
            <div className="flex justify-between gap-4">
              <span className="uppercase">
                {item.name}
                {item.quantity > 1 && <span> × {item.quantity}</span>}
              </span>
              <span className="shrink-0">{money.format(item.price * item.quantity)}</span>
            </div>
            <div className="pl-4 text-[11px]">
              <p>Part Number: {item.sku || "—"}</p>
              {item.serialNumber && <p>Serial Number: {item.serialNumber}</p>}
              <p>Return Date: {returnDate.format(returnBy)}</p>
            </div>
          </div>
        ))}

        <p className="mt-2 text-[11px]">For Support, Visit: support.apple-order-desk.local</p>
      </section>

      {/* Condiciones */}
      <section className="mt-8 border-t-[1.5px] border-black pt-3 text-[11px] leading-relaxed">
        <p>
          Use of this store constitutes acceptance of our terms of sale and the terms of each product
          purchased.
        </p>
        <p className="mt-2">
          If you are not fully satisfied with your purchase, you can return your undamaged item within{" "}
          {RETURN_DAYS} days for a full refund with no restocking fee.
        </p>
        <p className="mt-2">For information about our privacy policy, contact the store.</p>
      </section>

      {/* Totales */}
      <section className="mt-6 border-t-[1.5px] border-black pt-3">
        <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-right">
          <span>Sub-Total</span>
          <span>{money.format(subtotal)}</span>
          <span>Tax</span>
          <span>{money.format(tax)}</span>
          <span>Total</span>
          <span>{money.format(order.total)}</span>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-x-6 text-right">
          <span>Payment Method</span>
          <span />
          <span className="mt-2">Amount Paid Via {paidVia}</span>
          <span className="mt-2">{money.format(order.amountDue ?? order.total)}</span>
        </div>

        {isCardPayment(method) && (
          <div className="mt-2 text-right text-[11px]">
            <p>•••• {order.paymentLast4 || "----"}</p>
            <p>Order {number}</p>
          </div>
        )}
      </section>

      {/* Bloque de autorización (solo pagos con tarjeta) */}
      {isCardPayment(method) && (
        <section className="mt-8 border-t-[1.5px] border-black pt-3 text-[11px] leading-relaxed">
          <p>
            Please debit my account •••• {order.paymentLast4 || "----"} by {money.format(order.total)} (Sale)
          </p>
          <p>Card Number: •••• {order.paymentLast4 || "----"}</p>
          <p>Date/Time: {authDate.format(created)}</p>
          <p>Card Type: Credit</p>
          <p>Preferred Name: {brand} Credit</p>
          <p>Verified by: Card on file</p>
        </section>
      )}

      {/* Código de barras */}
      <section className="mt-6 border-t-[1.5px] border-black pt-4">
        <div className="flex justify-center">
          <Code39Barcode value={barcode} height={44} narrow={1.5} />
        </div>
        <p className="mt-3 text-center text-[11px]">
          Apple Order Desk can recycle your old electronics. Thank you for your purchase.
        </p>
      </section>
    </article>
  );
}

function isCardPayment(method: string) {
  return method === "card";
}