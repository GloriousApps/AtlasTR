"use client";

import { FormEvent, useMemo, useState } from "react";

type Result = {
  name?: string;
  playerName?: string;
  allianceName?: string;
  alliance?: string;
  x?: number;
  y?: number;
  power?: number;
  hqLevel?: number;
  shield?: boolean;
  serverId?: number;
  [key: string]: unknown;
};

function normalizeResults(payload: unknown): Result[] {
  if (Array.isArray(payload)) return payload as Result[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["players", "results", "data", "items", "bases"]) {
    if (Array.isArray(record[key])) return record[key] as Result[];
  }
  return [record as Result];
}

export default function Home() {
  const [server, setServer] = useState("1349");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"player" | "scan">("player");
  const [results, setResults] = useState<Result[]>([]);
  const [raw, setRaw] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const visibleResults = useMemo(
    () =>
      results.filter((item) => {
        const label = String(item.name ?? item.playerName ?? "").toLowerCase();
        return !name || label.includes(name.toLowerCase());
      }),
    [name, results],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setResults([]);
    setRaw(null);

    const serverId = Number(server);
    if (!Number.isInteger(serverId) || serverId < 1) {
      setError("Geçerli bir sunucu numarası girin.");
      return;
    }
    if (mode === "player" && !name.trim()) {
      setError("Oyuncu adı girin.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ server: String(serverId) });
      if (mode === "player") params.set("name", name.trim());
      const response = await fetch(`/api/${mode}?${params}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Canlı API isteği başarısız.");
      setRaw(body.data);
      setResults(normalizeResults(body.data));
      setNotice(
        mode === "player"
          ? "Canlı oyuncu araması tamamlandı."
          : "Canlı harita taraması tamamlandı.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Beklenmeyen bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">LW</span>
          <div>
            <strong>AtlasTR</strong>
            <span>Last War canlı arama</span>
          </div>
        </div>
        <span className="status"><i /> CANLI API</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">SUNUCU İSTİHBARATI</p>
          <h1>Aradığını bul.<br /><em>Koordinata git.</em></h1>
          <p className="hero-copy">
            Sunucudaki oyuncuları ve harita bölgelerini canlı API üzerinden
            sorgula. Oyun hesabı bilgilerin AtlasTR&apos;ye gönderilmez.
          </p>
        </div>
        <div className="hero-orbit"><span>LIVE</span><b>⌁</b></div>
      </section>

      <section className="search-card">
        <div className="tabs">
          <button className={mode === "player" ? "active" : ""} onClick={() => setMode("player")}>Oyuncu bul</button>
          <button className={mode === "scan" ? "active" : ""} onClick={() => setMode("scan")}>Bölge tara</button>
        </div>
        <form onSubmit={submit}>
          <label>
            <span>Sunucu</span>
            <input value={server} onChange={(event) => setServer(event.target.value)} inputMode="numeric" placeholder="1349" />
          </label>
          {mode === "player" && (
            <label className="wide">
              <span>Oyuncu adı</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Oyuncu adını yaz..." />
            </label>
          )}
          {mode === "scan" && (
            <div className="scan-help">Varsayılan tarama: 0–1000 X/Y aralığı. Büyük taramalar API kotasına göre birkaç saniye sürebilir.</div>
          )}
          <button className="submit" disabled={loading}>{loading ? "Taranıyor..." : mode === "player" ? "Oyuncuyu bul  →" : "Bölgeyi tara  →"}</button>
        </form>
        <p className="privacy">🔒 API anahtarı yalnızca sunucu tarafında saklanır · Oyun şifresi istemiyoruz</p>
      </section>

      {(notice || error) && <div className={error ? "message error" : "message success"}>{error || notice}</div>}

      <section className="results">
        <div className="section-heading">
          <div><p className="eyebrow">SONUÇLAR</p><h2>{visibleResults.length ? `${visibleResults.length} kayıt bulundu` : "Arama sonuçları"}</h2></div>
          {raw !== null && <span className="fresh">● Şimdi güncellendi</span>}
        </div>
        {visibleResults.length > 0 ? (
          <div className="result-grid">
            {visibleResults.map((item, index) => {
              const label = String(item.name ?? item.playerName ?? `Kayıt ${index + 1}`);
              return (
                <article className="result-card" key={`${label}-${index}`}>
                  <div className="result-icon">{mode === "player" ? "⌖" : "✦"}</div>
                  <div className="result-main">
                    <strong>{label}</strong>
                    <span>{String(item.allianceName ?? item.alliance ?? "İttifak bilgisi yok")}</span>
                  </div>
                  <div className="coords"><b>X {String(item.x ?? "—")}</b><b>Y {String(item.y ?? "—")}</b></div>
                  <button className="copy" onClick={() => navigator.clipboard?.writeText(`${item.x ?? ""}, ${item.y ?? ""}`)}>Kopyala</button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">⌖</div>
            <h3>Henüz sonuç yok</h3>
            <p>Bir sunucu ve oyuncu adı girerek canlı aramayı başlatın.</p>
          </div>
        )}
      </section>

      <footer>AtlasTR · Bağımsız topluluk aracı · Sonuçlar anlık bir sunucu görüntüsüdür</footer>
    </main>
  );
}
