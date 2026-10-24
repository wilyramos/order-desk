export type ProductCategory = "iPhone" | "Mac" | "iPad" | "Watch" | "AirPods" | "Accesorios";

export interface Product {
  _id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}
