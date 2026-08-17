import { useEffect, useState } from "react";
import { Globe, Trophy } from "lucide-react";
import { getCompetitions, toCompetitionCard, competitionLogoSources, type CompetitionCard } from "./api";
import type { Screen } from "./types";
import { Crest } from "./Crest";
import { FlagIcon } from "./FlagIcon";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";

interface Props {
  setActiveScreen: (s: Screen) => void;
  onOpenCompetition: (slug: string) => void;
}

export function CompetitionsPage({ setActiveScreen, onOpenCompetition }: Props) {
  const [competitions, setCompetitions] = useState<CompetitionCard[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | "featured">("all");

  const load = () => {
    setError(false);
    getCompetitions()
      .then((data) => setCompetitions(data.map(toCompetitionCard)))
      .catch(() => setError(true));
  };
  useEffect(load, []);

  const visible = competitions
    ? filter === "featured"
      ? competitions.filter((c) => c.featured)
      : competitions
    : null;

  // Group by continent/region
  const grouped = visible
    ? visible.reduce<Record<string, CompetitionCard[]>>((acc, c) => {
        const region = c.country || "International";
        const key = [
          "Europe",
          "England",
          "Spain",
          "Germany",
          "Italy",
          "France",
          "Portugal",
          "Netherlands",
          "Brazil",
          "Argentina",
          "Nigeria",
          "Ghana",
        ].includes(region)
          ? region === "Europe"
            ? "European Competitions"
            : region
          : "Other";
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
      }, {})
    : {};

  const regionOrder = [
    "England",
    "Spain",
    "Germany",
    "Italy",
    "France",
    "Portugal",
    "Netherlands",
    "Brazil",
    "Argentina",
    "Nigeria",
    "Ghana",
    "European Competitions",
    "Other",
  ];
  const sortedRegions = Object.keys(grouped).sort((a, b) => {
    const ia = regionOrder.indexOf(a);
    const ib = regionOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <div style={{ minHeight: "100%", paddingBottom: 60, maxWidth: 1280, margin: "0 auto" }}>
      <PageHeader title="Football Competitions &amp; Leagues" onBack={() => setActiveScreen("home")} />

      {/* Filter */}
      <div className="ms-filter-strip" style={{ padding: "8px 16px 14px" }}>
        <button
          className={`ms-filter-btn${filter === "all" ? " is-active" : ""}`}
          onClick={() => setFilter("all")}
          style={{ padding: "7px 18px", fontSize: 13 }}
        >
          All Leagues ({competitions?.length || 0})
        </button>
        <button
          className={`ms-filter-btn${filter === "featured" ? " is-active" : ""}`}
          onClick={() => setFilter("featured")}
          style={{ padding: "7px 18px", fontSize: 13 }}
        >
          Featured Major Leagues
        </button>
      </div>

      {error && <ErrorState message="Could not load competitions." onRetry={load} />}
      {visible === null && !error && <EmptyState title="Loading competitions…" />}
      {visible !== null && visible.length === 0 && <EmptyState title="No competitions found." />}

      {visible !== null && visible.length > 0 && (
        <div style={{ padding: "0 16px" }}>
          {sortedRegions.map((region) => (
            <div key={region} style={{ marginBottom: 26 }}>
              {/* Region header with real FlagIcon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 2px 10px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "var(--ms-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                <FlagIcon country={region === "European Competitions" ? "Europe" : region} size={18} />
                <span>{region}</span>
              </div>

              {/* Cards grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 10,
                }}
              >
                {grouped[region].map((c) => {
                  const srcs = competitionLogoSources({
                    logo_url: c.logo,
                    provider_competition_id: c.provider_competition_id,
                    provider_name: c.provider_name,
                  });
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => onOpenCompetition(c.slug)}
                      className="ms-comp-card ms-card-hover"
                      style={{ "--comp-color": c.color } as React.CSSProperties}
                    >
                      <Crest
                        src={srcs[0]}
                        fallbackSrcs={srcs.slice(1)}
                        name={c.name}
                        abbr={c.abbr}
                        size={42}
                        bgColor={c.color}
                        radius={8}
                        country={c.country}
                      />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="ms-comp-name" style={{ fontSize: 14 }}>
                          {c.name}
                        </span>
                        {c.country && (
                          <span
                            className="ms-comp-country"
                            style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}
                          >
                            <FlagIcon country={c.country} size={13} />
                            <span>{c.country}</span>
                          </span>
                        )}
                        <span className="ms-comp-sub">{c.season || "View Standings"}</span>
                      </span>
                      {c.featured && (
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: 10,
                            fontWeight: 900,
                            color: "#fff",
                            background: "var(--ms-accent)",
                            padding: "3px 8px",
                            borderRadius: 6,
                          }}
                        >
                          Major
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
