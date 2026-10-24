"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { API_URL } from "@/lib/api";
import { useCart } from "@/context/CartContext";

const priceFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const EMPTY_FORM = { name: "", email: "", phone: "", address: "" };

export default function CheckoutForm() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "No se pudo crear el pedido");
        return;
      }

      clear();

router.push(`/ordenes?nuevo=${data._id}`);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3 text-[17px] outline-none focus:border-[#0066cc]";

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#6e6e73]">Nombre completo</label>
          <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#6e6e73]">Correo</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#6e6e73]">Teléfono</label>
            <input name="phone" value={form.phone} onChange={handleChange} required className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#6e6e73]">Dirección de entrega</label>
          <textarea name="address" value={form.address} onChange={handleChange} required rows={3} className={inputClass} />
        </div>

        {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={sending || items.length === 0}
          className="w-full rounded-full bg-[#0066cc] py-3 text-lg text-white transition hover:bg-[#0071e3] disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {sending ? "Enviando pedido..." : "Confirmar pedido"}
        </button>
      </form>

      <aside className="h-fit rounded-3xl bg-[#f5f5f7] p-6">
        <h2 className="text-xl font-semibold">Tu pedido</h2>
        <ul className="mt-4 space-y-3 text-[15px]">
          {items.map(({ product, quantity }) => (
            <li key={product._id} className="flex justify-between gap-4">
              <span>
                {product.name} <span className="text-[#6e6e73]">× {quantity}</span>
              </span>
              <span>{priceFormatter.format(product.price * quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-black/10 pt-4 text-lg font-semibold">
          <span>Total</span>
          <span>{priceFormatter.format(total)}</span>
        </div>
      </aside>
    </div>
  );
}