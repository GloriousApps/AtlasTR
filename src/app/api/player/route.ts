import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.lastwar.tools";

export async function GET(request: NextRequest) {
  const apiKey = process.env.LASTWAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "LASTWAR_API_KEY ayarlanmamış. Vercel Environment Variables bölümüne API anahtarını ekleyin." },
      { status: 503 },
    );
  }

  const server = request.nextUrl.searchParams.get("server");
  const name = request.nextUrl.searchParams.get("name");
  if (!server || !name) return NextResponse.json({ error: "server ve name zorunludur." }, { status: 400 });

  const params = new URLSearchParams({ server_id: server, name });
  const response = await fetch(`${API_BASE}/world/find-player?${params}`, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json({ error: data?.detail ?? `Canlı API ${response.status} döndürdü.`, data }, { status: response.status });
  }
  return NextResponse.json({ data });
}
