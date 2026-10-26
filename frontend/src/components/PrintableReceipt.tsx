import Image from "next/image";
import Code39Barcode from "@/components/Code39Barcode";
import { orderBarcodeValue } from "@/lib/code39";
import type { Order } from "@/types/order";

const RETURN_DAYS = 14;

const CSS = `
  @page { 
    size: letter; 
    margin: 0; 
  }

  .rcp { 
    font-family: Arial, Helvetica, sans-serif; 
    color: #000; 
    font-size: 6.5pt; 
    line-height: 1.2; 
  }

  .rcp-container {
    width: 4.2in;
    box-sizing: border-box;
    padding: 1.2in 0.25in 1.2in 0.25in;
    margin: 0 auto;
    position: relative;
    background: #fff;
  }

  .rcp-hr { 
    border: none; 
    border-top: 1.2px solid #000; 
    margin: 18px 0; 
  }

  .rcp-row { 
    display: flex; 
    justify-content: space-between; 
    gap: 8px; 
  }

  .rcp-indent { 
    padding-left: 0.18in; 
  }

  .rcp-small { 
    font-size: 6pt; 
    line-height: 1.15;
  }

  .rcp-legal { 
    font-size: 5.5pt; 
    line-height: 1.2; 
  }

  .rcp-legal p { 
    margin: 0 0 8px 0; 
  }

  .rcp-center { 
    text-align: center; 
  }

  .rcp-totals { 
    display: grid; 
    grid-template-columns: 1fr auto; 
    row-gap: 3px; 
  }

  .rcp-totals .lbl { 
    text-align: right; 
    padding-right: 0.6in; 
  }

  .rcp-totals .val { 
    text-align: right; 
  }

  .rcp-page-break {
    page-break-before: always;
    break-before: page;
    margin-top: 40px;
  }

  @media screen {
    body { background: #1e1e1e; }
    .rcp-container { 
      margin: 40px auto; 
      box-shadow: 0 2px 12px rgba(0,0,0,.3); 
    }
  }

  @media print {
    html, body { 
      background: #fff !important; 
      margin: 0 !important; 
      padding: 0 !important; 
    }
    header, footer { 
      display: none !important; 
    }
    .rcp-container { 
      margin: 0 auto; 
      box-shadow: none; 
      padding: 1in 0.25in 1in 0.25in;
    }
  }
`;

const money = (value: number) =>
  "$ " + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan.","Feb.","Mar.","Apr.","May","June","July","Aug.","Sept.","Oct.","Nov.","Dec."];

const pad = (n: number) => String(n).padStart(2, "0");

