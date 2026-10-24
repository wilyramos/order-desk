export interface SeedProduct {
  name: string;
  category: "iPhone" | "Mac" | "iPad" | "Watch" | "AirPods" | "Accesorios";
  price: number;
  stock: number;
  description: string;
  image: string;
}

// Precios de ejemplo en PEN. Edítalos a tu gusto.
// Las imágenes van en frontend/public/products/ (ver paso 3).
export const PRODUCTS_EN: SeedProduct[] = [
  {
    name: "iPhone 16 Pro",
    category: "iPhone",
    price: 5499,
    stock: 10,
    description: "A18 Pro chip, 6.3-inch display and a pro camera system.",
    image: "/products/iphone-16-pro.jpg",
  },
  {
    name: "iPhone 16",
    category: "iPhone",
    price: 4299,
    stock: 15,
    description: "A18 chip, Camera Control and all-day battery life.",
    image: "/products/iphone-16.jpg",
  },
  {
    name: "iPhone 15",
    category: "iPhone",
    price: 3699,
    stock: 12,
    description: "Dynamic Island, USB-C and a 48MP main camera.",
    image: "/products/iphone-15.jpg",
  },
  {
    name: "MacBook Air 13-inch M3",
    category: "Mac",
    price: 4999,
    stock: 5,
    description: "Thin and light laptop with the M3 chip and up to 18 hours of battery.",
    image: "/products/macbook-air-m3.jpg",
  },
  {
    name: "iPad Air 11-inch M2",
    category: "iPad",
    price: 2799,
    stock: 8,
    description: "M2 chip and a Liquid Retina display in a thin design.",
    image: "/products/ipad-air-m2.jpg",
  },
  {
    name: "Apple Watch Series 10",
    category: "Watch",
    price: 1799,
    stock: 12,
    description: "Thinnest Apple Watch yet, with a larger display and fast charging.",
    image: "/products/apple-watch-series-10.jpg",
  },
  {
    name: "AirPods Pro 2",
    category: "AirPods",
    price: 999,
    stock: 20,
    description: "Active noise cancellation, Adaptive Audio and USB-C charging.",
    image: "/products/airpods-pro-2.jpg",
  },
  {
    name: "AirPods 4",
    category: "AirPods",
    price: 649,
    stock: 20,
    description: "Comfortable fit, spatial audio and a compact charging case.",
    image: "/products/airpods-4.jpg",
  },
];
