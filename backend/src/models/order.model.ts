import { Schema, model, type InferSchemaType } from "mongoose";

export const ORDER_STATUSES = [
  "pendiente",
  "confirmado",
  "enviado",
  "entregado",
  "recogido",
  "cancelado",
] as const;
export const PAYMENT_METHODS = ["card", "cash", "transfer"] as const;
export const IGV_RATE = 0.18;

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    sku: { type: String, default: "" }, // Part Number
    serialNumber: { type: String, default: "" },
    imei: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    quantityFulfilled: { type: Number, default: 0, min: 0 },
    image: { type: String, default: "" },
    returnDate: { type: Date },
  },
  { _id: true } // Mantenemos el ID para facilitar la edición individual
);

const orderSchema = new Schema(
  {
    invoiceNumber: { type: String, unique: true, sparse: true },
    customerNumber: { type: String, default: "" },

    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
    },

    location: {
      name: { type: String, default: "Apple" },
      address: { type: String, default: "Online store" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "El pedido debe tener al menos un producto",
      },
    },

    subtotal: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: IGV_RATE },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    amountDue: { type: Number, default: 0, min: 0 },

    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "card" },
    paymentCardBrand: { type: String, default: "" },
    paymentLast4: { type: String, default: "" },
    paymentTerms: { type: String, default: "Credit Card" },
    
    // Metadatos de transacción detallados
    paymentAuthCode: { type: String, default: "" },
    paymentApplicationId: { type: String, default: "" },
    paymentDeviceId: { type: String, default: "" },
    paymentCardType: { type: String, default: "" },
    paymentTvr: { type: String, default: "" },
    paymentTsi: { type: String, default: "" },

    status: { type: String, enum: ORDER_STATUSES, default: "recogido" },
  },
  { timestamps: true }
);

export type OrderAttrs = InferSchemaType<typeof orderSchema>;
export const Order = model("Order", orderSchema);