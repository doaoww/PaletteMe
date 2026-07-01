/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaletteMe — Discover the version of you that actually works",
  description:
    "Upload one selfie and see your best colors, makeup, hair, jewelry and styles on your own face. Your AI personal stylist.",
  openGraph: {
    title: "PaletteMe — Your AI personal stylist",
    description:
      "Upload one selfie. Get a personal beauty blueprint built on YOU.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400;1,9..40,500&family=Allura&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col stitch-dreamy-bg">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
