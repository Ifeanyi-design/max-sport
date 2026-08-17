import { Home, Radio, Calendar, BarChart3, Search } from "lucide-react";
import type { Screen } from "./types";

interface BottomTabBarProps {
  activeScreen: Screen;
  setActiveScreen: (s: Screen) => void;
  liveCount?: number;
}

const TABS = [
  { id: "home", label: "Home", Icon: Home, screen: "home" as Screen },
  { id: "live-list", label: "Live", Icon: Radio, screen: "live-list" as Screen, isLive: true },
  { id: "fixtures", label: "Fixtures", Icon: Calendar, screen: "fixtures" as Screen },
  { id: "standings", label: "Table", Icon: BarChart3, screen: "standings" as Screen },
  { id: "search", label: "Search", Icon: Search, screen: "search" as Screen },
];

const LIVE_RELATED: Screen[] = ["live-list", "live-match"];

export function BottomTabBar({ activeScreen, setActiveScreen, liveCount = 0 }: BottomTabBarProps) {
  function isActive(screen: Screen): boolean {
    if (screen === "live-list") return LIVE_RELATED.includes(activeScreen);
    return activeScreen === screen;
  }

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "stretch",
        background: "rgba(13,13,20,0.97)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.screen);
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveScreen(tab.screen)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "8px 4px 10px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ position: "relative", display: "inline-flex" }}>
              <tab.Icon
                size={20}
                color={active ? (tab.isLive ? "#dc2626" : "#ececf1") : "#6b6b7b"}
                strokeWidth={active ? 2.3 : 1.7}
              />
              {tab.isLive && liveCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -9,
                    minWidth: 15,
                    height: 14,
                    borderRadius: 7,
                    background: "#dc2626",
                    color: "#fff",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 9,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                  }}
                >
                  {liveCount}
                </span>
              )}
            </span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? "#ececf1" : "#6b6b7b",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
