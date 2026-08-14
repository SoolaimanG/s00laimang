import { NextResponse } from "next/server";
import { getTopTracks, spotifyConfigured } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!spotifyConfigured()) {
    return NextResponse.json({ configured: false, tracks: [] });
  }
  const tracks = await getTopTracks(5);
  return NextResponse.json(
    { configured: true, tracks },
    // top tracks change slowly; let the browser cache them for 30 min
    { headers: { "Cache-Control": "public, max-age=1800" } }
  );
}
