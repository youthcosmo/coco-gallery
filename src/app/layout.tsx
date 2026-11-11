import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COCO Gallery",
  description: "Curated Minimal Photography - COCO Gallery",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
