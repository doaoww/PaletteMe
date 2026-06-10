"use client";

import { FormEvent, useState } from "react";

export function WaitlistForm() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const email = (new FormData(form).get("email") as string) ?? "";

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmittedEmail(email);
      setDone(true);
      form.reset();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="waitlist">
      <div className="wrap">
        <div className="eyebrow">
          <span className="kicker">early access</span>
        </div>

        {done ? (
          <>
            <h2 className="waitlist__success-head">
              you&apos;re <span className="scr">in!</span>
            </h2>
            <p className="waitlist__success-p">
              We&apos;ll email {submittedEmail} when full features drop.
              <br />
              In the meantime — take the quiz and discover your season.
            </p>
            <div className="waitlist__success-cta">
              <a href="/quiz" className="cta-mini">start color quiz</a>
            </div>
          </>
        ) : (
          <>
            <h2>
              Your colors are <span className="scr">waiting</span>
            </h2>
            <p className="sub">
              The free analysis is live now. Join the waitlist to unlock saved palettes,
              real product picks, and the outfit scanner.
            </p>

            <form className="signup" onSubmit={submit}>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                disabled={loading}
                autoComplete="email"
              />
              <button type="submit" disabled={loading}>
                {loading ? "joining…" : "join waitlist"}
              </button>
            </form>

            {error && (
              <p className="waitlist__error" role="alert">
                {error}
              </p>
            )}

            <p className="micro">Free · No spam · Unsubscribe anytime</p>

            <div className="proof">
              <div className="av">
                <i style={{ background: "#F8B4C4" }} />
                <i style={{ background: "#C9B6E4" }} />
                <i style={{ background: "#D4A574" }} />
                <i style={{ background: "#A8D8EA" }} />
              </div>
              <span>2,400+ on the waitlist</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
