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
  title: "Personal Budget Tracker",
  description: "Kelola keuangan pribadi Anda dengan mudah dan rapi.",
};

import { ThemeProvider } from "@/components/ThemeProvider";
import { BudgetProvider } from "@/context/BudgetContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DatabaseStatusBanner from "@/components/DatabaseStatusBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function clean() {
                  document.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                    el.removeAttribute('bis_skin_checked');
                  });
                }
                clean();
                if (typeof MutationObserver !== 'undefined') {
                  new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.attributeName === 'bis_skin_checked' && m.target && m.target.removeAttribute) {
                        m.target.removeAttribute('bis_skin_checked');
                      }
                    }
                  }).observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked']
                  });
                }
              })();
            `
          }}
        />
      </head>
      <body className="h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <BudgetProvider>
            <div className="flex h-screen w-full" suppressHydrationWarning>
              {/* Sidebar for Desktop */}
              <Sidebar />
              
              {/* Main Content Wrapper */}
              <div className="flex flex-1 flex-col min-w-0" suppressHydrationWarning>
                {/* Top Header */}
                <Header />
                
                {/* Database Paused / Offline Banner */}
                <DatabaseStatusBanner />
                
                {/* Scrollable Main Content */}
                <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 bg-zinc-50/50 dark:bg-zinc-950/50">
                  <div className="w-full animate-in fade-in duration-500">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </BudgetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
