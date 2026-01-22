import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRightLeft,
  LogOut,
  Settings
} from 'lucide-react';
import { cn } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, label, collapsed }: { to: string, icon: any, label: string, collapsed: boolean }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-4 rounded-xl px-4 py-4 transition-all duration-200 group",
      isActive
        ? "bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        : "text-stone-500 hover:text-stone-900 dark:text-stone-500 dark:hover:text-stone-300"
    )}
  >
    <Icon size={22} strokeWidth={1.5} />
    <AnimatePresence>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className="font-medium text-base whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </NavLink>
);

export const Layout = () => {
  const { theme, toggleTheme } = useAppStore();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
    { to: '/budget', icon: Wallet, label: 'Budgets' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-black text-stone-900 dark:text-stone-100 font-sans">

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-stone-200 dark:border-stone-900 bg-white dark:bg-black transition-all duration-300 h-screen sticky top-0 z-20",
          collapsed ? "w-24" : "w-80"
        )}
      >
        <div className={cn(
          "flex h-24 items-center px-6 transition-all",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="h-10 w-10 bg-stone-900 dark:bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white dark:text-black text-lg font-bold">Z</span>
                </div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-bold tracking-wide uppercase"
                >
                  ZenFinance
                </motion.span>
              </div>
              <button onClick={() => setCollapsed(true)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1">
                <X size={20} />
              </button>
            </>
          ) : (
            <button onClick={() => setCollapsed(false)} className="text-stone-900 dark:text-stone-100 p-2 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg">
              <Menu size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-2 p-4 mt-2">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="p-4 border-t border-stone-100 dark:border-stone-900 space-y-2">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl px-4 py-3 text-stone-500 hover:text-stone-900 dark:text-stone-500 dark:hover:text-stone-300 transition-colors",
              collapsed && "justify-center px-0"
            )}
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            {!collapsed && <span className="text-base font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>

          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl px-4 py-3 text-stone-500 hover:text-red-600 dark:text-stone-500 dark:hover:text-red-400 transition-colors",
              collapsed && "justify-center px-0"
            )}
            title="Sign Out"
          >
            <LogOut size={22} />
            {!collapsed && <span className="text-base font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-950/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white dark:bg-black border-r border-stone-200 dark:border-stone-800 z-50 md:hidden p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-stone-900 dark:bg-stone-100 rounded-full flex items-center justify-center">
                    <span className="text-white dark:text-black text-sm font-bold">Z</span>
                  </div>
                  <span className="text-xl font-bold tracking-wide uppercase">ZenFinance</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
              </div>
              <nav className="space-y-2 flex-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 rounded-xl px-4 py-4 transition-all",
                      isActive
                        ? "bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                        : "text-stone-500"
                    )}
                  >
                    <item.icon size={22} />
                    <span className="font-medium text-base">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-stone-100 dark:border-stone-900 space-y-3">
                <button onClick={toggleTheme} className="flex items-center gap-4 w-full px-4 py-3 text-stone-500 dark:text-stone-400">
                  {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                  <span className="text-base">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                <button onClick={handleLogout} className="flex items-center gap-4 w-full px-4 py-3 text-stone-500 hover:text-red-500 dark:text-stone-400">
                  <LogOut size={22} />
                  <span className="text-base">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b border-stone-200 dark:border-stone-900 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="-ml-2 p-2">
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg uppercase tracking-wide">ZenFinance</span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 md:pt-10 bg-stone-50/50 dark:bg-black">
          <Outlet />
        </div>
      </main>
    </div>
  );
};