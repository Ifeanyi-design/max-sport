interface WordmarkProps {
  size?: "sm" | "md";
  stacked?: boolean;
  onClick?: () => void;
}

export function Wordmark({ size = "md", stacked = false, onClick }: WordmarkProps) {
  const fs = size === "sm" ? 16 : 22;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "flex-start" : "baseline",
        gap: stacked ? 0 : 0,
        background: "none",
        border: "none",
        padding: 0,
        cursor: onClick ? "pointer" : "default",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: fs,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.03em",
        }}
      >
        MAX
      </span>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: fs,
          fontWeight: 700,
          color: "#c81e1e",
          letterSpacing: "-0.03em",
        }}
      >
        SPORT
      </span>
    </button>
  );
}