function headerDate(d: Date): string {
  const h = d.getHours() % 12 || 12;
  const ampm = d.getHours() < 12 ? "AM" : "PM";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${h}:${pad(d.getMinutes())} ${ampm}`;
}

function authDate(d: Date): string {
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function shortDate(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function PrintableReceipt({ order }: { order: Order }) {
  const created = new Date(order.createdAt);
  const returnBy = new Date(created.getTime() + RETURN_DAYS * 24 * 60 * 60 * 1000);

  const total = order.total;
  const subtotal = order.subtotal ?? total;
  const tax = order.tax ?? 0;
  const amountDue = order.amountDue ?? total;

  const method = order.paymentMethod ?? "card";
  const isCard = method === "card";
  const brand = order.paymentCardBrand || "Visa";
  const last4 = order.paymentLast4 || "8107";
  const barcode = orderBarcodeValue(order);

  const paidVia =
    method === "cash" ? "Cash" : method === "transfer" ? "Bank Transfer" : `${brand} Credit (Chip)`;

  return (
    <div className="rcp" style={{ width: "100%", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <style>{CSS}</style>

      <div className="rcp-container" style={{ paddingTop: "2in" }}>
        {/* ENCABEZADO */}
        <Image
          src="/Apple_logo_black.svg"
          alt="Apple"
          width={18}
          height={22}
          unoptimized
          style={{ display: "block", marginBottom: "10px" }}
        />
        <div className="rcp-small">
          <div>{"Apple Rockingham Park"}</div>
          <div>99 Rockingham Park Blvd.STE W143A</div>
          <div>Salem, NH 03079</div>
          <div>rockinghampark@apple.com</div>
          <div>603-328-3140</div>
          <div>www.apple.com/retail/rockinghampark</div>
        </div>

        <hr className="rcp-hr" style={{ marginBottom: 2 }} />
        <div>{headerDate(created)}</div>
        <hr className="rcp-hr" style={{ marginBottom: 0 }} />

        {/* DETALLE DE PRODUCTOS */}
        {order.items.map((item, index) => (
          <div key={`${item.product}-${index}`} style={{ marginTop: index === 2 ? 2 : 12, marginBottom: 12 }}>
            <div className="rcp-row">
              <span>{item.name}</span>
              <span>{money(item.price * item.quantity)}</span>
            </div>
            <div className="rcp-small" style={{ marginTop: 4 }}>
              <div className="rcp-row" style={{ justifyContent: "flex-start" }}>
                <span>Part Number: {item.sku || "MJQ64LL/A"}</span>
              </div>
              <div className="rcp-row" style={{ justifyContent: "flex-start" }}>
                <span>Serial Number: {item.serialNumber || "MYJRG9GPM7"}</span>
              </div>
              <div className="rcp-row" style={{ justifyContent: "flex-start" }}>
                <span>IMEI: {item.imei || "353916270183924"}</span>
              </div>
              <div className="rcp-row" style={{ justifyContent: "flex-start" }}>
                <span>Return Date: {shortDate(returnBy)}</span>
              </div>
            </div>

            <div className="rcp-small" style={{ marginTop: 6 }}>
              For Support, Visit: www.apple.com/support
            </div>
          </div>
        ))}

        <hr className="rcp-hr" style={{ marginTop: 70 }} />

        {/* TÉRMINOS LEGALES */}
        <div className="rcp-legal">
          <p>
            Use of iPhone constitutes acceptance of the iPhone terms and conditions and other third party
            terms and conditions found in the iPhone box, or at http://www.apple.com/legal/sla/.
          </p>
          <p>
            If you are not fully satisfied with your iPhone purchase, you can return your undamaged iPhone
            within {RETURN_DAYS} days of purchase for a full refund with no restocking fee.
          </p>
          <p>
            If you disagree with these terms and conditions you can return the iPhone in accordance with the
            Apple Store&apos;s return policy http://www.apple.com/legal/sales_policies/retail.html
          </p>
          <p>For information on Apple&apos;s privacy policy see www.apple.com/privacy</p>
        </div>

        <hr className="rcp-hr" />

        {/* TOTALES */}
        <div className="rcp-totals" style={{ marginTop: 12 }}>
          <span className="lbl">Sub-Total</span>
          <span className="val">{money(subtotal)}</span>
          <span className="lbl">Tax</span>
          <span className="val">{money(tax)}</span>
          <span className="lbl">Total</span>
          <span className="val">{money(total)}</span>
        </div>

        <div className="rcp-totals" style={{ marginTop: 16 }}>
          <span className="lbl" style={{ textAlign: "center", gridColumn: "1 / span 2" }}>
            Payment Method
          </span>
          <span className="lbl" style={{ marginTop: 5 }}>
            Amount Paid Via {paidVia}
          </span>
          <span className="val" style={{ marginTop: 5 }}>
            {money(amountDue)}
          </span>
          {isCard && (
            <>
              <span className="lbl">•••• {last4}</span>
              <span className="val" />
              <span className="lbl">{order.invoiceNumber || "007302"}</span>
              <span className="val" />
            </>
          )}
        </div>

        <hr className="rcp-hr" style={{ marginTop: 60 }} />

        {/* CÓDIGO DE BARRAS */}
        <div className="rcp-center" style={{ marginTop: 14 }}>
          <Code39Barcode value={barcode} height={24} narrow={0.8} />
        </div>

        {/* VOUCHER DE AUTORIZACIÓN (SI ES PAGO CON TARJETA) */}
        {isCard && (
          <div className="rcp-page-break">
            <hr className="rcp-hr" style={{ marginTop: 0 }} />
            <div className="rcp-small" style={{ lineHeight: 1.45 }}>
              <div>Please debit my account •••• {last4} by {money(total)} (Sale)</div>
              <div>Card Number: •••• {last4}</div>
              <div>Date/Time: {authDate(created)}</div>
              <div>Application ID: A0000000031010</div>
              <div>Application PAN Sequence Number: 00</div>
              <div>Device Id: 0300</div>
              <div>Card Type: Credit</div>
              <div>Preferred Name: {brand} Credit</div>
              <div>TVR: 0080048000</div>
              <div>TSI: E800</div>
              <div>Verified by PIN</div>
            </div>

            <hr className="rcp-hr" style={{ marginTop: 20 }} />

            <div className="rcp-center rcp-small" style={{ lineHeight: 1.4, marginTop: 14 }}>
              <div>https://www.apple.com/legal/sales-support/sales-policies/retail_us.html</div>
              <div style={{ marginTop: 4 }}>
                Apple can recycle your old electronics, visit apple.com/recycle to learn how
              </div>
              <div style={{ marginTop: 4 }}>
                Learn how to set up your product and transfer your data from home at support.apple.com.
              </div>
            </div>
            <hr className="rcp-hr" style={{ marginTop: 14 }} />
          </div>
        )}
      </div>
    </div>
  );
}