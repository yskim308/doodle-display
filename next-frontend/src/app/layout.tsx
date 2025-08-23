import type { Metadata } from "next";
import "./globals.css";

import { Typography, Box } from "@mui/material";
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
    <html lang="en" className="h-full w-full">
      <link rel="icon" href="/favicon.png" sizes="any" />
      <body className="w-full h-full bg-black text-white">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
          }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: "240px", height: "auto" }}
          />
        </Box>
        {children}
      </body>
    </html>
  );
}
