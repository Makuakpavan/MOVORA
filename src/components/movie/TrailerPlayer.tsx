import { useEffect, useRef, useState } from 'react';

interface TrailerPlayerProps {
  embedUrl: string; // e.g. https://www.youtube.com/embed/KEY
}

export function TrailerPlayer({ embedUrl }: TrailerPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    // Load YouTube IFrame API if needed
    function loadApi() {
      return new Promise<void>((resolve) => {
        if ((window as any).YT && (window as any).YT.Player) return resolve();
        const existing = document.getElementById('youtube-iframe-api');
        if (existing) {
          (window as any).onYouTubeIframeAPIReady = () => resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = 'youtube-iframe-api';
        script.src = 'https://www.youtube.com/iframe_api';
        (window as any).onYouTubeIframeAPIReady = () => resolve();
        document.body.appendChild(script);
      });
    }

    let mounted = true;

    async function init() {
      await loadApi();
      if (!mounted || !containerRef.current) return;

      // create a div for the player
      const el = document.createElement('div');
      const id = `yt-player-${Math.random().toString(36).slice(2)}`;
      el.id = id;
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(el);

      const src = new URL(embedUrl);
      // ensure enablejsapi
      src.searchParams.set('enablejsapi', '1');
      src.searchParams.set('origin', window.location.origin);

      playerRef.current = new (window as any).YT.Player(id, {
        height: '100%',
        width: '100%',
        playerVars: Object.fromEntries(src.searchParams.entries()),
        videoId: (src.pathname || '').split('/').pop(),
        events: {
          onReady: () => {
            setReady(true);
            try {
              const vol = playerRef.current.getVolume();
              setVolume(typeof vol === 'number' ? vol : 100);
              setMuted(playerRef.current.isMuted());
            } catch {}
          },
        },
      });
    }

    init();

    return () => {
      mounted = false;
      try {
        playerRef.current?.destroy();
      } catch {}
    };
  }, [embedUrl]);

  // control handlers
  useEffect(() => {
    if (!playerRef.current || !ready) return;
    try {
      playerRef.current.setVolume(volume);
    } catch {}
  }, [volume, ready]);

  useEffect(() => {
    if (!playerRef.current || !ready) return;
    try {
      if (muted) playerRef.current.mute();
      else playerRef.current.unMute();
    } catch {}
  }, [muted, ready]);

  return (
    <div className="space-y-3">
      <div ref={containerRef} style={{ position: 'relative', paddingTop: '56.25%' }}>
        {/* Player will be injected here */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>

        <label className="flex items-center gap-2">
          <input
            aria-label="Volume"
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

export default TrailerPlayer;
