export type ConfirmedSeasonRank = {
  id: string;
  name: string;
  percentage: number;
  reason: string;
};

export type ConfirmedSeasonResult = {
  topSeason: ConfirmedSeasonRank;
  alternativeSeasons: ConfirmedSeasonRank[];
};

type SeasonedReport = {
  miniResult: {
    seasonName: string;
    headline: string;
  };
  fullReport: {
    colorAnalysis: {
      topSeason: ConfirmedSeasonRank;
      alternativeSeasons: ConfirmedSeasonRank[];
    };
  };
};

export function applyConfirmedSeasonToReport<TReport extends SeasonedReport>(
  report: TReport,
  confirmed: ConfirmedSeasonResult,
): TReport {
  return {
    ...report,
    miniResult: {
      ...report.miniResult,
      seasonName: confirmed.topSeason.name,
      headline: `You are ${articleFor(confirmed.topSeason.name)} ${confirmed.topSeason.name}`,
    },
    fullReport: {
      ...report.fullReport,
      colorAnalysis: {
        ...report.fullReport.colorAnalysis,
        topSeason: { ...confirmed.topSeason },
        alternativeSeasons: confirmed.alternativeSeasons.map((season) => ({ ...season })),
      },
    },
  };
}

function articleFor(name: string): "a" | "an" {
  return /^[aeiou]/i.test(name.trim()) ? "an" : "a";
}
