import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — PaletteMe",
  description: "How PaletteMe collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main style={{ background: "var(--surface)", minHeight: "100vh", padding: "0 0 80px" }}>
      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid var(--outline-variant)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <Link href="/" style={{ color: "var(--ink)", textDecoration: "none", fontSize: "14px" }}>
          ← paletteme
        </Link>
      </nav>

      <div style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "48px 24px 0",
      }}>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: "clamp(28px, 5vw, 40px)",
          color: "var(--ink)",
          marginBottom: "8px",
          lineHeight: 1.2,
        }}>
          Privacy Policy
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: "14px", marginBottom: "40px" }}>
          Last updated: June 2026
        </p>

        <Section title="Who we are">
          <p>PaletteMe is an AI personal stylist that analyzes your face, body, and style preferences
          to deliver personalized style recommendations. We are operated by PaletteMe
          (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).</p>
          <p>Questions about this policy: <a href="mailto:privacy@paletteme.com" style={{ color: "var(--primary)" }}>privacy@paletteme.com</a></p>
        </Section>

        <Section title="What we collect">
          <ul>
            <li><strong>Face photos</strong> — uploaded voluntarily for appearance analysis. Used only for AI-powered analysis and not stored permanently after processing.</li>
            <li><strong>Body photos</strong> — optional, uploaded for silhouette analysis. Same handling as face photos.</li>
            <li><strong>Quiz answers</strong> — style preferences, body measurements, and occasion preferences you provide during onboarding.</li>
            <li><strong>Account information</strong> — email address and name when you create an account via email or Google.</li>
            <li><strong>Style profile</strong> — the AI-generated analysis results, saved to your account so you can access your report.</li>
            <li><strong>Usage data</strong> — pages visited, features used, and interactions, collected anonymously via Vercel Analytics.</li>
          </ul>
        </Section>

        <Section title="How we use your data">
          <ul>
            <li>To generate your personalized style analysis and report</li>
            <li>To save your style profile so you can return to it</li>
            <li>To show you personalized product recommendations based on your style profile</li>
            <li>To improve the accuracy of our AI analysis over time</li>
            <li>To send you style updates if you subscribe to Pro (you can unsubscribe anytime)</li>
          </ul>
        </Section>

        <Section title="Photos and AI analysis">
          <p>
            Photos you upload are sent to our AI analysis providers (OpenAI) for processing.
            <strong> Photos are processed securely and are not used to train AI models.</strong>
            We do not sell, share, or use your photos for any purpose beyond generating your style report.
          </p>
          <p>
            Face and body photos are not stored on our servers after the analysis is complete.
            The analysis results (text descriptions of your features) are saved to your profile,
            but the original photos are not retained.
          </p>
        </Section>

        <Section title="Third-party services">
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>OpenAI</strong> — AI analysis of face photos and style generation. <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>OpenAI Privacy Policy</a></li>
            <li><strong>Supabase</strong> — database and authentication. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Supabase Privacy Policy</a></li>
            <li><strong>Pinterest</strong> — style reference images shown in your report. We access only public Pinterest content. <a href="https://policy.pinterest.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Pinterest Privacy Policy</a></li>
            <li><strong>Stripe</strong> — payment processing. We do not store your card details. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Stripe Privacy Policy</a></li>
            <li><strong>Vercel</strong> — hosting and analytics. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Vercel Privacy Policy</a></li>
          </ul>
        </Section>

        <Section title="Data retention">
          <ul>
            <li><strong>Photos:</strong> deleted after analysis is complete (not stored)</li>
            <li><strong>Style profile and quiz answers:</strong> retained while your account is active</li>
            <li><strong>Account data:</strong> retained until you delete your account</li>
            <li>You can request deletion of all your data at any time</li>
          </ul>
        </Section>

        <Section title="Your rights">
          <p>You have the right to:</p>
          <ul>
            <li>Access all data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and all associated data</li>
            <li>Export your style profile data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>To exercise any of these rights, email us at <a href="mailto:privacy@paletteme.com" style={{ color: "var(--primary)" }}>privacy@paletteme.com</a></p>
        </Section>

        <Section title="Cookies">
          <p>We use essential cookies for authentication (keeping you logged in) and session management.
          We do not use tracking or advertising cookies.</p>
        </Section>

        <Section title="Children">
          <p>PaletteMe is not intended for users under 13 years old. We do not knowingly collect
          personal data from children under 13.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>We may update this policy from time to time. We will notify you of significant changes
          by email or by displaying a notice in the app. Continued use of PaletteMe after changes
          constitutes acceptance of the updated policy.</p>
        </Section>

        <div style={{
          marginTop: "48px",
          paddingTop: "24px",
          borderTop: "1px solid var(--outline-variant)",
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
        }}>
          <Link href="/terms" style={{ color: "var(--ink-soft)", fontSize: "13px" }}>Terms of Service</Link>
          <Link href="/" style={{ color: "var(--ink-soft)", fontSize: "13px" }}>Back to PaletteMe</Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "36px" }}>
      <h2 style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "16px",
        color: "var(--ink)",
        marginBottom: "12px",
        letterSpacing: "0",
      }}>
        {title}
      </h2>
      <div style={{
        fontFamily: "var(--font-sans)",
        fontSize: "15px",
        lineHeight: "1.7",
        color: "var(--ink-soft)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}>
        {children}
      </div>
    </section>
  );
}
