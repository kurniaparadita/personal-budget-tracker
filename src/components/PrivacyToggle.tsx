'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useBudget } from '@/context/BudgetContext';

export default function PrivacyToggle() {
  const [mounted, setMounted] = useState(false);
  const { isPrivacyMode, togglePrivacyMode } = useBudget();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={togglePrivacyMode}
      className={`relative p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isPrivacyMode
          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-sm'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
      }`}
      title={isPrivacyMode ? 'Privacy Mode Aktif (Klik untuk tampilkan saldo)' : 'Privacy Mode (Klik untuk sensor saldo)'}
      aria-label="Toggle Privacy Mode"
    >
      {isPrivacyMode ? (
        <>
          <EyeOff className="w-5 h-5 animate-in zoom-in-75 duration-150" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        </>
      ) : (
        <Eye className="w-5 h-5 animate-in zoom-in-75 duration-150" />
      )}
    </button>
  );
}
