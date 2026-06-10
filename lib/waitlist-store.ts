import { promises as fs } from "fs";
import path from "path";

export type WaitlistEntry = {
  email: string;
  createdAt: string;
  source: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "waitlist.json");

export async function readWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addToWaitlist(
  email: string,
  source = "landing"
): Promise<{ entry: WaitlistEntry; isNew: boolean }> {
  const normalized = email.trim().toLowerCase();
  const entries = await readWaitlist();
  const existing = entries.find((e) => e.email === normalized);

  if (existing) {
    return { entry: existing, isNew: false };
  }

  const entry: WaitlistEntry = {
    email: normalized,
    createdAt: new Date().toISOString(),
    source,
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify([entry, ...entries], null, 2),
    "utf8"
  );

  return { entry, isNew: true };
}
