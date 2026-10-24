import { IGV_RATE } from "../models/order.model.js";

interface TicketItem {
  name: string;
  sku?: string | null;
  serialNumber?: string | null;
  price: number;
  quantity: number;
  quantityFulfilled?: number | null;
}




interface TicketOrder {
  _id: unknown;
  invoiceNumber?: string | null;
  customerNumber?: string | null;
  customer?: { name?: string | null; email?: string | null; phone?: string | null; address?: string | null } | null;
  location?: { name?: string | null; address?: string | null } | null;
  items: TicketItem[];
  subtotal?: number | null;
  tax?: number | null;
  taxRate?: number | null;
  total: number;
  amountDue?: number | null;
  paymentMethod?: string | null;
  paymentCardBrand?: string | null;
  paymentLast4?: string | null;
  paymentTerms?: string | null;
  status: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "PEN" }).format(value);

const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });
const longDateTime = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" });

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Order Placed",
  confirmado: "Processing",
  enviado: "Shipped",
  entregado: "Delivered",
  recogido: "Picked Up",
  cancelado: "Canceled",
};

export function buildTicketHtml(order: TicketOrder): string {
  const orderNumber = String(order._id).slice(-10).toUpperCase();
  const invoiceNumber = order.invoiceNumber || `INV-${orderNumber}`;
  const created = new Date(order.createdAt ?? Date.now());
  const customer = order.customer ?? {};
  const location = order.location ?? {};

  const taxRate = order.taxRate ?? IGV_RATE;
  const subtotal = order.subtotal ?? round2(order.total / (1 + taxRate));
  const tax = order.tax ?? round2(order.total - subtotal);
  const amountDue = order.amountDue ?? order.total;

  const paymentLine =
    order.paymentMethod === "cash"
      ? "Cash on pickup"
      : order.paymentMethod === "transfer"
        ? "Bank transfer"
        : `${escapeHtml(order.paymentCardBrand || "Card")} ···${escapeHtml(order.paymentLast4 || "----")}`;

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.sku || "—")}</td>
          <td class="r">${money(item.price)}</td>
          <td class="r">${item.quantity}</td>
          <td class="r">${item.quantityFulfilled ?? 0}</td>
          <td>${escapeHtml(item.serialNumber || "Pending")}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${escapeHtml(invoiceNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 40px 20px;
      background: #f5f5f7;
      color: #1d1d1f;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif;
      font-size: 14px;
    }
    .sheet { max-width: 860px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
    .top { display: flex; justify-content: space-between; gap: 24px; }
    h1 { font-size: 28px; font-weight: 600; margin: 0 0 4px; letter-spacing: -.01em; }
    .muted { color: #6e6e73; }
    .meta { text-align: right; line-height: 1.6; }
    .meta a { color: #0066cc; }
    .divider { height: 1px; background: rgba(0,0,0,.1); margin: 28px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
    .label { font-weight: 600; margin-bottom: 6px; }
    .value { line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid rgba(0,0,0,.08); font-size: 13px; vertical-align: top; }
    th { color: #6e6e73; font-weight: 600; }
    .r { text-align: right; }
    .summary { margin-left: auto; width: 300px; margin-top: 16px; }
    .summary div { display: flex; justify-content: space-between; padding: 6px 0; }
    .summary .due { border-top: 1px solid rgba(0,0,0,.1); margin-top: 8px; padding-top: 12px; font-weight: 600; font-size: 16px; }
    .payment { margin-top: 24px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #f5f5f7; font-weight: 600; }
    .footer { margin-top: 32px; font-size: 12px; color: #6e6e73; line-height: 1.6; }
    .print-btn { display: block; margin: 32px auto 0; padding: 12px 24px; border: none; border-radius: 999px; background: #0066cc; color: #fff; font-size: 15px; cursor: pointer; }
    .print-btn:hover { background: #0071e3; }
    @media (max-width: 680px) {
      .sheet { padding: 24px; }
      .grid { grid-template-columns: 1fr; }
      .top { flex-direction: column; }
      .meta { text-align: left; }
    }
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { box-shadow: none; border-radius: 0; max-width: 100%; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <main class="sheet">
    <header class="top">
      <div>
        <h1>Apple Order</h1>
        <p class="muted">Invoice Receipt</p>
      </div>
      <div class="meta">
        <div>Order Number: <strong>${escapeHtml(orderNumber)}</strong></div>
        <div>Order Date: ${escapeHtml(longDate.format(created))}</div>
        <div>Invoice Number: ${escapeHtml(invoiceNumber)}</div>
        <div>Invoice Date: ${escapeHtml(longDate.format(created))}</div>
        <div>Status: <span class="status">${escapeHtml(STATUS_LABELS[order.status] ?? order.status)}</span></div>
      </div>
    </header>

    <div class="divider"></div>

    <section class="grid">
      <div>
        <p class="label">Sold To</p>
        <p class="value">
          ${escapeHtml(customer.name)}<br />
          ${escapeHtml(customer.address)}
        </p>
      </div>
      <div>
        <p class="label">Location</p>
        <p class="value">
          ${escapeHtml(location.name)}<br />
          ${escapeHtml(location.address)}
        </p>
      </div>
      <div>
        <p class="label">Customer No</p>
        <p class="value">${escapeHtml(order.customerNumber || "—")}</p>
        <p class="label" style="margin-top:16px">Contact</p>
        <p class="value">
          ${escapeHtml(customer.email)}<br />
          ${escapeHtml(customer.phone)}
        </p>
      </div>
    </section>

    <div class="divider"></div>

    <section>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Product Number</th>
            <th class="r">Item Price</th>
            <th class="r">Qty Ordered</th>
            <th class="r">Qty Fulfilled</th>
            <th>Serial No.</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="summary">
        <div><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div><span>Sales Tax (${Math.round(taxRate * 100)}%)</span><span>${money(tax)}</span></div>
        <div><span>Total</span><span>${money(order.total)}</span></div>
        <div class="due"><span>Amount Due</span><span>${money(amountDue)}</span></div>
      </div>
    </section>

    <section class="payment grid">
      <div>
        <p class="label">Payment Methods</p>
        <p class="value">${money(order.total)} charged to ${paymentLine}</p>
        <p class="value">For a total of ${money(order.total)}</p>
      </div>
      <div>
        <p class="label">Terms</p>
        <p class="value">${escapeHtml(order.paymentTerms || "Credit Card")}</p>
      </div>
      <div>
        <p class="label">Last Updated</p>
        <p class="value">${escapeHtml(longDateTime.format(new Date(order.updatedAt ?? created)))}</p>
      </div>
    </section>

    <p class="footer">
      Items will be invoiced once they have shipped or are ready for pickup.<br />
      This document was generated by Apple. It is a practice document and has no tax validity.
    </p>

    <button class="print-btn" onclick="window.print()">Print or save as PDF</button>
  </main>
</body>
</html>`;
}