// components/PrintableReceipt.tsx
import Image from "next/image";
import { Source_Sans_3 } from "next/font/google";
import Code39Barcode from "@/components/Code39Barcode";
import { orderBarcodeValue } from "@/lib/code39";
import type { Order } from "@/types/order";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

const RETURN_DAYS = 14;

const CSS = `
  @page {
    size: 21.59cm 27.94cm;
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  .rcp {
    font-family: var(--font-source-sans), "Source Sans 3", "Source Sans Pro", Arial, sans-serif;
    color: #000;
    font-size: 10.5px;
    font-weight: 400;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .rcp-container {
    width: 21.59cm !important;
    min-height: 27.94cm;
    box-sizing: border-box;
    padding: 2.5cm 5cm;
    margin: 0 auto;
    position: relative;
    background: #fff;
  }

  .rcp-header {
    margin: 0;
    padding: 0;
    line-height: 1.5;
  }

  .rcp-logo {
    display: block;
    width: 22px;
    height: 26px;
    object-fit: contain;
    margin: 0 0 12px;
  }

  .rcp-bold {
    font-weight: 700;
  }

  .rcp-hr {
    display: block;
    width: 100%;
    height: 0;
    padding: 0;
    border: 0;
    border-top: 1.5px solid #000;
  }

  .rcp-date {
    margin: 0;
    padding: 0;
    line-height: 1.5;
  }

  .rcp-products {
    margin: 0;
    padding: 0;
  }

  .rcp-product {
    margin: 0 0 24px;
    padding: 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .rcp-product:last-child {
    margin-bottom: 0;
  }

  .rcp-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    line-height: 1.5;
  }

  .rcp-product-name {
    flex: 1;
    min-width: 0;
  }

  .rcp-product-price {
    flex-shrink: 0;
    text-align: right;
    white-space: nowrap;
  }

  .rcp-product-details {
    margin-top: 18px;
    padding: 0;
    line-height: 1.5;
  }

  .rcp-product-details > div {
    margin: 0;
    padding: 0;
  }

  .rcp-support {
    margin-top: 10px !important;
  }

  .rcp-legal {
    font-size: 10px;
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }

  .rcp-legal p {
    margin: 0 0 8px;
    padding: 0;
  }

  .rcp-legal p:last-child {
    margin-bottom: 0;
  }

  .rcp-totals {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: 0;
    row-gap: 4px;
    width: 100%;
    line-height: 1.5;
  }

  .rcp-totals .lbl {
    text-align: right;
    padding-right: 64px;
    white-space: nowrap;
  }

  .rcp-totals .val {
    text-align: right;
    white-space: nowrap;
  }

  .rcp-center {
    text-align: center;
  }

  .rcp-barcode {
    display: inline-block;
    line-height: 0;
    padding: 0;
    margin: 0;
  }

  .rcp-page-break {
    page-break-before: always;
    break-before: page;
    margin-top: 40px;
  }

  .rcp-authorization {
    line-height: 1.5;
  }

  .rcp-authorization > div {
    margin: 0;
    padding: 0;
  }

  .rcp-authorization-links {
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .rcp-authorization-links > div {
    margin-bottom: 6px;
  }

  .rcp-authorization-links > div:last-child {
    margin-bottom: 0;
  }

  @media screen {
    body {
      background: #525659;
    }

    .rcp-container {
      margin: 40px auto;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    }
  }

  @media print {
    html,
    body {
      width: 100%;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }

    header,
    footer {
      display: none !important;
    }

    .rcp {
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .rcp-container {
      width: 21.59cm !important;
      min-height: 27.94cm;
      margin: 0 auto;
      box-shadow: none;
    }

    .rcp-page-break {
      page-break-before: always;
      break-before: page;
    }
  }
`;

const money = (value: number) =>
  "$ " +
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_SHORT = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "June",
  "July",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
];

const pad = (n: number) => String(n).padStart(2, "0");

function headerDate(d: Date): string {
  const h = d.getHours() % 12 || 12;
  const ampm = d.getHours() < 12 ? "AM" : "PM";

  return `${MONTHS[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()} ${pad(h)}:${pad(d.getMinutes())} ${ampm}`;
}

