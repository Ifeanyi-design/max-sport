interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Could not load this data.", onRetry }: ErrorStateProps) {
  return (
    <div className="ms-state">
      <div className="ms-state-title ms-state-error">{message}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="ms-btn ms-btn-primary" style={{ marginTop: 14 }}>
          Try again
        </button>
      )}
    </div>
  );
}
