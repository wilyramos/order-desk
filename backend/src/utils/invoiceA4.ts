import type { Order } from "../models/order.model.js";

const money = (value: number | string) => {
  const num = Number(value) || 0;
  const isInt = Number.isInteger(num);
  return (
    "$" +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: isInt ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(num)
  );
};

const longDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(d);

const pad = (n: number) => String(n).padStart(2, "0");

// Formato del pie de impresión del navegador: 21/10/26, 9:54 a. m.
const printStamp = (d: Date) => {
  const h = d.getHours() % 12 || 12;
  const suffix = d.getHours() < 12 ? "a. m." : "p. m.";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}, ${h}:${pad(d.getMinutes())} ${suffix}`;
};

export function buildInvoiceA4Html(order: any): string {
  const frontendUrl = process.env.URL_FRONTEND || "http://localhost:3000";
  const logoUrl = `${frontendUrl}/Apple_logo_black.svg`;

  const displayOrderNumber =
    order.orderNumber || `W${String(order._id).slice(-10).toUpperCase()}`;
  const invoiceNumber = order.invoiceNumber || "MD11673451";
  const created = new Date(order.createdAt);
  const printUrl =
    order.printUrl ||
    "https://secure9.store.apple.com/shop/order/print/invoice/10078/AFD4712735";
  const stamp = printStamp(new Date());

  const brand = (order.paymentCardBrand || "Visa").toUpperCase();
  const last4 = order.paymentLast4 || "6390";
  const total = order.total;

  const cardDescription =
    order.paymentMethod === "cash"
      ? "Cash on pickup"
      : order.paymentMethod === "transfer"
        ? "Bank transfer"
        : `${brand} XXXXXXXXXXXX${last4}`;

  const itemsHtml = order.items
    .map(
      (item: any) => `
        <tr>
          <td class="col-name">${item.name}</td>
          <td>${item.sku || "MJQ64LL/A"}</td>
          <td>${money(item.price)}</td>
          <td>${item.quantity}</td>
          <td>${item.quantityFulfilled ?? item.quantity}</td>
        </tr>
        <tr>
          <td colspan="5" class="serial">Serial No.: (${item.serialNumber || "DQDRWCNVTY"})</td>
        </tr>`
    )
    .join("");

  const itemsColgroup = `
    <colgroup>
      <col style="width: 38.5%;" />
      <col style="width: 18.3%;" />
      <col style="width: 11.2%;" />
      <col style="width: 18.1%;" />
      <col style="width: 13.9%;" />
    </colgroup>`;

  const infoColgroup = `
    <colgroup>
      <col style="width: 38%;" />
      <col style="width: 38%;" />
      <col style="width: 24%;" />
    </colgroup>`;

  const footer = (page: number) => `
    <div class="footer">
      <div class="footer-top">
        <span>${printUrl}</span>
        <span>${stamp}</span>
      </div>
      <div class="footer-bottom">Página ${page} de 2</div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    @page {
      size: letter;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #000000;
      font-size: 10.5pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }

    /* Cada hoja Letter */
    .sheet {
      width: 8.5in;
      height: 11in;
      position: relative;
      overflow: hidden;
      padding: 0.4in 0.57in 0.9in 0.57in;
      background: #fff;
      page-break-after: always;
      break-after: page;
    }
    .sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Encabezado */
    .header-title-row {
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .store-logo {
      height: 17px;
      width: auto;
    }
    .store-title {
      font-size: 16pt;
      font-weight: 600;
      letter-spacing: -0.4px;
      line-height: 1;
    }
    .receipt-subtitle {
      font-size: 13pt;
      font-weight: 600;
      letter-spacing: -0.2px;
      margin-top: 4px;
    }
    .do-not-pay {
      margin-top: 14px;
      margin-bottom: 0.42in;
    }

    /* Dos columnas: izquierda ~59.5%, derecha el resto */
    .grid-2col {
      display: grid;
      grid-template-columns: 59.5% 1fr;
      margin-bottom: 0.4in;
    }
    .field-label {
      font-weight: 600;
    }
    .field-value {
      margin-top: 2px;
    }

    .customer-no {
      margin-top: 0.12in;
      margin-bottom: 0.4in;
    }

    .section-heading {
      font-size: 13pt;
      font-weight: 600;
      letter-spacing: -0.2px;
      margin-bottom: 0.14in;
    }

    /* Tablas: columnas pegadas, alineadas a la izquierda */
    .items-table,
    .additional-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .items-table th,
    .additional-table th {
      text-align: left;
      font-weight: 600;
      font-size: 10.5pt;
      letter-spacing: -0.25px;
      padding: 0 0 2px 0;
      border-bottom: 2.5px solid #000;
      vertical-align: bottom;
      white-space: nowrap;
      overflow: hidden;
    }
    .items-table td,
    .additional-table td {
      padding: 4px 0 0 0;
      vertical-align: top;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: clip;
    }
    .items-table td.col-name {
      text-transform: uppercase;
    }
    .items-table td.serial {
      padding: 2px 0 0 0;
      padding-left: 0.35in;
      white-space: normal;
    }
    /* Tabla partida: continuación en la hoja 2 */
    .additional-table.continued {
      border-top: 2.5px solid #000;
    }
    .additional-table.continued td {
      padding-top: 10px;
    }

    .item-notice {
      margin-top: 0.3in;
    }

    /* Etiquetas de totales, alineadas con la columna de cantidades */
    .totals {
      margin-top: 0.12in;
      margin-left: 79%;
      font-weight: 600;
    }
    .totals-row {
      font-size: 10.5pt;
      height: 19pt;
      line-height: 19pt;
    }

    /* Secciones con línea gruesa */
    .border-section-title {
      font-size: 13pt;
      font-weight: 600;
      letter-spacing: -0.2px;
      border-bottom: 2.5px solid #000;
      padding-bottom: 5px;
      margin-top: 0.45in;
      margin-bottom: 0.1in;
    }
    .payment-text {
      line-height: 1.5;
    }

    .policies-link {
      margin-top: 0.45in;
      line-height: 1.5;
    }
    .policies-link a {
      color: #0066cc;
      text-decoration: underline;
    }

    /* Pie de impresión del navegador */
    .footer {
      position: absolute;
      left: 0.57in;
      right: 0.57in;
      bottom: 0.6in;
      font-size: 8pt;
      color: #6e6e6e;
      letter-spacing: 0.1px;
    }
    .footer-top {
      display: flex;
      justify-content: space-between;
    }
    .footer-bottom {
      text-align: right;
      margin-top: 1px;
    }

    @media print {
      body { background: #fff; }
    }
  </style>
</head>
<body onload="window.print()">

  <!-- HOJA 1 -->
  <div class="sheet">
    <div class="header-title-row">
      <img src="${logoUrl}" alt="Apple" class="store-logo" />
      <span class="store-title">Apple Store</span>
    </div>
    <div class="receipt-subtitle">Invoice Receipt</div>
    <div class="do-not-pay">Do Not Pay</div>

    <div class="grid-2col">
      <div>
        <div class="field-label">Order Number:</div>
        <div class="field-value">${displayOrderNumber}</div>
      </div>
      <div>
        <div class="field-label">Order Date:</div>
        <div class="field-value">${longDate(created)}</div>
      </div>
    </div>

    <div class="grid-2col">
      <div>
        <div class="field-label">Sold To:</div>
        <div class="field-value">
          ${order.customer.name}<br />
          ${order.customer.address.replace(/\n/g, "<br />")}
        </div>
      </div>
      <div>
        <div class="field-label">Location:</div>
        <div class="field-value">
          ${order.customer.name}<br />
          ${order.location?.name || "Apple Fifth Avenue"}<br />
          ${order.location?.address}<br />
          NEW YORK NY 10153-0023<br />
          United States
        </div>
      </div>
    </div>

    <div class="customer-no">Customer No:${order.customerNumber || "900004"}</div>

    <div class="section-heading">Order Details</div>
    <table class="items-table">
      ${itemsColgroup}
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Product Number</th>
          <th>Item Price</th>
          <th>Quantity Ordered</th>
          <th>Quantity Fulfilled</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="item-notice">Items will be invoiced once they have shipped or are ready for pickup.</div>

    <div class="totals">
      <div class="totals-row">Subtotal</div>
      <div class="totals-row">Sales Tax</div>
      <div class="totals-row">Total</div>
      <div class="totals-row">Amount Due</div>
    </div>

    <div class="border-section-title">Payment Methods</div>
    <div class="payment-text">
      ${money(total)} charged to ${cardDescription}<br />
      For a total of ${money(total)}
    </div>

    <div class="border-section-title" style="border-bottom: none; padding-bottom: 0; margin-top: 0.55in; margin-bottom: 0.3in;">Additional Information</div>
    <table class="additional-table">
      ${infoColgroup}
      <thead>
        <tr>
          <th>Invoice Number</th>
          <th>Invoice Date</th>
          <th>Terms</th>
        </tr>
      </thead>
    </table>

    ${footer(1)}
  </div>

  <!-- HOJA 2 -->
  <div class="sheet">
    <table class="additional-table continued">
      ${infoColgroup}
      <tbody>
        <tr>
          <td>${invoiceNumber}</td>
          <td>${longDate(created)}</td>
          <td>${order.paymentTerms || "Credit Card"}</td>
        </tr>
      </tbody>
    </table>

    <div class="policies-link">
      This order is subject to Apple's Sales and Refunds Policies<br />
      <a href="https://www.apple.com/shop/open/salespolicies" target="_blank">https://www.apple.com/shop/open/salespolicies</a>
    </div>

    ${footer(2)}
  </div>

</body>
</html>`;
}