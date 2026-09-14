/**
 * Zero-dependency stand-in for the Express backend.
 *
 *   node mock/server.mjs      →  http://localhost:5000/api
 *
 * It implements exactly the endpoints the frontend calls, so you can develop
 * the UI before the real API exists. Delete this folder once your backend runs.
 * Sessions are in-memory only — restarting the server signs everyone out.
 */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = 5000;
const ORIGIN = 'http://localhost:5173';

const TITLES = [
  ['Inception', 'Your mind is the scene of the crime.', 8.4, '2010-07-16', 148, [878, 28]],
  ['Parasite', 'Act like you own the place.', 8.5, '2019-05-30', 132, [18, 53]],
  ['Mad Max: Fury Road', 'What a lovely day.', 8.1, '2015-05-15', 120, [28, 12]],
  ['Arrival', 'Why are they here?', 7.9, '2016-11-11', 116, [878, 18]],
  ['The Grand Budapest Hotel', 'A perfect holiday.', 8.1, '2014-03-07', 99, [35, 12]],
  ['Whiplash', 'The road to greatness can take you to the edge.', 8.5, '2014-10-10', 106, [18]],
  ['Dune', 'Beyond fear, destiny awaits.', 8.0, '2021-10-22', 155, [878, 12]],
  ['Everything Everywhere All at Once', 'The universe is so much bigger.', 7.8, '2022-03-25', 139, [12, 35]],
  ['Get Out', 'Just because you are invited.', 7.7, '2017-02-24', 104, [27, 9648]],
  ['Blade Runner 2049', 'There is an order to things.', 8.0, '2017-10-06', 164, [878, 18]],
  ['Spirited Away', 'The tunnel led to a strange town.', 8.6, '2001-07-20', 125, [16, 14]],
  ['Portrait of a Lady on Fire', 'Do all lovers feel they are inventing something?', 8.1, '2019-09-18', 122, [18, 10749]],
  ['No Country for Old Men', "There are no clean getaways.", 8.2, '2007-11-09', 122, [80, 53]],
  ['The Social Network', 'You do not get 500 million friends without making a few enemies.', 7.7, '2010-10-01', 120, [18]],
  ['Sinners', 'Some deals cost more than money.', 7.6, '2025-04-18', 137, [27, 53]],
  ['Past Lives', 'Destiny takes its time.', 7.9, '2023-06-02', 105, [18, 10749]],
  ['Oppenheimer', 'The world forever changes.', 8.3, '2023-07-21', 180, [18, 36]],
  ['The Substance', 'Have you ever dreamt of a better version of yourself?', 7.3, '2024-09-20', 141, [27, 878]],
];

const GENRES = {
  12: 'Adventure', 16: 'Animation', 18: 'Drama', 27: 'Horror', 28: 'Action',
  35: 'Comedy', 36: 'History', 53: 'Thriller', 80: 'Crime', 878: 'Science Fiction',
  9648: 'Mystery', 10749: 'Romance', 14: 'Fantasy',
};

const MOVIES = TITLES.map(([title, tagline, rating, releaseDate, runtime, genreIds], i) => ({
  id: String(i + 1),
  title,
  tagline,
  rating,
  voteCount: 4000 + i * 1337,
  releaseDate,
  runtime,
  overview: `${title} follows a small group of people pushed well past the point where ordinary choices still work. ${tagline}`,
  posterPath: null,
  backdropPath: null,
  genres: genreIds.map((id) => ({ id, name: GENRES[id] })),
  status: 'Released',
  originalLanguage: 'en',
  budget: 30_000_000 + i * 5_000_000,
  revenue: 180_000_000 + i * 11_000_000,
  productionCompanies: ['Northlight Pictures', 'Harbour Row Studios'],
  director: ['Ava Mensah', 'Tobias Reiner', 'Chidi Okafor', 'Lena Vasquez'][i % 4],
  cast: Array.from({ length: 8 }, (_, c) => ({
    id: c + 1,
    name: ['Ruth Adeyemi', 'Marco Devlin', 'Ines Haddad', 'Peter Nwosu', 'Sara Lindqvist', 'Danny Okonjo', 'Mei Tanaka', 'Owen Blake'][c],
    character: ['Lead', 'The Handler', 'Sister', 'The Broker', 'Neighbour', 'Driver', 'Analyst', 'Stranger'][c],
    profilePath: null,
  })),
  trailerUrl: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(title + ' trailer'),
  homepage: null,
}));

const users = new Map();
const sessions = new Map();
const favorites = new Map();

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

const sessionUser = (req) => {
  const match = /sid=([^;]+)/.exec(req.headers.cookie ?? '');
  return match ? users.get(sessions.get(match[1])) : undefined;
};

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); }
    });
  });

