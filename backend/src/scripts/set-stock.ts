import "dotenv/config";
import mongoose from "mongoose";
import { Product, DEFAULT_STOCK } from "../models/product.model.js";

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Falta MONGODB_URI en .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const result = await Product.updateMany({}, { $set: { stock: DEFAULT_STOCK } });

  console.log(`Productos actualizados: ${result.modifiedCount} de ${result.matchedCount}`);
  console.log(`Stock asignado: ${DEFAULT_STOCK} unidades por producto`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Error al actualizar el stock:", (error as Error).message);
  process.exit(1);
});