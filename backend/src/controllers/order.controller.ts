import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { createHash } from "node:crypto";
import { Product } from "../models/product.model.js";
import {
  Order,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  IGV_RATE,
} from "../models/order.model.js";
import { buildTicketHtml } from "../utils/ticket.js";

type OrderStatusValue = (typeof ORDER_STATUSES)[number];
type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];

const FULFILLED_STATUSES: OrderStatusValue[] = ["enviado", "entregado", "recogido"];

const round2 = (value: number) => Math.round(value * 100) / 100;

const toOrderStatus = (value: unknown): OrderStatusValue | undefined =>
  ORDER_STATUSES.find((status) => status === value);

const toPaymentMethod = (value: unknown): PaymentMethodValue =>
  PAYMENT_METHODS.find((method) => method === value) ?? "card";

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { customer, items, payment } = req.body;

    if (!customer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Datos del pedido incompletos" });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Cantidad no válida" });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productId}` });
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

    const count = await Order.countDocuments();
    const invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;
    const customerNumber = `C${createHash("sha256")
      .update(String(customer.email).toLowerCase())
      .digest("hex")
      .slice(0, 8)
      .toUpperCase()}`;

    const method = toPaymentMethod(payment?.method);

    const order = await Order.create({
      invoiceNumber,
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
      paymentLast4: payment?.last4 ?? "",
      paymentTerms: method === "card" ? "Credit Card" : "Cash",
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID no válido" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "ID no válido" });

    const newStatus = toOrderStatus(req.body.status);
    if (!newStatus) return res.status(400).json({ message: "Estado no válido" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });

    if (order.status === newStatus) return res.json(order);
    if (order.status === "cancelado") return res.status(409).json({ message: "Un pedido cancelado no puede reactivarse" });

    const fulfilled = FULFILLED_STATUSES.includes(newStatus);
    order.items.forEach((item) => {
      item.quantityFulfilled = fulfilled ? item.quantity : 0;
    });

    order.status = newStatus;
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderDetails(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID no válido" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    if (order.status === "cancelado") return res.status(409).json({ message: "Un pedido cancelado no se puede editar" });

    const body = req.body ?? {};

    // Actualización de campos a nivel raíz
    if (body.invoiceNumber) order.invoiceNumber = body.invoiceNumber;
    if (body.customerNumber) order.customerNumber = body.customerNumber;
    if (body.status && toOrderStatus(body.status)) order.status = body.status;

    // 1. Cliente y Ubicación
    // 1. Cliente y Ubicación
    if (body.customer) { for (const [key, value] of Object.entries(body.customer)) {
        order.set(`customer.${key}`, value);
      }
    }

    if (body.location) {
      for (const [key, value] of Object.entries(body.location)) {
        order.set(`location.${key}`, value);
      }
    }

    // 2. Método de pago y metadatos
    if (body.payment) {
      const p = body.payment;
      if (p.method) order.paymentMethod = toPaymentMethod(p.method);
      if (p.cardBrand !== undefined) order.paymentCardBrand = p.cardBrand;
      if (p.last4 !== undefined) order.paymentLast4 = p.last4;
      if (p.terms !== undefined) order.paymentTerms = p.terms;
      if (p.authCode !== undefined) order.paymentAuthCode = p.authCode;
      if (p.applicationId !== undefined) order.paymentApplicationId = p.applicationId;
      if (p.deviceId !== undefined) order.paymentDeviceId = p.deviceId;
      if (p.cardType !== undefined) order.paymentCardType = p.cardType;
      if (p.tvr !== undefined) order.paymentTvr = p.tvr;
      if (p.tsi !== undefined) order.paymentTsi = p.tsi;
    }

    // 3. Reemplazo/Edición total de Productos
    if (Array.isArray(body.items)) {
      order.items = body.items; // Sobrescribe permitiendo editar cualquier propiedad del producto
    }

    // 4. Recálculo manual o automático de finanzas
    const customTaxRate = body.taxRate !== undefined ? Number(body.taxRate) : order.taxRate;
    order.taxRate = customTaxRate;

    if (Array.isArray(body.items)) {
      const total = round2(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
      const subtotal = round2(total / (1 + customTaxRate));
      order.total = total;
      order.subtotal = subtotal;
      order.tax = round2(total - subtotal);
      order.amountDue = total;

      const fulfilled = FULFILLED_STATUSES.includes(order.status as OrderStatusValue);
      order.items.forEach((item) => {
        item.quantityFulfilled = fulfilled ? item.quantity : 0;
      });
    } else if (body.total !== undefined) {
      // Si no se pasaron items pero sí totales explícitos, se permite el override manual
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
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).send("ID no válido");

    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).send("Pedido no encontrado");

    res.type("html").send(buildTicketHtml(order));
  } catch (error) {
    next(error);
  }
}