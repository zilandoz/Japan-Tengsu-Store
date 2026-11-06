import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDir = path.join(packageDir, "dist", "public");
const sitemapPath = path.join(outputDir, "sitemap.xml");
const robotsPath = path.join(outputDir, "robots.txt");
const htmlPath = path.join(outputDir, "index.html");
const siteUrl = process.env.VITE_SITE_URL?.trim();

await mkdir(outputDir, { recursive: true });

if (!siteUrl) {
  await rm(sitemapPath, { force: true });
  await writeFile(robotsPath, "User-agent: *\nAllow: /\n");
  const html = await readFile(htmlPath, "utf8");
  await writeFile(
    htmlPath,
    html
      .replace('<meta property="og:url" content="/" />', "")
      .replace('<meta property="og:image" content="/images/japan-tengsu-product.jpeg" />', "")
      .replace('<meta name="twitter:image" content="/images/japan-tengsu-product.jpeg" />', ""),
  );
  process.stdout.write(
    "VITE_SITE_URL is not set; absolute sitemap and structured product metadata are omitted until the production domain is configured.\n",
  );
  process.exit(0);
}

const site = new URL(siteUrl);
if (
  !["http:", "https:"].includes(site.protocol) ||
  site.pathname !== "/" ||
  site.search ||
  site.hash
) {
  throw new Error(
    "VITE_SITE_URL must be an http(s) site origin with no path, query, or fragment.",
  );
}

const origin = site.origin;
const canonicalUrl = `${origin}/`;
const productImageUrl = `${origin}/images/japan-tengsu-product.jpeg`;
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Japan Tengsu",
  description:
    "Product package shown in the supplied photo. The complete ingredient and usage details are not legible in the photo.",
  image: productImageUrl,
  brand: {
    "@type": "Brand",
    name: "Japan Tengsu",
  },
  offers: {
    "@type": "Offer",
    url: canonicalUrl,
    priceCurrency: "USD",
    price: "30.00",
  },
};

let html = await readFile(htmlPath, "utf8");
html = html.replace(
  '<meta property="og:url" content="/" />',
  `<meta property="og:url" content="${canonicalUrl}" />`,
);
html = html.replaceAll(
  'content="/images/japan-tengsu-product.jpeg"',
  `content="${productImageUrl}"`,
);
html = html.replace(
  "</head>",
  `  <link rel="canonical" href="${canonicalUrl}" />\n    <script type="application/ld+json">${JSON.stringify(productSchema)}</script>\n  </head>`,
);

await writeFile(htmlPath, html);
await writeFile(
  sitemapPath,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${canonicalUrl}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
);
await writeFile(
  robotsPath,
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
