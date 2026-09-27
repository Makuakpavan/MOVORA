import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { imageUrl } from '@/utils/images';
import { cn } from '@/utils/cn';



interface PosterImageProps {
  path: string | null;
  title: string;
  size?: 'poster' | 'posterLarge' | 'backdrop' | 'profile';
  className?: string;
  /** Above-the-fold images should load eagerly; everything else lazily. */
  priority?: boolean;
}

export function PosterImage({
  path,
  title,
  size = 'poster',
  className,
  priority = false,
}: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const src = imageUrl(path, size);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`No artwork available for ${title}`}
        className={cn(
          'flex items-center justify-center bg-raised text-muted',
          className,
        )}
      >
        <ImageOff aria-hidden className="size-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Poster for ${title}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setFailed(true)}
      onLoad={() => setLoaded(true)}
      className={cn(
        className,
        'transition-opacity duration-300',
        loaded ? 'opacity-100' : 'opacity-0',
      )}
    />
  );
}
