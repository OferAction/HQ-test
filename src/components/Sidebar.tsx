'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, ScrollText } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ActOneIcon from './ActOneIcon';

const navItems = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Reviews', href: '/reviews', icon: ClipboardList },
  { label: 'Logs', href: '/logs', icon: ScrollText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  return (
    <aside className="w-[150px] h-full bg-canvas flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 h-16 flex items-center border-b border-line">
        <img src={logoSrc} alt="ActionHQ" className="h-5 w-auto" />
      </div>

      {/* Nav + bottom — bordered section */}
      <div className="flex-1 flex flex-col border-r border-line">
        <nav className="px-3 py-4 flex flex-col gap-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-selected text-ink'
                    : 'text-ink-3 hover:text-ink hover:bg-hover'
                }`}
              >
                <Icon size={16} className={active ? 'text-blue-400' : 'text-ink-4'} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Separator + ActOne */}
        <div className="px-3 pb-2">
          <div className="border-t border-line mb-3" />
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-3 hover:text-ink hover:bg-hover w-full transition-colors">
            <ActOneIcon size={16} className="text-ink-4" />
            ActOne
          </button>
        </div>
      </div>
    </aside>
  );
}
