import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ChatButton from './ChatButton';
import ChatModal from './ChatModal';
import ReactiveField from './ReactiveField';

const navigation = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Progress', path: '/dashboard' },
  { label: 'Profile', path: '/profile' },
  { label: 'Proof', path: '/reliability' },
];

const Layout = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <ReactiveField />

      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="mx-auto flex max-w-7xl items-stretch justify-between border border-black/10 bg-[#f8f6f0]/88 shadow-[0_14px_44px_-30px_rgba(17,24,39,0.65)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0a1321]/88">
          <Link
            to="/"
            className="group flex min-h-12 items-center gap-3 border-r border-black/10 px-4 dark:border-white/10 sm:min-h-14 sm:px-5"
            aria-label="AAMU Advising Assistant home"
          >
            <span className="grid h-7 w-7 place-items-center bg-primary-800 font-utility text-[0.55rem] font-black uppercase tracking-tight text-white transition-transform group-hover:-rotate-6 dark:bg-secondary-300 dark:text-[#111827]">
              A&amp;M
            </span>
            <span className="hidden text-left sm:block">
              <span className="block font-utility text-[0.58rem] font-bold uppercase tracking-[0.2em] text-primary-700 dark:text-secondary-300">The Hill</span>
              <span className="mt-0.5 block text-xs font-semibold text-slate-900 dark:text-white">Advising field</span>
            </span>
          </Link>

          <nav className="hidden items-stretch md:flex" aria-label="Main navigation">
            {navigation.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex min-w-[76px] items-center justify-center border-r border-black/10 px-4 font-utility text-[0.62rem] font-bold uppercase tracking-[0.14em] transition-colors dark:border-white/10 ${
                    active
                      ? 'bg-[#131820] text-white dark:bg-secondary-300 dark:text-[#101722]'
                      : 'text-slate-600 hover:bg-primary-500/10 hover:text-primary-800 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-secondary-300'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-primary-500 dark:bg-primary-700" />}
                </Link>
              );
            })}
            <button
              onClick={toggleTheme}
              className="grid w-14 place-items-center text-slate-700 transition hover:bg-secondary-300/35 hover:text-primary-800 dark:text-slate-200 dark:hover:bg-primary-800/50 dark:hover:text-secondary-300"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
          </nav>

          <div className="flex md:hidden">
            <button
              onClick={toggleTheme}
              className="grid w-12 place-items-center border-r border-black/10 text-slate-700 dark:border-white/10 dark:text-slate-200"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(open => !open)}
              className="grid w-12 place-items-center bg-[#131820] text-white dark:bg-secondary-300 dark:text-[#111827]"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              className="mx-auto mt-1 max-w-7xl border border-black/10 bg-[#f8f6f0] p-2 shadow-xl dark:border-white/10 dark:bg-[#0a1321] md:hidden"
              aria-label="Mobile navigation"
            >
              {navigation.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between border-b px-4 py-3 text-sm font-semibold last:border-0 ${active ? 'border-primary-700 bg-primary-800 text-white' : 'ink-border text-slate-700 dark:text-slate-200'}`}
                  >
                    {item.label}<span className="font-utility text-[0.6rem] uppercase tracking-[0.16em]">Open</span>
                  </Link>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer className="relative z-10 border-t border-black/10 bg-[#ece6dc]/95 dark:border-white/10 dark:bg-[#07101d]/95">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-[1fr_auto] sm:items-end sm:px-8">
          <div>
            <p className="font-display text-2xl italic text-slate-900 dark:text-white">Evidence for your next move.</p>
            <p className="mt-2 font-utility text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} GDG on Campus · Alabama A&amp;M University</p>
          </div>
          <Link to="/about" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-700 dark:text-secondary-300">
            Meet the builders <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </footer>

      <ChatButton />
      <ChatModal />
    </div>
  );
};

export default Layout;
