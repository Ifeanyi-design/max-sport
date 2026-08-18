import { useEffect, useRef, useState } from "react";
import {
  Home, Radio, Calendar, BarChart3, Trophy, Search,
  Users, Info, Film, ChevronDown, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import type { Screen } from "./types";

interface SidebarProps {
  activeScreen: Screen;
  setActiveScreen: (s: Screen) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  liveCount: number;
}

type NavItem = {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>;
  screen: Screen;
  isLive?: boolean;
};

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Watch",
    items: [
      { id: "home",       label: "Home",       Icon: Home,     screen: "home" },
      { id: "live-list",  label: "Live",        Icon: Radio,    screen: "live-list", isLive: true },
      { id: "fixtures",   label: "Fixtures",    Icon: Calendar, screen: "fixtures" },
      { id: "highlights", label: "Highlights",  Icon: Film,     screen: "highlights" },
    ],
  },
  {
    label: "Browse",
    items: [
      { id: "standings",    label: "Standings",  Icon: BarChart3, screen: "standings" },
      { id: "competitions", label: "Leagues",    Icon: Trophy,    screen: "competitions" },
      { id: "teams",        label: "Teams",      Icon: Users,     screen: "teams" },
      { id: "search",       label: "Search",     Icon: Search,    screen: "search" },
      { id: "about",        label: "About",      Icon: Info,      screen: "about" },
    ],
  },
];

const LIVE_RELATED: Screen[] = ["live-list", "live-match"];
const TEAM_RELATED: Screen[] = ["teams", "team"];

/* Wordmark inline — avoids import */
function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 0, padding: 0,
      }}
      aria-label="MaxSport home"
    >
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px",
        color: "#fff", lineHeight: 1,
      }}>MAX</span>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px",
        lineHeight: 1,
        background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>SPORT</span>
    </button>
  );
}

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
        background: "#081421",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        transition: "width 0.18s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "18px 0 14px" : "18px 16px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          minHeight: 60,
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={() => setActiveScreen("home")}
            aria-label="MaxSport"
            style={{
              border: "none", cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 22, fontWeight: 900,
              background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              padding: 0, letterSpacing: "-0.04em",
            } as React.CSSProperties}
          >
            M
          </button>
        ) : (
          <Logo onClick={() => setActiveScreen("home")} />
        )}
      </div>

      {/* Nav */}
      <nav
        ref={navRef}
        className="ms-scroll"
        style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 4 }}>
            {!collapsed && (
              <div
                style={{
                  padding: "14px 19px 5px",
                  fontSize: 10, fontWeight: 800,
                  color: "rgba(122,144,168,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {section.label}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {section.items.map((item) => {
                const active = isNavActive(item.screen);
                const isLiveItem = item.isLive;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={collapsed ? item.label : undefined}
                    onClick={() => setActiveScreen(item.screen)}
                    style={{
                      width: "100%",
                      height: 40,
                      border: "none",
                      borderLeft: `3px solid ${active ? "var(--ms-accent)" : "transparent"}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: 10,
                      padding: collapsed ? "0 0 0 0" : "0 16px 0 13px",
                      background: active
                        ? "rgba(37,99,235,0.12)"
                        : "transparent",
                      transition: "background 0.14s, color 0.14s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    {/* Icon */}
                    <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
                      <item.Icon
                        size={17}
                        color={
                          active
                            ? "#fff"
                            : isLiveItem && liveCount > 0
                            ? "var(--ms-live-bright)"
                            : "var(--ms-muted)"
                        }
                        strokeWidth={active ? 2.3 : 1.7}
                      />
                      {/* Live count badge */}
                      {isLiveItem && liveCount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: -6, right: -8,
                            minWidth: 14, height: 13,
                            borderRadius: 7,
                            background: "var(--ms-live)",
                            color: "#fff",
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: 9, fontWeight: 900,
                            display: "flex", alignItems: "center",
                            justifyContent: "center", padding: "0 3px",
                          }}
                        >
                          {liveCount}
                        </span>
                      )}
                    </span>

                    {/* Label */}
                    {!collapsed && (
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          fontWeight: active ? 700 : 500,
                          color: active ? "#fff" : "var(--ms-muted)",
                          transition: "color 0.14s",
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

      {/* Scroll hint */}
      {canScrollMore && (
        <button
          type="button"
          onClick={() => navRef.current?.scrollBy({ top: 80, behavior: "smooth" })}
          style={{
            position: "absolute", left: 8, right: 8, bottom: 52,
            height: 28,
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8,
            background: "linear-gradient(180deg, rgba(8,20,33,0.1), rgba(8,20,33,0.95))",
            color: "var(--ms-muted)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
          }}
        >
          <ChevronDown size={13} />
          {!collapsed && "More"}
        </button>
      )}

      {/* Collapse toggle */}
      <div style={{ padding: 8, borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <button
          type="button"
          onClick={onToggleCollapse}
          style={{
            width: "100%", height: 34, borderRadius: 7,
            border: "none", background: "transparent",
            color: "var(--ms-faint)", cursor: "pointer",
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6,
            fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
            transition: "color 0.14s, background 0.14s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--ms-muted)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--ms-faint)";
          }}
        >
          {collapsed ? <ChevronsRight size={14} /> : <><ChevronsLeft size={14} /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}
