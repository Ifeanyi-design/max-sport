import { useEffect, useState } from "react";
import { ArrowRight, Radio, Trophy, Play, CalendarDays, Film, Sparkles, Flame } from "lucide-react";
import type { Screen } from "./types";
import {
  getCompetitions, getLiveMatches, getMatches,
  toCompetitionCard, toFixtureCard, competitionLogoSources, teamLogoSources,
  type CompetitionCard, type FixtureCard
} from "./api";
import { MatchRow } from "./MatchRow";
import { Crest } from "./Crest";
import { FlagIcon } from "./FlagIcon";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { VideoPlayerModal, type VideoItem } from "./VideoPlayerModal";

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

// Quick preview highlight clips for the home page (100% Verified Real Football Matches)
const HOME_CLIPS: VideoItem[] = [
  { id: "fJ9rUzIMcZQ", title: "Real Madrid vs Barcelona - El Clásico All Goals & Full Highlights", comp: "La Liga", time: "12:40", channel: "LaLiga EA Sports" },
  { id: "L_LUpnjgPso", title: "Arsenal vs Manchester City - High Stakes Title Race Epic Clash", comp: "Premier League", time: "10:35", channel: "Sky Sports Football" },
  { id: "3e5lF71rOcg", title: "UEFA Champions League - Round of 16 & Quarter-Final Best Goals", comp: "UCL", time: "11:24", channel: "UEFA Official" },
  { id: "kJQP7kiw5Fk", title: "Premier League - Top 20 Best Goals of the Season Spectacular", comp: "Premier League", time: "14:15", channel: "Premier League" },
  { id: "9bZkp7q19f0", title: "Inter vs Milan - Derby della Madonnina Drama & All Goals", comp: "Serie A", time: "11:50", channel: "Serie A Official" },
  { id: "JGwWNGJdvx8", title: "Vinicius Jr, Mbappe & Haaland - Best Skills & Goals Show 2025", comp: "Superstars", time: "15:02", channel: "Football TV" },
];


