import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "calsync",
  description: "A quiet, unified view of your Google Calendars.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
