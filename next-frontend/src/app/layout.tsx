import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "doodle",
  description: "doodle and whatnot",
  icons: {
    icon: "./favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.png" sizes="any" />
      <body>{children}</body>
    </html>
  );
}
