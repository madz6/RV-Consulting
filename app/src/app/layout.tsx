import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pricing Strategy Workbench — D0 demonstrator",
  description: "Evidence-to-decision workspace for pricing consultants (synthetic hackathon demonstrator)",
};

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/case", label: "Case & Research" },
  { href: "/strategy", label: "Strategy Studio" },
  { href: "/model", label: "Model & Decision" },
  { href: "/package", label: "Decision Package" },
  { href: "/audit", label: "Audit & Lineage" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-neutral-50 text-neutral-900">
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-xs px-4 py-1.5 text-center font-medium print:hidden">
          SYNTHETIC DEMONSTRATOR — fictitious case data; one author + one reviewer; terminal state is “ready for review”. Not production software; no legal, compliance or willingness-to-pay claims.
        </div>
        <div className="flex min-h-screen">
          <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white print:hidden">
            <div className="px-4 py-5 border-b border-neutral-200">
              <div className="font-semibold text-sm tracking-tight">Pricing Strategy Workbench</div>
              <div className="text-xs text-neutral-500 mt-0.5">D0 hackathon demonstrator</div>
            </div>
            <nav className="p-2 space-y-0.5">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900">
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="px-4 py-3 mt-4 border-t border-neutral-200 text-[11px] leading-relaxed text-neutral-400">
              Spine: framing → research → evidence → strategy → model → recommendation → package
            </div>
          </aside>
          <main className="flex-1 min-w-0 px-8 py-6 print:px-0 print:py-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
