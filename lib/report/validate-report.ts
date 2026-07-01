import type { AnalysisResult } from "./report-schema";

type WardrobeType = "woman" | "man" | "other";

// ─── Forbidden patterns ────────────────────────────────────────────────────────

// Blush names must come from warm-peachy-rose families.
// Yellow, green, blue, grey, navy, black, white are never valid blush shades.
const FORBIDDEN_BLUSH: RegExp[] = [
  /\byellow\b/i, /\bgolden.?yellow\b/i, /\blemon\b/i, /\bbutter\b/i,
  /\bgreen\b/i, /\bforest\b/i, /\bolive\b/i, /\bsage\b/i, /\bemerald\b/i,
  /\bblue\b/i, /\bnavy\b/i, /\bcobalt\b/i, /\bindigo\b/i, /\baqua\b/i,
  /\bgre[ya]\b/i, /\bsilver\b/i, /\bslate\b/i, /\bcharcoal\b/i,
  /\bblack\b/i, /\bwhite\b/i,
];

// Fantasy hair colors that no normal salon would recommend as a flattering look.
// Natural reds (auburn, copper, burgundy) are fine.
const FORBIDDEN_HAIR_FANTASY: RegExp[] = [
  /\bpurple\b/i, /\bviolet\b/i, /\blilac\b/i, /\blavender\b/i,
  /\belectric\b/i, /\bneon\b/i, /\brainbow\b/i,
  /\bteal\b/i, /\bcyan\b/i,
  /\bpink\b/i,                          // pink hair (not pink-toned naturally)
  /\bblue(?!.?black)\b/i,               // "blue" is forbidden, "blue-black" is allowed
  /\bsilver.?blue\b/i, /\bblue.?silver\b/i,
  /\bpastel.?(?:pink|blue|purple|lilac|lavender)\b/i,
];

// CSS color names that should never appear in user-facing shade names.
const CSS_COLOR_NAMES = new Set([
  "burlywood", "peru", "saddlebrown", "darkgoldenrod", "firebrick",
  "maroon", "indigo", "darkolivegreen", "darkseagreen", "mediumseagreen",
  "midnightblue", "cornflowerblue", "darkred", "mediumorchid", "mediumpurple",
  "darksalmon", "lightcoral", "indianred", "rosybrown", "hotpink",
  "deeppink", "mediumvioletred", "palevioletred", "darkmagenta",
]);

const COSMETIC_TERMS =
  /\b(makeup|cosmetic|blush|lipstick|lip colour|lip color|eyeshadow|eye shadow|mascara|bronzer|contour|foundation|highlighter|liner|concealer|tinted moisturiser|tinted moisturizer|bb cream|cc cream)\b/i;

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ReportValidationResult = {
  valid: boolean;
  critical: string[];
  warnings: string[];
};

// ─── Main validator ────────────────────────────────────────────────────────────

