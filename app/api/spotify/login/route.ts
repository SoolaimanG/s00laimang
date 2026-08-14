import { NextRequest, NextResponse } from "next/server";

// one-time helper: visit /api/spotify/login in the browser to authorize
// your Spotify account and receive the refresh token for .env.local
export function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Set SPOTIFY_CLIENT_ID in .env.local first" },
      { status: 500 }
    );
  }
  // use the raw Host header — nextUrl.origin normalizes 127.0.0.1 to
  // localhost, which then fails Spotify's exact redirect-URI match
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host");
  const redirectUri = `${proto}://${host}/api/spotify/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user-read-currently-playing user-top-read",
  });
  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params}`
  );
}
