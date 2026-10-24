import { API_URL } from "@/lib/api";
import type { Order } from "@/types/order";

export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${API_URL}/api/orders`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudieron cargar los pedidos");
  return res.json();
}

export async function getOrder(id: string): Promise<Order | null> {
  const res = await fetch(`${API_URL}/api/orders/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("No se pudo cargar el pedido");
  return res.json();
}

export function ticketUrl(id: string): string {
  return `${API_URL}/api/orders/${id}/ticket`;
}
