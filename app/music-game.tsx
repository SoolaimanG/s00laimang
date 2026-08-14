"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type NowPlayingData = {
  configured: boolean;
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  url?: string;
  progressMs?: number;
  durationMs?: number;
};

type TopTrack = {
  title: string;
  artist: string;
  albumArt?: string;
  url?: string;
  durationMs: number;
};

const POLL_MS = 10_000;
const SEGMENTS = 12;

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function EqualizerBars() {
  return (
    <span className="eq-bars flex h-3 shrink-0 items-end gap-[2px]" aria-label="Playing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-[#1DB954]"
          style={{
            animation: `eq 1s ease-in-out ${i * 0.2}s infinite alternate`,
          }}
        />
      ))}
      <style>{`@keyframes eq { from { height: 30% } to { height: 100% } }`}</style>
    </span>
  );
}

function SpotifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.5 17.33a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 1 1-.33-1.46c4.57-1.05 8.5-.6 11.66 1.34.35.22.46.68.25 1.03zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.98-8.15-2.56-11.97-1.4a.94.94 0 1 1-.55-1.8c4.37-1.32 9.8-.68 13.5 1.6.44.27.58.85.31 1.29zm.13-3.41C15.24 8.35 8.87 8.14 5.17 9.26a1.13 1.13 0 1 1-.66-2.16c4.25-1.29 11.31-1.04 15.77 1.6a1.13 1.13 0 0 1-1.18 1.95z" />
    </svg>
  );
}

function useNowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const fetchedAt = useRef(0);
  const [, forceTick] = useState(0);

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch("/api/spotify/now-playing");
        const json = await res.json();
        if (active) {
          fetchedAt.current = Date.now();
          setData(json);
        }
      } catch {
        // keep last known state on network hiccups
      }
    }
    poll();
    const pollId = setInterval(poll, POLL_MS);
    const tickId = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => {
      active = false;
      clearInterval(pollId);
      clearInterval(tickId);
    };
  }, []);

  // interpolate progress between polls so the timer ticks in real time
  let progressMs = data?.progressMs ?? 0;
  if (data?.isPlaying && data.durationMs) {
    progressMs = Math.min(
      progressMs + (Date.now() - fetchedAt.current),
      data.durationMs
    );
  }
  return { data, progressMs };
}

function SegmentedProgress({ ratio }: { ratio: number }) {
  const filled = Math.round(ratio * SEGMENTS);
  return (
    <span className="flex gap-1">
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span
          key={i}
          className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${
            i < filled ? "bg-foreground/70" : "bg-foreground/15"
          }`}
        />
      ))}
    </span>
  );
}

function FloatingPlayer({
  data,
  progressMs,
  onDismiss,
}: {
  data: NowPlayingData;
  progressMs: number;
  onDismiss: () => void;
}) {
  const duration = data.durationMs ?? 0;
  const [closing, setClosing] = useState(false);
  return (
    <div
      onTransitionEnd={(e) => {
        if (closing && e.propertyName === "transform") onDismiss();
      }}
      className={`player-pop fixed bottom-4 left-1/2 z-50 w-[min(92vw,460px)] ${
        closing ? "player-closing" : ""
      }`}
    >
      <div className="relative flex items-center gap-3.5 rounded-2xl bg-background/80 p-3 pr-4 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-foreground/10 backdrop-blur-xl">
        {data.albumArt && (
          <a href={data.url} target="_blank" rel="noopener noreferrer">
            <Image
              src={data.albumArt}
              alt={`${data.album} album art`}
              width={52}
              height={52}
              unoptimized
              className="size-13 rounded-xl object-cover"
            />
          </a>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <EqualizerBars />
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-[15px] font-medium hover:underline"
            >
              {data.title}
            </a>
          </div>
          <p className="mt-0.5 truncate text-[13px] text-muted">{data.artist}</p>
          <div className="mt-1.5">
            <SegmentedProgress ratio={duration ? progressMs / duration : 0} />
          </div>
        </div>
        <span className="shrink-0 self-end pb-0.5 font-mono text-[11px] tabular-nums text-muted">
          {formatTime(progressMs)} / {formatTime(duration)}
        </span>
        <button
          type="button"
          onClick={() => setClosing(true)}
          aria-label="Dismiss player"
          className="absolute -right-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-md bg-foreground text-background shadow-md transition-transform hover:scale-110"
        >
          <svg viewBox="0 0 12 12" className="size-3 stroke-current stroke-[1.6]" fill="none" strokeLinecap="round">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function MusicGame() {
  const { data, progressMs } = useNowPlaying();
  const [dismissed, setDismissed] = useState(false);
  const [tracks, setTracks] = useState<TopTrack[]>([]);

  useEffect(() => {
    fetch("/api/spotify/top-tracks")
      .then((r) => r.json())
      .then((json) => setTracks(json.tracks ?? []))
      .catch(() => {});
  }, []);

  if (!data?.configured) return null;

  const showFloating = data.isPlaying && !dismissed;

  return (
    <>
      <section className="mt-16">
        <h2 className="font-serif text-2xl tracking-tight">/My Music Game</h2>

        {data.isPlaying && dismissed && (
          <button
            type="button"
            onClick={() => setDismissed(false)}
            className="mt-5 flex w-full cursor-pointer items-center gap-4 rounded-lg px-3 py-2.5 -mx-3 text-left transition-colors hover:bg-foreground/[0.04]"
            title="Bring the player back"
          >
            {data.albumArt && (
              <Image
                src={data.albumArt}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="size-10 rounded-md object-cover"
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2.5">
                <EqualizerBars />
                <span className="truncate text-[16px] font-medium">
                  {data.title}
                </span>
              </span>
              <span className="mt-0.5 block truncate text-[15px] text-muted">
                {data.artist}
              </span>
            </span>
            <span className="shrink-0 font-serif text-[15px] tracking-tight text-muted">
              now playing
            </span>
          </button>
        )}

        {!data.isPlaying && (
          <p className="mt-3 text-[15px] text-muted">
            Not playing anything right now.
          </p>
        )}

        {tracks.length > 0 && (
          <>
            <p className="mt-4 text-[15px] text-muted">On repeat lately:</p>
            <ul className="mt-2 -mx-3">
              {tracks.map((track, i) => (
                <li key={track.title + track.artist}>
                  <a
                    href={track.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-lg px-3 py-2 transition-colors hover:bg-foreground/[0.04]"
                  >
                    <span className="w-4 shrink-0 text-center font-serif text-[15px] text-muted">
                      {i + 1}
                    </span>
                    {track.albumArt && (
                      <Image
                        src={track.albumArt}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="size-10 rounded-md object-cover"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium">
                        {track.title}
                      </span>
                      <span className="block truncate text-[14px] text-muted">
                        {track.artist}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[12px] tabular-nums text-muted">
                      {formatTime(track.durationMs)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        <a
          href="https://open.spotify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-foreground"
        >
          <SpotifyLogo className="size-3.5 fill-[#1DB954]" />
          Powered by Spotify
        </a>
      </section>

      {showFloating && (
        <FloatingPlayer
          data={data}
          progressMs={progressMs}
          onDismiss={() => setDismissed(true)}
        />
      )}
    </>
  );
}
