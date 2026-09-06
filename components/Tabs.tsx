interface TabsProps {
  activeTab: "feed" | "watchlist" | "alerts" | "settings";
  onTabChange: (tab: "feed" | "watchlist" | "alerts" | "settings") => void;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs: Array<{ id: "feed" | "watchlist" | "alerts" | "settings"; label: string }> = [
    { id: "feed", label: "Feed" },
    { id: "watchlist", label: "Watchlist" },
    { id: "alerts", label: "Alerts" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div
      className="border-b"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="container mx-auto px-4 flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="px-4 py-3 font-medium transition-colors"
            style={{
              color: activeTab === tab.id ? "var(--gold)" : "var(--text-secondary)",
              borderBottom: activeTab === tab.id ? "2px solid var(--gold)" : "2px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
