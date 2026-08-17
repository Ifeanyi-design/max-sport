import { Crest } from "./Crest";
import type { FixtureCard } from "./api";

interface MatchRowProps {
  match: FixtureCard;
  onClick?: () => void;
}

export function MatchRow({ match, onClick }: MatchRowProps) {
  const isLive = match.status === "live";
  const showScore = match.status !== "upcoming";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "#12121a",
        color: "#ececf1",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
      }}
    >
      <div style={{ width: 52, flexShrink: 0, textAlign: "center" }}>
        {isLive ? (
          <span style={{ color: "#dc2626", fontWeight: 800, fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {match.min || "LIVE"}
          </span>
        ) : match.status === "finished" ? (
          <span style={{ fontSize: 11, color: "#8b8b9a", fontWeight: 700 }}>FT</span>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#c8c8d4" }}>{match.time}</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Crest src={match.homeLogo} name={match.home} abbr={match.homeAbbr} size={22} />
          <span
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {match.home}
          </span>
          {showScore && <span style={{ fontWeight: 800, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{match.hs}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Crest src={match.awayLogo} name={match.away} abbr={match.awayAbbr} size={22} />
          <span
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {match.away}
          </span>
          {showScore && <span style={{ fontWeight: 800, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{match.as}</span>}
        </div>
      </div>

      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div style={{ fontSize: 10, color: "#8b8b9a", fontWeight: 600 }}>{match.league}</div>
        {isLive && (
          <div style={{ marginTop: 4, fontSize: 10, fontWeight: 800, color: "#dc2626", letterSpacing: "0.06em" }}>
            LIVE
          </div>
        )}
      </div>
    </button>
  );
}
