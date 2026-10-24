import { writeFile } from "node:fs/promises";
import { load } from "cheerio";

const BASE_URL = "https://www.apple.com";
const USER_AGENT = "apple-order-desk-practica/1.0 (uso educativo, bajo volumen)";
const DELAY_MS = 2500;
const OUTPUT_FILE = "scraped-apple-products.json";

// Páginas de categoría de la tienda (en inglés)
const CATEGORY_PAGES: { path: string; category: string }[] = [
  { path: "/shop/buy-iphone", category: "iPhone" },
  { path: "/shop/buy-mac", category: "Mac" },
  { path: "/shop/buy-ipad", category: "iPad" },
  { path: "/shop/buy-watch", category: "Watch" },
  { path: "/shop/buy-airpods", category: "AirPods" },
];

interface ScrapedProduct {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} en ${url}`);
  }

  return res.text();
}

// Revisa robots.txt: si la ruta está prohibida para todos los bots, no continuamos
async function isAllowed(path: string): Promise<boolean> {
  const robots = await fetchText(`${BASE_URL}/robots.txt`);
  let appliesToAll = false;
  const disallowed: string[] = [];

  for (const raw of robots.split("\n")) {
    const line = raw.split("#")[0].trim();
    if (!line) continue;

    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();

    if (key.toLowerCase() === "user-agent") {
      appliesToAll = value === "*";
    } else if (appliesToAll && key.toLowerCase() === "disallow" && value) {
      disallowed.push(value);
    }
  }

  return !disallowed.some((rule) => path.startsWith(rule));
}

// Extrae productos de los bloques JSON-LD (schema.org) de la página
function extractFromJsonLd(html: string, category: string): ScrapedProduct[] {
  const $ = load(html);
  const products: ScrapedProduct[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    let data: unknown;
    try {
      data = JSON.parse($(el).contents().text());
    } catch {
      return;
    }

    const nodes: any[] = Array.isArray(data)
      ? data
      : (data as any)?.["@graph"] ?? [data];

    for (const node of nodes) {
      if (node?.["@type"] !== "Product") continue;

      const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
      const price = Number(offer?.price ?? 0);
      const image = Array.isArray(node.image) ? node.image[0] : node.image;

      if (!node.name || !price) continue;

      products.push({
        name: String(node.name).trim(),
        category,
        price,
        stock: offer?.availability?.includes("InStock") ? 10 : 0,
        description: String(node.description ?? "").replace(/\s+/g, " ").trim().slice(0, 300),
        image: typeof image === "string" ? image : "",
      });
    }
  });

  return products;
}

async function main() {
  console.log("Revisando robots.txt...");

  const all: ScrapedProduct[] = [];

  for (const page of CATEGORY_PAGES) {
    if (!(await isAllowed(page.path))) {
      console.warn(`robots.txt prohíbe ${page.path}. Se omite.`);
      continue;
    }

    console.log(`Leyendo ${page.category} (${page.path})...`);

    try {
      const html = await fetchText(`${BASE_URL}${page.path}`);
      const found = extractFromJsonLd(html, page.category);
      console.log(`  Productos encontrados: ${found.length}`);
      all.push(...found);
    } catch (error) {
      console.warn(`  Error: ${(error as Error).message}`);
    }

    await sleep(DELAY_MS);
  }

  // Quitamos duplicados por nombre
  const unique = [...new Map(all.map((p) => [p.name, p])).values()];

  console.log(`\nTotal de productos únicos: ${unique.length}`);

  if (unique.length === 0) {
    console.log(
      "No se encontró JSON-LD con productos. Apple pudo cambiar su HTML o bloquear la petición."
    );
    return;
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(unique, null, 2), "utf8");
  console.log(`Guardado en ${OUTPUT_FILE}. Revísalo antes de importarlo a MongoDB.`);
}

main().catch((error) => {
  console.error("Error en el scraping:", (error as Error).message);
  process.exit(1);
});
