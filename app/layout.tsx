import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Sunday4K — Your Life in Weeks",
    template: "%s | Sunday4K",
  },
  description:
    "See your life in weeks. Plan your weeks intentionally. Sunday4K helps you make every week count with curated resources and life compass tools.",
  metadataBase: new URL("https://sunday4k.life"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sunday4K",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sunday4K — Your Life in Weeks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
