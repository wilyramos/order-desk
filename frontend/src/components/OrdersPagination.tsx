// File: frontend/src/components/OrdersPagination.tsx

import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  /** Parámetros extra que deben conservarse en los enlaces (p. ej. ?nuevo=) */
  extraParams?: Record<string, string | undefined>;
};

function buildHref(page: number, extraParams: Record<string, string | undefined> = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extraParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/ordenes?${query}` : "/ordenes";
}

const linkBase = "rounded-full px-3 py-1.5 text-sm transition";
const linkIdle = "text-[#6e6e73] hover:bg-black/5 hover:text-[#1d1d1f]";
const linkDisabled = "cursor-default text-[#c7c7cc]";

export default function OrdersPagination({ currentPage, totalPages, extraParams }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="Paginación de pedidos" className="mt-10 flex items-center justify-center gap-1">
      {hasPrev ? (
        <Link href={buildHref(currentPage - 1, extraParams)} className={`${linkBase} ${linkIdle}`}>
          ‹ Anterior
        </Link>
      ) : (
        <span className={`${linkBase} ${linkDisabled}`}>‹ Anterior</span>
      )}

      {pages.map((page) =>
        page === currentPage ? (
          <span
            key={page}
            aria-current="page"
            className="min-w-[2rem] rounded-full bg-[#1d1d1f] px-3 py-1.5 text-center text-sm font-medium text-white"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page, extraParams)}
            className={`${linkBase} min-w-[2rem] text-center ${linkIdle}`}
          >
            {page}
          </Link>
        )
      )}

      {hasNext ? (
        <Link href={buildHref(currentPage + 1, extraParams)} className={`${linkBase} ${linkIdle}`}>
          Siguiente ›
        </Link>
      ) : (
        <span className={`${linkBase} ${linkDisabled}`}>Siguiente ›</span>
      )}
    </nav>
  );
}
