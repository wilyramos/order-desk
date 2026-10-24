"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Product } from "@/types/product";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "apple-order-desk-cart";
const CHANGE_EVENT = "apple-order-desk-cart-change";
const EMPTY_CART = "[]";

const CartContext = createContext<CartContextValue | null>(null);

// Suscripción: se entera de cambios en otras pestañas (storage)
// y en esta pestaña (CHANGE_EVENT, que disparamos al escribir)
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

// Devuelve el texto guardado (un string es comparable, así evitamos bucles)
function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? EMPTY_CART;
}

// En el servidor no existe localStorage, así que el carrito está vacío
function getServerSnapshot() {
  return EMPTY_CART;
}

function parseCart(raw: string): CartItem[] {
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = useMemo(() => parseCart(raw), [raw]);

  // Leemos siempre el valor actual de localStorage para evitar datos desactualizados
  const update = useCallback((fn: (prev: CartItem[]) => CartItem[]) => {
    const current = parseCart(getSnapshot());
    writeCart(fn(current));
  }, []);

  const addItem = useCallback(
    (product: Product) => {
      update((prev) => {
        if (product.stock === 0) return prev;

        const existing = prev.find((i) => i.product._id === product._id);
        if (existing) {
          return prev.map((i) =>
            i.product._id === product._id
              ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
              : i
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
    },
    [update]
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      update((prev) =>
        prev
          .map((i) =>
            i.product._id === productId
              ? { ...i, quantity: Math.min(Math.max(quantity, 0), i.product.stock) }
              : i
          )
          .filter((i) => i.quantity > 0)
      );
    },
    [update]
  );

  const removeItem = useCallback(
    (productId: string) => {
      update((prev) => prev.filter((i) => i.product._id !== productId));
    },
    [update]
  );

  const clear = useCallback(() => update(() => []), [update]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [items, addItem, setQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}