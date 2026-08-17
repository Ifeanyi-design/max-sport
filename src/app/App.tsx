import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wifi } from "lucide-react";
import { type Screen, type AppMode } from "./components/sports/types";
import { getLiveMatches, toLiveCard, LiveCard } from "./components/sports/api";
import { Sidebar } from "./components/sports/Sidebar";
import { BottomTabBar } from "./components/sports/BottomTabBar";
import { SportsHomePage } from "./components/sports/SportsHomePage";
import { LiveListPage } from "./components/sports/LiveListPage";
import { LiveMatchPage } from "./components/sports/LiveMatchPage";
import { FixturesPage } from "./components/sports/FixturesPage";
import { StandingsPage } from "./components/sports/StandingsPage";
import { CompetitionsPage } from "./components/sports/CompetitionsPage";
import { TeamProfilePage } from "./components/sports/TeamProfilePage";
import { PlayerProfilePage } from "./components/sports/PlayerProfilePage";
import { HighlightsPage } from "./components/sports/HighlightsPage";
import { SearchPage } from "./components/sports/SearchPage";
import { WorldCupHubPage } from "./components/sports/WorldCupHubPage";
import { SystemSummaryPage } from "./components/sports/SystemSummaryPage";
import { MobileSportsPage } from "./components/sports/MobileSportsPage";
import "../styles/fonts.css";

