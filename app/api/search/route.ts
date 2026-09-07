import { NextRequest, NextResponse } from "next/server";
import { searchSpotify } from "@/lib/spotify";
import type { SearchType } from "@/lib/spotify-types";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const q = params.get("q")?.trim();
  const type: SearchType = params.get("type") === "album" ? "album" : "track";
  const offset = Number(params.get("offset")) || 0;

  if (!q) {
    return NextResponse.json({ error: "Missing ?q= query param" }, { status: 400 });
  }

  try {
    const data = await searchSpotify(q, type, offset);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Spotify search failed" }, { status: 502 });
  }
}
