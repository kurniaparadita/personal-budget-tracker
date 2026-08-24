'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, Receipt, PiggyBank, Target } from 'lucide-react';
import { useState } from 'react';

const MENU_ITEMS = [
  { id: '/', label: 'Dashboard', icon: LayoutDashboard },
  { id: '/transaksi', label: 'Transaksi', icon: Wallet },
  { id: '/tagihan', label: 'Tagihan Online', icon: Receipt },
  { id: '/tabungan', label: 'Tabungan & Tujuan', icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl h-screen sticky top-0">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <PiggyBank className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Budget<span className="text-blue-600 dark:text-blue-500">Tracker</span></span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 px-2">Menu Utama</div>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.id;
          
          return (
            <Link
              key={item.id}
              href={item.id}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 mt-auto border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-300 shrink-0">
            AG
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">Admin Ganteng</span>
            <span className="text-xs text-zinc-500 truncate">admin@budget.io</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
