// components/invoice/InvoiceView.tsx
"use client";

import { Fragment, useEffect, useRef } from "react";
import type { Order, OrderItem } from "@/types/order";
import { invoiceCss } from "./invoice-styles";
import Image from "next/image";

const DEFAULT_PRINT_URL =
  "https://secure9.store.apple.com/shop/order/print/invoice/10078/AFD4712735";

const money = (value: number): string =>
  "$" +
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const longDate = (d: Date): string =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(d);

const pad = (n: number): string => String(n).padStart(2, "0");

// Pie de impresión del navegador: 21/10/26, 9:54 a. m.
const printStamp = (d: Date): string => {
  const h = d.getHours() % 12 || 12;
  const suffix = d.getHours() < 12 ? "a. m." : "p. m.";
  const year = String(d.getFullYear()).slice(-2);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${year}, ${h}:${pad(
    d.getMinutes()
  )} ${suffix}`;
};

const getCardDescription = (order: Order): string => {
  if (order.paymentMethod === "cash") return "Cash on pickup";
  if (order.paymentMethod === "transfer") return "Bank transfer";
  const brand = (order.paymentCardBrand || "Visa").toUpperCase();
  const last4 = order.paymentLast4 || "6390";
  return `${brand} XXXXXXXXXXXX${last4}`;
};

function ItemRows({ item }: { item: OrderItem }) {
  return (
    <Fragment>
      <tr>
        <td className="col-name">{item.name}</td>
        <td>{item.sku || "MJQ64LL/A"}</td>
        <td>{money(item.price)}</td>
        <td>{item.quantity}</td>
        <td>{item.quantityFulfilled ?? item.quantity}</td>
      </tr>
      <tr>
        <td colSpan={5} className="serial">
          Serial No.: ({item.serialNumber || "DQDRWCNVTY"})
        </td>
      </tr>
    </Fragment>
  );
}

export default function InvoiceView({ order }: { order: Order }) {
  const stampRef = useRef<HTMLSpanElement>(null);

  const displayOrderNumber =
    order.orderNumber || `W${order._id.slice(-10).toUpperCase()}`;
  const invoiceNumber = order.invoiceNumber || "MD11673451";
  const created = new Date(order.createdAt);
  const printUrl = order.printUrl || DEFAULT_PRINT_URL;
  const cardDescription = getCardDescription(order);

  // La fecha del pie se rellena en cliente para evitar diferencias de hidratación.
  useEffect(() => {
    if (stampRef.current) stampRef.current.textContent = printStamp(new Date());
  }, []);

  // El PDF solo se genera al pulsar el botón.
  const handlePrint = () => {
    if (stampRef.current) stampRef.current.textContent = printStamp(new Date());
    window.print();
  };

  const footer = (page: number) => (
    <div className="footer">
      <div className="footer-top">
        <span>{printUrl}</span>
        <span ref={page === 1 ? stampRef : undefined} />
      </div>
      <div className="footer-bottom">Página {page} de 2</div>
    </div>
  );

  return (
    <>
      <style>{invoiceCss}</style>

      <div className="toolbar no-print">
        <button type="button" onClick={handlePrint}>
          Imprimir factura
        </button>
      </div>

      <div className="invoice-screen">
        {/* HOJA 1 */}
        <div className="sheet">
          <div className="header-title-row">
            <Image
              src="/Apple_logo_black.svg"
              alt="Apple"
              width={14}
              height={17}
              unoptimized
              className="store-logo"
            />
            <span className="store-title">Apple Store</span>
          </div>
          <div className="receipt-subtitle">Invoice Receipt</div>
          <div className="do-not-pay">Do Not Pay</div>

          <div className="grid-2col">
            <div>
              <div className="field-label">Order Number:</div>
              <div className="field-value">{displayOrderNumber}</div>
            </div>
            <div>
              <div className="field-label">Order Date:</div>
              <div className="field-value">{longDate(created)}</div>
            </div>
          </div>

          <div className="grid-2col">
            <div>
              <div className="field-label">Sold To:</div>
              <div className="field-value pre">
                {order.customer.name}
                {"\n"}
                {order.customer.address}
              </div>
            </div>
            <div>
              <div className="field-label">Location:</div>
              <div className="field-value pre">
                {order.customer.name}
                {"\n"}
                {order.location?.name || "Apple Fifth Avenue"}
                {"\n"}
                {order.location?.address || "767 Fifth Avenue"}
                {"\n"}
                NEW YORK NY 10153-0023
                {"\n"}
                United States
              </div>
            </div>
          </div>

          <div className="customer-no">
            Customer No:{order.customerNumber || "900004"}
          </div>

          <div className="section-heading">Order Details</div>
          <table className="items-table">
            <colgroup>
              <col style={{ width: "38.5%" }} />
              <col style={{ width: "18.3%" }} />
              <col style={{ width: "11.2%" }} />
              <col style={{ width: "18.1%" }} />
              <col style={{ width: "13.9%" }} />
            </colgroup>
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
              {order.items.map((item, i) => (
                <ItemRows key={`${item.product}-${i}`} item={item} />
              ))}
            </tbody>
          </table>

          <div className="item-notice">
            Items will be invoiced once they have shipped or are ready for pickup.
          </div>

          <div className="totals">
            <div className="totals-row">Subtotal</div>
            <div className="totals-row">Sales Tax</div>
            <div className="totals-row">Total</div>
            <div className="totals-row">Amount Due</div>
          </div>

          <div className="border-section-title">Payment Methods</div>
          <div className="payment-text">
            {money(order.total)} charged to {cardDescription}
            <br />
            For a total of {money(order.total)}
          </div>

          <div className="border-section-title plain">Additional Information</div>
          <table className="additional-table">
            <colgroup>
              <col style={{ width: "38%" }} />
              <col style={{ width: "38%" }} />
              <col style={{ width: "24%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Invoice Date</th>
                <th>Terms</th>
              </tr>
            </thead>
          </table>

          {footer(1)}
        </div>

        {/* HOJA 2 */}
        <div className="sheet">
          <table className="additional-table continued">
            <colgroup>
              <col style={{ width: "38%" }} />
              <col style={{ width: "38%" }} />
              <col style={{ width: "24%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td>{invoiceNumber}</td>
                <td>{longDate(created)}</td>
                <td>{order.paymentTerms || "Credit Card"}</td>
              </tr>
            </tbody>
          </table>

          <div className="policies-link">
            This order is subject to Apple&apos;s Sales and Refunds Policies
            <br />
            <a
              href="https://www.apple.com/shop/open/salespolicies"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.apple.com/shop/open/salespolicies
            </a>
          </div>

          {footer(2)}
        </div>
      </div>
    </>
  );
}