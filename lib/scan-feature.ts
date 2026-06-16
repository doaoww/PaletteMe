export const SCAN_FEATURE_FLAG_ENV = "NEXT_PUBLIC_SCAN_FEATURE_ENABLED";

export const SCAN_DISABLED_RESPONSE = {
  ok: false,
  error: "Style checks are coming soon.",
  code: "SCAN_FEATURE_DISABLED",
  stage: "feature_flag",
} as const;

export function isScanFeatureEnabled(
  value = process.env.NEXT_PUBLIC_SCAN_FEATURE_ENABLED
): boolean {
  const normalized = value?.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}

export function getScanComingSoonCopy() {
  return {
    kicker: "coming soon",
    title: "Style checks are coming soon",
    body:
      "We are polishing clothing, outfit, makeup, and shopping scans so the verdicts feel accurate enough to trust. Your color report is ready now, and scans will open after testing.",
    note:
      "Soon you will be able to check clothes before buying, compare outfits, scan makeup shades, and save your best finds.",
  };
}
