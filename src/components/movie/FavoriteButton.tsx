import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useToggleFavorite } from '@/hooks/useFavorites';
import { cn } from '@/utils/cn';
import type { MovieSummary } from '@/types/movie';

interface FavoriteButtonProps {
  movie: MovieSummary;
  /** `overlay` sits on top of a poster; `inline` sits in a row of buttons. */
  variant?: 'overlay' | 'inline';
  className?: string;
}

export function FavoriteButton({
  movie,
  variant = 'overlay',
  className,
}: FavoriteButtonProps) {
  const navigate = useNavigate();
  const { isFavorite, toggle, canFavorite } = useToggleFavorite();
  const saved = isFavorite(movie.id);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canFavorite) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    toggle(movie);
  };

  const label = saved
    ? `Remove ${movie.title} from favourites`
    : `Save ${movie.title} to favourites`;

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        className={cn(
          'inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors',
          saved
            ? 'border-accent bg-accent/15 text-accent-soft hover:bg-accent/25'
            : 'border-hairline bg-raised text-chalk hover:bg-hairline',
          className,
        )}
      >
        <Heart aria-hidden className="size-4" fill={saved ? 'currentColor' : 'none'} />
        {saved ? 'In your favourites' : 'Save to favourites'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-9 items-center justify-center rounded-full',
        'bg-screen/70 backdrop-blur-sm transition-colors',
        saved ? 'text-accent-soft' : 'text-chalk/80 hover:text-chalk',
        className,
      )}
    >
      <Heart aria-hidden className="size-4" fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
