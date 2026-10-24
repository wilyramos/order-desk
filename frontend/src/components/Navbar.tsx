import Link from "next/link";
import CartLink from "@/components/CartLink";
import Logo from "@/components/Logo";

const LINKS = [
  { href: "#iPhone", label: "iPhone" },
  { href: "#Mac", label: "Mac" },
  { href: "#iPad", label: "iPad" },
  { href: "#Watch", label: "Watch" },
  { href: "#AirPods", label: "AirPods" },
  { href: "#Accesorios", label: "Accesorios" },
  { href: "/ordenes", label: "Pedidos" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#fbfbfd]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#fbfbfd]/60">
      <nav
        aria-label="Global"
        className="mx-auto flex h-11 max-w-[980px] items-center justify-between px-4 text-[12px] text-[#1d1d1f]"
      >
        <Link href="/" aria-label="Inicio" className="flex items-center">
          <Logo size={16} />
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="font-normal opacity-80 transition-opacity hover:opacity-100">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <CartLink />
      </nav>
    </header>
  );
}