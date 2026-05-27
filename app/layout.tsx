import type { Metadata } from "next";
import { Jost, Playfair_Display, Source_Sans_3 } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const heading = Jost({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Content OS - Thinking amplification for founders & creators",
  description:
    "Discover high-signal topics, generate drafts in your voice, and publish on your terms. Built for founders, engineers, creators, and anyone building in public.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${body.variable} ${heading.variable} ${display.variable} min-h-screen font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
