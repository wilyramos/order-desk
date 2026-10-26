"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { API_URL } from "@/lib/api";
import type { Order } from "@/types/order";

type PaymentMethod = "card" | "cash" | "transfer";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "Credit or debit card" },
  { value: "cash", label: "Cash on pickup" },
  { value: "transfer", label: "Bank transfer" },
];

const CARD_BRANDS = ["Visa", "Mastercard", "American Express", "Other"];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const inputClass =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[17px] outline-none focus:border-[#0066cc]";
const labelClass = "mb-2 block text-[15px] font-medium text-[#1d1d1f]";
const sectionClass = "rounded-3xl bg-[#f5f5f7] p-8 sm:p-10";

export default function EditOrderForm({ order }: { order: Order }) {
  const router = useRouter();

  const [customer, setCustomer] = useState({
    name: order.customer.name,
    email: order.customer.email,
    phone: order.customer.phone,
    address: order.customer.address,
  });

  const [method, setMethod] = useState<PaymentMethod>(
    (order.paymentMethod as PaymentMethod) || "card"
  );
  const [cardBrand, setCardBrand] = useState(order.paymentCardBrand || "Visa");
  const [last4, setLast4] = useState(order.paymentLast4 ?? "");

  const [itemsData, setItemsData] = useState(
    order.items.map((item) => ({
      quantity: item.quantity,
      serialNumber: item.serialNumber || "",
      imei: item.imei || "",
    }))
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const total = order.items.reduce(
    (sum, item, index) => sum + item.price * (itemsData[index]?.quantity ?? item.quantity),
    0
  );

  function handleCustomerChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setCustomer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleItemChange(index: number, field: string, value: string | number) {
    setItemsData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (method === "card" && !/^\d{4}$/.test(last4)) {
      setError("Enter the last 4 digits of your card.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          payment: {
            method,
            cardBrand: method === "card" ? cardBrand : "",
            last4: method === "card" ? last4 : "",
          },
          items: itemsData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "We couldn't save your changes.");
        return;
      }

      router.push(`/ordenes/${order._id}`);
      router.refresh();
    } catch {
      setError("We couldn't connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Productos, IMEI, Serial y Cantidades */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Products</h2>
        <div className="space-y-6">
          {order.items.map((item, index) => (
            <div key={`${item.product}-${index}`} className="border-b border-black/10 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="truncate text-[17px] font-semibold">{item.name}</p>
                  <p className="text-sm text-[#6e6e73]">{money.format(item.price)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-[#6e6e73]" htmlFor={`qty-${index}`}>
                    Qty
                  </label>
                  <input
                    id={`qty-${index}`}
                    type="number"
                    min={1}
                    value={itemsData[index].quantity}
                    onChange={(e) => handleItemChange(index, "quantity", Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                    className="w-20 rounded-2xl border border-black/10 bg-white px-3 py-2 text-center outline-none focus:border-[#0066cc]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Serial Number</label>
                  <input
                    type="text"
                    value={itemsData[index].serialNumber}
                    onChange={(e) => handleItemChange(index, "serialNumber", e.target.value)}
                    placeholder="e.g. MYJRG9GPM7"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>IMEI</label>
                  <input
                    type="text"
                    value={itemsData[index].imei}
                    onChange={(e) => handleItemChange(index, "imei", e.target.value)}
                    placeholder="e.g. 353916270183924"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between border-t border-black/10 pt-4 text-[17px] font-semibold">
          <span>Total</span>
          <span>{money.format(total)}</span>
        </div>
      </section>

      {/* Datos de contacto y entrega */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Contact and delivery</h2>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Full name</label>
            <input name="name" value={customer.name} onChange={handleCustomerChange} required className={inputClass} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                value={customer.email}
                onChange={handleCustomerChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" value={customer.phone} onChange={handleCustomerChange} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Delivery address</label>
            <textarea
              name="address"
              value={customer.address}
              onChange={handleCustomerChange}
              required
              rows={3}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Método de pago y tarjeta */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Payment</h2>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Payment method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className={inputClass}
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {method === "card" && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Card brand</label>
                <select value={cardBrand} onChange={(e) => setCardBrand(e.target.value)} className={inputClass}>
                  {CARD_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Last 4 digits</label>
                <input
                  inputMode="numeric"
                  maxLength={4}
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-600">{error}</p>}

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#0066cc] px-8 py-3 text-[17px] text-white transition hover:bg-[#0071e3] disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}