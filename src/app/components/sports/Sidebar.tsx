import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home, Wifi, Calendar, BarChart3, Trophy, Users,
  Film, Search, Globe, Clapperboard, Smartphone, BookOpen, ChevronRight, ChevronsLeft
} from "lucide-react";
import type { Screen, AppMode } from "./types";

interface SidebarProps {
  activeScreen: Screen;
  setActiveScreen: (s: Screen) => void;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  onCollapse: () => void;
}

type NavSection = {
  label: string;
  items: { id: string; label: string; Icon: React.FC<any>; screen: Screen; isLive?: boolean; isGold?: boolean }[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main",
    items: [
      { id: "home",      label: "Home",      Icon: Home,      screen: "home" },
      { id: "live-list", label: "Live",       Icon: Wifi,      screen: "live-list", isLive: true },
      { id: "fixtures",  label: "Fixtures",   Icon: Calendar,  screen: "fixtures" },
      { id: "standings", label: "Standings",  Icon: BarChart3, screen: "standings" },
    ],
  },
  {
    label: "Browse",
    items: [
      { id: "competitions", label: "Leagues",    Icon: Trophy, screen: "competitions" },
      { id: "teams",        label: "Teams",      Icon: Users,  screen: "teams" },
      { id: "highlights",   label: "Highlights", Icon: Film,   screen: "highlights" },
      { id: "search",       label: "Search",     Icon: Search, screen: "search" },
    ],
  },
  {
    label: "Events",
    items: [
      { id: "world-cup", label: "World Cup", Icon: Globe, screen: "world-cup", isGold: true },
    ],
  },
];

const LIVE_RELATED: Screen[] = ["live-list", "live-match"];
const STANDINGS_RELATED: Screen[] = ["standings", "player-profile"];

