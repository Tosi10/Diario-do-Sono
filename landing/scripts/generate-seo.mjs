import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(
  readFileSync(join(root, "seo.config.json"), "utf8")
);

function loadSiteUrl() {
  if (process.env.VITE_SITE_URL) {
    return process.env.VITE_SITE_URL.trim().replace(/\/$/, "");
  }
  for (const file of [".env.production", ".env"]) {
    try {
      const env = readFileSync(join(root, file), "utf8");
      const match = env.match(/^VITE_SITE_URL=(.+)$/m);
      if (match) return match[1].trim().replace(/\/$/, "");
    } catch {
      /* optional file */
    }
  }
  return config.defaultSiteUrl.replace(/\/$/, "");
}

const siteUrl = loadSiteUrl();
const ogImage = `${siteUrl}${config.ogImagePath}`;

const robots = `# Gerado por scripts/generate-seo.mjs — não editar à mão
User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: config.title,
      description: config.description,
      inLanguage: "pt-BR",
    },
    {
      "@type": "Physician",
      "@id": `${siteUrl}/#physician`,
      name: config.physician.name,
      givenName: config.physician.givenName,
      familyName: config.physician.familyName,
      jobTitle: config.physician.jobTitle,
      medicalSpecialty: "Psychiatric",
      image: ogImage,
      url: `${siteUrl}/`,
      telephone: config.physician.telephone,
      email: config.physician.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: config.clinic.streetAddress,
        addressLocality: config.clinic.addressLocality,
        addressRegion: config.clinic.addressRegion,
        postalCode: config.clinic.postalCode,
        addressCountry: config.clinic.addressCountry,
      },
      worksFor: {
        "@type": "MedicalBusiness",
        "@id": `${siteUrl}/#clinic`,
      },
    },
    {
      "@type": "MedicalBusiness",
      "@id": `${siteUrl}/#clinic`,
      name: config.clinic.name,
      url: `${siteUrl}/`,
      telephone: config.physician.telephone,
      email: config.physician.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: config.clinic.streetAddress,
        addressLocality: config.clinic.addressLocality,
        addressRegion: config.clinic.addressRegion,
        postalCode: config.clinic.postalCode,
        addressCountry: config.clinic.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -25.4284,
        longitude: -49.2733,
      },
    },
  ],
};

writeFileSync(join(root, "public", "robots.txt"), robots, "utf8");
writeFileSync(join(root, "public", "sitemap.xml"), sitemap, "utf8");
writeFileSync(
  join(root, "public", "structured-data.json"),
  `${JSON.stringify(structuredData, null, 2)}\n`,
  "utf8"
);

console.log(`[seo] siteUrl=${siteUrl}`);
console.log("[seo] wrote public/robots.txt, sitemap.xml, structured-data.json");
