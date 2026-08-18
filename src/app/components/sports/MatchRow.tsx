import { Crest } from "./Crest";
import type { FixtureCard } from "./api";
import { teamLogoSources } from "./api";

interface MatchRowProps {
  match: FixtureCard;
  onClick?: () => void;
  showLeague?: boolean;
}

export function MatchRow({ match, onClick, showLeague = true }: MatchRowProps) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const showScore = match.status !== "upcoming";

  const homeSrcs = teamLogoSources({
    name: match.home,
    logo_url: match.homeLogo,
    provider_team_id: match.homeProviderId,
    provider_name: match.homeProviderName,
  });
  const awaySrcs = teamLogoSources({
    name: match.away,
    logo_url: match.awayLogo,
    provider_team_id: match.awayProviderId,
    provider_name: match.awayProviderName,
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className={`ms-match${isLive ? " is-live" : ""}`}
    >
      {/* Status column */}
      <div className="ms-match-status">
        {isLive ? (
          <>
            <span className="ms-live-dot" style={{ width: 6, height: 6 }} />
            <span className="ms-live">{match.min || "LIVE"}</span>
          </>
        ) : isFinished ? (
          <span className="ms-ft">FT</span>
        ) : (
          <span className="ms-time">{match.time}</span>
        )}
      </div>

      {/* Teams + scores */}
      <div className="ms-match-main">
        <div className="ms-match-team">
          <Crest
            src={homeSrcs[0]}
            fallbackSrcs={homeSrcs.slice(1)}
            name={match.home}
            abbr={match.homeAbbr}
            size={22}
          />
          <span style={{ fontWeight: isLive ? 700 : 600 }}>{match.home}</span>
          {showScore && (
            <span
              className="ms-match-score"
              style={{ color: isLive && match.hs > match.as ? "var(--ms-text)" : undefined }}
            >
              {match.hs}
            </span>
          )}
        </div>
        <div className="ms-match-team">
          <Crest
            src={awaySrcs[0]}
            fallbackSrcs={awaySrcs.slice(1)}
            name={match.away}
            abbr={match.awayAbbr}
            size={22}
          />
          <span style={{ fontWeight: isLive ? 700 : 600 }}>{match.away}</span>
          {showScore && (
            <span
              className="ms-match-score"
              style={{ color: isLive && match.as > match.hs ? "var(--ms-text)" : undefined }}
            >
              {match.as}
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      {showLeague && (
        <div className="ms-match-meta" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
          <div className="ms-match-league">{match.league}</div>
          {isLive ? (
            <div className="ms-match-live">
              <span className="ms-live-dot" style={{ width: 5, height: 5 }} />
              LIVE
            </div>
          ) : isFinished ? (
            <span className="ms-badge-ft">FT</span>
          ) : (
            <span className="ms-tv-badge ms-tv-supersport" style={{ fontSize: 9, padding: "1px 5px" }}>
              TV Live
            </span>
          )}
        </div>
      )}
    </button>
  );
}
