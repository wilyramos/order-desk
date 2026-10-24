import "dotenv/config";
import mongoose from "mongoose";
import { writeFile } from "node:fs/promises";
import { Product } from "../models/product.model.js";

const STORE_URL = "https://pe.tiendasishop.com";
const TOTAL = 50;
const PAGE_SIZE = 250;
const MAX_PAGES = 10;
const OUTPUT_FILE = "scraped-iphones-en.json";

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string | null;
  variants: { price: string; available: boolean }[];
  images: { src: string }[];
}

// Solo iPhone: el título debe empezar por "iPhone"
const IPHONE_TITLE = /^iphone\b/i;

// Colores y acabados: español -> inglés
const COLORS_EN: Record<string, string> = {
  "borgoña": "Burgundy",
  "glaciar": "Glacier",
  "negro humo": "Smoke Black",
  "negro": "Black",
  "blanco": "White",
  "plata": "Silver",
  "dorado brillante": "Bright Gold",
  "dorado": "Gold",
  "morado": "Purple",
  "transparente": "Clear",
  "arcoíris": "Rainbow",
  "medianoche": "Midnight",
  "naranja eléctrico": "Electric Orange",
  "iridiscente": "Iridescent",
  "azul": "Blue",
  "rojo": "Red",
  "verde": "Green",
  "rosa": "Pink",
};

// Frases frecuentes de las descripciones: español -> inglés
const PHRASES_EN: [RegExp, string][] = [
  [/Pantalla ProMotion de ([\d.]+) pulgadas/gi, "$1-inch ProMotion display"],
  [/cámara Fusion principal de (\d+) MP con apertura variable/gi, "$1 MP Fusion main camera with variable aperture"],
  [/la mayor duración de batería en un iPhone/gi, "the longest battery life in an iPhone"],
  [/chip (A\d+ Pro|A\d+)/gi, "$1 chip"],
  [/iPhone (\d+ Pro Max)\./gi, "iPhone $1."],
];

// Palabras típicas del español que indican que la traducción quedó incompleta
const SPANISH_HINT = /\b(de|con|la|el|los|las|y|pulgadas|cámara|pantalla|batería)\b/i;

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

// Reemplaza solo palabras completas (funciona con acentos gracias a \p{L})
function translateColors(text: string): string {
  let result = text;
  const entries = Object.entries(COLORS_EN).sort((a, b) => b[0].length - a[0].length);

  for (const [es, en] of entries) {
    const regex = new RegExp(`(?<!\\p{L})${es}(?!\\p{L})`, "giu");
    result = result.replace(regex, en);
  }

  return result;
}

function translateDescription(html: string | null): string {
  let text = (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const [regex, replacement] of PHRASES_EN) {
    text = text.replace(regex, replacement);
  }

  return text.slice(0, 300);
}

function toProductDoc(p: ShopifyProduct) {
  const firstVariant = p.variants[0];
  const name = translateColors(p.title.trim()).replace(/\s+/g, " ");
  const description = translateDescription(p.body_html);

  if (SPANISH_HINT.test(description)) {
    console.warn(`Revisar descripción (posible español sin traducir): ${name}`);
  }

  return {
    name,
    category: "iPhone" as const,
    price: Number(firstVariant?.price ?? 0),
    stock: p.variants.some((v) => v.available) ? 10 : 0,
    description,
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

  console.log(`iPhone traducidos: ${products.length}`);

  await writeFile(OUTPUT_FILE, JSON.stringify(products, null, 2), "utf8");
  console.log(`Respaldo guardado en ${OUTPUT_FILE}. Revísalo antes de confiar en la traducción.`);

  await mongoose.connect(process.env.MONGODB_URI);

  const deleted = await Product.deleteMany({});
  console.log(`Productos eliminados: ${deleted.deletedCount}`);

  const inserted = await Product.insertMany(products);
  console.log(`Productos importados: ${inserted.length}`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Error en la importación:", (error as Error).message);
  process.exit(1);
});
