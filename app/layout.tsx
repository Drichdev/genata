import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Genata",
  description: "Générateur de données",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-1">{children}</main>

        <footer className="border-t">
          <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between">
            <div>
              © 2025 • <span className="font-semibold">Genata</span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Auteur: <span className="font-medium">Drichdev</span>
              </span>
              <a
                href="https://github.com/Drichdev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
