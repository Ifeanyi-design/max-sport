interface EmptyStateProps {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, detail, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: "#8b8b9a" }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#c8c8d4" }}>
        {title}
      </div>
      {detail && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
          {detail}
        </div>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
