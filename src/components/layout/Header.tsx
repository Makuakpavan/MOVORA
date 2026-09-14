import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Heart, LogOut, Menu, User as UserIcon, X } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/discover', label: 'Discover', end: false },
  { to: '/favorites', label: 'Favourites', end: false },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close both menus whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  // Close the user menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-screen/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0 font-display text-xl font-extrabold tracking-tight"
          style={{ fontVariationSettings: "'wdth' 115" }}
        >
          MOV<span className="text-accent">ORA</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-2 text-sm transition-colors',
                  isActive ? 'bg-raised text-chalk' : 'text-muted hover:text-chalk',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden max-w-sm flex-1 lg:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          {isAuthenticated ? (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-hairline bg-surface py-1.5 pl-1.5 pr-3.5 text-sm transition-colors hover:bg-raised"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold">
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </span>
                <span className="max-w-24 truncate">{user?.name}</span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-hairline bg-surface shadow-xl shadow-black/40"
                >
                  <p className="truncate border-b border-hairline px-4 py-3 text-xs text-muted">
                    {user?.email}
                  </p>
                  <Link
                    role="menuitem"
                    to="/favorites"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted hover:bg-raised hover:text-chalk"
                  >
                    <Heart aria-hidden className="size-4" />
                    Your favourites
                  </Link>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => void logout()}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-muted hover:bg-raised hover:text-chalk"
                  >
                    <LogOut aria-hidden className="size-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-chalk"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-chalk transition-colors hover:bg-accent-soft"
              >
                Create account
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="rounded-lg p-2 text-muted hover:text-chalk md:hidden"
          >
            {mobileOpen ? (
              <X aria-hidden className="size-5" />
            ) : (
              <Menu aria-hidden className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Search is always reachable on small screens, menu open or not. */}
      <div className="border-t border-hairline px-4 py-2.5 sm:px-6 lg:hidden">
        <SearchBar />
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-hairline bg-surface px-4 py-3 md:hidden"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-lg px-3 py-2.5 text-sm',
                      isActive ? 'bg-raised text-chalk' : 'text-muted',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-3 border-t border-hairline pt-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted"
              >
                <LogOut aria-hidden className="size-4" />
                Sign out of {user?.name}
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-hairline py-2.5 text-sm"
                >
                  <UserIcon aria-hidden className="size-4" />
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex flex-1 items-center justify-center rounded-full bg-accent py-2.5 text-sm font-medium"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
