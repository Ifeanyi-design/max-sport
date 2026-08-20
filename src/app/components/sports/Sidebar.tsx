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

/* Wordmark inline — Premium branding */
function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 2, padding: 0,
      }}
      aria-label="MaxSport home"
    >
      <span style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em",
        color: "#fff", lineHeight: 1,
      }}>MAX</span>
      <span style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em",
        lineHeight: 1,
        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
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
              fontFamily: "'Sora', sans-serif",
              fontSize: 24, fontWeight: 800,
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
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
        style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 0" }}
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 8 }}>
            {!collapsed && (
              <div
                style={{
                  padding: "16px 20px 8px",
                  fontSize: 11, fontWeight: 700,
                  color: "rgba(132,150,171,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {section.label}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                      height: 44,
                      border: "none",
                      borderLeft: `3px solid ${active ? "var(--ms-accent)" : "transparent"}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: 12,
                      padding: collapsed ? "0 0 0 0" : "0 18px 0 15px",
                      background: active
                        ? "rgba(59,130,246,0.14)"
                        : "transparent",
                      transition: "background 0.2s ease, color 0.2s ease",
                      borderRadius: active ? "0 8px 8px 0" : 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    {/* Icon */}
                    <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
                      <item.Icon
                        size={18}
                        color={
                          active
                            ? "#fff"
                            : isLiveItem && liveCount > 0
                            ? "var(--ms-live-bright)"
                            : "var(--ms-muted)"
                        }
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                      {/* Live count badge */}
                      {isLiveItem && liveCount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: -7, right: -9,
                            minWidth: 16, height: 15,
                            borderRadius: 8,
                            background: "var(--ms-live)",
                            color: "#fff",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 9, fontWeight: 700,
                            display: "flex", alignItems: "center",
                            justifyContent: "center", padding: "0 4px",
                            boxShadow: "0 2px 6px rgba(16,185,129,0.4)",
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
                          fontSize: 14,
                          fontWeight: active ? 600 : 500,
                          color: active ? "#fff" : "var(--ms-muted)",
                          transition: "color 0.2s ease",
                          letterSpacing: "-0.01em",
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
