import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { PRODUCTS_EN } from "./products-en.js";

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Falta MONGODB_URI en .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  // Reemplaza el catálogo actual por los productos del seed
  const deleted = await Product.deleteMany({});
  console.log(`Productos eliminados: ${deleted.deletedCount}`);

  const inserted = await Product.insertMany(PRODUCTS_EN);
  console.log(`Productos importados: ${inserted.length}`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Error en el seed:", error.message);
  process.exit(1);
});
