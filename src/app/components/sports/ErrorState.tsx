interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Could not load this data.", onRetry }: ErrorStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px" }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#f0a0a0" }}>{message}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: 14,
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "#c81e1e",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
