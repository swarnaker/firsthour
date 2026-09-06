import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIRSTHOUR - Pons First Hour Research",
  description: "Signal-only Pons first hour tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
