import type { Product } from "@/types/product";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("No se pudieron cargar los productos");
  }

  return res.json();
}