const LIVE_SCREENS: Screen[] = ["live-list", "live-match"];
const TICKER_H = 34; // px — height of the ticker bar

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<AppMode>("sports");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 768);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [liveTicker, setLiveTicker] = useState<LiveCard[]>([]);

  useEffect(() => {
    getLiveMatches()
      .then((d) => setLiveTicker(d.map(toLiveCard)))
      .catch(() => setLiveTicker([]));
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth < 768) setSidebarCollapsed(true); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTickerIndex(i => i + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const isMobile        = activeScreen === "mobile";
  const showSidebar     = !isMobile && !sidebarCollapsed;
  const showCollapsedNav = !isMobile && sidebarCollapsed;
  const showTicker      = !LIVE_SCREENS.includes(activeScreen) && !isMobile;
  const tickerIdx       = liveTicker.length ? tickerIndex % liveTicker.length : 0;

  return (
    // CSS variable lets LiveMatchPage subtract ticker height from its fixed-height split
    <div
      style={{
        background: "#07070f",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        display: "flex",
        ["--app-ticker-h" as string]: showTicker ? `${TICKER_H}px` : "0px",
      }}
    >
      {/* ── Sidebar ── */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 88, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            style={{ flexShrink: 0, overflow: "hidden" }}
          >
            <Sidebar
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              mode={mode}
              setMode={setMode}
              onCollapse={() => setSidebarCollapsed(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating logo / expand pill (collapsed, non-mobile) ── */}
      <AnimatePresence>
        {showCollapsedNav && (
          <motion.div
            key="floating-logo"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{ position: "fixed", top: "14px", left: "14px", zIndex: 300 }}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSidebarCollapsed(false)}
              style={{
                display: "flex", alignItems: "center", gap: 0,
                background: "rgba(10,10,22,0.9)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                cursor: "pointer",
                overflow: "hidden",
                boxShadow: "0 6px 24px rgba(0,0,0,0.55)",
                padding: 0,
              }}
            >
              <div style={{
                width: "40px", height: "40px",
                background: "linear-gradient(135deg,#e53e3e 0%,#ff6b6b 50%,#c0392b 100%)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "19px", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>M</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "0 12px 0 10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ width: "12px", height: "1.5px", background: "#4a4f6e", borderRadius: "1px" }} />
                  <div style={{ width: "9px",  height: "1.5px", background: "#4a4f6e", borderRadius: "1px" }} />
                  <div style={{ width: "12px", height: "1.5px", background: "#4a4f6e", borderRadius: "1px" }} />
                </div>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#5e6280", letterSpacing: "0.03em" }}>Menu</span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content column: ticker above scroll pane ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Live ticker — sits outside scroll pane so pages aren't compressed */}
        <AnimatePresence>
          {showTicker && (
            <motion.div
              key="ticker"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: TICKER_H, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              style={{ flexShrink: 0, overflow: "hidden" }}
            >
              <div
                onClick={() => setActiveScreen("live-list")}
                style={{
                  height: TICKER_H,
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "0 20px",
                  background: "rgba(255,59,59,0.06)",
                  borderBottom: "1px solid rgba(255,59,59,0.12)",
                  cursor: "pointer",
                }}
              >
                <style>{`@keyframes appLivePulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                  <span style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#ff3b3b", display: "inline-block",
                    animation: "appLivePulse 1.4s ease-in-out infinite",
                  }} />
                  <Wifi size={11} color="#ff3b3b" strokeWidth={2.2} />
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", fontWeight: 900, color: "#ff3b3b", letterSpacing: "1.5px" }}>LIVE</span>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", fontWeight: 700, color: "#3a3f5e", letterSpacing: "0.5px" }}>· {liveTicker.length} matches</span>
                </div>

                <div style={{ width: "1px", height: "14px", background: "rgba(255,59,59,0.2)", flexShrink: 0 }} />

                <div style={{ flex: 1, overflow: "hidden" }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tickerIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                       <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: "#c0c5e0" }}>{liveTicker[tickerIdx].home}</span>
                       <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "14px", fontWeight: 900, color: "#fff", background: "rgba(255,255,255,0.07)", padding: "0 6px", borderRadius: "4px" }}>
                         {liveTicker[tickerIdx].homeScore} — {liveTicker[tickerIdx].awayScore}
                       </span>
                       <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: "#c0c5e0" }}>{liveTicker[tickerIdx].away}</span>
                       <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "10px", fontWeight: 800, color: "#ff3b3b" }}>{liveTicker[tickerIdx].minute}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "10px", fontWeight: 600, color: "#5e6280", flexShrink: 0, letterSpacing: "0.03em" }}>Watch →</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll pane — gets the remaining height after ticker */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          paddingBottom: showCollapsedNav ? "80px" : "0",
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ minHeight: "100%" }}
            >
              {activeScreen === "home"           && <SportsHomePage   setActiveScreen={setActiveScreen} />}
              {activeScreen === "live-list"      && <LiveListPage      setActiveScreen={setActiveScreen} />}
              {activeScreen === "live-match"     && <LiveMatchPage     setActiveScreen={setActiveScreen} />}
              {activeScreen === "fixtures"       && <FixturesPage      setActiveScreen={setActiveScreen} />}
              {activeScreen === "standings"      && <StandingsPage     setActiveScreen={setActiveScreen} />}
              {activeScreen === "competitions"   && <CompetitionsPage  setActiveScreen={setActiveScreen} />}
              {activeScreen === "teams"          && <TeamProfilePage   setActiveScreen={setActiveScreen} />}
              {activeScreen === "player-profile" && <PlayerProfilePage setActiveScreen={setActiveScreen} />}
              {activeScreen === "highlights"     && <HighlightsPage    setActiveScreen={setActiveScreen} />}
              {activeScreen === "search"         && <SearchPage        setActiveScreen={setActiveScreen} />}
              {activeScreen === "world-cup"      && <WorldCupHubPage   setActiveScreen={setActiveScreen} />}
              {activeScreen === "system-summary" && <SystemSummaryPage setActiveScreen={setActiveScreen} />}
              {activeScreen === "mobile"         && <MobileSportsPage  setActiveScreen={setActiveScreen} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom tab bar (collapsed sidebar) */}
      <AnimatePresence>
        {showCollapsedNav && (
          <BottomTabBar
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
            onExpandSidebar={() => setSidebarCollapsed(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
