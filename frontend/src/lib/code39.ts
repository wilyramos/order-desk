import type { Order } from "@/types/order";

export function orderBarcodeValue(order: Pick<Order, "_id" | "createdAt" | "orderNumber">): string {
  const d = new Date(order.createdAt);
  const ymd =
    `${d.getFullYear()}` +
    `${String(d.getMonth() + 1).padStart(2, "0")}` +
    `${String(d.getDate()).padStart(2, "0")}`;

  let orderDigits = "";
  if (order.orderNumber) {
    const match = order.orderNumber.match(/\d{10}/);
    orderDigits = match ? match[0] : order.orderNumber;
  } else {
    const numeric = parseInt(order._id.slice(-8), 16);
    orderDigits = String(numeric).padStart(10, "0").slice(-10);
  }

  return `${ymd}R${orderDigits}`;
}