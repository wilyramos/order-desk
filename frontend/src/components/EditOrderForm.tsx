"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { API_URL } from "@/lib/api";
import type { Order, OrderStatus } from "@/types/order";

type PaymentMethod = "card" | "cash" | "transfer";

const OPICIONES_ESTADO: { value: OrderStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
  { value: "recogido", label: "Recogido" },
  { value: "cancelado", label: "Cancelado" },
];

const OPCIONES_PAGO: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "Tarjeta de crédito o débito" },
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia bancaria" },
];

const MARCAS_TARJETA = ["AMERICAN EXPRESS", "VISA", "MASTERCARD", "DISCOVER", "Otro"];

const formatearMoneda = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const inputClass =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[17px] outline-none focus:border-[#0066cc]";
const labelClass = "mb-2 block text-[15px] font-medium text-[#1d1d1f]";
const sectionClass = "rounded-3xl bg-[#f5f5f7] p-8 sm:p-10";

function formatDateForInput(dateStr?: string | Date): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditOrderForm({ order }: { order: Order }) {
  const router = useRouter();

  const [generalInfo, setGeneralInfo] = useState({
    invoiceNumber: order.invoiceNumber || "",
    orderNumber: order.orderNumber || "",
    customerNumber: order.customerNumber || "",
    status: order.status,
    createdAt: formatDateForInput(order.createdAt),
  });

  const [customer, setCustomer] = useState({
    name: order.customer.name,
    email: order.customer.email,
    phone: order.customer.phone,
    address: order.customer.address,
  });

  const [location, setLocation] = useState({
    name: order.location?.name || "Apple West 14th Street",
    address: order.location?.address || "401 West 14th Street",
    email: order.location?.email || "west14thstreet@apple.com",
    phone: order.location?.phone || "212-444-3400",
  });

  const [method, setMethod] = useState<PaymentMethod>(
    (order.paymentMethod as PaymentMethod) || "card"
  );
  const [cardBrand, setCardBrand] = useState(order.paymentCardBrand || "AMERICAN EXPRESS");
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
      sku: item.sku || "MJQC4LL/A",
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
      setError("Ingrese los últimos 4 dígitos de la tarjeta.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: generalInfo.invoiceNumber,
          orderNumber: generalInfo.orderNumber,
          customerNumber: generalInfo.customerNumber,
          status: generalInfo.status,
          createdAt: generalInfo.createdAt ? new Date(generalInfo.createdAt).toISOString() : undefined,
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
        setError(data.message ?? "No se pudieron guardar los cambios.");
        return;
      }

      router.push(`/ordenes/${order._id}`);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información General del Pedido */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Detalles del Pedido</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelClass}>Fecha y Hora de Compra</label>
            <input
              type="datetime-local"
              name="createdAt"
              value={generalInfo.createdAt}
              onChange={handleGeneralChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número de Orden (QR/Barras)</label>
            <input
              name="orderNumber"
              value={generalInfo.orderNumber}
              onChange={handleGeneralChange}
              placeholder="Ej. W1408180021"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número de Factura / Ticket</label>
            <input
              name="invoiceNumber"
              value={generalInfo.invoiceNumber}
              onChange={handleGeneralChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número de Cliente</label>
            <input
              name="customerNumber"
              value={generalInfo.customerNumber}
              onChange={handleGeneralChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Estado del Pedido</label>
            <select
              name="status"
              value={generalInfo.status}
              onChange={handleGeneralChange}
              className={inputClass}
            >
              {OPICIONES_ESTADO.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Productos</h2>
        <div className="space-y-8">
          {itemsData.map((item, index) => (
            <div key={`${item.product}-${index}`} className="border-b border-black/10 pb-8 last:border-0 last:pb-0">
              <div className="grid gap-4 sm:grid-cols-12 mb-4">
                <div className="sm:col-span-5">
                  <label className={labelClass}>Nombre del Producto</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className={labelClass}>Part Number (SKU)</label>
                  <input
                    type="text"
                    value={item.sku}
                    onChange={(e) => handleItemChange(index, "sku", e.target.value)}
                    placeholder="Ej. MJQC5LL/A"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Precio ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.price}
                    onChange={(e) => handleItemChange(index, "price", Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Cant.</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", Math.max(1, Math.floor(Number(e.target.value) || 1)))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Número de Serie</label>
                  <input
                    type="text"
                    value={item.serialNumber}
                    onChange={(e) => handleItemChange(index, "serialNumber", e.target.value)}
                    placeholder="Ej. J30DNHXGKL"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>IMEI</label>
                  <input
                    type="text"
                    value={item.imei}
                    onChange={(e) => handleItemChange(index, "imei", e.target.value)}
                    placeholder="Ej. 355108567837622"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Fecha Límite de Devolución</label>
                  <input
                    type="date"
                    value={item.returnDate}
                    onChange={(e) => handleItemChange(index, "returnDate", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between border-t border-black/10 pt-4 text-[17px] font-semibold">
          <span>Total Calculado</span>
          <span>{formatearMoneda.format(total)}</span>
        </div>
      </section>

      {/* Tienda / Ubicación */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Datos de la Tienda</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre de la Tienda</label>
            <input name="name" value={location.name} onChange={handleLocationChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Dirección</label>
            <input name="address" value={location.address} onChange={handleLocationChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email de Tienda</label>
            <input type="email" name="email" value={location.email} onChange={handleLocationChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input name="phone" value={location.phone} onChange={handleLocationChange} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Cliente */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Datos del Cliente</h2>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Nombre Completo</label>
            <input name="name" value={customer.name} onChange={handleCustomerChange} required className={inputClass} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Correo Electrónico</label>
              <input type="email" name="email" value={customer.email} onChange={handleCustomerChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input name="phone" value={customer.phone} onChange={handleCustomerChange} required className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Dirección de Entrega</label>
            <textarea name="address" value={customer.address} onChange={handleCustomerChange} required rows={3} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Pago y Metadatos de Transacción */}
      <section className={sectionClass}>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Metadatos de Pago y Transacción</h2>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Método de Pago</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={inputClass}>
              {OPCIONES_PAGO.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {method === "card" && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Marca de Tarjeta</label>
                  <select value={cardBrand} onChange={(e) => setCardBrand(e.target.value)} className={inputClass}>
                    {MARCAS_TARJETA.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Últimos 4 Dígitos</label>
                  <input
                    inputMode="numeric"
                    maxLength={4}
                    value={last4}
                    onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="7544"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Código de Aprobación (Auth Code)</label>
                  <input
                    name="authCode"
                    value={paymentMeta.authCode}
                    onChange={handlePaymentMetaChange}
                    placeholder="Ej. 841650"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tipo de Tarjeta</label>
                  <input
                    name="cardType"
                    value={paymentMeta.cardType}
                    onChange={handlePaymentMetaChange}
                    placeholder="Ej. Credit"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Application ID</label>
                  <input
                    name="applicationId"
                    value={paymentMeta.applicationId}
                    onChange={handlePaymentMetaChange}
                    placeholder="Ej. A000000025010402"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Device ID</label>
                  <input
                    name="deviceId"
                    value={paymentMeta.deviceId}
                    onChange={handlePaymentMetaChange}
                    placeholder="Ej. 0830"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>TVR</label>
                  <input
                    name="tvr"
                    value={paymentMeta.tvr}
                    onChange={handlePaymentMetaChange}
                    placeholder="Ej. 0000008000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>TSI</label>
                  <input
                    name="tsi"
                    value={paymentMeta.tsi}
                    onChange={handlePaymentMetaChange}
                    placeholder="Ej. E800"
                    className={inputClass}
                  />
                </div>
              </div>
            </>
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
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}