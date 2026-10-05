import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HireMe — Emploi, carrière et opportunités", short_name: "HireMe",
    description: "L’écosystème emploi et carrière qui accompagne les talents au Cameroun.",
    start_url: "/", display: "standalone", background_color: "#070707", theme_color: "#ffe600", lang: "fr-CM",
    icons: [
      { src: "/icon-192.png?v=4", sizes: "192x192", type: "image/png" },
      { src: "/apple-touch-icon.png?v=4", sizes: "180x180", type: "image/png" },
    ],
  };
}
