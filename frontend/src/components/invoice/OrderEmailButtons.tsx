// File: frontend/src/components/invoice/OrderEmailButtons.tsx

"use client";

import { useState } from "react";
import { sendOrderEmail } from "@/lib/orders";

export default function OrderEmailButtons({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState<"receipt" | "invoice" | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSendEmail = async (type: "receipt" | "invoice") => {
    setLoading(type);
    setMessage(null);
    
    try {
      await sendOrderEmail(orderId, type);
      setMessage({ 
        text: `Email de ${type === "receipt" ? "recibo" : "factura"} enviado correctamente.`, 
        type: "success" 
      });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-3 sm:items-end">
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={() => handleSendEmail("receipt")}
          disabled={loading !== null}
          className="flex items-center justify-center rounded-full bg-[#0071e3] px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "receipt" ? "Enviando recibo..." : "Enviar recibo al correo"}
        </button>
        <button
          onClick={() => handleSendEmail("invoice")}
          disabled={loading !== null}
          className="flex items-center justify-center rounded-full bg-[#1d1d1f] px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#424245] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "invoice" ? "Enviando factura..." : "Enviar factura al correo"}
        </button>
      </div>
      
      {message && (
        <p className={`text-[13px] font-medium ${message.type === "success" ? "text-[#1d7f3c]" : "text-[#e30000]"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}