import { NextResponse } from "next/server";
import { getNowPlaying, spotifyConfigured } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!spotifyConfigured()) {
    return NextResponse.json({ configured: false, isPlaying: false });
  }
  const nowPlaying = await getNowPlaying();
  return NextResponse.json(
    { configured: true, ...nowPlaying },
    { headers: { "Cache-Control": "no-store" } }
  );
}
