const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";

export function spotifyConfigured() {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_CLIENT_SECRET &&
      process.env.SPOTIFY_REFRESH_TOKEN
  );
}

function basicAuth() {
  return Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");
}

// cache the short-lived access token across requests within the server process
const tokenCache = globalThis as unknown as {
  __spotifyToken?: { value: string; expiresAt: number };
};

async function getAccessToken(): Promise<string | null> {
  const cached = tokenCache.__spotifyToken;
  if (cached && Date.now() < cached.expiresAt - 10_000) return cached.value;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  tokenCache.__spotifyToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export type NowPlaying = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  url?: string;
  progressMs?: number;
  durationMs?: number;
};

export type TopTrack = {
  title: string;
  artist: string;
  albumArt?: string;
  url?: string;
  durationMs: number;
};

export async function getNowPlaying(): Promise<NowPlaying> {
  const token = await getAccessToken();
  if (!token) return { isPlaying: false };

  const res = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 204 || !res.ok) return { isPlaying: false };

  const data = await res.json();
  const item = data.item;
  if (!item || data.currently_playing_type !== "track")
    return { isPlaying: false };

  return {
    isPlaying: data.is_playing,
    title: item.name,
    artist: item.artists.map((a: { name: string }) => a.name).join(", "),
    album: item.album.name,
    albumArt: item.album.images?.[1]?.url ?? item.album.images?.[0]?.url,
    url: item.external_urls?.spotify,
    progressMs: data.progress_ms ?? 0,
    durationMs: item.duration_ms ?? 0,
  };
}

// requires the user-top-read scope on the refresh token
export async function getTopTracks(limit = 5): Promise<TopTrack[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const res = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=short_term`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (!res.ok) return [];

  const data = await res.json();
  type Item = {
    name: string;
    duration_ms: number;
    artists: { name: string }[];
    album: { images?: { url: string }[] };
    external_urls?: { spotify: string };
  };
  return (data.items ?? []).map((item: Item) => ({
    title: item.name,
    artist: item.artists.map((a) => a.name).join(", "),
    albumArt: item.album.images?.[1]?.url ?? item.album.images?.[0]?.url,
    url: item.external_urls?.spotify,
    durationMs: item.duration_ms,
  }));
}
