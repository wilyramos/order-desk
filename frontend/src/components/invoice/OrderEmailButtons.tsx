// File: frontend/src/components/invoice/OrderEmailButtons.tsx

"use client";

import { useState } from "react";
import { sendOrderEmail } from "@/lib/orders";

type EmailType = "receipt" | "invoice";

const LABELS: Record<EmailType, { idle: string; busy: string; ok: string }> = {
  receipt: {
    idle: "Enviar recibo por correo",
    busy: "Enviando recibo…",
    ok: "Recibo enviado.",
  },
  invoice: {
    idle: "Enviar factura por correo",
    busy: "Enviando factura…",
    ok: "Factura enviada.",
  },
};

// Cada botón mantiene su propio estado: uno no bloquea ni comparte mensaje con el otro.
function SendEmailButton({ orderId, type }: { orderId: string; type: EmailType }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await sendOrderEmail(orderId, type);
      setMessage({ text: LABELS[type].ok, ok: true });
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "No se pudo enviar el correo.";
      setMessage({ text, ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1 md:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full border border-[#d2d2d7] bg-white px-3 py-1 text-xs text-[#0066cc] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:text-[#86868b]"
      >
        {loading ? LABELS[type].busy : LABELS[type].idle}
      </button>
      {message && (
        <p className={`text-[11px] ${message.ok ? "text-[#6e6e73]" : "text-[#e30000]"}`}>{message.text}</p>
      )}
    </div>
  );
}

export default function OrderEmailButtons({ orderId }: { orderId: string }) {
  return (
    <div className="flex flex-col gap-2">
      <SendEmailButton orderId={orderId} type="receipt" />
      <SendEmailButton orderId={orderId} type="invoice" />
    </div>
  );
}
