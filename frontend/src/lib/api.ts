import type { Product } from "@/types/product";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("No se pudieron cargar los productos");
  }

  return res.json();
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;

  const res = await fetch(`${API_URL}/api/products/${id}`, { cache: "no-store" });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error("No se pudo cargar el producto");

  return res.json();
}
