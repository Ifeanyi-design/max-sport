import { useEffect, useState } from "react";
import { ArrowRight, Radio, Trophy, Play, CalendarDays } from "lucide-react";
import type { Screen } from "./types";
import {
  getCompetitions, getLiveMatches, getMatches,
  toCompetitionCard, toFixtureCard, competitionLogoSources, teamLogoSources,
  type CompetitionCard, type FixtureCard
} from "./api";
import { MatchRow } from "./MatchRow";
import { Crest } from "./Crest";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

interface Props {
  setActiveScreen: (screen: Screen) => void;
  onOpenMatch: (id: number) => void;
  onOpenCompetition: (slug: string) => void;
}

function todayKey() { return new Date().toISOString().slice(0, 10); }
function tomorrowKey() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function SportsHomePage({ setActiveScreen, onOpenMatch, onOpenCompetition }: Props) {
  const [live, setLive] = useState<FixtureCard[] | null>(null);
  const [matches, setMatches] = useState<FixtureCard[] | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionCard[] | null>(null);
  const [error, setError] = useState(false);
  const [dateTab, setDateTab] = useState<string>("all");

  const load = () => {
    setError(false);
    Promise.all([getLiveMatches(), getMatches({ limit: 80 }), getCompetitions()])
      .then(([liveMatches, allMatches, comps]) => {
        setLive(liveMatches.map(toFixtureCard));
        setMatches(allMatches.map(toFixtureCard));
        setCompetitions(comps.map(toCompetitionCard));
      })
      .catch(() => setError(true));
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const featured = live && live.length ? live[0] : null;

  // Upcoming = scheduled, grouped for date tabs
  const upcoming = matches?.filter(m => m.status === "scheduled") ?? [];
  const today = todayKey();
  const tomorrow = tomorrowKey();

  const upcomingDates = Array.from(new Set(upcoming.map(m => m.date))).sort().slice(0, 4);
  const dateTabs = [{ key: "all", label: "All upcoming" }, ...upcomingDates.map(d => ({
    key: d,
    label: d === today ? "Today" : d === tomorrow ? "Tomorrow" : new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
  }))];

  const visibleUpcoming = dateTab === "all"
    ? upcoming.slice(0, 10)
    : upcoming.filter(m => m.date === dateTab).slice(0, 10);

  return (
    <div style={{ minHeight: "100%", paddingBottom: 32, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <header style={{ padding: "22px 20px 16px" }}>
        <p className="ms-eyebrow">MaxSport</p>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(28px, 6vw, 42px)",
          margin: "4px 0 0", letterSpacing: "-0.02em", lineHeight: 1.05, color: "var(--ms-text)"
        }}>
          Football, Live &amp; Upcoming
        </h1>
      </header>

      {/* Live hero card */}
      {featured && (
        <div style={{ padding: "0 20px 24px" }}>
          <button
            type="button"
            onClick={() => onOpenMatch(featured.id)}
            className="ms-hero ms-card-hover"
            style={{ width: "100%", display: "block", textAlign: "left", cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <span className="ms-live-dot lg" />
              <span style={{ color: "var(--ms-live)", fontWeight: 800, fontSize: 12, letterSpacing: "0.1em" }}>LIVE NOW</span>
              {featured.league && <span style={{ fontSize: 12, color: "var(--ms-muted)" }}>· {featured.league}</span>}
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ms-accent)", fontWeight: 700 }}>
                <Play size={11} fill="currentColor" /> Watch
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                <Crest
                  src={teamLogoSources({ logo_url: featured.homeLogo, provider_team_id: featured.homeProviderId, provider_name: featured.homeProviderName })[0]}
                  fallbackSrcs={teamLogoSources({ logo_url: featured.homeLogo, provider_team_id: featured.homeProviderId, provider_name: featured.homeProviderName }).slice(1)}
                  name={featured.home} abbr={featured.homeAbbr} size={44}
                />
                <span style={{ fontWeight: 800, fontSize: 18, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{featured.home}</span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(36px, 8vw, 56px)", fontWeight: 900,
                fontVariantNumeric: "tabular-nums", letterSpacing: "-0.04em"
              }}>
                <span>{featured.hs}</span>
                <span style={{ color: "var(--ms-faint)", fontSize: "0.6em" }}>–</span>
                <span>{featured.as}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1, justifyContent: "flex-end" }}>
                <span style={{ fontWeight: 800, fontSize: 18, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{featured.away}</span>
                <Crest
                  src={teamLogoSources({ logo_url: featured.awayLogo, provider_team_id: featured.awayProviderId, provider_name: featured.awayProviderName })[0]}
                  fallbackSrcs={teamLogoSources({ logo_url: featured.awayLogo, provider_team_id: featured.awayProviderId, provider_name: featured.awayProviderName }).slice(1)}
                  name={featured.away} abbr={featured.awayAbbr} size={44}
                />
              </div>
            </div>
            {featured.min && (
              <div style={{ marginTop: 14, textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--ms-live)" }}>
                {featured.min}
              </div>
            )}
          </button>
        </div>
      )}

      {error && <ErrorState message="Some data could not be loaded." onRetry={load} />}

      {/* Live now section */}
      <section style={{ marginBottom: 28, padding: "0 20px" }}>
        <div className="ms-section">
          <Radio size={16} color="var(--ms-live)" />
          <h2>Live now</h2>
          {(live?.length ?? 0) > 0 && (
            <span style={{
              background: "var(--ms-live-soft)", color: "var(--ms-live)",
              borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 800
            }}>
              {live!.length}
            </span>
          )}
          <button type="button" onClick={() => setActiveScreen("live-list")} className="ms-section-action">
            All live <ArrowRight size={12} />
          </button>
        </div>
        {live === null
          ? <EmptyState title="Loading live matches…" />
          : live.length
          ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
              {live.slice(0, 6).map(m => <MatchRow key={m.id} match={m} onClick={() => onOpenMatch(m.id)} />)}
            </div>
          : <div className="ms-hero ms-hero-calm" style={{ textAlign: "center", padding: "24px 20px" }}>
              <p style={{ margin: 0, fontSize: 32 }}>⚽</p>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--ms-muted)" }}>No live matches right now</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ms-faint)" }}>Upcoming fixtures below ↓</p>
            </div>
        }
      </section>

      {/* Upcoming — with date tabs */}
      <section style={{ marginBottom: 28 }}>
        <div className="ms-section" style={{ padding: "0 20px" }}>
          <CalendarDays size={16} color="var(--ms-muted)" />
          <h2>Upcoming fixtures</h2>
          <button type="button" onClick={() => setActiveScreen("fixtures")} className="ms-section-action">
            All fixtures <ArrowRight size={12} />
          </button>
        </div>

        {/* Date tabs */}
        {upcomingDates.length > 1 && (
          <div className="ms-filter-strip" style={{ paddingLeft: 20, marginBottom: 12 }}>
            {dateTabs.map(dt => (
              <button
                key={dt.key}
                className={`ms-filter-btn${dateTab === dt.key ? " is-active" : ""}`}
                onClick={() => setDateTab(dt.key)}
              >
                {dt.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: "0 20px" }}>
          {matches === null
            ? <EmptyState title="Loading fixtures…" />
            : visibleUpcoming.length
            ? <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {visibleUpcoming.map(m => <MatchRow key={m.id} match={m} onClick={() => onOpenMatch(m.id)} />)}
              </div>
            : <EmptyState title="No upcoming fixtures for this date." />
          }
        </div>
      </section>

      {/* Competitions */}
      <section style={{ padding: "0 20px", marginBottom: 28 }}>
        <div className="ms-section">
          <Trophy size={16} color="var(--ms-muted)" />
          <h2>Competitions</h2>
          <button type="button" onClick={() => setActiveScreen("competitions")} className="ms-section-action">
            All <ArrowRight size={12} />
          </button>
        </div>
        {competitions === null
          ? <EmptyState title="Loading competitions…" />
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {competitions.slice(0, 12).map(c => {
                const logoSrcs = competitionLogoSources({
                  logo_url: c.logo,
                  provider_competition_id: c.provider_competition_id,
                  provider_name: c.provider_name,
                });
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => onOpenCompetition(c.slug)}
                    className="ms-comp-card"
                    style={{ "--comp-color": c.color } as React.CSSProperties}
                  >
                    <Crest
                      src={logoSrcs[0]}
                      fallbackSrcs={logoSrcs.slice(1)}
                      name={c.name}
                      abbr={c.abbr}
                      size={34}
                      bgColor={c.color}
                    />
                    <span style={{ minWidth: 0 }}>
                      <span className="ms-comp-name">{c.name}</span>
                      <span className="ms-comp-sub">{c.season || "View standings"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
        }
      </section>
    </div>
  );
}
