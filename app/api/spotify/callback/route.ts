import { NextRequest, NextResponse } from "next/server";

// one-time helper: Spotify redirects here after /api/spotify/login;
// shows the refresh token to copy into .env.local
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host");
  const redirectUri = `${proto}://${host}/api/spotify/callback`;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await res.json();
  if (!data.refresh_token) {
    return NextResponse.json(data, { status: 500 });
  }

  const envLine = `SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`;
  return new NextResponse(
    `<body style="font-family:monospace;padding:40px;max-width:680px">
      <h2>Your refresh token</h2>
      <textarea id="tok" readonly rows="6"
        style="width:100%;font-family:monospace;font-size:13px;padding:12px;border-radius:8px;border:1px solid #ccc"
        onclick="this.select()">${envLine}</textarea>
      <p>
        <button style="padding:10px 18px;font-size:15px;cursor:pointer;border-radius:8px"
          onclick="navigator.clipboard.writeText(document.getElementById('tok').value).then(()=>this.textContent='Copied!')">
          Copy to clipboard
        </button>
      </p>
      <p>Replace the whole SPOTIFY_REFRESH_TOKEN line in .env.local with this
         (one single line, no breaks), then restart the dev server.</p>
    </body>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
