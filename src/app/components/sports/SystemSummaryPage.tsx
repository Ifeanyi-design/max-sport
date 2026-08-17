import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Layers, Navigation, Database, Cpu, Code2, ChevronDown, ChevronRight, Globe } from "lucide-react";
import type { Screen } from "./types";

interface SystemSummaryPageProps {
  setActiveScreen: (s: Screen) => void;
}

const ALL_SCREENS: { screen: Screen; label: string; category: string; description: string; dataSource: string }[] = [
  { screen: "home",           label: "Sports Home",         category: "Core",        description: "Hero live match, live carousel, upcoming fixtures strip, highlights reel, competition hub, trending sports.", dataSource: "GET /api/home — aggregated feed; /api/live/featured; /api/fixtures/next-5" },
  { screen: "live-list",      label: "Live Match List",      category: "Live",        description: "All currently live matches in a filterable grid. League filter chips, viewer counts, minute badges, refresh control.", dataSource: "GET /api/matches/live — poll every 30s; websocket for score updates" },
  { screen: "live-match",     label: "Live Match Detail",    category: "Live",        description: "Single match view: video player UI, real-time score header, stats panel (possession, shots, cards), commentary feed, timeline, lineups, other live sidebar.", dataSource: "GET /api/match/:id/detail; WS /ws/match/:id for commentary+score" },
  { screen: "fixtures",       label: "Fixtures",             category: "Core",        description: "Weekly calendar strip, date-based match list, league selector, status tags (LIVE/FT/HT/UPCOMING), click-to-detail.", dataSource: "GET /api/fixtures?date=YYYY-MM-DD&league=epl" },
  { screen: "standings",      label: "Standings",            category: "Core",        description: "Full league table with pos/trend/W/D/L/GF/GA/GD/Pts/Form. Zone highlighting (UCL/UEL/Relegation). Top scorers + assists panels.", dataSource: "GET /api/standings/:league/:season; /api/top-scorers/:league" },
  { screen: "competitions",   label: "Competitions",         category: "Core",        description: "Browse all competitions by continent/region, league cards with active season info.", dataSource: "GET /api/competitions" },
  { screen: "teams",          label: "Team Profile",         category: "Detail",      description: "Team overview: form, squad list, upcoming fixtures, season stats.", dataSource: "GET /api/team/:id" },
  { screen: "player-profile", label: "Player Profile",       category: "Detail",      description: "Full player bio, season stats grid, goals-per-month chart, attribute radar, match-by-match performance, career history, international record.", dataSource: "GET /api/player/:id; /api/player/:id/stats; /api/player/:id/matches" },
  { screen: "highlights",     label: "Highlights",           category: "Media",       description: "Video highlights feed, featured hero reel, filter by competition/date, view counts.", dataSource: "GET /api/highlights?league=&limit=20" },
  { screen: "search",         label: "Search",               category: "Discovery",   description: "Global search across teams, players, leagues, matches. Trending + recent history. Category filters.", dataSource: "GET /api/search?q=&type=all|team|player|league|match" },
  { screen: "world-cup",      label: "World Cup Hub",        category: "Tournament",  description: "WC2026 hub: group tables (8 groups), knockout bracket (R16→QF→SF→Final), schedule, tournament stats, top scorers.", dataSource: "GET /api/tournament/wc2026/groups; /bracket; /schedule; /stats" },
  { screen: "mobile",         label: "Mobile UX Preview",    category: "System",      description: "Phone-frame preview of the mobile app experience with bottom navigation, FAB live button, swipeable cards.", dataSource: "Same API surface as desktop, rendered in mobile layout" },
];