export function Sidebar({ activeScreen, setActiveScreen, mode, setMode, onCollapse }: SidebarProps) {
  const [liveCount] = useState(6);

  function isNavActive(id: string, screen: Screen): boolean {
    if (id === "live-list") return LIVE_RELATED.includes(activeScreen);
    if (id === "standings") return STANDINGS_RELATED.includes(activeScreen);
    return activeScreen === screen;
  }

  function getAccentColor(id: string) {
    if (id === "live-list") return "#ff3b3b";
    if (id === "world-cup") return "#f5c518";
    return "#00d4ff";
  }

  function getActiveBg(id: string) {
    if (id === "live-list") return "rgba(255,59,59,0.1)";
    if (id === "world-cup") return "rgba(245,197,24,0.08)";
    return "rgba(0,212,255,0.08)";
  }

  return (
    <div style={{
      width: "88px", flexShrink: 0, height: "100vh", position: "sticky", top: 0,
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "rgba(7,7,15,0.99)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      zIndex: 50, overflowY: "auto", overflowX: "visible",
      scrollbarWidth: "none",
    }}>
      <style>{`
        @keyframes sidebarLivePulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.75); }
        }
        @keyframes liveRing {
          0%   { box-shadow: 0 0 0 0 rgba(255,59,59,0.6); }
          70%  { box-shadow: 0 0 0 6px rgba(255,59,59,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,59,59,0); }
        }
        .sidebar-btn:hover { background: rgba(255,255,255,0.04) !important; }
        .sidebar-btn:hover .sb-label { color: #c0c5e0 !important; }
      `}</style>

      {/* ── LOGO ── */}
      <div style={{
        padding: "20px 0 18px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
        width: "100%",
      }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveScreen("home")}
          style={{
            width: "44px", height: "44px", borderRadius: "14px", cursor: "pointer",
            background: "linear-gradient(135deg, #e53e3e 0%, #ff6b6b 50%, #c0392b 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(229,62,62,0.4), 0 0 0 1px rgba(255,107,107,0.2)",
            position: "relative",
          }}
        >
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px",
            fontWeight: 900, color: "#fff", letterSpacing: "-1px",
          }}>M</span>
        </motion.div>

        <div style={{
          background: mode === "sports"
            ? "linear-gradient(135deg, #00d4ff, #00ff87)"
            : "linear-gradient(135deg, #e53e3e, #ff6b6b)",
          borderRadius: "5px", padding: "2px 7px",
        }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "8px",
            fontWeight: 900, letterSpacing: "1.5px",
            color: mode === "sports" ? "#07070f" : "#fff",
          }}>{mode === "sports" ? "SPORTS" : "CINEMA"}</span>
        </div>

      </div>

      {/* ── NAV SECTIONS ── */}
      <nav style={{ flex: 1, width: "100%", padding: "0 8px", display: "flex", flexDirection: "column", gap: "0" }}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.label} style={{ marginBottom: si < NAV_SECTIONS.length - 1 ? "4px" : "0" }}>
            {/* Section label */}
            <div style={{
              padding: "10px 8px 5px",
              fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 700,
              color: "#2e3050", textTransform: "uppercase", letterSpacing: "0.12em",
              userSelect: "none",
            }}>{section.label}</div>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {section.items.map((item) => {
                const isActive = isNavActive(item.id, item.screen);
                const accent = getAccentColor(item.id);
                const activeBg = getActiveBg(item.id);

                return (
                  <motion.button
                    key={item.id}
                    className="sidebar-btn"
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setActiveScreen(item.screen)}
                    style={{
                      width: "100%", height: "52px", borderRadius: "11px", border: "none",
                      cursor: "pointer", position: "relative", overflow: "visible",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: "4px",
                      background: isActive ? activeBg : "transparent",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-bar"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        style={{
                          position: "absolute", left: "-8px", top: "50%",
                          transform: "translateY(-50%)",
                          width: "3px", height: "28px", borderRadius: "0 3px 3px 0",
                          background: item.id === "live-list"
                            ? "linear-gradient(180deg, #ff3b3b, #ff6b6b)"
                            : item.id === "world-cup"
                            ? "linear-gradient(180deg, #f5c518, #ff9500)"
                            : "linear-gradient(180deg, #00d4ff, #00ff87)",
                          boxShadow: `0 0 10px ${accent}80`,
                        }}
                      />
                    )}

                    {/* Icon wrapper */}
                    <div style={{ position: "relative" }}>
                      <item.Icon
                        size={19}
                        color={isActive ? accent : "#4a4f6e"}
                        strokeWidth={isActive ? 2.3 : 1.8}
                        style={{ transition: "color 0.15s" }}
                      />

                      {/* Live count badge */}
                      {item.isLive && (
                        <div style={{
                          position: "absolute", top: "-5px", right: "-8px",
                          minWidth: "16px", height: "14px", borderRadius: "7px",
                          background: "#ff3b3b",
                          border: "1.5px solid rgba(7,7,15,0.99)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: "9px", fontWeight: 900, color: "#fff",
                          padding: "0 3px",
                          animation: "liveRing 2s ease-in-out infinite",
                        }}>{liveCount}</div>
                      )}

                      {/* Gold glow dot for World Cup */}
                      {item.isGold && !isActive && (
                        <span style={{
                          position: "absolute", top: "-3px", right: "-4px",
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: "#f5c518", boxShadow: "0 0 6px #f5c518",
                          display: "block",
                        }} />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className="sb-label"
                      style={{
                        fontFamily: "'Inter', sans-serif", fontSize: "9px",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? accent : "#3a3f5e",
                        letterSpacing: "0.02em",
                        transition: "color 0.15s",
                        lineHeight: 1,
                      }}
                    >{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── DIVIDER ── */}
      <div style={{
        width: "56px", height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
        margin: "6px 0",
      }} />

      {/* ── BOTTOM UTILITIES ── */}
      <div style={{
        padding: "6px 8px 20px", width: "100%",
        display: "flex", flexDirection: "column", gap: "2px",
      }}>
        {/* Dev Reference */}
        <UtilButton
          label="Dev Ref"
          active={activeScreen === "system-summary"}
          activeColor="#f5c518"
          onClick={() => setActiveScreen("system-summary")}
        >
          <BookOpen size={17} color={activeScreen === "system-summary" ? "#f5c518" : "#3a3f5e"} strokeWidth={1.8} />
        </UtilButton>

        {/* Mobile Preview */}
        <UtilButton
          label="Mobile"
          active={activeScreen === "mobile"}
          activeColor="#00d4ff"
          onClick={() => setActiveScreen("mobile")}
        >
          <Smartphone size={17} color={activeScreen === "mobile" ? "#00d4ff" : "#3a3f5e"} strokeWidth={1.8} />
        </UtilButton>

        {/* Mode toggle */}
        <motion.button
          className="sidebar-btn"
          whileTap={{ scale: 0.93 }}
          onClick={() => setMode(mode === "sports" ? "movies" : "sports")}
          style={{
            width: "100%", height: "44px", borderRadius: "11px",
            border: "1px solid rgba(255,255,255,0.07)",
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "3px",
            background: mode === "movies" ? "rgba(229,62,62,0.1)" : "rgba(255,255,255,0.03)",
            transition: "background 0.15s",
          }}
        >
          <Clapperboard size={17} color={mode === "movies" ? "#ff6b6b" : "#3a3f5e"} strokeWidth={1.8} />
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 500,
            color: mode === "movies" ? "#ff6b6b" : "#3a3f5e", letterSpacing: "0.02em",
          }}>{mode === "sports" ? "Cinema" : "Sports"}</span>
        </motion.button>

        {/* User avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: "38px", height: "38px", borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff",
              cursor: "pointer",
              border: "2px solid rgba(255,255,255,0.1)",
              boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
              position: "relative",
            }}
          >
            JD
            {/* Online dot */}
            <div style={{
              position: "absolute", bottom: "1px", right: "1px",
              width: "9px", height: "9px", borderRadius: "50%",
              background: "#00ff87", border: "2px solid rgba(7,7,15,0.99)",
            }} />
          </motion.div>
        </div>

        {/* ── COLLAPSE BUTTON ── */}
        <div style={{
          width: "calc(100% - 2px)", height: "1px", margin: "8px 1px 4px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }} />
        <motion.button
          className="sidebar-btn"
          whileTap={{ scale: 0.93 }}
          onClick={onCollapse}
          style={{
            width: "100%", height: "36px", borderRadius: "10px", border: "none",
            cursor: "pointer", display: "flex", flexDirection: "row",
            alignItems: "center", justifyContent: "center", gap: "6px",
            background: "transparent", transition: "background 0.15s",
          }}
        >
          <ChevronsLeft size={13} color="#2e3050" strokeWidth={2} />
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 500,
            color: "#2e3050", letterSpacing: "0.06em", textTransform: "uppercase",
          }}>Collapse</span>
        </motion.button>
      </div>
    </div>
  );
}

function UtilButton({
  label, active, activeColor, onClick, children
}: {
  label: string; active: boolean; activeColor: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <motion.button
      className="sidebar-btn"
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      style={{
        width: "100%", height: "44px", borderRadius: "11px", border: "none",
        cursor: "pointer", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "3px",
        background: active ? `${activeColor}12` : "transparent",
        transition: "background 0.15s",
      }}
    >
      {children}
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: active ? 700 : 500,
        color: active ? activeColor : "#3a3f5e", letterSpacing: "0.02em",
      }}>{label}</span>
    </motion.button>
  );
}