function authDate(d: Date): string {
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function shortDate(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}`;
}

export default function PrintableReceipt({ order }: { order: Order }) {
  const created = new Date(order.createdAt);

  const returnBy = new Date(
    created.getTime() + RETURN_DAYS * 24 * 60 * 60 * 1000
  );

  const total = order.total;
  const subtotal = order.subtotal ?? total;
  const tax = order.tax ?? 0;

  const method = order.paymentMethod ?? "card";
  const isCard = method === "card";

  const brand = (order.paymentCardBrand || "AMERICAN EXPRESS").toUpperCase();
  const last4 = order.paymentLast4 || "7544";
  const barcode = orderBarcodeValue(order);

  const paidVia =
    method === "cash"
      ? "CASH"
      : method === "transfer"
        ? "BANK TRANSFER"
        : `${brand} (Contactless)`;

  return (
    <div
      className={`rcp ${sourceSans.variable}`}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <style>{CSS}</style>

      <div className="rcp-container">
        {/* HEADER */}
        <div className="rcp-header">
          <Image
            src="/Apple_logo_black.svg"
            alt="Apple"
            width={22}
            height={26}
            unoptimized
            className="rcp-logo"
          />

          <div className="rcp-bold">Apple West 14th Street</div>
          <div>401 West 14th Street</div>
          <div>New York, NY 10014</div>
          <div>west14thstreet@apple.com</div>
          <div>212-444-3400</div>
          <div>DCA License # 1273537 &amp; 1273536</div>
          <div>www.apple.com/retail/west14thstreet</div>
        </div>

        <hr
          className="rcp-hr"
          style={{ marginTop: "16px", marginBottom: "8px" }}
        />

        <div className="rcp-date">{headerDate(created)}</div>
        <hr
          className="rcp-hr"
          style={{
            marginTop: "34px",
            marginBottom: "2px",
            borderTopWidth: "1.5px",
          }}
        />

        {/* PRODUCTS */}
        <div className="rcp-products">
          {order.items.map((item, index) => (
            <div key={`${item.product}-${index}`} className="rcp-product">
              <div className="rcp-row rcp-bold">
                <span className="rcp-product-name">{item.name}</span>

                <span className="rcp-product-price">
                  {money(item.price * item.quantity)}
                </span>
              </div>

              <div className="rcp-product-details">
                <div>Part Number: {item.sku || "MJWC4LL/A"}</div>

                {item.serialNumber && (
                  <div>Serial Number: {item.serialNumber}</div>
                )}

                {item.imei && <div>IMEI: {item.imei}</div>}

                <div>Return Date: {shortDate(returnBy)}</div>

                <div className="rcp-support">
                  For Support, Visit: www.apple.com/support
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LEGAL TERMS */}
        <hr
          className="rcp-hr"
          style={{ marginTop: "24px", marginBottom: "16px" }}
        />

        <div className="rcp-legal">
          <p>
            Use of iPhone constitutes acceptance of the iPhone terms and
            conditions and other third party terms and conditions found in
            the iPhone box, or at http://www.apple.com/legal/sla/.
          </p>

          <p>
            If you are not fully satisfied with your iPhone purchase, you can
            return your undamaged iPhone within {RETURN_DAYS} days of purchase
            for a full refund with no restocking fee.
          </p>

          <p>
            If you disagree with these terms and conditions you can return
            the iPhone in accordance with the Apple Store&apos;s return policy
            http://www.apple.com/legal/sales_policies/retail.html
          </p>

          <p>
            For information on Apple&apos;s privacy policy see
            www.apple.com/privacy
          </p>
        </div>

        <hr
          className="rcp-hr"
          style={{ marginTop: "16px", marginBottom: "16px" }}
        />

        {/* TOTALS */}
        <div className="rcp-totals">
          <span className="lbl">Sub-Total</span>
          <span className="val">{money(subtotal)}</span>

          <span className="lbl">Tax</span>
          <span className="val">{money(tax)}</span>

          <span className="lbl rcp-bold">Total</span>
          <span className="val rcp-bold">{money(total)}</span>
        </div>

        {/* PAYMENT METHOD */}
        <div className="rcp-totals" style={{ marginTop: "16px" }}>
          <span className="lbl rcp-bold" style={{ paddingBottom: "4px" }}>
            Payment Method
          </span>
          <span className="val"></span>

          <span className="lbl">Amount Paid Via {paidVia}</span>
          <span className="val">{money(total)}</span>

          {isCard && (
            <>
              <span className="lbl">•••• {last4}</span>
              <span className="val"></span>

              <span className="lbl">{order.invoiceNumber || "841650"}</span>
              <span className="val"></span>
            </>
          )}
        </div>

        {/* BARCODE */}
        <hr
          className="rcp-hr"
          style={{
            marginTop: "32px",
            marginBottom: "16px",
            borderTopWidth: "3px",
          }}
        />

        <div className="rcp-center">
          <div className="rcp-barcode">
            <Code39Barcode value={barcode} height={30} narrow={1} />
          </div>
          <div
            style={{
              marginTop: "4px",
              fontSize: "8.5px",
              letterSpacing: "1.5px",
              fontWeight: "bold",
            }}
          >
            * {barcode.split("").join(" ")} *
          </div>
        </div>

        {/* CARD AUTHORIZATION */}
        {isCard && (
          <div className="rcp-page-break">
            <hr className="rcp-hr" style={{ marginBottom: "16px" }} />

            <div className="rcp-authorization">
              <div>
                Please debit my account{" "}
                <span className="rcp-base">•••• {last4}</span> by{" "}
                {money(total)} (Sale)
              </div>

              <div>
                Card Number: <span className="rcp-">•••• {last4}</span>
              </div>

              <div>Date/Time: {authDate(created)}</div>
              <div>Application ID: A000000025010402</div>
              <div>Device Id: 0830</div>
              <div>Card Type: Credit</div>
              <div>TVR: 0000008000</div>
              <div>TSI: E800</div>
              <div>No CVM</div>
            </div>

            <hr
              className="rcp-hr"
              style={{ marginTop: "24px", marginBottom: "16px" }}
            />

            <div className="rcp-center rcp-authorization-links">
              <div>
                https://www.apple.com/legal/sales-support/sales-policies/retail_us.html
              </div>

              <div>
                Apple can recycle your old electronics, visit apple.com/recycle
                to learn how
              </div>

              <div>
                Learn how to set up your product and transfer your data from
                home at support.apple.com.
              </div>
            </div>

            <hr className="rcp-hr" style={{ marginTop: "16px" }} />
          </div>
        )}
      </div>
    </div>
  );
}