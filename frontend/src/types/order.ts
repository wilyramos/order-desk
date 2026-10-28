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
  returnDate?: string;
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
    email?: string;
    phone?: string;
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
  paymentAuthCode?: string;
  paymentApplicationId?: string;
  paymentDeviceId?: string;
  paymentCardType?: string;
  paymentTvr?: string;
  paymentTsi?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}