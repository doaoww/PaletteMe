import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — PaletteMe",
  description: "How PaletteMe collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main style={{ background: "var(--surface)", minHeight: "100vh", padding: "0 0 80px" }}>
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

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px 0" }}>
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
          Last updated: June 22, 2026 · Effective immediately
        </p>

        <Section title="1. Who we are">
          <p>
            PaletteMe (&quot;PaletteMe&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an
            AI-powered personal styling application that analyzes a user&apos;s facial features, body
            proportions, and style preferences to deliver a personalized style report, color palette,
            and product recommendations.
          </p>
          <p>
            <strong>Contact:</strong><br />
            Email: <a href="mailto:privacy@paletteme.com" style={{ color: "var(--primary)" }}>privacy@paletteme.com</a><br />
            For data deletion or access requests, please email us with subject line &quot;Data Request&quot;.
          </p>
        </Section>

        <Section title="2. Data we collect">
          <p>We collect only the data necessary to provide our service:</p>
          <ul>
            <li>
              <strong>Face photos</strong> — uploaded by the user for AI appearance analysis.
              Transmitted securely to our AI provider (OpenAI) and <strong>not stored on our
              servers</strong> after analysis is complete.
            </li>
            <li>
              <strong>Body photos</strong> — optional, uploaded for silhouette and proportion
              analysis. Same handling as face photos: not retained after processing.
            </li>
            <li>
              <strong>Quiz answers</strong> — style preferences, height, body type, occasions,
              and budget preferences entered during onboarding.
            </li>
            <li>
              <strong>Account information</strong> — email address and display name when
              registering via email or Google OAuth.
            </li>
            <li>
              <strong>Style profile</strong> — the AI-generated text analysis (Kibbe type, color
              season, style direction, recommendations). Saved to your account for future access.
              Does not include the original photos.
            </li>
            <li>
              <strong>Usage analytics</strong> — anonymous, aggregated data about feature usage
              collected via Vercel Analytics. No personally identifiable information.
            </li>
          </ul>
        </Section>

        <Section title="3. How we use your data">
          <ul>
            <li>To generate your personalized AI style analysis and report</li>
            <li>To save and display your style profile within your account</li>
            <li>To show personalized clothing, makeup, and product recommendations</li>
            <li>To display style reference images from Pinterest (public content only)</li>
            <li>To process payments for paid reports or subscriptions via Stripe</li>
            <li>To send account-related emails (password reset, receipt, important updates)</li>
            <li>To send style update emails if you subscribe to Pro — unsubscribe anytime</li>
          </ul>
          <p>We do not sell, rent, or trade your personal data to any third party for marketing purposes.</p>
        </Section>

        <Section title="4. Photos and AI analysis">
          <p>
            <strong>Photos are processed securely for analysis. PaletteMe does not sell or share
            your images.</strong>
          </p>
          <p>
            Face and body photos you upload are transmitted over an encrypted connection to OpenAI&apos;s
            API for AI analysis. OpenAI processes the image to extract visible facial and body features.
            Photos are <strong>not retained</strong> by PaletteMe after the analysis response is
            received, and are <strong>not used to train AI models</strong> under OpenAI&apos;s
            API data usage policy (API inputs are not used for training by default).
          </p>
          <p>
            The analysis output — a text description of your features and style recommendations — is
            saved to your account. The original photos are not saved.
          </p>
        </Section>

        <Section title="5. Pinterest content">
          <p>
            PaletteMe uses the <strong>Pinterest API</strong> to display publicly available style
            reference images and mood board content within your personalized style report.
          </p>
          <p><strong>How we use Pinterest data:</strong></p>
          <ul>
            <li>We access only <strong>public Pinterest content</strong> — pins and boards that any user can view without logging in</li>
            <li>Pinterest images are displayed as <strong>visual style references</strong> to help users understand their recommended aesthetic (e.g., &quot;Quiet Luxury for Soft Natural types&quot;)</li>
            <li>All Pinterest content is <strong>attributed to Pinterest</strong> with a visible link back to the original pin or board</li>
            <li>We do <strong>not store Pinterest images</strong> on our servers — they are fetched and displayed in real time via the Pinterest API</li>
            <li>We do <strong>not repurpose, resell, or republish</strong> Pinterest content outside of its intended display within the user&apos;s style report</li>
            <li>Pinterest data is used solely to <strong>enhance the user experience</strong> by providing visual inspiration relevant to their style profile</li>
            <li>We comply with <strong>Pinterest&apos;s API Terms of Service</strong> and Developer Guidelines</li>
          </ul>
          <p>
            Users who interact with Pinterest content in PaletteMe are subject to{" "}
            <a href="https://policy.pinterest.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>
              Pinterest&apos;s Privacy Policy
            </a>.
          </p>
        </Section>

        <Section title="6. Third-party services">
          <p>We use the following services to operate PaletteMe:</p>
          <ul>
            <li>
              <strong>OpenAI</strong> — AI analysis of face/body photos and style report generation.{" "}
              <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a>
            </li>
            <li>
              <strong>Supabase</strong> — user authentication and database storage.{" "}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a>
            </li>
            <li>
              <strong>Pinterest API</strong> — style reference images. Public content only.{" "}
              <a href="https://policy.pinterest.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a>
            </li>
            <li>
              <strong>Stripe</strong> — payment processing. Card data is handled by Stripe; we do not receive or store card numbers.{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a>
            </li>
            <li>
              <strong>Google</strong> — optional Google OAuth login.{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a>
            </li>
            <li>
              <strong>Vercel</strong> — hosting, CDN, and anonymous analytics.{" "}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Privacy Policy</a>
            </li>
          </ul>
        </Section>

        <Section title="7. Legal basis for processing (GDPR)">
          <p>For users in the European Economic Area (EEA) and UK, we process your data under the following legal bases:</p>
          <ul>
            <li><strong>Contract performance</strong> — processing necessary to provide the style analysis service you requested</li>
            <li><strong>Legitimate interests</strong> — improving our service, preventing fraud, and security monitoring</li>
            <li><strong>Consent</strong> — for optional communications such as Pro subscription updates (you can withdraw at any time)</li>
            <li><strong>Legal obligation</strong> — where required by applicable law</li>
          </ul>
        </Section>

        <Section title="8. Data retention">
          <ul>
            <li><strong>Face and body photos:</strong> not stored — deleted immediately after analysis</li>
            <li><strong>Style profile and quiz answers:</strong> retained while your account is active</li>
            <li><strong>Account data (email, name):</strong> retained until you delete your account</li>
            <li><strong>Payment records:</strong> retained as required by applicable financial regulations (typically 7 years)</li>
            <li><strong>Analytics data:</strong> anonymous and aggregated, retained indefinitely</li>
          </ul>
        </Section>

        <Section title="9. Your rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li><strong>Access</strong> — request a copy of all personal data we hold about you</li>
            <li><strong>Correction</strong> — request correction of inaccurate data</li>
            <li><strong>Deletion</strong> — request deletion of your account and all associated personal data</li>
            <li><strong>Portability</strong> — receive your style profile data in a machine-readable format</li>
            <li><strong>Objection</strong> — object to processing based on legitimate interests</li>
            <li><strong>Withdraw consent</strong> — for any processing based on consent, at any time</li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a href="mailto:privacy@paletteme.com" style={{ color: "var(--primary)" }}>
              privacy@paletteme.com
            </a>{" "}
            with subject &quot;Data Request&quot;. We will respond within 30 days.
          </p>
        </Section>

        <Section title="10. Data security">
          <p>
            We use industry-standard security measures including TLS encryption for data in transit,
            encrypted storage for data at rest, and access controls limiting who can access your data.
            No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="11. Cookies">
          <p>
            We use essential cookies required for authentication (keeping you logged in) and session
            management. We do not use advertising, tracking, or third-party marketing cookies.
          </p>
        </Section>

        <Section title="12. Children">
          <p>
            PaletteMe is not directed at children under 13 years of age. We do not knowingly collect
            personal data from children under 13. If you believe a child has provided us with personal
            data, please contact us at{" "}
            <a href="mailto:privacy@paletteme.com" style={{ color: "var(--primary)" }}>privacy@paletteme.com</a>{" "}
            and we will delete it promptly.
          </p>
        </Section>

        <Section title="13. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes
            by email (to your registered address) and/or by displaying a prominent notice in the app at
            least 14 days before the change takes effect. The date at the top of this page indicates
            when it was last updated.
          </p>
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
