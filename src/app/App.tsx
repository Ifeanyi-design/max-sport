import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router";
import { Radio } from "lucide-react";
import { type Screen } from "./components/sports/types";
import { getLiveMatches, getSportsMeta, toLiveCard, type LiveCard } from "./components/sports/api";
import { Sidebar } from "./components/sports/Sidebar";
import { BottomTabBar } from "./components/sports/BottomTabBar";
import { SportsHomePage } from "./components/sports/SportsHomePage";
import { LiveListPage } from "./components/sports/LiveListPage";
import { LiveMatchPage } from "./components/sports/LiveMatchPage";
import { FixturesPage } from "./components/sports/FixturesPage";
import { StandingsPage } from "./components/sports/StandingsPage";
import { CompetitionsPage } from "./components/sports/CompetitionsPage";
import { SearchPage } from "./components/sports/SearchPage";
import { TeamsPage } from "./components/sports/TeamsPage";
import { TeamProfilePage } from "./components/sports/TeamProfilePage";
import { AboutPage } from "./components/sports/AboutPage";
import "../styles/fonts.css";

const TICKER_H = 32;

const screenPath: Record<Exclude<Screen, "live-match">, string> = {
  home: "/",
  "live-list": "/live",
  fixtures: "/fixtures",
  standings: "/standings/english-premier-league",
  competitions: "/competitions",
  teams: "/teams",
  team: "/teams",
  about: "/about",
  search: "/search",
};

function screenForPath(pathname: string): Screen {
  if (pathname.startsWith("/match/")) return "live-match";
  if (pathname === "/live") return "live-list";
  if (pathname === "/fixtures") return "fixtures";
  if (pathname.startsWith("/standings/")) return "standings";
  if (pathname === "/competitions") return "competitions";
  if (pathname.startsWith("/teams/")) return "team";
  if (pathname === "/teams") return "teams";
  if (pathname === "/about") return "about";
  if (pathname === "/search") return "search";
  return "home";
}

function MatchRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <LiveMatchPage matchId={Number(id)} onBack={() => navigate("/live")} onOpenMatch={(matchId) => navigate(`/match/${matchId}`)} />;
}

function StandingsRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();
  return <StandingsPage slug={slug || "english-premier-league"} onBack={() => navigate("/")} onSelectCompetition={(nextSlug) => navigate(`/standings/${nextSlug}`)} onOpenMatch={(matchId) => navigate(`/match/${matchId}`)} />;
}

function TeamRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();
  return <TeamProfilePage slug={slug || ""} onBack={() => navigate("/teams")} onOpenMatch={(matchId) => navigate(`/match/${matchId}`)} onOpenCompetition={(competitionSlug) => navigate(`/standings/${competitionSlug}`)} />;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [liveTicker, setLiveTicker] = useState<LiveCard[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const activeScreen = screenForPath(location.pathname);

  const setActiveScreen = (screen: Screen) => {
    if (screen !== "live-match") navigate(screenPath[screen]);
  };

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const load = () => {
      getLiveMatches().then((matches) => setLiveTicker(matches.map(toLiveCard))).catch(() => setLiveTicker([]));
      getSportsMeta().then((meta) => setLiveCount(meta.live_count ?? 0)).catch(() => {});
    };
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setTickerIndex((index) => index + 1), 4000);
    return () => window.clearInterval(timer);
  }, []);

  const showTicker = activeScreen !== "live-match" && !isMobile;
  const tickerMatch = liveTicker.length ? liveTicker[tickerIndex % liveTicker.length] : null;

  return (
    <div style={{ background: "#0a0a10", height: "100vh", overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", display: "flex", color: "#ececf1", ["--app-ticker-h" as string]: showTicker ? `${TICKER_H}px` : "0px" }}>
      {!isMobile && <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((value) => !value)} liveCount={liveCount} />}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {showTicker && (
          <button type="button" onClick={() => navigate(tickerMatch ? `/match/${tickerMatch.id}` : "/live")} style={{ height: TICKER_H, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: "rgba(220,38,38,0.06)", border: "none", borderBottom: "1px solid rgba(220,38,38,0.14)", cursor: "pointer", color: "inherit", width: "100%", textAlign: "left", flexShrink: 0 }}>
            <span className="ms-live-dot" /><Radio size={12} color="#dc2626" />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#dc2626", letterSpacing: "0.08em" }}>LIVE</span>
            <span style={{ fontSize: 11, color: "#8b8b9a" }}>{liveCount} matches</span>
            <span style={{ width: 1, height: 12, background: "rgba(220,38,38,0.2)" }} />
            <span style={{ flex: 1, overflow: "hidden", fontSize: 12, color: "#c8c8d4" }}>{tickerMatch ? `${tickerMatch.home} ${tickerMatch.homeScore}–${tickerMatch.awayScore} ${tickerMatch.away}${tickerMatch.minute ? `  ${tickerMatch.minute}` : ""}` : "No live matches right now"}</span>
            <span style={{ fontSize: 11, color: "#8b8b9a" }}>Open live</span>
          </button>
        )}
        <main className="ms-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative", paddingBottom: isMobile ? 72 : 0 }}>
          <Routes>
            <Route path="/" element={<SportsHomePage setActiveScreen={setActiveScreen} onOpenMatch={(id) => navigate(`/match/${id}`)} onOpenCompetition={(slug) => navigate(`/standings/${slug}`)} />} />
            <Route path="/live" element={<LiveListPage setActiveScreen={setActiveScreen} onOpenMatch={(id) => navigate(`/match/${id}`)} />} />
            <Route path="/match/:id" element={<MatchRoute />} />
            <Route path="/fixtures" element={<FixturesPage setActiveScreen={setActiveScreen} onOpenMatch={(id) => navigate(`/match/${id}`)} />} />
            <Route path="/standings/:slug" element={<StandingsRoute />} />
            <Route path="/competitions" element={<CompetitionsPage setActiveScreen={setActiveScreen} onOpenCompetition={(slug) => navigate(`/standings/${slug}`)} />} />
            <Route path="/teams" element={<TeamsPage setActiveScreen={setActiveScreen} onOpenTeam={(slug) => navigate(`/teams/${slug}`)} />} />
            <Route path="/teams/:slug" element={<TeamRoute />} />
            <Route path="/about" element={<AboutPage setActiveScreen={setActiveScreen} />} />
            <Route path="/search" element={<SearchPage setActiveScreen={setActiveScreen} onOpenMatch={(id) => navigate(`/match/${id}`)} onOpenCompetition={(slug) => navigate(`/standings/${slug}`)} onOpenTeam={(slug) => navigate(`/teams/${slug}`)} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {isMobile && <BottomTabBar activeScreen={activeScreen} setActiveScreen={setActiveScreen} liveCount={liveCount} />}
    </div>
  );
}
