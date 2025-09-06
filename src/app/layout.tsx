import type { Metadata, Viewport } from "next";
import { Noto_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Signage",
  description: "ACM @ UIUC Digital Signage",
  authors: [{ name: "ACM @ UIUC Team", url: "https://acm.illinois.edu" }]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSans.variable} ${jetBrainsMono.variable} antialiased bg-acmblue text-white`}
      >
        {children}
      </body>
    </html>
  );
}
