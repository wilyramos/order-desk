export type OrderStatus =
  | "pendiente"
  | "confirmado"
  | "enviado"
  | "entregado"
  | "recogido"
  | "cancelado";

export interface OrderItem {
  product: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  quantityFulfilled?: number;
  serialNumber?: string;
  image?: string;
  imei?: string;
}

export interface Order {
  _id: string;
  invoiceNumber?: string;
  customerNumber?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  location?: {
    name?: string;
    address?: string;
  };
  items: OrderItem[];
  subtotal?: number;
  tax?: number;
  taxRate?: number;
  total: number;
  amountDue?: number;
  paymentMethod?: string;
  paymentCardBrand?: string;
  paymentLast4?: string;
  paymentTerms?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}