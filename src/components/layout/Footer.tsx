import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-hairline">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-display text-lg font-bold">
            MOV<span className="text-accent">ORA</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Search films, keep a watchlist, lose fewer evenings to scrolling.
          </p>
        </div>

        <nav aria-label="Footer" className="flex gap-5 text-sm text-muted">
          <Link to="/" className="hover:text-chalk">
            Home
          </Link>
          <Link to="/discover" className="hover:text-chalk">
            Discover
          </Link>
          <Link to="/favorites" className="hover:text-chalk">
            Favourites
          </Link>
        </nav>
      </div>
    </footer>
  );
}