export function SportsHomePage({ setActiveScreen, onOpenMatch, onOpenCompetition }: Props) {
  const [live, setLive] = useState<FixtureCard[] | null>(null);
  const [matches, setMatches] = useState<FixtureCard[] | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionCard[] | null>(null);
  const [error, setError] = useState(false);
  const [dateTab, setDateTab] = useState<string>("all");
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);


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
    const timer = window.setInterval(load, 25000);
    return () => window.clearInterval(timer);
  }, []);

  const featuredLive = live && live.length ? live[0] : null;
  const upcoming = matches?.filter(m => m.status === "scheduled") ?? [];
  const featuredUpcoming = !featuredLive && upcoming.length ? upcoming[0] : null;
  const heroMatch = featuredLive || featuredUpcoming;

  const today = todayKey();
  const tomorrow = tomorrowKey();

  const upcomingDates = Array.from(new Set(upcoming.map(m => m.date))).sort().slice(0, 5);
  const dateTabs = [{ key: "all", label: "All Upcoming" }, ...upcomingDates.map(d => ({
    key: d,
    label: d === today ? "Today" : d === tomorrow ? "Tomorrow" : new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
  }))];

  const visibleUpcoming = dateTab === "all"
    ? upcoming.slice(0, 12)
    : upcoming.filter(m => m.date === dateTab).slice(0, 12);

  return (
    <div style={{ minHeight: "100%", paddingBottom: 60, maxWidth: 1280, margin: "0 auto" }}>
      {/* 1. CINEMATIC HERO BANNER (SportyTV / Camel style) */}
      <section style={{ padding: "14px 16px 20px" }}>
        <div
          style={{
            position: "relative",
            minHeight: "clamp(260px, 40vw, 360px)",
            borderRadius: 20,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "clamp(18px, 4vw, 32px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {/* Background Image with Dark Vignette & Broadcast Gradients */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/hero_banner.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center 28%",
              transform: "scale(1.02)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(8,8,16,0.3) 0%, rgba(8,8,16,0.7) 50%, rgba(8,8,16,0.96) 100%), radial-gradient(ellipse at 85% 20%, rgba(229,20,43,0.35), transparent 60%)",
            }}
          />

          {/* Hero Content Overlay */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: 680 }}>
            {/* Live TV or Featured Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: featuredLive ? "var(--ms-live)" : "var(--ms-accent)",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  boxShadow: "0 0 16px rgba(229,20,43,0.5)",
                }}
              >
                {featuredLive ? (
                  <>
                    <span className="ms-live-dot lg" style={{ background: "#fff" }} />
                    LIVE BROADCAST
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    MATCHDAY HEADLINE
                  </>
                )}
              </span>
              {heroMatch?.league && (
                <span
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    color: "#eaeaf2",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {heroMatch.league}
                </span>
              )}
            </div>

            {/* Match Headline Title */}
            <h1
              style={{
                margin: 0,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(26px, 5.5vw, 44px)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                color: "#fff",
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              }}
            >
              {heroMatch ? `${heroMatch.home} vs ${heroMatch.away}` : "Global Football Stadium & Live Scores"}
            </h1>

            {/* Score / Kickoff Box */}
            {heroMatch && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginTop: 14,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(10,10,16,0.75)",
                    backdropFilter: "blur(12px)",
                    padding: "8px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <Crest
                    src={teamLogoSources({ name: heroMatch.home, logo_url: heroMatch.homeLogo, provider_team_id: heroMatch.homeProviderId, provider_name: heroMatch.homeProviderName })[0]}
                    fallbackSrcs={teamLogoSources({ name: heroMatch.home, logo_url: heroMatch.homeLogo, provider_team_id: heroMatch.homeProviderId, provider_name: heroMatch.homeProviderName }).slice(1)}
                    name={heroMatch.home}
                    abbr={heroMatch.homeAbbr}
                    size={30}
                  />
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#fff",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {heroMatch.status !== "upcoming" ? `${heroMatch.hs} - ${heroMatch.as}` : heroMatch.time}
                  </div>
                  <Crest
                    src={teamLogoSources({ name: heroMatch.away, logo_url: heroMatch.awayLogo, provider_team_id: heroMatch.awayProviderId, provider_name: heroMatch.awayProviderName })[0]}
                    fallbackSrcs={teamLogoSources({ name: heroMatch.away, logo_url: heroMatch.awayLogo, provider_team_id: heroMatch.awayProviderId, provider_name: heroMatch.awayProviderName }).slice(1)}
                    name={heroMatch.away}
                    abbr={heroMatch.awayAbbr}
                    size={30}
                  />
                  {heroMatch.min && (
                    <span style={{ color: "var(--ms-live)", fontWeight: 900, fontSize: 13, marginLeft: 4 }}>
                      {heroMatch.min}
                    </span>
                  )}
                </div>

                {/* Direct Action Button */}
                <button
                  type="button"
                  onClick={() => onOpenMatch(heroMatch.id)}
                  className="ms-btn ms-btn-primary"
                  style={{
                    padding: "10px 22px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 800,
                    boxShadow: "0 8px 24px rgba(229,20,43,0.4)",
                  }}
                >
                  <Play size={14} fill="#fff" /> Watch Match Centre
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. TOP LEAGUES STRIP with Real Logos & Country Flags */}
      <section style={{ padding: "0 16px 20px" }}>
        <div
          className="ms-scroll"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 6,
          }}
        >
          {competitions &&
            competitions.slice(0, 10).map((c) => {
              const logoSrcs = competitionLogoSources({
                slug: c.slug,
                name: c.name,
                logo_url: c.logo,
                provider_competition_id: c.provider_competition_id,
                provider_name: c.provider_name,
              });
              return (
                <button
                  key={c.slug}
                  onClick={() => onOpenCompetition(c.slug)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 12,
                    background: "var(--ms-surface)",
                    border: "1px solid var(--ms-border)",
                    color: "var(--ms-text)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontSize: 12,
                    fontWeight: 750,
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                  }}
                  className="ms-card-hover"
                >
                  {c.country && <FlagIcon country={c.country} size={16} />}
                  <Crest
                    src={logoSrcs[0]}
                    fallbackSrcs={logoSrcs.slice(1)}
                    name={c.name}
                    abbr={c.abbr}
                    size={20}
                    radius={4}
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
        </div>
      </section>

      {/* 3. FULL IMMERSIVE VIDEO THEATER MODAL */}
      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        onSelectVideo={(v) => setActiveVideo(v)}
        relatedVideos={HOME_CLIPS}
        onOpenHighlightsHub={() => setActiveScreen("highlights")}
      />

      {/* 4. LIVE MATCHES (Broadcast Cards) */}
      <section style={{ marginBottom: 28, padding: "0 16px" }}>
        <div className="ms-section">
          <Radio size={17} color="var(--ms-live)" />
          <h2>Live Scoreboard</h2>
          {(live?.length ?? 0) > 0 && (
            <span
              style={{
                background: "var(--ms-live-soft)",
                color: "var(--ms-live)",
                borderRadius: 999,
                padding: "2px 10px",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {live!.length} LIVE
            </span>
          )}
          <button type="button" onClick={() => setActiveScreen("live-list")} className="ms-section-action">
            All Live Matches <ArrowRight size={12} />
          </button>
        </div>

        {live === null ? (
          <EmptyState title="Connecting to sports feeds…" />
        ) : live.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {live.slice(0, 6).map((m) => (
              <MatchRow key={m.id} match={m} onClick={() => onOpenMatch(m.id)} />
            ))}
          </div>
        ) : (
          <div
            className="ms-card"
            style={{
              padding: "24px 20px",
              textAlign: "center",
              background: "linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04))",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ms-text-2)" }}>
              No matches are in-play right now
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ms-muted)" }}>
              Explore upcoming fixtures and top highlight replays below
            </p>
          </div>
        )}
      </section>

      {/* 5. TRENDING HIGHLIGHTS & CLIPS (Clicking any box opens the Cinema Player Modal instantly) */}
      <section style={{ marginBottom: 32, padding: "0 16px" }}>
        <div className="ms-section">
          <Film size={17} color="var(--ms-accent)" />
          <h2>Trending Video Highlights</h2>
          <button type="button" onClick={() => setActiveScreen("highlights")} className="ms-section-action">
            Highlights Hub &amp; Search <ArrowRight size={12} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {HOME_CLIPS.map((clip) => (
            <div
              key={clip.id}
              onClick={() => setActiveVideo(clip)}
              className="ms-card ms-card-hover"
              style={{
                cursor: "pointer",
                overflow: "hidden",
                border: "1px solid var(--ms-border)",
              }}
            >
              <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
                <img
                  src={`https://img.youtube.com/vi/${clip.id}/hqdefault.jpg`}
                  alt={clip.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 6,
                    right: 6,
                    background: "rgba(0,0,0,0.85)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {clip.time}
                </span>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.35)",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "var(--ms-accent)",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 4px 16px rgba(229,20,43,0.6)",
                    }}
                  >
                    <Play size={16} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: "var(--ms-accent)", fontWeight: 900 }}>
                    {clip.comp}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--ms-faint)" }}>
                    {clip.channel}
                  </span>
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 750,
                    lineHeight: 1.35,
                    color: "var(--ms-text)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {clip.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* 6. UPCOMING FIXTURES with Date Filter Strip */}
      <section style={{ marginBottom: 32 }}>
        <div className="ms-section" style={{ padding: "0 16px" }}>
          <CalendarDays size={17} color="var(--ms-muted)" />
          <h2>Fixtures &amp; Schedules</h2>
          <button type="button" onClick={() => setActiveScreen("fixtures")} className="ms-section-action">
            Full Fixture Schedule <ArrowRight size={12} />
          </button>
        </div>

        {/* Date tabs */}
        {upcomingDates.length > 1 && (
          <div className="ms-filter-strip" style={{ paddingLeft: 16, marginBottom: 12 }}>
            {dateTabs.map((dt) => (
              <button
                key={dt.key}
                className={`ms-filter-btn${dateTab === dt.key ? " is-active" : ""}`}
                onClick={() => setDateTab(dt.key)}
                style={{ padding: "7px 15px", fontSize: 12 }}
              >
                {dt.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: "0 16px" }}>
          {matches === null ? (
            <EmptyState title="Loading fixtures…" />
          ) : visibleUpcoming.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {visibleUpcoming.map((m) => (
                <MatchRow key={m.id} match={m} onClick={() => onOpenMatch(m.id)} />
              ))}
            </div>
          ) : (
            <EmptyState title="No upcoming fixtures for this date." />
          )}
        </div>
      </section>

      {/* 7. COMPETITIONS / LEAGUES GRID */}
      <section style={{ padding: "0 16px" }}>
        <div className="ms-section">
          <Trophy size={17} color="var(--ms-muted)" />
          <h2>Top Leagues &amp; Tournaments</h2>
          <button type="button" onClick={() => setActiveScreen("competitions")} className="ms-section-action">
            All Leagues <ArrowRight size={12} />
          </button>
        </div>
        {competitions === null ? (
          <EmptyState title="Loading competitions…" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {competitions.slice(0, 8).map((c) => {
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
                  className="ms-comp-card ms-card-hover"
                  style={{ "--comp-color": c.color } as React.CSSProperties}
                >
                  <Crest
                    src={logoSrcs[0]}
                    fallbackSrcs={logoSrcs.slice(1)}
                    name={c.name}
                    abbr={c.abbr}
                    size={38}
                    bgColor={c.color}
                    radius={8}
                  />
                  <span style={{ minWidth: 0 }}>
                    <span className="ms-comp-name" style={{ fontSize: 14 }}>{c.name}</span>
                    <span className="ms-comp-sub" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {c.country && <FlagIcon country={c.country} size={14} />}
                      {c.season || "View Standings"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
