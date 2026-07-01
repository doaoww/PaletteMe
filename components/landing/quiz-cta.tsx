import Link from "next/link";

export function QuizCta() {
  return (
    <section id="quiz" className="quiz-cta">
      <div className="wrap">
        <div className="quiz-cta__inner">
          <div>
            <div className="eyebrow">
              <span className="kicker">one photo</span>
            </div>
            <h2>Your visual blueprint starts here</h2>
            <p>
              Upload a clear photo and see the colors, contrast, hair, glasses
              and details that suit your features.
            </p>
          </div>
          <Link href="/style-setup" className="cta-mini">
            upload my photo
          </Link>
        </div>
      </div>
    </section>
  );
}
