import { useEffect, useState } from "react";
import { Crest } from "./Crest";
import { teamLogoSources } from "./api";

interface TickerMatch {
  id: string | number;
  home: string;
  away: string;
  hs: number | null;
  as: number | null;
  min: string | null;
  status: string;
  homeLogo?: string;
  awayLogo?: string;
  homeProviderId?: string | number | null;
  awayProviderId?: string | number | null;
  homeProviderName?: string | null;
  awayProviderName?: string | null;
}

interface LiveTickerProps {
  matches: TickerMatch[];
  onMatchClick?: (id: string | number) => void;
}

function isLiveStatus(status: string) {
  const s = (status || "").toUpperCase();
  return s.includes("LIVE") || s.includes("HT") || s.includes("ET") ||
    s.includes("PEN") || /^\d+[''']$/.test(s) || /^\d+$/.test(s);
}

export function LiveTicker({ matches, onMatchClick }: LiveTickerProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  // Only show live + recently finished
  const liveMatches = matches.filter(
    (m) => isLiveStatus(m.status) || (m.status || "").toUpperCase() === "FT"
  );

  if (!ready || liveMatches.length === 0) return null;

  // Duplicate items so the seamless loop works
  const items = [...liveMatches, ...liveMatches];

  function getMin(m: TickerMatch) {
    if (isLiveStatus(m.status)) return m.min || m.status;
    return "FT";
  }

  return (
    <div className="ms-ticker" role="marquee" aria-label="Live match scores">
      <div className="ms-ticker-inner" style={{ animationDuration: `${Math.max(30, liveMatches.length * 6)}s` }}>
        {items.map((m, i) => {
          const live = isLiveStatus(m.status);
          const homeHigh = (m.hs ?? 0) > (m.as ?? 0);
          const awayHigh = (m.as ?? 0) > (m.hs ?? 0);
          const homeSrcs = teamLogoSources({
            logo_url: m.homeLogo,
            provider_team_id: m.homeProviderId,
            provider_name: m.homeProviderName,
            name: m.home,
          });
          const awaySrcs = teamLogoSources({
            logo_url: m.awayLogo,
            provider_team_id: m.awayProviderId,
            provider_name: m.awayProviderName,
            name: m.away,
          });

          return (
            <button
              key={`${m.id}-${i}`}
              type="button"
              className="ms-ticker-match"
              onClick={() => onMatchClick?.(m.id)}
            >
              {/* Live dot */}
              {live && <span className="ms-ticker-dot" />}

              {/* Home team */}
              <Crest
                srcs={homeSrcs}
                name={m.home}
                size={14}
                style={{ borderRadius: 2, background: "rgba(255,255,255,0.07)" }}
              />
              <span style={{
                maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis",
                fontWeight: homeHigh ? 800 : 600,
                color: homeHigh ? "#fff" : undefined,
              }}>
                {m.home}
              </span>

              {/* Score */}
              <span className="ms-ticker-score">
                {m.hs != null ? `${m.hs}-${m.as}` : "vs"}
              </span>

              {/* Away team */}
              <span style={{
                maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis",
                fontWeight: awayHigh ? 800 : 600,
                color: awayHigh ? "#fff" : undefined,
              }}>
                {m.away}
              </span>
              <Crest
                srcs={awaySrcs}
                name={m.away}
                size={14}
                style={{ borderRadius: 2, background: "rgba(255,255,255,0.07)" }}
              />

              {/* Minute / Status */}
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: live ? "var(--ms-live-bright)" : "var(--ms-muted)",
                marginLeft: 2,
              }}>
                {getMin(m)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
