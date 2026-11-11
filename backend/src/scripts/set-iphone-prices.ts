// File: backend/src/scripts/set-iphone-prices.ts

import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

// Mapeo de precios de más específico a más general para evitar falsos positivos
const IPHONE_PRICES: { [key: string]: number } = {
  "iPhone 17 Pro Max": 1199,
  "iPhone 18 Pro Max": 1299,
  "iPhone 17 Pro": 1099,
  "iPhone 18 Pro": 1199,
  "iPhone 17": 899,
};

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Falta MONGODB_URI en .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const iphones = await Product.find({ category: "iPhone" });

  let updatedCount = 0;

  for (const product of iphones) {
    // Buscar la coincidencia del modelo en el nombre del producto
    const matchedKey = Object.keys(IPHONE_PRICES).find((key) =>
      product.name.toLowerCase().includes(key.toLowerCase())
    );

    if (matchedKey) {
      const newPrice = IPHONE_PRICES[matchedKey];
      product.price = newPrice;
      await product.save();
      console.log(`✓ [${matchedKey}] ${product.name} -> $${newPrice}`);
      updatedCount++;
    } else {
      console.log(`⚠ Sin coincidencia de precio: ${product.name}`);
    }
  }

  console.log(`\nProceso finalizado: ${updatedCount} de ${iphones.length} iPhones actualizados.`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Error al actualizar los precios:", (error as Error).message);
  process.exit(1);
});