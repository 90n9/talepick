import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalePick - Frontend",
  description: "TalePick frontend application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
