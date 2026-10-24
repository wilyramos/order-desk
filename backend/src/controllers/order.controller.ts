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

interface OrderRequestBody {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: { productId: string; quantity: number }[];
  payment?: { method?: string; cardBrand?: string; last4?: string };
}

interface OrderDetailsBody {
  customer?: Partial<{ name: string; email: string; phone: string; address: string }>;
  payment?: Partial<{ method: string; cardBrand: string; last4: string }>;
  quantities?: number[];
}

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
    const { customer, items, payment } = req.body as Partial<OrderRequestBody>;

    if (!customer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Datos del pedido incompletos" });
    }

    const orderItems: {
      product: string;
      name: string;
      sku: string;
      serialNumber: string;
      price: number;
      quantity: number;
      quantityFulfilled: number;
      image: string;
    }[] = [];
    let total = 0;

    // Validamos solo que los productos existan. El stock no se controla ni se descuenta.
    for (const item of items) {
      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Cantidad no válida" });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productId}` });
      }

      // El precio se toma de la base de datos, nunca del cliente
      orderItems.push({
        product: String(product._id),
        name: product.name,
        sku: String(product._id).slice(-8).toUpperCase(),
        serialNumber: "",
        price: product.price,
        quantity,
        quantityFulfilled: 0,
        image: product.image,
      });
      total += product.price * quantity;
    }

    // Los precios incluyen IGV: el subtotal y el impuesto se calculan hacia atrás
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
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID no válido" });
    }

    const newStatus = toOrderStatus((req.body as { status?: unknown }).status);
    if (!newStatus) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    const previousStatus = order.status;

    if (previousStatus === newStatus) {
      return res.json(order);
    }

    if (previousStatus === "cancelado") {
      return res.status(409).json({ message: "Un pedido cancelado no puede reactivarse" });
    }

    // La cantidad entregada se completa solo en los estados de salida
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
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    if (order.status === "cancelado") {
      return res.status(409).json({ message: "Un pedido cancelado no se puede editar" });
    }

    const body = (req.body ?? {}) as OrderDetailsBody;

    // 1. Datos de contacto y entrega
    const customerFields = ["name", "email", "phone", "address"] as const;
    for (const field of customerFields) {
      const value = body.customer?.[field];
      if (typeof value === "string") {
        order.set(`customer.${field}`, value.trim());
      }
    }

    // 2. Método de pago y tarjeta
    if (body.payment) {
      const method = toPaymentMethod(body.payment.method ?? order.paymentMethod);
      order.set("paymentMethod", method);

      if (method === "card") {
        const last4 = String(body.payment.last4 ?? order.paymentLast4 ?? "").trim();
        if (!/^\d{4}$/.test(last4)) {
          return res.status(400).json({ message: "Los últimos 4 dígitos de la tarjeta no son válidos" });
        }

        order.set("paymentCardBrand", String(body.payment.cardBrand ?? order.paymentCardBrand ?? "").trim());
        order.set("paymentLast4", last4);
        order.set("paymentTerms", "Credit Card");
      } else {
        order.set("paymentCardBrand", "");
        order.set("paymentLast4", "");
        order.set("paymentTerms", "Cash");
      }
    }

    // 3. Cantidades por producto (se alinean por posición con order.items)
    if (Array.isArray(body.quantities)) {
      for (let index = 0; index < order.items.length; index++) {
        const raw = body.quantities[index];
        if (raw === undefined) continue;

        const quantity = Math.floor(Number(raw));
        if (!Number.isFinite(quantity) || quantity < 1) {
          return res.status(400).json({ message: "Cantidad no válida" });
        }

        order.items[index].quantity = quantity;
      }

      // Recalculamos los importes con los precios y cantidades nuevos
      const total = round2(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
      const subtotal = round2(total / (1 + IGV_RATE));
      order.set("total", total);
      order.set("subtotal", subtotal);
      order.set("tax", round2(total - subtotal));
      order.set("amountDue", total);

      const fulfilled = FULFILLED_STATUSES.includes(order.status as OrderStatusValue);
      order.items.forEach((item) => {
        item.quantityFulfilled = fulfilled ? item.quantity : 0;
      });
    }

    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function getOrderTicket(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("ID no válido");
    }

    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).send("Pedido no encontrado");
    }

    res.type("html").send(buildTicketHtml(order));
  } catch (error) {
    next(error);
  }
}