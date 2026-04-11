import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "calsync",
  description: "Unified view of your Google Calendars",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">{children}</body>
    </html>
  );
}
