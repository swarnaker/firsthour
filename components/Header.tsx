interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function Header({ search, onSearchChange }: HeaderProps) {
  return (
    <header
      className="border-b px-4 py-4"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--gold)" }}>
              FIRSTHOUR
            </h1>
            <p className="text-xs" style={{ color: "var(--text-dim)" }}>
              Pons first hour · research, not a wallet
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className="px-3 py-1 border rounded text-xs"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--gold-dim)",
              }}
            >
              Robinhood
            </span>
            <span
              className="px-3 py-1 border rounded text-xs"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--gold-dim)",
              }}
            >
              Pons only
            </span>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search ticker / CA"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>
    </header>
  );
}
