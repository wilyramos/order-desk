import "dotenv/config";
import mongoose from "mongoose";
import { writeFile } from "node:fs/promises";
import { Product } from "../models/product.model.js";

const API_URL =
  "https://n-ecom-backendneoshopimportaciones.onrender.com/api/products/v2?limit=100";
const BACKUP_FILE = "products-api-backup.json";

interface ApiProduct {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagenes?: string[];
  categoria?: { nombre?: string };
  isActive?: boolean;
  deletedAt?: string | null;
}

interface ApiResponse {
  products: ApiProduct[];
  total: number;
}

async function fetchProducts(): Promise<ApiProduct[]> {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`La API respondió con HTTP ${res.status}`);
  }

  const data = (await res.json()) as ApiResponse;
  return data.products;
}

// Quita etiquetas HTML y espacios sobrantes de la descripción
function stripHtml(html = ""): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Convierte el producto de la API al formato de tu modelo Product
function toProductDoc(p: ApiProduct) {
  return {
    name: p.nombre.trim(),
    category: p.categoria?.nombre?.trim() || "Sin categoría",
    price: p.precio,
    stock: p.stock,
    description: stripHtml(p.descripcion),
    image: p.imagenes?.[0] ?? "",
  };
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Falta MONGODB_URI en .env");
  }

  console.log("Descargando productos de la API...");
  const raw = await fetchProducts();

  // Solo productos activos y no eliminados
  const active = raw.filter((p) => p.isActive && !p.deletedAt);
  console.log(`Productos recibidos: ${raw.length} | activos: ${active.length}`);

  const products = active.map(toProductDoc).filter((p) => p.name && p.price > 0);

  // Respaldo local con los datos originales de la API
  await writeFile(BACKUP_FILE, JSON.stringify(active, null, 2), "utf8");
  console.log(`Respaldo original guardado en ${BACKUP_FILE}`);

  await mongoose.connect(process.env.MONGODB_URI);

  // Reemplaza los productos existentes (igual que tus otros scripts de importación)
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