import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Okane - Gestionnaire de finances personnelles",
  description: "Gérez vos finances, multi-comptes et multi-devises. Import CSV, budgets, graphiques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('okane-theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
              (function(){var w=console.warn;console.warn=function(){if(typeof arguments[0]==='string'&&arguments[0].indexOf('width')!==-1&&arguments[0].indexOf('height')!==-1&&arguments[0].indexOf('greater than 0')!==-1)return;w.apply(console,arguments)}})()
            `,
          }}
        />
      </head>
      <body className="min-h-full transition-colors duration-300">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
