import { useEffect, useRef, useState } from "react";
import {
  Home, Radio, Calendar, BarChart3, Trophy, Search, Users, Info, Film, ChevronDown, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import type { Screen } from "./types";
import { Wordmark } from "./Wordmark";

interface SidebarProps {
  activeScreen: Screen;
  setActiveScreen: (s: Screen) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  liveCount: number;
}

type NavItem = { id: string; label: string; Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>; screen: Screen; isLive?: boolean };

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Watch",
    items: [
      { id: "home", label: "Home", Icon: Home, screen: "home" },
      { id: "live-list", label: "Live", Icon: Radio, screen: "live-list", isLive: true },
      { id: "fixtures", label: "Fixtures", Icon: Calendar, screen: "fixtures" },
      { id: "highlights", label: "Highlights", Icon: Film, screen: "highlights" },
    ],
  },
  {
    label: "Browse",
    items: [
      { id: "standings", label: "Standings", Icon: BarChart3, screen: "standings" },
      { id: "competitions", label: "Leagues", Icon: Trophy, screen: "competitions" },
      { id: "teams", label: "Teams", Icon: Users, screen: "teams" },
      { id: "search", label: "Search", Icon: Search, screen: "search" },
      { id: "about", label: "About", Icon: Info, screen: "about" },
    ],
  },
];


const LIVE_RELATED: Screen[] = ["live-list", "live-match"];
const TEAM_RELATED: Screen[] = ["teams", "team"];

export function Sidebar({
  activeScreen,
  setActiveScreen,
  collapsed,
  onToggleCollapse,
  liveCount,
}: SidebarProps) {
  const navRef = useRef<HTMLElement>(null);
  const [canScrollMore, setCanScrollMore] = useState(false);

  function checkOverflow() {
    const el = navRef.current;
    if (!el) return;
    setCanScrollMore(el.scrollHeight - el.scrollTop - el.clientHeight > 12);
  }

  useEffect(() => {
    checkOverflow();
    const el = navRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkOverflow);
    window.addEventListener("resize", checkOverflow);
    return () => {
      el.removeEventListener("scroll", checkOverflow);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [collapsed]);

  function isNavActive(screen: Screen): boolean {
    if (screen === "live-list") return LIVE_RELATED.includes(activeScreen);
    if (screen === "teams") return TEAM_RELATED.includes(activeScreen);
    return activeScreen === screen;
  }

  const width = collapsed ? 64 : 220;

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0d0d14",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        transition: "width 0.18s ease",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: collapsed ? "18px 10px 14px" : "18px 16px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          minHeight: 64,
        }}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={() => setActiveScreen("home")}
            aria-label="MaxSport home"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 22,
              fontWeight: 900,
              color: "#c81e1e",
              letterSpacing: "-0.04em",
              padding: 0,
            }}
          >
            M
          </button>
        ) : (
          <Wordmark onClick={() => setActiveScreen("home")} />
        )}
      </div>

      <nav
        ref={navRef}
        className="ms-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: collapsed ? "10px 8px" : "12px 10px",
        }}
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 14 }}>
            {!collapsed && (
              <div
                style={{
                  padding: "6px 10px 6px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#5c5c6b",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {section.label}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {section.items.map((item) => {
                const active = isNavActive(item.screen);
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={collapsed ? item.label : undefined}
                    onClick={() => setActiveScreen(item.screen)}
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: 10,
                      padding: collapsed ? 0 : "0 10px",
                      background: active ? "rgba(200,30,30,0.12)" : "transparent",
                      color: active ? "#ececf1" : "#8b8b9a",
                      position: "relative",
                    }}
                  >
                    {active && (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 8,
                          bottom: 8,
                          width: 3,
                          borderRadius: "0 2px 2px 0",
                          background: item.isLive ? "#dc2626" : "#c81e1e",
                        }}
                      />
                    )}
                    <span style={{ position: "relative", display: "inline-flex" }}>
                      <item.Icon size={18} color={active ? (item.isLive ? "#dc2626" : "#ececf1") : "#6b6b7b"} strokeWidth={active ? 2.2 : 1.8} />
                      {item.isLive && liveCount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: -7,
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
                    {!collapsed && (
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          fontWeight: active ? 650 : 500,
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {canScrollMore && (
        <button
          type="button"
          onClick={() => navRef.current?.scrollBy({ top: 80, behavior: "smooth" })}
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 56,
            height: 28,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            background: "linear-gradient(180deg, rgba(13,13,20,0.2), rgba(13,13,20,0.95))",
            color: "#8b8b9a",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <ChevronDown size={13} />
          {!collapsed && "More"}
        </button>
      )}

      <div style={{ padding: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          type="button"
          onClick={onToggleCollapse}
          style={{
            width: "100%",
            height: 36,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "#5c5c6b",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {collapsed ? <ChevronsRight size={14} /> : <><ChevronsLeft size={14} /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}
