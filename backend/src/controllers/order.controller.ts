// File: backend/src/controllers/order.controller.ts

import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { createHash } from "node:crypto";
import puppeteer, { type Browser } from "puppeteer";
import { Product } from "../models/product.model.js";
import {
  Order,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  IGV_RATE,
  type OrderAttrs,
} from "../models/order.model.js";
import { buildTicketHtml } from "../utils/ticket.js";
import { buildInvoiceA4Html } from "../utils/invoiceA4.js";

type OrderStatusValue = (typeof ORDER_STATUSES)[number];
type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];
type OrderDoc = OrderAttrs & { _id: mongoose.Types.ObjectId };

const FULFILLED_STATUSES: readonly OrderStatusValue[] = ["enviado", "entregado", "recogido"];

const EMAIL_SENDER = { name: "MacStore", email: "MacStore@order-pickup.com" } as const;

const EMAIL_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #1d1d1f; padding: 20px;">
    <p style="margin-bottom: 24px;">Thank you for shopping at the Store.</p>
    <p>To tell us about your experience, <a href="#" style="color: #ff6600; text-decoration: none;">click here</a>.</p>
  </div>
`;

const PAYMENT_FIELD_MAP = {
  cardBrand: "paymentCardBrand",
  last4: "paymentLast4",
  terms: "paymentTerms",
  authCode: "paymentAuthCode",
  applicationId: "paymentApplicationId",
  deviceId: "paymentDeviceId",
  cardType: "paymentCardType",
  tvr: "paymentTvr",
  tsi: "paymentTsi",
} as const;

interface BrevoEmailPayload {
  sender: { name: string; email: string };
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  attachment?: { name: string; content: string }[];
}

async function sendBrevoEmail(payload: BrevoEmailPayload): Promise<unknown> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY no está definida");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Brevo respondió ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

async function generatePdfBuffer(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const toOrderStatus = (value: unknown): OrderStatusValue | undefined =>
  ORDER_STATUSES.find((status) => status === value);

const toPaymentMethod = (value: unknown): PaymentMethodValue =>
  PAYMENT_METHODS.find((method) => method === value) ?? "card";

const isFulfilled = (status: string) =>
  FULFILLED_STATUSES.includes(status as OrderStatusValue);

const applyFulfillment = (order: {
  status: string;
  items: { quantity: number; quantityFulfilled: number }[];
}) => {
  const fulfilled = isFulfilled(order.status);
  order.items.forEach((item) => {
    item.quantityFulfilled = fulfilled ? item.quantity : 0;
  });
};

const timestamp = () => new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);

function ensureValidId(id: string, res: Response): boolean {
  if (mongoose.isValidObjectId(id)) return true;
  res.status(400).json({ message: "Invalid ID" });
  return false;
}

async function findOrderDoc(id: string): Promise<OrderDoc | null> {
  return (await Order.findById(id).lean()) as OrderDoc | null;
}

function applyPaymentUpdate(order: any, p: Record<string, any>) {
  if (p.method) order.paymentMethod = toPaymentMethod(p.method);
  for (const [field, target] of Object.entries(PAYMENT_FIELD_MAP)) {
    if (p[field] !== undefined) order[target] = p[field];
  }
}

const generateInvoiceNumber = () => `MD${Math.floor(10000000 + Math.random() * 90000000)}`;
const generateOrderNumber = () => `W${Math.floor(1000000000 + Math.random() * 9000000000)}`;
const generateLast4Digits = () => Math.floor(1000 + Math.random() * 9000).toString();

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { customer, items, payment } = req.body;

    if (!customer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Incomplete order data" });
    }

    const invoiceNumber = req.body.invoiceNumber || generateInvoiceNumber();
    const orderNumber = req.body.orderNumber || generateOrderNumber();

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      orderItems.push({
        product: String(product._id),
        name: product.name,
        sku: String(product._id).slice(-8).toUpperCase(),
        serialNumber: "",
        imei: "",
        price: product.price,
        quantity,
        quantityFulfilled: 0,
        image: product.image,
      });
      total += product.price * quantity;
    }

    total = round2(total);
    const taxRate = IGV_RATE;
    const subtotal = round2(total / (1 + taxRate));
    const tax = round2(total - subtotal);

    const customerNumber = `C${createHash("sha256")
      .update(String(customer.email).toLowerCase())
      .digest("hex")
      .slice(0, 8)
      .toUpperCase()}`;

    const method = toPaymentMethod(payment?.method);
    const paymentLast4 = payment?.last4 || generateLast4Digits();

    const order = await Order.create({
      invoiceNumber,
      orderNumber,
      customerNumber,
      customer,
      items: orderItems,
      subtotal,
      taxRate,
      tax,
      total,
      amountDue: total,
      paymentMethod: method,
      paymentCardBrand: payment?.cardBrand ?? "",
      paymentLast4,
      paymentTerms: method === "card" ? "Credit Card" : "Cash",
      pickedUpAt: req.body.pickedUpAt ? new Date(req.body.pickedUpAt) : null,
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

export async function getOrders(_req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!ensureValidId(req.params.id, res)) return;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!ensureValidId(req.params.id, res)) return;

    const newStatus = toOrderStatus(req.body.status);
    if (!newStatus) return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === newStatus) return res.json(order);
    if (order.status === "cancelado") {
      return res.status(409).json({ message: "Canceled order cannot be reactivated" });
    }

    order.status = newStatus;
    if (newStatus === "recogido" && !order.pickedUpAt) {
      order.pickedUpAt = new Date();
    }

    applyFulfillment(order);
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderDetails(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!ensureValidId(req.params.id, res)) return;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "cancelado") {
      return res.status(409).json({ message: "Canceled order cannot be edited" });
    }

    const body = req.body ?? {};

    if (body.invoiceNumber !== undefined) order.invoiceNumber = body.invoiceNumber;
    if (body.orderNumber !== undefined) order.orderNumber = body.orderNumber;
    if (body.customerNumber !== undefined) order.customerNumber = body.customerNumber;
    if (body.status && toOrderStatus(body.status)) order.status = body.status;
    if (body.createdAt) order.createdAt = new Date(body.createdAt);
    if (body.pickedUpAt !== undefined) {
      order.pickedUpAt = body.pickedUpAt ? new Date(body.pickedUpAt) : null;
    }

    for (const section of ["customer", "location"] as const) {
      if (body[section]) {
        for (const [key, value] of Object.entries(body[section])) {
          order.set(`${section}.${key}`, value);
        }
      }
    }

    if (body.payment) applyPaymentUpdate(order, body.payment);

    const taxRate = body.taxRate !== undefined ? Number(body.taxRate) : order.taxRate;
    order.taxRate = taxRate;

    if (Array.isArray(body.items)) {
      order.items = body.items;
      const total = round2(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
      const subtotal = round2(total / (1 + taxRate));
      order.total = total;
      order.subtotal = subtotal;
      order.tax = round2(total - subtotal);
      order.amountDue = total;
      applyFulfillment(order);
    } else if (body.total !== undefined) {
      order.total = Number(body.total);
      order.subtotal = Number(body.subtotal ?? order.subtotal);
      order.tax = Number(body.tax ?? order.tax);
      order.amountDue = Number(body.amountDue ?? order.amountDue);
    }

    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function getOrderTicket(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).send("Invalid ID");
    const order = await findOrderDoc(req.params.id);
    if (!order) return res.status(404).send("Order not found");
    res.type("html").send(buildTicketHtml(order as any));
  } catch (error) {
    next(error);
  }
}

export async function getOrderInvoicePdf(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).send("Invalid ID");
    const order = await findOrderDoc(req.params.id);
    if (!order) return res.status(404).send("Order not found");
    res.type("html").send(buildInvoiceA4Html(order as any));
  } catch (error) {
    next(error);
  }
}

interface SendDocumentOptions {
  buildHtml: (order: any) => string;
  subject: string;
  filePrefix: string;
  successMessage: string;
}

async function sendDocumentByEmail(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
  opts: SendDocumentOptions,
) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const order = await findOrderDoc(req.params.id);
    if (!order?.customer?.email) {
      return res.status(404).json({ message: "Order not found or invalid customer data" });
    }

    const pdf = await generatePdfBuffer(opts.buildHtml(order));

    const data = await sendBrevoEmail({
      sender: EMAIL_SENDER,
      to: [{ email: order.customer.email, name: order.customer.name }],
      subject: opts.subject,
      htmlContent: EMAIL_HTML,
      attachment: [
        { name: `${opts.filePrefix}_${timestamp()}R09510744.pdf`, content: pdf.toString("base64") },
      ],
    });

    res.json({ message: opts.successMessage, data });
  } catch (error) {
    console.error("Brevo Error:", error);
    next(error);
  }
}

export const sendReceiptEmail = (req: Request<{ id: string }>, res: Response, next: NextFunction) =>
  sendDocumentByEmail(req, res, next, {
    buildHtml: buildTicketHtml,
    subject: "Your receipt from MacStore ",
    filePrefix: "Sale_Email_Receipt",
    successMessage: "Receipt email sent with PDF attachment",
  });

export const sendInvoiceEmail = (req: Request<{ id: string }>, res: Response, next: NextFunction) =>
  sendDocumentByEmail(req, res, next, {
    buildHtml: buildInvoiceA4Html,
    subject: "Your invoice from MacStore ",
    filePrefix: "Sale_Email_Invoice",
    successMessage: "Invoice email sent with PDF attachment",
  });