import { IMAGE_BASE_URL } from './constants';

type ImageSize = 'poster' | 'posterLarge' | 'backdrop' | 'profile';

const SIZE_SEGMENT: Record<ImageSize, string> = {
  poster: 'w342',
  posterLarge: 'w500',
  backdrop: 'w1280',
  profile: 'w185',
};

/**
 * Turns whatever the backend gives us into a usable <img src>.
 * Absolute URLs pass straight through, so the app works whether your API
 * returns full URLs or bare TMDB-style paths like "/abc123.jpg".
 */
export function imageUrl(
  path: string | null | undefined,
  size: ImageSize = 'poster',
): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (!IMAGE_BASE_URL) return path;
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${IMAGE_BASE_URL}/${SIZE_SEGMENT[size]}${normalised}`;
}
