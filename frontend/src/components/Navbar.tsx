import Link from "next/link";
import CartLink from "@/components/CartLink";
import Logo from "@/components/Logo";

const NAV_LINKS = [
  { href: "#iPhone", label: "iPhone" },
  { href: "#Mac", label: "Mac" },
  { href: "#iPad", label: "iPad" },
  { href: "#Watch", label: "Watch" },
  { href: "#AirPods", label: "AirPods" },
  { href: "#Accesorios", label: "Accessories" },
  { href: "/ordenes", label: "Orders" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-11 w-full border-b border-[#000000]/10 bg-[rgba(255,255,255,0.8)] backdrop-blur-md backdrop-saturate-150">
      <nav
        aria-label="Global Navigation"
        className="mx-auto flex h-full max-w-[1024px] items-center justify-between px-4 text-[12px] font-normal tracking-tight text-[#1d1d1f]"
      >
        {/* Apple Logo */}
        <Link href="/" aria-label="Apple Store Home" className="opacity-80 transition-opacity hover:opacity-100">
          <Logo size={16} />
        </Link>

        {/* Navigation Categories */}
        <ul className="hidden items-center justify-between gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Utility Icons (Search + Bag) */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            aria-label="Search Store"
            className="opacity-80 transition-opacity hover:opacity-100"
          >
            <svg
              className="h-[15px] w-[15px]"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 12C9.53757 12 12 9.53757 12 6.5C12 3.46243 9.53757 1 6.5 1C3.46243 1 1 3.46243 1 6.5C1 9.53757 3.46243 12 6.5 12Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M10.5 10.5L14 14"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <CartLink />
        </div>
      </nav>
    </header>
  );
}