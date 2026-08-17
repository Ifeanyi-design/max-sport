import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw, Play, Check } from "lucide-react";
import { getMatches, toFixtureCard, teamLogoSources, competitionLogoSources, type FixtureCard, type ApiMatch } from "./api";
import type { Screen } from "./types";
import { Crest } from "./Crest";

interface Props {
  setActiveScreen: (s: Screen) => void;
  onOpenMatch: (id: number) => void;
}

function todayKey() { return new Date().toISOString().slice(0, 10); }
function tomorrowKey() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function dateLabel(key: string): string {
  if (key === "Unknown") return "TBD";
  const today = todayKey();
  const tomorrow = tomorrowKey();
  if (key === today) return "Today";
  if (key === tomorrow) return "Tomorrow";
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export function FixturesPage({ setActiveScreen, onOpenMatch }: Props) {
  const [cards, setCards] = useState<FixtureCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [leagueFilter, setLeagueFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "finished">("all");

  const load = () => {
    setLoading(true);
    setError(null);
    getMatches({ limit: 300 })
      .then((data: ApiMatch[]) => { setCards(data.map(toFixtureCard)); })
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const dates = useMemo(() => {
    const keys = Array.from(new Set(cards.map(c => c.date))).filter(k => k !== "Unknown");
    keys.sort();
    return keys;
  }, [cards]);

  const leagues = useMemo(() => {
    const set = new Set(cards.map(c => c.league).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [cards]);

  const visible = useMemo(() =>
    cards
      .filter(c => statusFilter === "all" ? true : statusFilter === "finished" ? c.status === "finished" : c.status !== "finished")
      .filter(c => leagueFilter === "All" ? true : c.league === leagueFilter)
      .filter(c => selectedDate ? c.date === selectedDate : true),
    [cards, leagueFilter, selectedDate, statusFilter]
  );

  // Group by date then by league
  const grouped = useMemo(() => {
    const byDate: Record<string, Record<string, FixtureCard[]>> = {};
    for (const f of visible) {
      const dateKey = f.date;
      if (!byDate[dateKey]) byDate[dateKey] = {};
      const leagueKey = f.league || "Other";
      if (!byDate[dateKey][leagueKey]) byDate[dateKey][leagueKey] = [];
      byDate[dateKey][leagueKey].push(f);
    }
    return byDate;
  }, [visible]);

  const dateGroups = Object.keys(grouped).sort();

  return (
    <div style={{ minHeight: "100%", color: "var(--ms-text)", paddingBottom: 40 }}>
      {/* Sticky header */}
      <div className="ms-page-header">
        <span className="ms-page-title">Fixtures &amp; Results</span>
        <button onClick={load} className="ms-icon-btn" style={{ marginLeft: "auto" }} disabled={loading}>
          <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
        </button>
      </div>

      {/* Status filter */}
      <div className="ms-filter-strip">
        {[{ id: "all", label: "All" }, { id: "upcoming", label: "Fixtures" }, { id: "finished", label: "Results" }].map(item => (
          <button
            key={item.id}
            className={`ms-filter-btn${statusFilter === item.id ? " is-active" : ""}`}
            onClick={() => setStatusFilter(item.id as typeof statusFilter)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* League filter */}
      {leagues.length > 2 && (
        <div className="ms-filter-strip" style={{ paddingTop: 0 }}>
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

      {/* Date pills */}
      <div className="ms-filter-strip" style={{ paddingTop: 0, paddingBottom: 4 }}>
        <button
          className={`ms-filter-btn${selectedDate === null ? " is-active" : ""}`}
          onClick={() => setSelectedDate(null)}
        >
          All dates
        </button>
        {dates.slice(0, 8).map(d => (
          <button
            key={d}
            className={`ms-filter-btn${selectedDate === d ? " is-active" : ""}`}
            onClick={() => setSelectedDate(d)}
          >
            {dateLabel(d)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 14px" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="ms-skeleton" style={{ height: 72, borderRadius: 12 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", color: "var(--ms-loss)", padding: "48px 20px", fontSize: 14 }}>
          <p style={{ fontSize: 32, margin: "0 0 8px" }}>⚠️</p>
          Could not load fixtures. <button onClick={load} className="ms-btn" style={{ marginTop: 14 }}>Retry</button>
        </div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 20px", color: "var(--ms-muted)", fontSize: 14 }}>
          <p style={{ fontSize: 36, margin: "0 0 10px" }}>📅</p>
          No fixtures for this filter.
        </div>
      ) : (
        <div style={{ padding: "8px 14px 0" }}>
          {dateGroups.map(dateKey => (
            <div key={dateKey} className="ms-fixture-group">
              {/* Date header */}
              <div className={`ms-fixture-date${dateKey === todayKey() ? " ms-fixture-date-today" : ""}`}>
                {dateLabel(dateKey)}
                <span className="ms-fixture-date-line" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ms-faint)", textTransform: "none", letterSpacing: 0 }}>
                  {Object.values(grouped[dateKey]).flat().length} matches
                </span>
              </div>

              {/* League groups within date */}
              {Object.entries(grouped[dateKey]).map(([league, fixtures]) => (
                <div key={league} style={{ marginBottom: 14 }}>
                  <div className="ms-comp-group-header">
                    {(() => {
                      const f = fixtures[0];
                      const leagueSrcs = competitionLogoSources({
                        logo_url: f.leagueLogo,
                        provider_competition_id: f.leagueProviderId,
                        provider_name: f.leagueProviderName,
                      });
                      return leagueSrcs[0] ? (
                        <Crest src={leagueSrcs[0]} fallbackSrcs={leagueSrcs.slice(1)} name={league} size={16} radius={4} />
                      ) : null;
                    })()}
                    {league}
                    <span style={{ marginLeft: "auto", opacity: 0.5 }}>{fixtures.length}</span>
                  </div>
                  <div className="ms-comp-group-matches">
                    {fixtures.map(f => (
                      <FixtureRow key={f.id} f={f} onClick={() => onOpenMatch(f.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FixtureRow({ f, onClick }: { f: FixtureCard; onClick?: () => void }) {
  const isLive = f.status === "live";
  const isFinished = f.status === "finished";
  const homeSrcs = teamLogoSources({ logo_url: f.homeLogo, provider_team_id: f.homeProviderId, provider_name: f.homeProviderName });
  const awaySrcs = teamLogoSources({ logo_url: f.awayLogo, provider_team_id: f.awayProviderId, provider_name: f.awayProviderName });

  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        background: isLive
          ? "linear-gradient(135deg, rgba(255,45,85,0.07), var(--ms-surface))"
          : "var(--ms-surface)",
        borderRadius: 10,
        padding: "10px 12px",
        border: `1px solid ${isLive ? "rgba(255,45,85,0.22)" : "var(--ms-border)"}`,
        display: "flex", alignItems: "center", gap: 10,
        transition: "background 0.14s ease, border-color 0.14s ease",
      }}
    >
      {/* Time / status */}
      <div style={{
        width: 46, textAlign: "center", flexShrink: 0,
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
      }}>
        {isLive ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span className="ms-live-dot" style={{ width: 6, height: 6 }} />
            <span style={{ color: "var(--ms-live)", fontSize: 11 }}>{f.min || "LIVE"}</span>
          </div>
        ) : isFinished ? (
          <Check size={14} color="var(--ms-faint)" />
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ms-muted)" }}>{f.time}</span>
        )}
      </div>

      {/* Teams */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {[{ logo: f.homeLogo, srcs: homeSrcs, name: f.home, abbr: f.homeAbbr, score: f.hs, pid: f.homeProviderId, pn: f.homeProviderName },
          { logo: f.awayLogo, srcs: awaySrcs, name: f.away, abbr: f.awayAbbr, score: f.as, pid: f.awayProviderId, pn: f.awayProviderName }].map((team, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 7,
            marginBottom: i === 0 ? 5 : 0,
          }}>
            <Crest
              src={team.srcs[0]}
              fallbackSrcs={team.srcs.slice(1)}
              name={team.name} abbr={team.abbr} size={20}
            />
            <span style={{
              fontWeight: 600, fontSize: 13, flex: 1,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
            }}>
              {team.name}
            </span>
            {(isLive || isFinished) && (
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: 16,
                fontVariantNumeric: "tabular-nums",
                color: "var(--ms-text)",
              }}>
                {team.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Status badge */}
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        {isLive
          ? <span className="ms-badge-live"><span className="ms-live-dot" style={{ width: 5, height: 5, background: "#fff" }} />LIVE</span>
          : isFinished
          ? <span className="ms-badge-ft">FT</span>
          : <span style={{ fontSize: 10, color: "var(--ms-faint)", fontWeight: 600 }}>{f.time}</span>
        }
      </div>
    </div>
  );
}
