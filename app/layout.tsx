import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem VRI Ipoh",
  description: "Takwim Pejabat & Tempahan Bilik — Institut Penyelidikan Veterinar Ipoh, JPV Malaysia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Image src="/vri-logo.png" alt="Logo VRI Ipoh" width={36} height={36} />
              VRI Ipoh <span className="font-normal text-slate-400">| JPV Malaysia</span>
            </Link>
            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/takwim/2026" className="text-vri-blue hover:underline">
                Takwim 2026
              </Link>
              <Link href="/takwim/2027" className="text-vri-purple hover:underline">
                Takwim 2027
              </Link>
              <Link href="/tempahan" className="text-vri-terracotta hover:underline">
                Tempahan Bilik
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
