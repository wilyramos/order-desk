
import "dotenv/config";
import mongoose from "mongoose";
import { writeFile } from "node:fs/promises";
import { Product } from "../models/product.model.js";

const STORE_URL = "https://pe.tiendasishop.com";
const TOTAL = 50;
const PAGE_SIZE = 250;
const MAX_PAGES = 10;

interface ShopifyProduct {
  id: number;
  title: string;
  product_type: string;
  body_html: string | null;
  variants: { price: string; available: boolean }[];
  images: { src: string }[];
}

// Solo iPhone: el título debe empezar por "iPhone".
// Así se excluyen accesorios como "Case ZAGG ... para iPhone 18 Pro".
const IPHONE_TITLE = /^iphone\b/i;

async function fetchPage(page: number): Promise<ShopifyProduct[]> {
  const res = await fetch(`${STORE_URL}/products.json?limit=${PAGE_SIZE}&page=${page}`, {
    headers: { "User-Agent": "apple-order-desk-practica/1.0" },
  });

  if (!res.ok) {
    throw new Error(`La tienda respondió con HTTP ${res.status} en la página ${page}`);
  }

  const data = (await res.json()) as { products: ShopifyProduct[] };
  return data.products;
}

async function fetchIphones(): Promise<ShopifyProduct[]> {
  const iphones: ShopifyProduct[] = [];

  for (let page = 1; page <= MAX_PAGES && iphones.length < TOTAL; page++) {
    const products = await fetchPage(page);
    if (products.length === 0) break;

    iphones.push(...products.filter((p) => IPHONE_TITLE.test(p.title.trim())));
  }

  return iphones.slice(0, TOTAL);
}

function toProductDoc(p: ShopifyProduct) {
  const firstVariant = p.variants[0];

  return {
    name: p.title.trim(),
    category: "iPhone" as const,
    price: Number(firstVariant?.price ?? 0),
    stock: p.variants.some((v) => v.available) ? 10 : 0,
    description: (p.body_html ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300),
    image: p.images[0]?.src ?? "",
  };
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Falta MONGODB_URI en .env");
  }

  console.log("Buscando iPhone en la tienda...");
  const raw = await fetchIphones();

  const products = raw.map(toProductDoc).filter((p) => p.name && p.price > 0);

  console.log(`iPhone válidos a importar: ${products.length}`);

  await writeFile("scraped-products.json", JSON.stringify(products, null, 2), "utf8");
  console.log("Respaldo guardado en scraped-products.json");

  await mongoose.connect(process.env.MONGODB_URI);

  const deleted = await Product.deleteMany({});
  console.log(`Productos eliminados: ${deleted.deletedCount}`);

  const inserted = await Product.insertMany(products);
  console.log(`Productos importados: ${inserted.length}`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Error en la importación:", error.message);
  process.exit(1);
});
