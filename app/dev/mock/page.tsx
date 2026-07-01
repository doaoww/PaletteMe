"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MOCK_ANALYSIS } from "@/lib/report/mock-analysis";

// Dev-only page: injects mock analysis + placeholder face photo into localStorage
// then redirects to /profile so you can work on the report UI without AI calls.
// Access at: http://localhost:3000/dev/mock

const PLACEHOLDER_PHOTO = "data:image/svg+xml;base64," + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <rect width="400" height="500" fill="#e8e0d8"/>
  <circle cx="200" cy="180" r="80" fill="#c4b09a"/>
  <ellipse cx="200" cy="420" rx="120" ry="100" fill="#c4b09a"/>
  <text x="200" y="260" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#8a7a6a">face photo placeholder</text>
</svg>
`);

export default function MockPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("paletteme-analysis", JSON.stringify(MOCK_ANALYSIS));
    localStorage.setItem("paletteme-face-photo", PLACEHOLDER_PHOTO);
    router.replace("/profile");
  }, [router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#888" }}>
      Loading mock report…
    </div>
  );
}
