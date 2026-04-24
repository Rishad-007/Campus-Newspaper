import type { Metadata } from "next";
import Script from "next/script";
import {
  Noto_Serif_Bengali,
  Playfair_Display,
  Source_Sans_3,
} from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dailybrur.com";

const newspaperDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const newspaperBody = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const banglaBody = Noto_Serif_Bengali({
  variable: "--font-bangla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Daily BRUR",
    template: "%s | Daily BRUR",
  },
  description: "Campus newspaper of Begum Rokeya University, Rangpur",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      bn: "/",
    },
  },
  openGraph: {
    title: "Daily BRUR",
    description: "Campus newspaper of Begum Rokeya University, Rangpur",
    url: SITE_URL,
    siteName: "Daily BRUR",
    locale: "en_GB",
    alternateLocale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily BRUR",
    description: "Campus newspaper of Begum Rokeya University, Rangpur",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newspaperDisplay.variable} ${newspaperBody.variable} ${banglaBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-GMM4NSH2QX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GMM4NSH2QX');
          `}
        </Script>
      </body>
    </html>
  );
}
