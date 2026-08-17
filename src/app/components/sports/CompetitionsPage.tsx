import { useEffect, useState } from "react";
import { Globe, Trophy } from "lucide-react";
import { getCompetitions, toCompetitionCard, competitionLogoSources, type CompetitionCard } from "./api";
import type { Screen } from "./types";
import { Crest } from "./Crest";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";

interface Props {
  setActiveScreen: (s: Screen) => void;
  onOpenCompetition: (slug: string) => void;
}

// Country → emoji flag mapping for common football countries
const COUNTRY_FLAGS: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Spain: "🇪🇸", Germany: "🇩🇪", Italy: "🇮🇹", France: "🇫🇷",
  Portugal: "🇵🇹", Netherlands: "🇳🇱", Brazil: "🇧🇷", Argentina: "🇦🇷",
  Europe: "🌍", International: "🌐", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", Turkey: "🇹🇷",
  "United States": "🇺🇸", Mexico: "🇲🇽", Russia: "🇷🇺", Belgium: "🇧🇪",
};

export function CompetitionsPage({ setActiveScreen, onOpenCompetition }: Props) {
  const [competitions, setCompetitions] = useState<CompetitionCard[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | "featured">("all");

  const load = () => {
    setError(false);
    getCompetitions()
      .then(data => setCompetitions(data.map(toCompetitionCard)))
      .catch(() => setError(true));
  };
  useEffect(load, []);

  const visible = competitions
    ? filter === "featured"
      ? competitions.filter(c => c.featured)
      : competitions
    : null;

  // Group by continent/region
  const grouped = visible
    ? visible.reduce<Record<string, CompetitionCard[]>>((acc, c) => {
        const region = (c as any).country || "International";
        const key = ["Europe", "England", "Spain", "Germany", "Italy", "France", "Portugal"].includes(region)
          ? region === "Europe" ? "European Competitions" : region
          : "Other";
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
      }, {})
    : {};

  const regionOrder = ["England", "Spain", "Germany", "Italy", "France", "Portugal", "European Competitions", "Other"];
  const sortedRegions = Object.keys(grouped).sort((a, b) => {
    const ia = regionOrder.indexOf(a); const ib = regionOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1; if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <div style={{ minHeight: "100%", paddingBottom: 40 }}>
      <PageHeader title="Competitions" onBack={() => setActiveScreen("home")} />

      {/* Filter */}
      <div className="ms-filter-strip">
        <button className={`ms-filter-btn${filter === "all" ? " is-active" : ""}`} onClick={() => setFilter("all")}>
          All
        </button>
        <button className={`ms-filter-btn${filter === "featured" ? " is-active" : ""}`} onClick={() => setFilter("featured")}>
          ⭐ Featured
        </button>
      </div>

      {error && <ErrorState message="Could not load competitions." onRetry={load} />}
      {visible === null && !error && <EmptyState title="Loading competitions…" />}
      {visible !== null && visible.length === 0 && <EmptyState title="No competitions found." />}

      {visible !== null && visible.length > 0 && (
        <div style={{ padding: "0 14px" }}>
          {sortedRegions.map(region => (
            <div key={region} style={{ marginBottom: 24 }}>
              {/* Region header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "0 2px 12px",
                fontSize: 12, fontWeight: 800, color: "var(--ms-muted)",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                <span>{COUNTRY_FLAGS[region] || "🌍"}</span>
                {region}
              </div>

              {/* Cards grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {grouped[region].map(c => {
                  const srcs = competitionLogoSources({
                    logo_url: c.logo,
                    provider_competition_id: (c as any).provider_competition_id,
                    provider_name: (c as any).provider_name,
                  });
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => onOpenCompetition(c.slug)}
                      className="ms-comp-card"
                      style={{ "--comp-color": c.color } as React.CSSProperties}
                    >
                      <Crest
                        src={srcs[0]}
                        fallbackSrcs={srcs.slice(1)}
                        name={c.name}
                        abbr={c.abbr}
                        size={40}
                        bgColor={c.color}
                        radius={8}
                      />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="ms-comp-name" style={{ fontSize: 14 }}>{c.name}</span>
                        {(c as any).country && (
                          <span className="ms-comp-country">
                            {COUNTRY_FLAGS[(c as any).country] || ""} {(c as any).country}
                          </span>
                        )}
                        <span className="ms-comp-sub">{c.season || "View standings"}</span>
                      </span>
                      {c.featured && (
                        <span style={{
                          flexShrink: 0, fontSize: 10, fontWeight: 800, color: "#f5b945",
                          background: "rgba(245,185,69,0.12)", padding: "3px 8px", borderRadius: 4
                        }}>
                          Featured
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
