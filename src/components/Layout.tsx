import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const navItems = [
    { name: 'Calendar view', path: '/' },
    { name: 'Report', path: '/report' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="border-b border-slate-200">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-12">
            <h1 className="text-2xl font-bold tracking-tight">Smart Track</h1>
            <nav className="flex items-center gap-8 h-full">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'h-16 flex items-center px-1 text-sm font-medium border-b-2 transition-colors',
                    location.pathname === item.path
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border border-slate-300 bg-slate-50"></div>
          </div>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