export function validateGeneratedReport(
  result: AnalysisResult,
  options: { wardrobeType?: WardrobeType } = {},
): ReportValidationResult {
  const critical: string[] = [];
  const warnings: string[] = [];
  const { fullReport } = result;
  const wardrobeType = options.wardrobeType ?? "woman";

  // ── 1. Blush shades in makeup comparisons ──────────────────────────────────
  for (const mc of fullReport.makeupComparisons) {
    if (mc.category === "blush") {
      for (const pat of FORBIDDEN_BLUSH) {
        if (pat.test(mc.goodShade.name)) {
          critical.push(`BLUSH comparison: "${mc.goodShade.name}" matches forbidden pattern /${pat.source}/i`);
        }
      }
    }
  }

  // ── 2. Blush shades in colorDiagnostics.makeup ────────────────────────────
  const diagBlush = fullReport.colorDiagnostics?.makeup?.blush ?? [];
  for (const shade of diagBlush) {
    for (const pat of FORBIDDEN_BLUSH) {
      if (pat.test(shade.name)) {
        critical.push(`BLUSH shade: "${shade.name}" matches forbidden pattern /${pat.source}/i`);
      }
    }
  }

  // ── 3. Fantasy hair colors ─────────────────────────────────────────────────
  for (const hair of fullReport.hairOptions) {
    const colorField = hair.color ?? "";
    for (const pat of FORBIDDEN_HAIR_FANTASY) {
      if (pat.test(colorField)) {
        critical.push(`HAIR COLOR: "${colorField}" contains fantasy/unrealistic color (pattern: /${pat.source}/i)`);
      }
    }

    // ── 4. Color words in hair description ──────────────────────────────────
    // description must be about cut mechanics only
    const desc = hair.description ?? "";
    const colorInDesc = [
      /\bauburn\b/i, /\bespresso\b/i, /\bburgundy\b/i,
      /\bblonde\b/i, /\bplatinum\b/i, /\bcopper\b/i,
      /adding.{0,25}(tone|warmth|depth|colour|color)/i,
      /\bcolou?r(?:ing)? (?:already|add|suit|match)/i,
    ];
    for (const pat of colorInDesc) {
      if (pat.test(desc)) {
        warnings.push(
          `HAIR DESC: "${hair.name}" — description mentions hair color (pattern /${pat.source}/i). ` +
          `Color info belongs in 'color' field only.`,
        );
        break;
      }
    }
  }

  // ── 5. Best colors quantity ────────────────────────────────────────────────
  const bestCount = fullReport.colorAnalysis.bestColors.length;
  if (bestCount < 20) {
    warnings.push(`BEST COLORS: only ${bestCount} colors returned (prompt requires 28–36).`);
  }

  // ── 6. CSS color names in bestColors ──────────────────────────────────────
  for (const c of fullReport.colorAnalysis.bestColors) {
    const key = c.name.toLowerCase().replace(/\s+/g, "");
    if (CSS_COLOR_NAMES.has(key)) {
      warnings.push(`CSS NAME: "${c.name}" is a raw CSS color name — must use a real shade name (e.g. "Warm Caramel").`);
    }
  }

  // ── 7. Minimum avoid colors ───────────────────────────────────────────────
  const avoidCount = fullReport.colorAnalysis.avoidColors?.length ?? 0;
  if (avoidCount < 6) {
    warnings.push(`AVOID COLORS: only ${avoidCount} (prompt requires 8–10).`);
  }

  // ── 8. Hair options count ─────────────────────────────────────────────────
  if (fullReport.hairOptions.length < 2) {
    warnings.push(`HAIR OPTIONS: only ${fullReport.hairOptions.length} option(s) — minimum 2 required.`);
  }

  // ── 9. Glasses cards ─────────────────────────────────────────────────────
  const glassesCount = fullReport.glasses?.cards?.length ?? 0;
  if (glassesCount < 3) {
    warnings.push(`GLASSES: only ${glassesCount} card(s) — 3 required.`);
  }

  // ── 10. Neutrals count ───────────────────────────────────────────────────
  const neutralsCount = fullReport.colorDiagnostics?.neutrals?.length ?? 0;
  if (neutralsCount < 8) {
    warnings.push(`NEUTRALS: only ${neutralsCount} neutral shades (10 groups are mandatory).`);
  }

  if (wardrobeType === "man") {
    if (fullReport.makeupComparisons.length > 0) {
      critical.push("MALE REPORT: makeupComparisons must be an empty array.");
    }

    if (fullReport.colorDiagnostics?.makeup) {
      critical.push("MALE REPORT: colorDiagnostics.makeup must be null or omitted.");
    }

    const grooming = fullReport.grooming;
    if (!grooming) {
      critical.push("MALE REPORT: grooming section is required.");
    } else {
      if (!grooming.beardShape.trim()) {
        critical.push("MALE REPORT: grooming.beardShape is required.");
      }
      if (!grooming.beardShapeWhy.trim()) {
        critical.push("MALE REPORT: grooming.beardShapeWhy is required.");
      }
      if (!grooming.beardColor.trim()) {
        critical.push("MALE REPORT: grooming.beardColor is required.");
      }
      if (!grooming.beardColorWhy.trim()) {
        critical.push("MALE REPORT: grooming.beardColorWhy is required.");
      }
      if (grooming.options.length !== 3) {
        critical.push(`MALE REPORT: grooming.options must contain exactly 3 options, got ${grooming.options.length}.`);
      }
      const bestCount = grooming.options.filter((option) => option.verdict === "best").length;
      if (bestCount !== 1) {
        critical.push(`MALE REPORT: grooming.options must contain exactly one best verdict, got ${bestCount}.`);
      }
      if (COSMETIC_TERMS.test(grooming.skinNote)) {
        critical.push("MALE REPORT: grooming.skinNote contains cosmetic language; it must stay within grooming and skincare basics.");
      }
    }

    const archetypeMakeup = fullReport.faceArchetype?.stylingNotes.makeup ?? "";
    const summaryMakeup = fullReport.signatureSummary?.makeup ?? "";
    if (COSMETIC_TERMS.test(archetypeMakeup)) {
      critical.push("MALE REPORT: faceArchetype.stylingNotes.makeup contains cosmetic language; it must be grooming/beard guidance.");
    }
    if (COSMETIC_TERMS.test(summaryMakeup)) {
      critical.push("MALE REPORT: signatureSummary.makeup contains cosmetic language; it must be grooming/beard guidance.");
    }
  } else if (fullReport.grooming) {
    warnings.push(`GROOMING: returned for wardrobeType "${wardrobeType}", but grooming is men-only.`);
  }

  return {
    valid: critical.length === 0,
    critical,
    warnings,
  };
}
