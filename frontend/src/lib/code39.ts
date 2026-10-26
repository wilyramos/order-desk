import type { Order } from "@/types/order";

const CODE39: Record<string, string> = {
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn",
  "4": "nnnwwnnnw", "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw",
  "8": "wnnwnnwnn", "9": "nnwwnnwnn",
  A: "wnnnnwnnw", B: "nnwnnwnnw", C: "wnwnnwnnn", D: "nnnnwwnnw", E: "wnnnwwnnn",
  F: "nnwnwwnnn", G: "nnnnnwwnw", H: "wnnnnwwnn", I: "nnwnnwwnn", J: "nnnnwwwnn",
  K: "wnnnnnnww", L: "nnwnnnnww", M: "wnwnnnnwn", N: "nnnnwnnww", O: "wnnnwnnwn",
  P: "nnwnwnnwn", Q: "nnnnnnwww", R: "wnnnnnwwn", S: "nnwnnnwwn", T: "nnnnwnwwn",
  U: "wwnnnnnnw", V: "nwwnnnnnw", W: "wwwnnnnnn", X: "nwnnwnnnw", Y: "wwnnwnnnn",
  Z: "nwwnwnnnn", "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnwnnn",
  "*": "nwnnwnwnn", $: "nwnwnwnnn", "/": "nwnwnnnwn", "+": "nwnnnwnwn", "%": "nnnwnwnwn",
};

export interface BarRect {
  x: number;
  width: number;
}

export function encodeCode39(value: string, narrow = 0.9): { bars: BarRect[]; width: number } {
  const text = `*${value.toUpperCase()}*`;
  const bars: BarRect[] = [];
  let x = 0;

  for (const ch of text) {
    const pattern = CODE39[ch] ?? CODE39["-"];
    for (let i = 0; i < pattern.length; i++) {
      const w = pattern[i] === "w" ? narrow * 2.2 : narrow;
      if (i % 2 === 0) bars.push({ x, width: w });
      x += w;
    }
    x += narrow * 1.2;
  }

  return { bars, width: x - narrow * 1.2 };
}

export function orderBarcodeValue(order: Pick<Order, "_id" | "createdAt">): string {
  const d = new Date(order.createdAt);
  const ymd =
    `${d.getFullYear()}` +
    `${String(d.getMonth() + 1).padStart(2, "0")}` +
    `${String(d.getDate()).padStart(2, "0")}`;

  const numeric = parseInt(order._id.slice(-8), 16);
  const digits = String(numeric).padStart(10, "0").slice(-10);

  return `${ymd}R${digits}`;
}