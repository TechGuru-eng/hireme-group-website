import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: "https://hiremegroup.com", lastModified, changeFrequency: "weekly", priority: 1 },
    { url: "https://hiremegroup.com/publicite", lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://hiremegroup.com/email-marketing", lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
