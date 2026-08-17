import { ArrowLeft, RefreshCw } from "lucide-react";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  onRefresh?: () => void;
  trailing?: React.ReactNode;
}

export function PageHeader({ title, onBack, onRefresh, trailing }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "16px 20px 12px",
        position: "sticky",
        top: 0,
        zIndex: 5,
        background: "rgba(10,10,16,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "#ececf1",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} />
        </button>
      )}
      <h1
        style={{
          margin: 0,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "0.02em",
          color: "#ececf1",
        }}
      >
        {title}
      </h1>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {trailing}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "#8b8b9a",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
