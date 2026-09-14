import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';

/* Every page is its own chunk, so the first load only ships the home page. */
const HomePage = lazy(() => import('@/pages/HomePage'));
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const MovieDetailsPage = lazy(() => import('@/pages/MovieDetailsPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'discover', element: <DiscoverPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'movies/:id', element: <MovieDetailsPage /> },
      {
        element: <ProtectedRoute mode="prompt" />,
        children: [{ path: 'favorites', element: <FavoritesPage /> }],
      },
      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
