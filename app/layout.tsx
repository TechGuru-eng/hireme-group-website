import type { Metadata, Viewport } from "next";
import { Manrope, Syne } from "next/font/google";
import "./globals.css";
import MotionEnhancements from "./MotionEnhancements";
import MobileExperience from "./MobileExperience";
import WhatsAppSupport from "./WhatsAppSupport";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffdf00",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hiremegroup.com"),
  title: { default: "HireMe — Emploi, carrière et opportunités au Cameroun", template: "%s | HireMe" },
  description: "HireMe accompagne les talents au Cameroun avec des offres d’emploi, des CV professionnels, des formations, des outils et une communauté active.",
  applicationName: "HireMe",
  authors: [{ name: "HireMe Group", url: "https://hiremegroup.com" }],
  creator: "HireMe Group",
  publisher: "HireMe Group",
  category: "Emploi et carrière",
  keywords: ["emploi Cameroun", "offres d'emploi Cameroun", "recherche emploi", "CV professionnel", "CV ATS", "formation professionnelle", "recrutement Cameroun", "HireMe"],
  alternates: { canonical: "/", languages: { "fr-CM": "/" } },
  openGraph: {
    type: "website", locale: "fr_CM", url: "/", siteName: "HireMe",
    title: "HireMe — Votre avenir professionnel commence ici",
    description: "Offres d’emploi, CV professionnels, formations, outils et communauté pour accélérer votre carrière au Cameroun.",
    images: [{ url: "/hero-professional.png", width: 1024, height: 1536, alt: "HireMe accompagne les talents vers les opportunités professionnelles" }],
  },
  twitter: {
    card: "summary_large_image", title: "HireMe — Emploi et carrière au Cameroun",
    description: "Trouvez des opportunités, améliorez votre CV et développez votre carrière avec HireMe.", images: ["/hero-professional.png"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=4", sizes: "any" },
      { url: "/favicon-32.png?v=4", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico?v=4",
    apple: [{ url: "/apple-touch-icon.png?v=4", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization", "@id": "https://hiremegroup.com/#organization", name: "HireMe Group",
        url: "https://hiremegroup.com", logo: "https://hiremegroup.com/favicon.svg", email: "admin@hiremeguide.com",
        foundingDate: "2022", areaServed: { "@type": "Country", name: "Cameroun" },
        sameAs: ["https://www.linkedin.com/company/hireme-cm", "https://www.whatsapp.com/channel/0029Vb6XRzI1t90bk6USq33g"],
      },
      {
        "@type": "WebSite", "@id": "https://hiremegroup.com/#website", url: "https://hiremegroup.com",
        name: "HireMe", inLanguage: "fr-CM", publisher: { "@id": "https://hiremegroup.com/#organization" },
      },
    ],
  };

  return (
    <html lang="fr">
      <head><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></head>
      <body
        className={`${manrope.variable} ${syne.variable} antialiased`}
      >
        <MotionEnhancements />
        <MobileExperience />
        {children}
        <WhatsAppSupport />
      </body>
    </html>
  );
}
