import type { Metadata } from "next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "./globals.css";

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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
