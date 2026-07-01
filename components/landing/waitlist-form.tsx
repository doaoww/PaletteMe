import Link from "next/link";

export function WaitlistForm() {
  return (
    <section id="waitlist" className="waitlist final-report-cta">
      <div className="wrap">
        <div className="eyebrow">
          <span className="kicker">start report</span>
        </div>

        <h2>
          Your features are already there. Now see what suits them.
        </h2>
        <p className="sub">
          Upload one clear photo and get a personalized appearance report for
          your coloring, contrast, hair, glasses, metals and details.
        </p>

        <div className="final-report-cta__actions">
          <Link href="/style-setup" className="cta-mini">
            upload my photo
          </Link>
          <span>Takes less than 30 seconds</span>
        </div>
      </div>
    </section>
  );
}
