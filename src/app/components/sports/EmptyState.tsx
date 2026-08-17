interface EmptyStateProps {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, detail, action }: EmptyStateProps) {
  return (
    <div className="ms-state">
      <div className="ms-state-title">{title}</div>
      {detail && <div className="ms-state-detail">{detail}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
