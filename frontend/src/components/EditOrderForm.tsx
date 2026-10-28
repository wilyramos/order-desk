"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { API_URL } from "@/lib/api";
import type { Order, OrderStatus } from "@/types/order";

type PaymentMethod = "card" | "cash" | "transfer";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
  { value: "recogido", label: "Recogido" },
  { value: "cancelado", label: "Cancelado" },
];

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

  const [generalInfo, setGeneralInfo] = useState({
    invoiceNumber: order.invoiceNumber || "",
    customerNumber: order.customerNumber || "",
    status: order.status,
  });

  const [customer, setCustomer] = useState({
    name: order.customer.name,
    email: order.customer.email,
    phone: order.customer.phone,
    address: order.customer.address,
  });

  const [location, setLocation] = useState({
    name: order.location?.name || "",
    address: order.location?.address || "",
    email: order.location?.email || "",
    phone: order.location?.phone || "",
  });

  const [method, setMethod] = useState<PaymentMethod>(
    (order.paymentMethod as PaymentMethod) || "card"
  );
  const [cardBrand, setCardBrand] = useState(order.paymentCardBrand || "Visa");
  const [last4, setLast4] = useState(order.paymentLast4 ?? "");
  
  const [paymentMeta, setPaymentMeta] = useState({
    authCode: order.paymentAuthCode || "",
    applicationId: order.paymentApplicationId || "",
    deviceId: order.paymentDeviceId || "",
    cardType: order.paymentCardType || "",
    tvr: order.paymentTvr || "",
    tsi: order.paymentTsi || "",
  });

  const [itemsData, setItemsData] = useState(
    order.items.map((item) => ({
      product: item.product,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      serialNumber: item.serialNumber || "",
      imei: item.imei || "",
      returnDate: item.returnDate ? new Date(item.returnDate).toISOString().split("T")[0] : "",
      image: item.image,
    }))
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const total = itemsData.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleGeneralChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setGeneralInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleCustomerChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setCustomer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleLocationChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setLocation((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePaymentMetaChange(e: ChangeEvent<HTMLInputElement>) {
    setPaymentMeta((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
          invoiceNumber: generalInfo.invoiceNumber,
          customerNumber: generalInfo.customerNumber,
          status: generalInfo.status,
          customer,
          location,
          payment: {
            method,
            cardBrand: method === "card" ? cardBrand : "",
            last4: method === "card" ? last4 : "",
            authCode: paymentMeta.authCode,
            applicationId: paymentMeta.applicationId,
            deviceId: paymentMeta.deviceId,
            cardType: paymentMeta.cardType,
            tvr: paymentMeta.tvr,
            tsi: paymentMeta.tsi,
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
      {/* General Details */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Order Details</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Invoice Number</label>
            <input name="invoiceNumber" value={generalInfo.invoiceNumber} onChange={handleGeneralChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Customer Number</label>
            <input name="customerNumber" value={generalInfo.customerNumber} onChange={handleGeneralChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={generalInfo.status} onChange={handleGeneralChange} className={inputClass}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Products, Prices, IMEI, Serial and Quantities */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Products</h2>
        <div className="space-y-8">
          {itemsData.map((item, index) => (
            <div key={`${item.product}-${index}`} className="border-b border-black/10 pb-8 last:border-0 last:pb-0">
              <div className="grid gap-4 sm:grid-cols-12 mb-4">
                <div className="sm:col-span-6">
                  <label className={labelClass}>Product Name</label>
                  <input type="text" value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-3">
                  <label className={labelClass}>Price (each)</label>
                  <input type="number" min={0} step={0.01} value={item.price} onChange={(e) => handleItemChange(index, "price", Number(e.target.value) || 0)} className={inputClass} />
                </div>
                <div className="sm:col-span-3">
                  <label className={labelClass}>Qty</label>
                  <input type="number" min={1} value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", Math.max(1, Math.floor(Number(e.target.value) || 1)))} className={inputClass} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Serial Number</label>
                  <input type="text" value={item.serialNumber} onChange={(e) => handleItemChange(index, "serialNumber", e.target.value)} placeholder="e.g. MYJRG9GPM7" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>IMEI</label>
                  <input type="text" value={item.imei} onChange={(e) => handleItemChange(index, "imei", e.target.value)} placeholder="e.g. 353916270183924" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Return Date</label>
                  <input type="date" value={item.returnDate} onChange={(e) => handleItemChange(index, "returnDate", e.target.value)} className={inputClass} />
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

      {/* Store Location */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Store Location</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Store Name</label>
            <input name="name" value={location.name} onChange={handleLocationChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Store Address</label>
            <input name="address" value={location.address} onChange={handleLocationChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Store Email</label>
            <input type="email" name="email" value={location.email} onChange={handleLocationChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Store Phone</label>
            <input name="phone" value={location.phone} onChange={handleLocationChange} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Contact and delivery */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Customer details</h2>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Full name</label>
            <input name="name" value={customer.name} onChange={handleCustomerChange} required className={inputClass} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={customer.email} onChange={handleCustomerChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" value={customer.phone} onChange={handleCustomerChange} required className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Delivery address</label>
            <textarea name="address" value={customer.address} onChange={handleCustomerChange} required rows={3} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Payment */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Payment Metadata</h2>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Payment method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={inputClass}>
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {method === "card" && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Card brand / Type</label>
                  <div className="flex gap-4">
                    <select value={cardBrand} onChange={(e) => setCardBrand(e.target.value)} className={inputClass}>
                      {CARD_BRANDS.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                    <input name="cardType" placeholder="Type (e.g. Credit)" value={paymentMeta.cardType} onChange={handlePaymentMetaChange} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Last 4 digits</label>
                  <input inputMode="numeric" maxLength={4} value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1234" className={inputClass} />
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Auth Code</label>
                  <input name="authCode" value={paymentMeta.authCode} onChange={handlePaymentMetaChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Application ID</label>
                  <input name="applicationId" value={paymentMeta.applicationId} onChange={handlePaymentMetaChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Device ID</label>
                  <input name="deviceId" value={paymentMeta.deviceId} onChange={handlePaymentMetaChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>TVR</label>
                  <input name="tvr" value={paymentMeta.tvr} onChange={handlePaymentMetaChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>TSI</label>
                  <input name="tsi" value={paymentMeta.tsi} onChange={handlePaymentMetaChange} className={inputClass} />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-600">{error}</p>}

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
        <button type="submit" disabled={saving} className="rounded-full bg-[#0066cc] px-8 py-3 text-[17px] text-white transition hover:bg-[#0071e3] disabled:cursor-not-allowed disabled:bg-gray-400">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}