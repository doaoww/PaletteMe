import { ColorAnalyzer } from "@/components/dashboard/color-analyzer";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-svh bg-cream text-ink">
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--hair)",
          padding: "14px var(--pad)",
          position: "sticky",
          top: 0,
          background: "color-mix(in srgb, var(--cream) 92%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          zIndex: 50,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--sans)",
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "var(--ink-soft)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          className="hover:text-ink"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          home
        </Link>

        <Link href="/" className="wordmark" style={{ fontSize: "1.3rem", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          palette<span className="me">me</span>
        </Link>

        <span className="kicker" style={{ fontSize: "0.58rem" }} aria-hidden="true">
          analysis
        </span>
      </header>

      <main>
        <ColorAnalyzer />
      </main>
    </div>
  );
}
