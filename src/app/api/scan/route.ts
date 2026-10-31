import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.lastwar.tools";

export async function GET(request: NextRequest) {
  const apiKey = process.env.LASTWAR_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "LASTWAR_API_KEY ayarlanmamış." }, { status: 503 });

  const server = request.nextUrl.searchParams.get("server");
  if (!server) return NextResponse.json({ error: "server zorunludur." }, { status: 400 });
  const params = new URLSearchParams({ server_id: server, x_start: "0", y_start: "0", x_end: "1000", y_end: "1000", step: "20" });
  const response = await fetch(`${API_BASE}/world/scan?${params}`, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: data?.detail ?? `Canlı API ${response.status} döndürdü.`, data }, { status: response.status });
  return NextResponse.json({ data });
}
