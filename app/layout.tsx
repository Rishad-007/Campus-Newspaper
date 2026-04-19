import type { Metadata } from "next";
import {
  Noto_Serif_Bengali,
  Playfair_Display,
  Source_Sans_3,
} from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

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
  title: "Daily Darpan",
  description: "Responsive bilingual newspaper UI prototype built with Next.js",
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
      </body>
    </html>
  );
}
