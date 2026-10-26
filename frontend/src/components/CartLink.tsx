"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartLink() {
  const { count } = useCart();

  return (
    <Link
      href="/carrito"
      aria-label={`Shopping Bag, ${count} items`}
      className="relative flex items-center justify-center text-[#1d1d1f] opacity-80 transition-opacity hover:opacity-100"
    >
      {/* Apple Shopping Bag Icon SVG */}
      <svg
        className="h-[17px] w-[15px]"
        viewBox="0 0 17 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.5 7V5.5C4.5 3.01472 6.51472 1 9 1C11.4853 1 13.5 3.01472 13.5 5.5V7H15.5C16.0523 7 16.5 7.44772 16.5 8V18C16.5 18.5523 16.0523 19 15.5 19H2.5C1.94772 19 1.5 18.5523 1.5 18V8C1.5 7.44772 1.94772 7 2.5 7H4.5ZM6 7H12V5.5C12 3.84315 10.6569 2.5 9 2.5C7.34315 2.5 6 3.84315 6 5.5V7ZM3 8.5V17.5H15V8.5H3Z"
          fill="currentColor"
        />
      </svg>

      {/* Bag Badge Count */}
      {count > 0 && (
        <span className="absolute -bottom-1 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#0071e3] px-1 text-[9px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}