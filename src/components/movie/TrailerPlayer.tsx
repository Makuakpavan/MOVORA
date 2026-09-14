interface TrailerPlayerProps {
  embedUrl: string; // e.g. https://www.youtube.com/embed/KEY
}

export function TrailerPlayer({ embedUrl }: TrailerPlayerProps) {
  const src = (() => {
    try {
      const url = new URL(embedUrl);
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('playsinline', '1');
      url.searchParams.set('rel', '0');
      return url.toString();
    } catch {
      return embedUrl;
    }
  })();

  return (
    <div className="relative w-full overflow-hidden rounded-md bg-black" style={{ aspectRatio: '16 / 9' }}>
      <iframe
        src={src}
        title="Movie trailer"
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

export default TrailerPlayer;
