import Link from "next/link";

export function QuizCta() {
  return (
    <section id="quiz" className="quiz-cta">
      <div className="wrap">
        <div className="quiz-cta__inner">
          <div>
            <div className="eyebrow">
              <span className="kicker">color quiz</span>
            </div>
            <h2>
              Questions <span className="scr">first</span>, selfie second
            </h2>
            <p>
              Goals, undertone, body shape, style vibe — then one selfie to
              reveal your colors and outfit direction.
            </p>
          </div>
          <Link href="/quiz" className="cta-mini">
        let&apos;s start
      </Link>
        </div>
      </div>
    </section>
  );
}