const COMPONENTS = [
  { name: "TeamBadge",       desc: "Circular team badge with abbreviation + team color. Sizes: 28–56px.",                  usage: "LiveListPage, LiveMatchPage, StandingsPage" },
  { name: "LivePulse",       desc: "Animated red dot + LIVE label. Pulses at 1.4s cycle.",                                 usage: "LiveListPage, LiveMatchPage, SportsHomePage, MobileSportsPage" },
  { name: "MinuteTag",       desc: "Match minute badge — red for ongoing, gold for HT, grey for FT.",                      usage: "LiveListPage, FixturesPage, SportsHomePage" },
  { name: "FormBadge",       desc: "W/D/L 20×20 coloured badge — green/gold/red.",                                         usage: "StandingsPage, TeamProfilePage" },
  { name: "StatBar",         desc: "Two-sided stat bar with motion fill. Home% vs Away%.",                                  usage: "LiveMatchPage stats panel" },
  { name: "SkeletonRow",     desc: "Shimmer loading skeleton for table rows.",                                              usage: "StandingsPage, FixturesPage" },
  { name: "Tooltip",         desc: "Hover tooltip with CSS arrow for sidebar nav items.",                                   usage: "Sidebar" },
  { name: "MatchCard",       desc: "Live/upcoming match card with score, teams, badges, watch CTA.",                        usage: "LiveListPage, SportsHomePage" },
  { name: "StatCard",        desc: "Single-stat display block with value, label, sub-label and colour accent.",             usage: "PlayerProfilePage" },
  { name: "Sidebar",         desc: "72px icon-only sidebar with tooltips, live dot, active indicator, mode toggle.",        usage: "App.tsx (desktop only)" },
  { name: "BottomNav",       desc: "Mobile sticky bottom navigation: Home/Live/Fixtures/Search/More.",                     usage: "MobileSportsPage" },
];

const UI_STATES = [
  { state: "LIVE",         color: "#ff3b3b", desc: "Animated red pulse dot. Applied on match cards, sidebar icon, mobile FAB, nav badge." },
  { state: "HT",           color: "#f5c518", desc: "Gold badge. Half-time indicator on score cards and minute tags." },
  { state: "FT",           color: "#5e6280", desc: "Grey. Final result — no animation." },
  { state: "UPCOMING",     color: "#00d4ff", desc: "Cyan. Shows kickoff time. Reminder/notify CTA." },
  { state: "LOADING",      color: "#3d4060", desc: "Shimmer skeleton animation (90deg gradient sweep). Used on all data-fetched lists." },
  { state: "EMPTY",        color: "#3d4060", desc: "Centered icon + title + subtitle. Shown when filter returns 0 results." },
  { state: "SCORE CHANGE", color: "#00ff87", desc: "Green flash on score value (animate pulse 0.4s). Triggered by WS score update." },
  { state: "GOAL NOTIF",   color: "#00ff87", desc: "Toast overlay in video player. Name + minute + team badge. Auto-dismiss 4s." },
];

const API_MAP = [
  { endpoint: "GET /api/matches/live",           desc: "Returns all currently live matches with score, minute, league, viewer count." },
  { endpoint: "WS  /ws/match/:id",               desc: "Real-time stream: score, commentary, cards, subs, minute ticker." },
  { endpoint: "GET /api/match/:id/detail",       desc: "Full match data: lineups, stats, timeline events, possession over time." },
  { endpoint: "GET /api/fixtures",               desc: "Fixtures by date/league. Status: upcoming|live|finished. Supports date range." },
  { endpoint: "GET /api/standings/:league",      desc: "Full table: pos, form, trend, zone (champions/europa/relegation)." },
  { endpoint: "GET /api/player/:id/stats",       desc: "Season stats: goals, assists, xG, shots, radar attributes, per-match." },
  { endpoint: "GET /api/tournament/:id/groups",  desc: "Group tables for tournament (WC, Euro etc). Includes QA/points." },
  { endpoint: "GET /api/tournament/:id/bracket", desc: "Knockout bracket tree: rounds, matches, scores, status." },
  { endpoint: "GET /api/search",                 desc: "Multi-type search. Returns teams, players, leagues, matches grouped." },
  { endpoint: "GET /api/highlights",             desc: "Video highlights feed with thumbnail URL, duration, view count, league." },
];

