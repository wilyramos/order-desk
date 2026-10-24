import { Schema, model, type InferSchemaType } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["iPhone", "Mac", "iPad", "Watch", "AirPods", "Accesorios"],
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export type ProductAttrs = InferSchemaType<typeof productSchema>;

export const Product = model("Product", productSchema);