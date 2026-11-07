"use client";

import { Fragment, useEffect, useRef } from "react";
import type { Order, OrderItem } from "@/types/order";
import { invoiceCss } from "./invoice-styles";
import Image from "next/image";

const DEFAULT_PRINT_URL =
  "https://secure6.store.apple.com/us/shop/order/print/invoice/10078/AFD4669200";

const money = (value: number): string =>
  "$" +
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const longDate = (d: Date): string =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(d);

const pad = (n: number): string => String(n).padStart(2, "0");

const printStamp = (d: Date): string => {
  const h = d.getHours() % 12 || 12;
  const suffix = d.getHours() < 12 ? "AM" : "PM";
  const year = String(d.getFullYear()).slice(-2);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${year}, ${h}:${pad(
    d.getMinutes()
  )} ${suffix}`;
};

const getCardDescription = (order: Order): string => {
  if (order.paymentMethod === "cash") return "Cash";
  if (order.paymentMethod === "transfer") return "Bank Transfer";
  const brand = (order.paymentCardBrand || "Visa").toUpperCase();
  const last4 = order.paymentLast4 || "6390";
  return `${brand} XXXXXXXXXXXX${last4}`;
};

function ItemRows({ item }: { item: OrderItem }) {
  const quantityFulfilled = item.quantityFulfilled ?? item.quantity;
  const totalItemPrice = item.price * quantityFulfilled;

  return (
    <Fragment>
      <tr>
        <td className="col-name" contentEditable suppressContentEditableWarning>{item.name}</td>
        <td contentEditable suppressContentEditableWarning>{item.sku || "MJQ64LL/A"}</td>
        <td contentEditable suppressContentEditableWarning>{money(item.price)}</td>
        <td contentEditable suppressContentEditableWarning>{item.quantity}</td>
        <td contentEditable suppressContentEditableWarning>{quantityFulfilled}</td>
        <td contentEditable suppressContentEditableWarning>{money(totalItemPrice)}</td>
      </tr>
      <tr>
        <td colSpan={6} className="serial" contentEditable suppressContentEditableWarning>
          Serial No.: ({item.serialNumber || "F25HK9XDKW"})
        </td>
      </tr>
    </Fragment>
  );
}

export default function InvoiceView({ order }: { order: Order }) {
  const stampRef = useRef<HTMLSpanElement>(null);

  const displayOrderNumber =
    order.orderNumber || `W${order._id.slice(-10).toUpperCase()}`;
  const invoiceNumber = order.invoiceNumber || "MD11642211";
  const created = new Date(order.createdAt);
  const printUrl = order.printUrl || DEFAULT_PRINT_URL;
  const cardDescription = getCardDescription(order);

  useEffect(() => {
    if (stampRef.current) stampRef.current.textContent = printStamp(new Date());
  }, []);

  const handlePrint = () => {
    if (stampRef.current) stampRef.current.textContent = printStamp(new Date());
    window.print();
  };

  return (
    <>
      <style>{invoiceCss}</style>

      <div className="toolbar no-print">
        <button type="button" onClick={handlePrint}>
          Print Invoice
        </button>
      </div>

      <div className="invoice-screen">
        <div className="sheet">
          {/* HEADER */}
          <div className="header-title-row">
            <Image
              src="/Apple_logo_black.svg"
              alt="Apple"
              width={14}
              height={17}
              unoptimized
              className="store-logo"
            />
            <span className="store-title" contentEditable suppressContentEditableWarning>Apple Store</span>
          </div>
          <div className="receipt-subtitle" contentEditable suppressContentEditableWarning>Invoice Receipt</div>
          <div className="do-not-pay" contentEditable suppressContentEditableWarning>Non-Payable</div>

          <div className="grid-2col">
            <div>
              <div className="field-label">Order Number:</div>
              <div className="" contentEditable suppressContentEditableWarning>{displayOrderNumber}</div>
            </div>
            <div>
              <div className="field-label">Order Date:</div>
              <div className="field-value" contentEditable suppressContentEditableWarning>{longDate(created)}</div>
            </div>
          </div>

          <div className="grid-2col">
            <div>
              <div className="field-label">Sold To:</div>
              <div className="field-value pre" contentEditable suppressContentEditableWarning>
                {order.customer.name}
                {"\n"}
                {order.customer.address}
              </div>
            </div>
            <div>
              <div className="field-label">Location:</div>
              <div className="field-value pre" contentEditable suppressContentEditableWarning>
                {order.location?.name || "Neotec Peru"}
                {"\n"}
                Apple Fifth Avenue
                {"\n"}
                {order.location?.address || "767 Fifth Avenue"}
                {"\n"}
                NEW YORK NY 10153-0023
                {"\n"}
                United States
              </div>
            </div>
          </div>

          <div className="customer-no" contentEditable suppressContentEditableWarning>
            Customer No.: {order.customerNumber || "900004"}
          </div>

          {/* PRODUCT DETAILS */}
          <div className="section-heading" contentEditable suppressContentEditableWarning>Order Details</div>
          <table className="items-table">
            <colgroup>
              <col style={{ width: "32%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Part<br/>Number</th>
                <th>Item<br/>Price</th>
                <th>Quantity<br/>Ordered</th>
                <th>Quantity<br/>Fulfilled</th>
                <th>Itemized<br/>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <ItemRows key={`${item.product}-${i}`} item={item} />
              ))}
            </tbody>
          </table>

          <div className="item-notice" contentEditable suppressContentEditableWarning>
            Items will be invoiced when shipped or ready for pickup.
          </div>

          {/* TOTALS */}
          <div className="totals-section">
            <table className="totals-table">
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td contentEditable suppressContentEditableWarning>{money(order.subtotal ?? order.total - (order.tax ?? 0))}</td>
                </tr>
                <tr>
                  <td>Sales Tax</td>
                  <td contentEditable suppressContentEditableWarning>{money(order.tax ?? 0)}</td>
                </tr>
                <tr>
                  <td>Total</td>
                  <td contentEditable suppressContentEditableWarning>{money(order.total)}</td>
                </tr>
                <tr>
                  <td>Amount Due</td>
                  <td contentEditable suppressContentEditableWarning>{money(order.amountDue ?? 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PAYMENT METHODS AND ADDITIONAL INFORMATION */}
          <div className="border-section-title" contentEditable suppressContentEditableWarning>Payment Methods</div>
          <div className="payment-text" contentEditable suppressContentEditableWarning>
            {money(order.total)} charged to {cardDescription}
            <br />
            For a total of {money(order.total)}
          </div>

          <div className="border-section-title plain" contentEditable suppressContentEditableWarning>Additional Information</div>
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
            <tbody>
              <tr>
                <td contentEditable suppressContentEditableWarning>{invoiceNumber}</td>
                <td contentEditable suppressContentEditableWarning>{longDate(created)}</td>
                <td contentEditable suppressContentEditableWarning>{order.paymentTerms || "Credit Card"}</td>
              </tr>
            </tbody>
          </table>

          <div className="policies-link" contentEditable suppressContentEditableWarning>
            This order is subject to Apple&apos;s Sales and Refund Policy
            <br />
            <a
              href="https://www.apple.com/shop/open/salespolicies"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.apple.com/shop/open/salespolicies
            </a>
          </div>

          {/* FOOTER */}
          <div className="footer">
            <div className="footer-top">
              <span contentEditable suppressContentEditableWarning>{printUrl}</span>
              <span ref={stampRef} contentEditable suppressContentEditableWarning />
            </div>
            <div className="footer-bottom" contentEditable suppressContentEditableWarning>1/1</div>
          </div>
        </div>
      </div>
    </>
  );
}