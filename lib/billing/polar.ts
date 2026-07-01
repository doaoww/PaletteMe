import { Polar } from "@polar-sh/sdk";

export function getPolarClient(): Polar {
  return new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
    server: process.env.POLAR_ENVIRONMENT === "sandbox" ? "sandbox" : "production",
  });
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
