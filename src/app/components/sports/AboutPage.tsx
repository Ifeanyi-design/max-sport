import type { Screen } from "./types";
import { PageHeader } from "./PageHeader";

export function AboutPage({ setActiveScreen }: { setActiveScreen: (screen: Screen) => void }) {
  return <div style={{ minHeight: "100%", paddingBottom: 32 }}>
    <PageHeader title="About MaxSport" onBack={() => setActiveScreen("home")} />
    <article style={{ maxWidth: 720, padding: "12px 20px", color: "#c8c8d4", fontSize: 14, lineHeight: 1.65 }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#ececf1", fontSize: 32, fontWeight: 700, margin: "0 0 10px" }}>Football without the noise.</h1>
      <p>MaxSport is MaxCinema’s football scores, fixtures, standings, and match-stream hub. Match information is supplied by the connected sports data providers.</p>
      <h2 style={{ color: "#ececf1", fontSize: 16, marginTop: 26 }}>Streams</h2>
      <p>Where a stream is available, MaxSport shows the provider’s embed or links to that provider. We do not host third-party broadcasts.</p>
      <h2 style={{ color: "#ececf1", fontSize: 16, marginTop: 26 }}>Copyright and contact</h2>
      <p>For copyright, stream, or data concerns, contact the MaxCinema team through the main MaxCinema website. Provider links can be removed where appropriate.</p>
      <a href="https://www.maxcinema.name.ng" target="_blank" rel="noreferrer" style={{ display: "inline-flex", marginTop: 10, padding: "9px 12px", borderRadius: 8, background: "#c81e1e", color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: 13 }}>Visit MaxCinema</a>
    </article>
  </div>;
}
