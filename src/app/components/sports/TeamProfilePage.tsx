import { useEffect, useState } from "react";
import { Calendar, Trophy, ChevronRight, ArrowLeft } from "lucide-react";
import { getTeam, toFixtureCard, teamLogoSources, competitionLogoSources, type ApiTeamDetail } from "./api";
import { Crest } from "./Crest";
import { FlagIcon } from "./FlagIcon";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { MatchRow } from "./MatchRow";
import { PageHeader } from "./PageHeader";

interface Props {
  slug: string;
  onBack: () => void;
  onOpenMatch: (id: number) => void;
  onOpenCompetition: (slug: string) => void;
}

export function TeamProfilePage({ slug, onBack, onOpenMatch, onOpenCompetition }: Props) {
  const [detail, setDetail] = useState<ApiTeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getTeam(slug)
      .then(setDetail)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, [slug]);

  if (loading) return <EmptyState title="Loading team profile & statistics…" />;
  if (error || !detail) return <ErrorState message="Could not load this team." onRetry={load} />;

  const teamSrcs = teamLogoSources({
    logo_url: detail.team.logo_url,
    provider_team_id: detail.team.provider_team_id,
    provider_name: detail.team.provider_name,
  });

  return (
    <div style={{ minHeight: "100%", paddingBottom: 60, maxWidth: 1200, margin: "0 auto" }}>
      <PageHeader title={detail.team.name} onBack={onBack} onRefresh={load} />

      {/* Team Header Hero Banner */}
      <div style={{ padding: "14px 16px 20px" }}>
        <div
          style={{
            position: "relative",
            borderRadius: 18,
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(229,20,43,0.18), rgba(20,20,32,0.95))",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "24px 20px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            flexWrap: "wrap",
          }}
        >
          <Crest
            src={teamSrcs[0]}
            fallbackSrcs={teamSrcs.slice(1)}
            name={detail.team.name}
            abbr={detail.team.abbr}
            size={68}
            radius={14}
            country={detail.team.country}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              {detail.team.country && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ms-muted)" }}>
                  <FlagIcon country={detail.team.country} size={15} />
                  {detail.team.country}
                </span>
              )}
              {detail.team.abbr && (
                <span
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 800,
                    color: "var(--ms-muted)",
                  }}
                >
                  {detail.team.abbr}
                </span>
              )}
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(26px, 5vw, 36px)",
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              {detail.team.name}
            </h1>
          </div>
        </div>
      </div>

      {/* League Standings Position Badges */}
      {detail.standings && detail.standings.length > 0 && (
        <section style={{ margin: "0 16px 24px" }}>
          <div className="ms-section">
            <Trophy size={16} color="var(--ms-accent)" />
            <h2>Tournament Standings</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {detail.standings.map((row) => {
              const compSrcs = competitionLogoSources({
                logo_url: row.competition.logo_url,
                provider_competition_id: row.competition.provider_competition_id,
                provider_name: row.competition.provider_name,
              });
              return (
                <button
                  key={`${row.competition.slug}-${row.position}`}
                  type="button"
                  onClick={() => onOpenCompetition(row.competition.slug)}
                  className="ms-card ms-card-hover"
                  style={{
                    color: "#ececf1",
                    textAlign: "left",
                    borderRadius: 12,
                    padding: "14px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Crest
                    src={compSrcs[0]}
                    fallbackSrcs={compSrcs.slice(1)}
                    name={row.competition.name}
                    size={32}
                    radius={6}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.competition.name}
                    </strong>
                    <small style={{ display: "block", marginTop: 2, color: "var(--ms-muted)" }}>
                      {row.points} Pts • {row.played} Played (W{row.won} D{row.drawn} L{row.lost})
                    </small>
                  </div>
                  <span
                    style={{
                      color: "var(--ms-accent)",
                      fontSize: 22,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 900,
                    }}
                  >
                    #{row.position}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Fixtures */}
      <section style={{ margin: "0 16px 24px" }}>
        <div className="ms-section">
          <Calendar size={16} color="var(--ms-muted)" />
          <h2>Upcoming Match Schedule</h2>
        </div>
        {detail.upcoming_matches.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {detail.upcoming_matches.map((match) => (
              <MatchRow key={match.id} match={toFixtureCard(match)} onClick={() => onOpenMatch(match.id)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No upcoming matches currently scheduled for this team." />
        )}
      </section>

      {/* Recent Results */}
      <section style={{ margin: "0 16px 24px" }}>
        <div className="ms-section">
          <h2>Recent Match Results</h2>
        </div>
        {detail.recent_matches.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {detail.recent_matches.map((match) => (
              <MatchRow key={match.id} match={toFixtureCard(match)} onClick={() => onOpenMatch(match.id)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No recent match results available." />
        )}
      </section>
    </div>
  );
}
