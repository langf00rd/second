import { AppProvider } from "@/components/app-provider";
import { QueryProvider } from "@/components/query-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Second",
    template: "%s | Second",
  },
  description:
    "Transform your scattered thoughts into organized knowledge. Second uses AI to help you capture, connect, and recall information effortlessly.",
  keywords: [
    "second",
    "AI notes",
    "note taking",
    "knowledge management",
    "productivity",
    "artificial intelligence",
  ],
  authors: [{ name: "Second" }],
  creator: "Second",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Second",
    title: "Second",
    description:
      "Transform your scattered thoughts into organized knowledge. Second uses AI to help you capture, connect, and recall information effortlessly.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Second",
    description:
      "Transform your scattered thoughts into organized knowledge. Second uses AI to help you capture, connect, and recall information effortlessly.",
    creator: "@second",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <QueryProvider>{children}</QueryProvider>
        </AppProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
