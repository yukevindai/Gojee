import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrassMaxxing - Touching grass made simple",
  description: "Discover amazing places, connect with nature, and make the most of your outdoor experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
