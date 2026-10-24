import { Schema, model, type InferSchemaType } from "mongoose";

export const DEFAULT_STOCK = 100;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["iPhone", "Mac", "iPad", "Watch", "AirPods", "Accesorios"],
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: DEFAULT_STOCK },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export type ProductAttrs = InferSchemaType<typeof productSchema>;

export const Product = model("Product", productSchema);