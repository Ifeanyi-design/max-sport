// Lightweight cross-page navigation state used by the sports SPA.
// The app navigates via setActiveScreen (state-based, no router), so we stash
// the selected match id here when opening a match detail screen.
export const navState: { selectedMatchId: number | null } = {
  selectedMatchId: null,
};
