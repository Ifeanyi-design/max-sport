import React, { useState, useEffect, useMemo } from "react";
import { Flame, Wifi, Play, ArrowLeft } from "lucide-react";
import { getLiveMatches, toFixtureCard, teamLogoSources, competitionLogoSources, type FixtureCard } from "./api";
import type { Screen } from "./types";
import { Crest } from "./Crest";

interface Props {
  setActiveScreen: (s: Screen) => void;
  onOpenMatch: (id: number) => void;
}

export function LiveListPage({ setActiveScreen, onOpenMatch }: Props) {
  const [matches, setMatches] = useState<FixtureCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leagueFilter, setLeagueFilter] = useState("All");

  const load = () => {
    setLoading(true); setError(null);
    getLiveMatches()
      .then(data => setMatches(data.map(toFixtureCard)))
      .catch(e => setError(String(e?.message || e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const t = window.setInterval(load, 20000);
    return () => window.clearInterval(t);
  }, []);

  const leagues = useMemo(() => {
    const set = new Set(matches.map(m => m.league).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [matches]);

  const filtered = useMemo(() =>
    leagueFilter === "All" ? matches : matches.filter(m => m.league === leagueFilter),
    [matches, leagueFilter]
  );

  // Group by league
  const grouped = useMemo(() => {
    const map: Record<string, FixtureCard[]> = {};
    for (const m of filtered) {
      const key = m.league || "Other";
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return map;
  }, [filtered]);

  return (
    <div style={{ minHeight: "100%", color: "var(--ms-text)", paddingBottom: 40 }}>
      {/* Header */}
      <div className="ms-page-header">
        <button onClick={() => setActiveScreen("home")} aria-label="Back" className="ms-icon-btn">
          <ArrowLeft size={16} />
        </button>
        <Flame size={16} color="var(--ms-live)" />
        <span className="ms-page-title">Live Scores</span>
        <div style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
          background: "var(--ms-live-soft)", color: "var(--ms-live)",
          padding: "4px 12px", borderRadius: 999,
          fontWeight: 800, fontSize: 12, letterSpacing: "0.04em"
        }}>
          <Wifi size={12} />
          {matches.length} LIVE
        </div>
      </div>

      {/* League filter */}
      {leagues.length > 2 && (
        <div className="ms-filter-strip">
          {leagues.map(l => (
            <button
              key={l}
              className={`ms-filter-btn${leagueFilter === l ? " is-active" : ""}`}
              onClick={() => setLeagueFilter(l)}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 14px" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="ms-skeleton" style={{ height: 88, borderRadius: 12 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <p style={{ fontSize: 32, margin: "0 0 10px" }}>📡</p>
          <p style={{ color: "var(--ms-loss)", fontSize: 14 }}>Could not fetch live matches.</p>
          <button className="ms-btn" onClick={load} style={{ marginTop: 14 }}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px" }}>
          <p style={{ fontSize: 48, margin: "0 0 14px" }}>🟢</p>
          <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 8px" }}>No live matches right now</p>
          <p style={{ color: "var(--ms-muted)", fontSize: 13 }}>
            Check back when a game is in progress. Live data refreshes every 20 seconds.
          </p>
        </div>
      ) : (
        <div style={{ padding: "8px 14px 0" }}>
          {Object.entries(grouped).map(([league, groupMatches]) => {
            const firstMatch = groupMatches[0];
            const leagueSrcs = competitionLogoSources({
              logo_url: firstMatch.leagueLogo,
              provider_competition_id: firstMatch.leagueProviderId,
              provider_name: firstMatch.leagueProviderName,
            });
            return (
              <div key={league} style={{ marginBottom: 20 }}>
                {/* League header */}
                <div className="ms-comp-group-header" style={{ padding: "0 4px 10px" }}>
                  {leagueSrcs[0] && (
                    <Crest src={leagueSrcs[0]} fallbackSrcs={leagueSrcs.slice(1)} name={league} size={18} radius={4} />
                  )}
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ms-text-2)" }}>{league}</span>
                  <span style={{ marginLeft: "auto", color: "var(--ms-live)", fontWeight: 700, fontSize: 11 }}>
                    {groupMatches.length} live
                  </span>
                </div>

                {/* Match cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {groupMatches.map(m => <LiveMatchCard key={m.id} m={m} onOpen={onOpenMatch} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LiveMatchCard({ m, onOpen }: { m: FixtureCard; onOpen: (id: number) => void }) {
  const homeSrcs = teamLogoSources({ logo_url: m.homeLogo, provider_team_id: m.homeProviderId, provider_name: m.homeProviderName });
  const awaySrcs = teamLogoSources({ logo_url: m.awayLogo, provider_team_id: m.awayProviderId, provider_name: m.awayProviderName });

  return (
    <div
      className="ms-live-card"
      onClick={() => onOpen(m.id)}
      style={{
        background: "linear-gradient(135deg, rgba(255,45,85,0.07), var(--ms-surface))",
        border: "1px solid rgba(255,45,85,0.2)",
        borderRadius: 12,
      }}
    >
      {/* Minute */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="ms-live-dot" />
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 14, color: "var(--ms-live)"
          }}>
            {m.min || "LIVE"}
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onOpen(m.id); }}
          className="ms-live-watch"
          style={{ fontSize: 10, padding: "4px 10px" }}
        >
          <Play size={9} fill="white" /> Watch
        </button>
      </div>

      {/* Teams + score */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Home */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Crest src={homeSrcs[0]} fallbackSrcs={homeSrcs.slice(1)} name={m.home} abbr={m.homeAbbr} size={32} />
          <span style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {m.home}
          </span>
        </div>

        {/* Score */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: 32, fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <span>{m.hs}</span>
          <span style={{ color: "var(--ms-faint)", fontSize: 20 }}>–</span>
          <span>{m.as}</span>
        </div>

        {/* Away */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0, justifyContent: "flex-end" }}>
          <span style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {m.away}
          </span>
          <Crest src={awaySrcs[0]} fallbackSrcs={awaySrcs.slice(1)} name={m.away} abbr={m.awayAbbr} size={32} />
        </div>
      </div>
    </div>
  );
}