const DEV_NOTES = [
  "All pages use React functional components with TypeScript. Props are typed via interfaces. Screen type is a union in types.ts.",
  "Navigation is state-managed in App.tsx via setActiveScreen(). No React Router — single SPA screen swap with AnimatePresence.",
  "Live data should poll GET /api/matches/live every 30 seconds. Score changes should use WebSocket for push updates.",
  "Use AnimatePresence with mode='wait' for all screen transitions. Entry: opacity 0→1, y 12→0 at 0.25s ease-out.",
  "Sidebar is 72px fixed, icon-only, with hover tooltips. Active state uses layoutId='sidebar-indicator' for smooth sliding.",
  "Mobile layout is entirely separate (MobileSportsPage). It renders inside a phone-frame for desktop preview. In production, serve the mobile layout at viewport < 768px.",
  "Color tokens: Primary BG #07070f, Surface #0d0d1c, Accent Cyan #00d4ff, Accent Green #00ff87, Live Red #ff3b3b, Gold #f5c518.",
  "Font stack: 'Barlow Condensed' for headings/scores/labels, 'Inter' for body text. Both loaded via fonts.css.",
  "Card glass effect: background rgba(13,13,28,0.8), backdrop-filter blur(12-24px), border rgba(255,255,255,0.06).",
  "Loading skeletons use shimmer animation (background gradient sweep 1.4s). Applied as className='skeleton-shimmer'.",
  "Player/Team detail screens (PlayerProfilePage, TeamProfilePage) are currently linked from Standings and Teams nav items.",
  "World Cup Hub is standalone. Link it from Home hero section and sidebar nav (Globe icon).",
];

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: "24px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "10px",
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: open ? "12px 12px 0 0" : "12px",
          padding: "14px 18px", cursor: "pointer",
          transition: "border-radius 0.15s",
        }}
      >
        <div style={{ color: "#00d4ff" }}>{icon}</div>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "1px", flex: 1, textAlign: "left" }}>{title}</span>
        {open ? <ChevronDown size={14} color="#5e6280" /> : <ChevronRight size={14} color="#5e6280" />}
      </button>
      {open && (
        <div style={{
          border: "1px solid rgba(255,255,255,0.08)", borderTop: "none",
          borderRadius: "0 0 12px 12px", overflow: "hidden",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function SystemSummaryPage({ setActiveScreen }: SystemSummaryPageProps) {
  return (
    <div style={{ background: "#07070f", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        padding: "32px 32px 28px",
        background: "linear-gradient(180deg, rgba(13,13,28,0.95) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "20px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px", flexShrink: 0,
            background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={24} color="#f5c518" />
          </div>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
              Developer Reference · v1.0 · June 2026
            </div>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: "44px", fontWeight: 900,
              color: "#fff", textTransform: "uppercase", letterSpacing: "-0.5px",
              lineHeight: 1, margin: 0,
            }}>MAXCINEMA <span style={{ background: "linear-gradient(135deg, #00d4ff, #00ff87)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sports Hub</span></h1>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#5e6280", marginTop: "6px" }}>
              UI System Summary — Blueprint for Flask + API + React implementation
            </div>
          </div>

          <div style={{ marginLeft: "auto", flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "32px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{ALL_SCREENS.length}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280" }}>screens</div>
          </div>
        </div>

        {/* Quick stats strip */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Total Screens", value: ALL_SCREENS.length, color: "#00d4ff" },
            { label: "Core Components", value: COMPONENTS.length, color: "#00ff87" },
            { label: "UI States", value: UI_STATES.length, color: "#f5c518" },
            { label: "API Endpoints", value: API_MAP.length, color: "#ff9500" },
            { label: "Tech Stack", value: "React + TS + Tailwind", color: "#9095b8" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 900, color: s.color }}>{s.value}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "28px 32px 60px" }}>

        {/* 1. All Screens */}
        <Section title="Full Page List" icon={<Layers size={18} />}>
          <div>
            {["Core", "Live", "Detail", "Media", "Discovery", "Tournament", "System"].map(cat => {
              const catScreens = ALL_SCREENS.filter(s => s.category === cat);
              if (!catScreens.length) return null;
              return (
                <div key={cat}>
                  <div style={{
                    padding: "8px 18px", background: "rgba(255,255,255,0.015)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#3d4060", textTransform: "uppercase", letterSpacing: "0.08em" }}>{cat}</span>
                  </div>
                  {catScreens.map((s, i) => (
                    <motion.div
                      key={s.screen} whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: "16px",
                        padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                        cursor: "pointer",
                      }}
                      onClick={() => setActiveScreen(s.screen)}
                    >
                      <div style={{
                        width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                        background: "#00d4ff", marginTop: "6px",
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3px" }}>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, color: "#fff" }}>{s.label}</span>
                          <code style={{
                            fontFamily: "monospace", fontSize: "11px", color: "#5e6280",
                            background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: "4px",
                          }}>{s.screen}</code>
                        </div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#9095b8", lineHeight: 1.5, marginBottom: "5px" }}>{s.description}</div>
                        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#4a6280", background: "rgba(0,212,255,0.04)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(0,212,255,0.08)" }}>
                          {s.dataSource}
                        </div>
                      </div>
                      <ChevronRight size={13} color="#3d4060" style={{ flexShrink: 0, marginTop: "4px" }} />
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        </Section>

        {/* 2. Navigation Architecture */}
        <Section title="Navigation Architecture" icon={<Navigation size={18} />}>
          <div style={{ padding: "20px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Desktop nav */}
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800, color: "#00d4ff", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                Desktop Sidebar (72px)
              </div>
              {[
                { label: "Home", icon: "⌂", note: "Default entry" },
                { label: "Live ●", icon: "◉", note: "Live pulse dot, links to list" },
                { label: "Fixtures", icon: "📅", note: "Weekly calendar view" },
                { label: "Standings", icon: "📊", note: "Full table + scorers" },
                { label: "Competitions", icon: "🏆", note: "Browse all leagues" },
                { label: "Teams", icon: "👥", note: "Team profile" },
                { label: "Highlights", icon: "🎬", note: "Video feed" },
                { label: "Search", icon: "🔍", note: "Global search" },
                { label: "World Cup Hub", icon: "🌍", note: "Tournament hub" },
                { label: "— Dev Ref", icon: "📖", note: "System summary (this page)" },
                { label: "— Mobile Preview", icon: "📱", note: "Phone-frame preview" },
                { label: "— Mode Toggle", icon: "🎬", note: "Sports ↔ Cinema switch" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "6px 10px", borderRadius: "7px",
                  background: item.label.startsWith("—") ? "transparent" : "rgba(255,255,255,0.02)",
                  marginBottom: "3px",
                  borderLeft: item.label.startsWith("—") ? "none" : "2px solid rgba(0,212,255,0.2)",
                }}>
                  <span style={{ fontSize: "14px" }}>{item.icon}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: item.label.startsWith("—") ? "#3d4060" : "#e0e4f8", flex: 1 }}>{item.label}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#3d4060" }}>{item.note}</span>
                </div>
              ))}
            </div>

            {/* Mobile nav */}
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800, color: "#00ff87", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                Mobile Bottom Nav
              </div>
              {[
                { label: "Home", note: "Feed" },
                { label: "Live ●", note: "Match list — animated dot" },
                { label: "Fixtures", note: "Calendar" },
                { label: "Search", note: "Global search" },
                { label: "More", note: "Competitions, Standings, Profile" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "6px 10px", borderRadius: "7px",
                  background: "rgba(255,255,255,0.02)", marginBottom: "3px",
                  borderLeft: "2px solid rgba(0,255,135,0.2)",
                }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#e0e4f8", flex: 1 }}>{item.label}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#3d4060" }}>{item.note}</span>
                </div>
              ))}
              <div style={{ marginTop: "12px", padding: "10px", background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.15)", borderRadius: "10px" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 800, color: "#ff3b3b", marginBottom: "4px" }}>LIVE FAB (Floating)</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9095b8" }}>
                  56×56 bottom-right, pulse animation. Always visible. Navigates to live-list.
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800, color: "#f5c518", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                  Navigation Flow
                </div>
                {[
                  "Home → Live List (click any live match card)",
                  "Live List → Live Match Detail (click Watch)",
                  "Live Match Detail → Live List (Back button)",
                  "Standings → Player Profile (click player row)",
                  "Fixtures → Live Match Detail (click live match)",
                  "Search → Teams / Players / Live Match",
                  "World Cup Hub → Live Match Detail (click bracket match)",
                ].map((flow, i) => (
                  <div key={i} style={{
                    fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#7b80a0",
                    padding: "5px 0", borderBottom: i < 6 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}>
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#3d4060", flexShrink: 0 }} />
                    {flow}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 3. Component System */}
        <Section title="Component System" icon={<Code2 size={18} />}>
          <div>
            {COMPONENTS.map((c, i) => (
              <div key={c.name} style={{
                display: "flex", alignItems: "flex-start", gap: "16px",
                padding: "12px 18px", borderBottom: i < COMPONENTS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <code style={{
                  flexShrink: 0, fontFamily: "monospace", fontSize: "12px", fontWeight: 700,
                  color: "#00d4ff", background: "rgba(0,212,255,0.07)", padding: "3px 8px",
                  borderRadius: "6px", minWidth: "160px",
                }}>{c.name}</code>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#c0c5e0", marginBottom: "3px" }}>{c.desc}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280" }}>Used in: {c.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. UI State System */}
        <Section title="UI State System" icon={<Cpu size={18} />}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
            {UI_STATES.map((s, i) => (
              <div key={s.state} style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                padding: "14px 18px",
                borderBottom: i < UI_STATES.length - 2 ? "1px solid rgba(255,255,255,0.04)" : "none",
                borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <div style={{
                  width: "10px", height: "10px", borderRadius: "3px", flexShrink: 0,
                  background: s.color, marginTop: "4px",
                  boxShadow: `0 0 8px ${s.color}60`,
                }} />
                <div>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 800, color: s.color, letterSpacing: "0.5px" }}>{s.state}</span>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9095b8", marginTop: "3px", lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 5. Data Flow / API Map */}
        <Section title="API ↔ UI Data Flow" icon={<Database size={18} />}>
          <div>
            {API_MAP.map((a, i) => (
              <div key={a.endpoint} style={{
                display: "flex", alignItems: "flex-start", gap: "16px",
                padding: "12px 18px", borderBottom: i < API_MAP.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <code style={{
                  flexShrink: 0, fontFamily: "monospace", fontSize: "11px",
                  color: a.endpoint.startsWith("WS") ? "#f5c518" : "#00ff87",
                  background: a.endpoint.startsWith("WS") ? "rgba(245,197,24,0.06)" : "rgba(0,255,135,0.06)",
                  padding: "3px 8px", borderRadius: "6px", whiteSpace: "nowrap",
                }}>{a.endpoint}</code>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#9095b8", lineHeight: 1.5 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. Developer Notes */}
        <Section title="Developer Notes" icon={<Globe size={18} />}>
          <div style={{ padding: "8px 0" }}>
            {DEV_NOTES.map((note, i) => (
              <div key={i} style={{
                display: "flex", gap: "14px", padding: "12px 18px",
                borderBottom: i < DEV_NOTES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <div style={{
                  flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%",
                  background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 800, color: "#00d4ff",
                }}>{i + 1}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#9095b8", lineHeight: 1.6 }}>{note}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: "8px", padding: "20px",
          background: "rgba(13,13,28,0.7)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px", textAlign: "center",
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 900, color: "#fff", marginBottom: "6px" }}>
            MAXCINEMA SPORTS HUB — UI SYSTEM v1.0
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#5e6280" }}>
            Complete, structured, production-ready UI blueprint for Flask + API + React implementation.
            This document serves as the single source of truth for the design system.
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#3d4060", marginTop: "8px" }}>
            Generated June 2026 · React 18 + TypeScript + Tailwind v4 + Motion
          </div>
        </div>

      </div>
    </div>
  );
}
