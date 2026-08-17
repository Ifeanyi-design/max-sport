import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Home, Wifi, Calendar, BarChart3, MoreHorizontal } from "lucide-react";
import type { Screen } from "./types";

interface BottomTabBarProps {
  activeScreen: Screen;
  setActiveScreen: (s: Screen) => void;
  onExpandSidebar: () => void;
  liveCount?: number;
}

const PRIMARY_TABS = [
  { id: "home",      label: "Home",     Icon: Home,      screen: "home" as Screen,      accent: "#00d4ff" },
  { id: "live-list", label: "Live",     Icon: Wifi,      screen: "live-list" as Screen, accent: "#ff3b3b", isLive: true },
  { id: "fixtures",  label: "Fixtures", Icon: Calendar,  screen: "fixtures" as Screen,  accent: "#00d4ff" },
  { id: "standings", label: "Table",    Icon: BarChart3, screen: "standings" as Screen, accent: "#00d4ff" },
];

const LIVE_RELATED: Screen[] = ["live-list", "live-match"];
const STANDINGS_RELATED: Screen[] = ["standings", "player-profile"];

export function BottomTabBar({ activeScreen, setActiveScreen, onExpandSidebar, liveCount = 6 }: BottomTabBarProps) {
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const fn = () => setIsNarrow(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  function isActive(id: string, screen: Screen): boolean {
    if (id === "live-list") return LIVE_RELATED.includes(activeScreen);
    if (id === "standings") return STANDINGS_RELATED.includes(activeScreen);
    return activeScreen === screen;
  }

  if (isNarrow) {
    return (
      <motion.div
        key="bt-mobile"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: "spring", stiffness: 400, damping: 36 }}
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "stretch",
          background: "rgba(9, 9, 20, 0.97)",
          backdropFilter: "blur(32px) saturate(1.5)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px 20px 0 0",
          paddingTop: "6px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.5)",
        }}
      >
        <style>{`
          @keyframes btLiveRing {
            0%   { box-shadow: 0 0 0 0 rgba(255,59,59,0.6); }
            70%  { box-shadow: 0 0 0 5px rgba(255,59,59,0); }
            100% { box-shadow: 0 0 0 0 rgba(255,59,59,0); }
          }
        `}</style>

        {PRIMARY_TABS.map(tab => {
          const active = isActive(tab.id, tab.screen);
          const { accent } = tab;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => setActiveScreen(tab.screen)}
              style={{
                flex: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "4px", padding: "6px 4px 4px",
                background: "transparent", border: "none", cursor: "pointer",
                position: "relative",
              }}
            >
              {/* Active top bar */}
              {active && (
                <motion.div
                  layoutId="bt-mobile-bar"
                  style={{
                    position: "absolute", top: 0, left: "20%", right: "20%",
                    height: "2px", borderRadius: "0 0 3px 3px",
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}

              <div style={{ position: "relative" }}>
                <tab.Icon
                  size={20}
                  color={active ? accent : "#4a4f6e"}
                  strokeWidth={active ? 2.3 : 1.7}
                  style={{ transition: "color 0.15s" }}
                />
                {tab.isLive && (
                  <div style={{
                    position: "absolute", top: "-4px", right: "-8px",
                    minWidth: "16px", height: "14px", borderRadius: "7px",
                    background: "#ff3b3b",
                    border: "1.5px solid rgba(9,9,20,0.97)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "9px", fontWeight: 900, color: "#fff",
                    padding: "0 3px",
                    animation: "btLiveRing 2s ease-in-out infinite",
                  }}>{liveCount}</div>
                )}
              </div>

              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: "10px",
                fontWeight: active ? 700 : 500,
                color: active ? accent : "#3a3f5e",
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}>{tab.label}</span>
            </motion.button>
          );
        })}

        {/* More button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onExpandSidebar}
          style={{
            flex: 1,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "4px", padding: "6px 4px 4px",
            background: "transparent", border: "none", cursor: "pointer",
          }}
        >
          <MoreHorizontal size={20} color="#4a4f6e" strokeWidth={1.7} />
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: "10px",
            fontWeight: 500, color: "#3a3f5e",
            letterSpacing: "0.01em", lineHeight: 1,
          }}>More</span>
        </motion.button>
      </motion.div>
    );
  }

  // ── DESKTOP: floating pill ──
  return (
    <motion.div
      key="bt-desktop"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 90, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 34 }}
      style={{
        position: "fixed",
        bottom: "18px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        background: "rgba(9, 9, 20, 0.92)",
        backdropFilter: "blur(28px) saturate(1.4)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "26px",
        padding: "5px 8px",
        gap: "2px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
        whiteSpace: "nowrap",
      }}
    >
      <style>{`
        @keyframes btLiveRing {
          0%   { box-shadow: 0 0 0 0 rgba(255,59,59,0.6); }
          70%  { box-shadow: 0 0 0 5px rgba(255,59,59,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,59,59,0); }
        }
        .bt-pill-btn:hover { background: rgba(255,255,255,0.05) !important; }
      `}</style>

      {PRIMARY_TABS.map(tab => {
        const active = isActive(tab.id, tab.screen);
        const { accent } = tab;
        return (
          <motion.button
            key={tab.id}
            className="bt-pill-btn"
            whileTap={{ scale: 0.88 }}
            onClick={() => setActiveScreen(tab.screen)}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "3px", padding: "8px 16px", borderRadius: "20px",
              border: "none", cursor: "pointer",
              background: active ? `${accent}14` : "transparent",
              position: "relative",
              transition: "background 0.15s",
            }}
          >
            <div style={{ position: "relative" }}>
              <tab.Icon
                size={18}
                color={active ? accent : "#4a4f6e"}
                strokeWidth={active ? 2.3 : 1.8}
                style={{ transition: "color 0.15s" }}
              />
              {tab.isLive && (
                <div style={{
                  position: "absolute", top: "-4px", right: "-8px",
                  minWidth: "15px", height: "13px", borderRadius: "7px",
                  background: "#ff3b3b",
                  border: "1.5px solid rgba(9,9,20,0.92)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "8px", fontWeight: 900, color: "#fff",
                  padding: "0 3px",
                  animation: "btLiveRing 2s ease-in-out infinite",
                }}>{liveCount}</div>
              )}
            </div>

            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: "9px",
              fontWeight: active ? 700 : 500,
              color: active ? accent : "#3a3f5e",
              letterSpacing: "0.02em",
              transition: "color 0.15s", lineHeight: 1,
            }}>{tab.label}</span>

            <AnimatePresence>
              {active && (
                <motion.div
                  layoutId="bt-pill-dot"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  style={{
                    position: "absolute", bottom: "2px", left: "50%",
                    transform: "translateX(-50%)",
                    width: "4px", height: "4px", borderRadius: "50%",
                    background: accent, boxShadow: `0 0 8px ${accent}`,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}

      <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.07)", margin: "0 4px", flexShrink: 0 }} />

      <motion.button
        className="bt-pill-btn"
        whileTap={{ scale: 0.88 }}
        onClick={onExpandSidebar}
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "3px", padding: "8px 14px", borderRadius: "20px",
          border: "none", cursor: "pointer", background: "transparent",
        }}
      >
        <MoreHorizontal size={18} color="#4a4f6e" strokeWidth={1.8} />
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: "9px",
          fontWeight: 500, color: "#3a3f5e", letterSpacing: "0.02em", lineHeight: 1,
        }}>More</span>
      </motion.button>
    </motion.div>
  );
}
