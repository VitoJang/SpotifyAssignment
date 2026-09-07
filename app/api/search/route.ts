import { NextRequest, NextResponse } from "next/server";
import { searchSpotify } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing ?q= query param" }, { status: 400 });
  }

  try {
    const data = await searchSpotify(q);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Spotify search failed" }, { status: 502 });
  }
}
