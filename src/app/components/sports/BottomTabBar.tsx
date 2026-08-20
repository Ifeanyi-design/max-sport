import { Home, Radio, Calendar, BarChart3, Film } from "lucide-react";
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
  { id: "highlights", label: "Clips", Icon: Film, screen: "highlights" as Screen },
];

const LIVE_RELATED: Screen[] = ["live-list", "live-match"];

export function BottomTabBar({ activeScreen, setActiveScreen, liveCount = 0 }: BottomTabBarProps) {
  function isActive(screen: Screen): boolean {
    if (screen === "live-list") return LIVE_RELATED.includes(activeScreen);
    return activeScreen === screen;
  }

  return (
    <nav className="ms-bottom-bar">
      {TABS.map((tab) => {
        const active = isActive(tab.screen);
        const accentColor = tab.isLive ? "var(--ms-live)" : "var(--ms-accent)";
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveScreen(tab.screen)}
            className={`ms-bottom-tab${active ? " is-active" : ""}`}
          >
            {/* Indicator bar above active tab */}
            <span className="ms-bottom-tab-indicator" />

            {/* Icon */}
            <span className="ms-bottom-tab-icon">
              <tab.Icon
                size={21}
                color={active ? (tab.isLive ? "var(--ms-live)" : "var(--ms-accent)") : "var(--ms-faint)"}
                strokeWidth={active ? 2.4 : 1.7}
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
                    background: "var(--ms-live)",
                    color: "#fff",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 9,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                    boxShadow: "0 0 8px rgba(255,45,85,0.5)",
                  }}
                >
                  {liveCount > 99 ? "99+" : liveCount}
                </span>
              )}
            </span>

            {/* Label */}
            <span
              className="ms-bottom-tab-label"
              style={{ color: active ? (tab.isLive ? "var(--ms-live)" : "var(--ms-accent)") : "var(--ms-faint)" }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
