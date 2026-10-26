export type ReceiptLocale = "en" | "ja" | "es";

export interface ReceiptTranslations {
  storeName: string;
  addressLine1: string;
  addressLine2: string;
  partNumber: string;
  serialNumber: string;
  imei: string;
  returnDate: string;
  forSupportVisit: string;
  legalTerms: {
    acceptance: string;
    returnPolicy: (days: number) => string;
    disagree: string;
    privacy: string;
  };
  totals: {
    subtotal: string;
    tax: string;
    total: string;
  };
  payment: {
    paymentMethod: string;
    amountPaidVia: (via: string) => string;
    debitNotice: (last4: string, amount: string) => string;
    cardNumber: string;
    dateTime: string;
    appId: string;
    cardType: string;
    preferredName: string;
    verifiedBy: string;
  };
  footer: {
    recycle: string;
    setup: string;
  };
}

export const RECEIPT_DICTIONARY: Record<ReceiptLocale, ReceiptTranslations> = {
  en: {
    storeName: "Apple Rockingham Park",
    addressLine1: "99 Rockingham Park Blvd.STE W143A",
    addressLine2: "Salem, NH 03079",
    partNumber: "Part Number",
    serialNumber: "Serial Number",
    imei: "IMEI",
    returnDate: "Return Date",
    forSupportVisit: "For Support, Visit",
    legalTerms: {
      acceptance:
        "Use of product constitutes acceptance of the terms and conditions found in the product box.",
      returnPolicy: (days) =>
        `If you are not fully satisfied with your purchase, you can return your undamaged product within ${days} days of purchase for a full refund.`,
      disagree:
        "If you disagree with these terms you can return the product in accordance with the store's return policy.",
      privacy: "For information on Apple's privacy policy see www.apple.com/privacy",
    },
    totals: {
      subtotal: "Sub-Total",
      tax: "Tax",
      total: "Total",
    },
    payment: {
      paymentMethod: "Payment Method",
      amountPaidVia: (via) => `Amount Paid Via ${via}`,
      debitNotice: (last4, amount) => `Please debit my account •••• ${last4} by ${amount} (Sale)`,
      cardNumber: "Card Number",
      dateTime: "Date/Time",
      appId: "Application ID",
      cardType: "Card Type",
      preferredName: "Preferred Name",
      verifiedBy: "Verified by PIN",
    },
    footer: {
      recycle: "Apple can recycle your old electronics, visit apple.com/recycle to learn how",
      setup: "Learn how to set up your product and transfer your data from home at support.apple.com.",
    },
  },
  ja: {
    storeName: "Apple ギンザ (Apple Store)",
    addressLine1: "東京都中央区銀座 3-5-12",
    addressLine2: "〒104-0061 日本",
    partNumber: "部品番号",
    serialNumber: "シリアル番号",
    imei: "IMEI",
    returnDate: "返品期限",
    forSupportVisit: "サポート情報はこちら",
    legalTerms: {
      acceptance: "製品のご使用により、製品のパッケージに含まれる利用規約に同意されたものとみなされます。",
      returnPolicy: (days) =>
        `ご購入いただいた製品にご満足いただけない場合は、${days}日以内であれば無傷の製品を返品して全額返金を受けることができます。`,
      disagree: "本規約に同意されない場合は、ストアの返品ポリシーに従って製品を返品できます。",
      privacy: "Appleのプライバシーポリシーの詳細については www.apple.com/jp/privacy をご覧ください。",
    },
    totals: {
      subtotal: "小計",
      tax: "消費税",
      total: "合計",
    },
    payment: {
      paymentMethod: "お支払い方法",
      amountPaidVia: (via) => `お支払い額（${via}）`,
      debitNotice: (last4, amount) => `口座 •••• ${last4} より ${amount} を引落します (売上)`,
      cardNumber: "カード番号",
      dateTime: "日時",
      appId: "アプリケーションID",
      cardType: "カード種類",
      preferredName: "カード名義",
      verifiedBy: "PIN検証済み",
    },
    footer: {
      recycle: "Appleはお使いの不要になった電子機器をリサイクルします。詳細: apple.com/jp/recycle",
      setup: "ご自宅での初期設定およびデータ転送方法について: support.apple.com/ja-jp",
    },
  },
  es: {
    storeName: "Apple Store",
    addressLine1: "Av. Principal 123",
    addressLine2: "Lima, Perú",
    partNumber: "Número de parte",
    serialNumber: "Número de serie",
    imei: "IMEI",
    returnDate: "Fecha límite de devolución",
    forSupportVisit: "Para soporte, visite",
    legalTerms: {
      acceptance: "El uso del producto constituye la aceptación de los términos y condiciones.",
      returnPolicy: (days) =>
        `Si no está satisfecho con su compra, puede devolver el producto dentro de los ${days} días posteriores a la compra.`,
      disagree: "Si no está de acuerdo con estos términos, puede devolver el producto.",
      privacy: "Para obtener información sobre la política de privacidad visite www.apple.com/privacy",
    },
    totals: {
      subtotal: "Subtotal",
      tax: "Impuesto",
      total: "Total",
    },
    payment: {
      paymentMethod: "Método de Pago",
      amountPaidVia: (via) => `Monto pagado mediante ${via}`,
      debitNotice: (last4, amount) => `Débito a la cuenta •••• ${last4} por ${amount}`,
      cardNumber: "Número de Tarjeta",
      dateTime: "Fecha/Hora",
      appId: "ID de Aplicación",
      cardType: "Tipo de Tarjeta",
      preferredName: "Nombre en Tarjeta",
      verifiedBy: "Verificado por PIN",
    },
    footer: {
      recycle: "Apple puede reciclar sus dispositivos antiguos en apple.com/recycle",
      setup: "Aprenda a configurar su producto en support.apple.com",
    },
  },
};

/** Formateador de moneda dinámico según el idioma */
export function formatCurrencyByLocale(amount: number, locale: ReceiptLocale) {
  if (locale === "ja") {
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

/** Formateador de fechas según el idioma */
export function formatDateByLocale(date: Date, locale: ReceiptLocale) {
  if (locale === "ja") {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
  
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = date.getHours() % 12 || 12;
  const ampm = date.getHours() < 12 ? "AM" : "PM";
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${h}:${pad(date.getMinutes())} ${ampm}`;
}