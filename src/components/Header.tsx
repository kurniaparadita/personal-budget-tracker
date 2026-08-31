'use client';

import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const MENU_MAP: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/transaksi': 'Pemasukan & Pengeluaran',
  '/tagihan': 'Tagihan Online',
  '/tabungan': 'Tabungan & Uang Darurat',
  '/history': 'Riwayat Bulanan'
};

export default function Header() {
  const pathname = usePathname();
  const pageTitle = MENU_MAP[pathname] || 'Personal Budget Tracker';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl px-4 sm:gap-x-6 sm:px-6 lg:px-8">
        <button 
          type="button" 
          className="-m-2.5 p-2.5 text-zinc-700 dark:text-zinc-300 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 lg:hidden" aria-hidden="true" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex flex-1 items-center">
            <h1 className="text-xl font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown (Simple version) */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 z-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-lg px-4 py-4 space-y-2">
          {Object.entries(MENU_MAP).map(([path, label]) => (
            <Link 
              key={path} 
              href={path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname === path ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
