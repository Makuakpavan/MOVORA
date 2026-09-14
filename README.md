# MOVORA — frontend

A movie discovery app: search by title, filter and sort results, read full details, and keep a watchlist tied to your account.

React 18 · TypeScript · Vite · React Router · TanStack Query · Tailwind CSS v4 · React Hook Form · Axios

This repository is **frontend only**. It talks to a separate Express + MongoDB API over REST. No database or server logic lives here.

---

## Quick start

```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

If your backend isn't ready yet, open a second terminal:

```bash
npm run mock-api       # http://localhost:5000/api
```

The mock is a single zero-dependency Node file (`mock/server.mjs`) that implements every endpoint the UI calls, with ~220 ms of fake latency so you can see the loading skeletons. Register any email and password to try the favourites flow. Delete the folder once the real API is running.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Types only, no output |
| `npm run mock-api` | Stand-in backend on port 5000 |

## Environment

`.env` (never committed — `.env.example` is the template):

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

Anything prefixed with `VITE_` is compiled into the JavaScript bundle and is readable by anyone who opens the site. API keys, database URLs and JWT secrets belong in the backend's environment, never here. If you're proxying TMDB, the key stays on the Express side.

Leave `VITE_IMAGE_BASE_URL` blank if your API already returns absolute image URLs — `imageUrl()` passes those straight through.

---

## Folder structure

```
src/
├── api/                 Everything that talks to the network
│   ├── client.ts        Axios instance, auth headers, error normalisation
│   ├── adapters.ts      Backend JSON → app types (the one seam to edit)
│   ├── authApi.ts
│   ├── movieApi.ts
│   └── favoritesApi.ts
├── components/
│   ├── ui/              Button, Field, Rating, Badge, Skeleton, states
│   ├── layout/          Header, Footer
│   ├── movie/           MovieCard, MovieGrid, MovieRail, Hero, PosterImage
│   ├── search/          SearchBar, FilterPanel, Pagination
│   └── ErrorBoundary.tsx
├── context/AuthContext.tsx
├── hooks/               useAuth, useMovies, useFavorites, useDebounce, …
├── layouts/RootLayout.tsx
├── pages/               One file per route, all lazily loaded
├── routes/              Router config, ProtectedRoute, GuestRoute
├── types/               Movie, auth and API types
└── utils/               Formatting, image URLs, constants
```

The rule that keeps this maintainable: **components never see raw API JSON.** They receive `MovieSummary` and `MovieDetails`. Only `src/api/adapters.ts` knows what your backend actually sends.

## Connecting your backend

### 1. Point the app at it

Set `VITE_API_BASE_URL`. Alternatively, uncomment the `proxy` block in `vite.config.ts` to route `/api` through Vite in development and sidestep CORS entirely.

### 2. Match the field names

The app expects these endpoints:

```
POST   /api/auth/register        { name, email, password }
POST   /api/auth/login           { email, password }
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/movies?collection=trending|top_rated|recent
GET    /api/movies/search?q=&page=&sort=&genre=&year=&minRating=
GET    /api/movies/:id
GET    /api/movies/:id/similar
GET    /api/movies/genres        (optional — falls back to a built-in list)

GET    /api/favorites
POST   /api/favorites/:movieId
DELETE /api/favorites/:movieId
```

Response envelopes are flexible out of the box. `unwrap()` accepts both `res.json(movie)` and `res.json({ data: movie })`. `toPaginatedMovies()` accepts a bare array or an object keyed `items`, `results`, `movies` or `data`, with totals under `totalResults`/`total_results`/`total`/`count`.

Field names are flexible too — the adapters already try `posterPath` and `poster_path`, `id` and `_id`, `rating` and `voteAverage`. Anything they miss, add to the `pick(...)` call in `src/api/adapters.ts`. That's the only file you should need to touch.

### 3. Pick an auth strategy

The default is **httpOnly cookies**, which is the safer option: the browser holds the session cookie and JavaScript can't read it, so an XSS bug can't lift the session. Your Express app needs:

```js
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
```

If your backend returns `{ token }` instead, set `USE_BEARER_TOKEN = true` at the top of `src/api/client.ts`. The token then lives in memory and is mirrored to `sessionStorage` so a refresh doesn't sign you out. That's a deliberate trade-off — `sessionStorage` is readable by any script on the page.

Either way, a 401 from any request clears the session and drops the UI back to its signed-out state.

---

## How the pieces work

**Two kinds of state, kept apart.** Server data (movies, favourites) lives in TanStack Query, which handles caching, deduplication, background refetching and retries. Client state is only the session, held in `AuthContext`. There's no global store for search filters — those live in the URL.

**Search state is the URL.** `/search?q=inception&page=2&genre=878&sort=rating` restores exactly. Results are shareable and the back button behaves. `useSearchQueryState` is the single place that reads and writes those params, and any change except `page` resets to page 1.

**Typing doesn't hammer the API.** The input is local state; `useDebounce` waits 400 ms of quiet before the URL and query update. Between pages, `keepPreviousData` holds the old grid on screen at 60% opacity instead of collapsing it into skeletons.

**Favourites update instantly.** `useToggleFavorite` writes to the cache optimistically, so the heart fills on click, then rolls back if the server rejects it.

**Every failure has a screen.** `ApiError` normalises everything Axios throws into `{ status, message, fieldErrors }`, and `ErrorState` renders network failures, expired sessions and server errors differently, each with the action that actually fixes it. `ErrorBoundary` catches render-time crashes so one broken component doesn't blank the page.

## Performance

- Every route is a separate lazily loaded chunk — the first load ships the home page only.
- `MovieCard` is memoised, so toggling one favourite doesn't re-render the whole grid.
- Posters are `loading="lazy"` except the first six in a grid and the hero, which are eager and `fetchPriority="high"`.
- Query results stay fresh for 60 s (5–10 min for collections and details), so navigating back doesn't refetch.
- 401 and 404 responses are never retried.

## Accessibility

Semantic landmarks throughout, a skip link, one consistent focus ring, `aria-pressed` on the favourite toggles, `aria-live` on the result count, labelled form fields with errors wired through `aria-describedby`, alt text on every poster plus a labelled fallback when artwork is missing, and `prefers-reduced-motion` respected globally.

## Design tokens

Defined once in `src/index.css` under `@theme`, which is how Tailwind v4 generates utilities. Change a value there and it propagates everywhere.

| Token | Value | Use |
| --- | --- | --- |
| `screen` | `#0A0A0B` | Page background |
| `surface` | `#141417` | Cards, panels |
| `raised` | `#1E1E23` | Inputs, secondary buttons |
| `hairline` | `#2C2C33` | Borders, dividers |
| `chalk` | `#F2F0EC` | Primary text |
| `muted` | `#9A9AA3` | Secondary text |
| `accent` | `#E3143C` | Primary actions, active state |
| `star` | `#F5B544` | Ratings only |

Type is Archivo (headings, width axis at 110) and Instrument Sans (body), both loaded from Google Fonts in `index.html`.

## Deploying

```bash
npm run build          # → dist/
```

Serve `dist/` from any static host. Because the app uses client-side routing, configure a catch-all rewrite to `/index.html` — otherwise a refresh on `/movies/42` returns a 404 from the host. Vercel and Netlify do this automatically for SPAs; Nginx needs `try_files $uri /index.html;`.

Set `VITE_API_BASE_URL` to your production API URL in the host's environment settings before building.











to do's

1 => connect it to a database

