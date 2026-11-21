// Debe coincidir con IGV_RATE en backend/src/models/order.model.ts.
// Los precios de los productos NO incluyen impuesto: el impuesto se suma encima.
export const TAX_RATE = 0.07;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calcTaxBreakdown(subtotal: number, taxRate: number = TAX_RATE) {
  const tax = round2(subtotal * taxRate);
  return { subtotal: round2(subtotal), tax, total: round2(subtotal + tax) };
}
