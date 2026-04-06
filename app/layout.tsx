import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LTO MID 2026 — Admin Portal",
  description: "User Access Authorization System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
