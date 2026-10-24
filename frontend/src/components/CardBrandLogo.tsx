type Brand = "visa" | "mastercard" | "amex" | "discover" | "generic";

function normalizeBrand(value: string | undefined): Brand {
  const v = (value ?? "").toLowerCase();
  if (v.includes("visa")) return "visa";
  if (v.includes("master")) return "mastercard";
  if (v.includes("amex") || v.includes("american")) return "amex";
  if (v.includes("discover")) return "discover";
  return "generic";
}

export default function CardBrandLogo({ brand }: { brand?: string }) {
  const type = normalizeBrand(brand);

  if (type === "visa") {
    return (
      <svg width="48" height="16" viewBox="0 0 48 16" aria-label="Visa" role="img">
        <text x="0" y="14" fill="#1A1F71" fontFamily="Arial, sans-serif" fontWeight="bold" fontStyle="italic" fontSize="17">
          VISA
        </text>
      </svg>
    );
  }

  if (type === "mastercard") {
    return (
      <svg width="30" height="20" viewBox="0 0 30 20" aria-label="Mastercard" role="img">
        <circle cx="10" cy="10" r="9" fill="#EB001B" />
        <circle cx="20" cy="10" r="9" fill="#F79E1B" />
        <path d="M15 3.2a9 9 0 0 1 0 13.6 9 9 0 0 1 0-13.6z" fill="#FF5F00" />
      </svg>
    );
  }

  if (type === "amex") {
    return (
      <svg width="40" height="20" viewBox="0 0 40 20" aria-label="American Express" role="img">
        <rect width="40" height="20" rx="3" fill="#2E77BC" />
        <text x="20" y="14" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="9">
          AMEX
        </text>
      </svg>
    );
  }

  if (type === "discover") {
    return (
      <svg width="48" height="20" viewBox="0 0 48 20" aria-label="Discover" role="img">
        <rect width="48" height="20" rx="3" fill="#FFFFFF" stroke="#D0D0D0" />
        <text x="6" y="14" fill="#231F20" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="9">
          DISCOVER
        </text>
        <circle cx="41" cy="10" r="5" fill="#F58220" />
      </svg>
    );
  }

  return (
    <svg width="34" height="20" viewBox="0 0 34 20" aria-label="Card" role="img">
      <rect width="34" height="20" rx="3" fill="#E5E5EA" />
      <rect x="4" y="11" width="10" height="3" rx="1" fill="#8E8E93" />
    </svg>
  );
}