const paginate = (items, page = 1, perPage = 12) => ({
  items: items.slice((page - 1) * perPage, page * perPage),
  page,
  totalPages: Math.max(1, Math.ceil(items.length / perPage)),
  totalResults: items.length,
});

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname.replace(/^\/api/, '');
  const user = sessionUser(req);

  // Simulate latency so loading skeletons are actually visible.
  await new Promise((r) => setTimeout(r, 220));

  // --- auth ---------------------------------------------------------------
  if (path === '/auth/register' && req.method === 'POST') {
    const { name, email, password } = await readBody(req);
    if ([...users.values()].some((u) => u.email === email)) {
      return send(res, 409, { message: 'That email is already registered.' });
    }
    const record = { id: randomUUID(), name, email, password };
    users.set(record.id, record);
    const sid = randomUUID();
    sessions.set(sid, record.id);
    res.setHeader('Set-Cookie', `sid=${sid}; HttpOnly; Path=/; SameSite=Lax`);
    return send(res, 201, { data: { user: { id: record.id, name, email } } });
  }

  if (path === '/auth/login' && req.method === 'POST') {
    const { email, password } = await readBody(req);
    const record = [...users.values()].find((u) => u.email === email && u.password === password);
    if (!record) return send(res, 401, { message: 'Email or password is incorrect.' });
    const sid = randomUUID();
    sessions.set(sid, record.id);
    res.setHeader('Set-Cookie', `sid=${sid}; HttpOnly; Path=/; SameSite=Lax`);
    return send(res, 200, { data: { user: { id: record.id, name: record.name, email } } });
  }

  if (path === '/auth/logout' && req.method === 'POST') {
    res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0');
    return send(res, 200, { data: null });
  }

  if (path === '/auth/me') {
    if (!user) return send(res, 401, { message: 'Not signed in.' });
    return send(res, 200, { data: { user: { id: user.id, name: user.name, email: user.email } } });
  }

  // --- favorites ----------------------------------------------------------
  if (path === '/favorites' && req.method === 'GET') {
    if (!user) return send(res, 401, { message: 'Sign in to see your favourites.' });
    const ids = favorites.get(user.id) ?? new Set();
    return send(res, 200, { data: MOVIES.filter((m) => ids.has(m.id)) });
  }

  const favoriteMatch = /^\/favorites\/(.+)$/.exec(path);
  if (favoriteMatch) {
    if (!user) return send(res, 401, { message: 'Sign in to save favourites.' });
    const ids = favorites.get(user.id) ?? new Set();
    if (req.method === 'POST') ids.add(favoriteMatch[1]);
    if (req.method === 'DELETE') ids.delete(favoriteMatch[1]);
    favorites.set(user.id, ids);
    return send(res, 200, { data: null });
  }

  // --- movies -------------------------------------------------------------
  if (path === '/movies/genres') {
    return send(res, 200, {
      data: Object.entries(GENRES).map(([id, name]) => ({ id: Number(id), name })),
    });
  }

  if (path === '/movies/search') {
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const genre = Number(url.searchParams.get('genre')) || null;
    const year = Number(url.searchParams.get('year')) || null;
    const minRating = Number(url.searchParams.get('minRating')) || null;
    const sort = url.searchParams.get('sort') ?? 'popularity';

    let results = MOVIES.filter((m) => m.title.toLowerCase().includes(q));
    if (genre) results = results.filter((m) => m.genres.some((g) => g.id === genre));
    if (year) results = results.filter((m) => m.releaseDate.startsWith(String(year)));
    if (minRating) results = results.filter((m) => m.rating >= minRating);

    const sorters = {
      rating: (a, b) => b.rating - a.rating,
      release_date: (a, b) => b.releaseDate.localeCompare(a.releaseDate),
      title: (a, b) => a.title.localeCompare(b.title),
      popularity: (a, b) => b.voteCount - a.voteCount,
    };
    results = [...results].sort(sorters[sort] ?? sorters.popularity);

    return send(res, 200, { data: paginate(results, Number(url.searchParams.get('page')) || 1) });
  }

  const similarMatch = /^\/movies\/(.+)\/similar$/.exec(path);
  if (similarMatch) {
    return send(res, 200, { data: MOVIES.filter((m) => m.id !== similarMatch[1]).slice(0, 8) });
  }

  const detailMatch = /^\/movies\/(.+)$/.exec(path);
  if (detailMatch) {
    const movie = MOVIES.find((m) => m.id === detailMatch[1]);
    if (!movie) return send(res, 404, { message: 'Movie not found.' });
    return send(res, 200, { data: movie });
  }

  if (path === '/movies') {
    const collection = url.searchParams.get('collection') ?? 'trending';
    const sorted = {
      trending: [...MOVIES].sort((a, b) => b.voteCount - a.voteCount),
      top_rated: [...MOVIES].sort((a, b) => b.rating - a.rating),
      recent: [...MOVIES].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)),
    }[collection] ?? MOVIES;
    return send(res, 200, { data: paginate(sorted, 1, 18) });
  }

  send(res, 404, { message: `No mock route for ${req.method} ${path}` });
}).listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}/api`);
  console.log('Register any email and password to try the favourites flow.');
});
