import { init, track, Identify, identify, flush } from "@amplitude/analytics-node";

let initialized = false;

function ensureInit() {
  if (initialized) return;
  initialized = true;
  init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!, {
    // serverZone: 'US', // change to 'EU' if your Amplitude project is EU-hosted
    flushQueueSize: 10,      // flush after 10 events buffered
    flushIntervalMillis: 0,  // flush immediately in serverless (no persistent process)
  });
}

export function serverTrack(
  eventName: string,
  properties: Record<string, unknown>,
  userId?: string
) {
  ensureInit();
  track(eventName, properties, userId ? { user_id: userId } : undefined);
}

export function serverIdentify(userId: string, userProperties: Record<string, unknown>) {
  ensureInit();
  const identifyObj = new Identify();
  for (const [key, value] of Object.entries(userProperties)) {
    identifyObj.set(key, value as string | number | boolean);
  }
  identify(identifyObj, { user_id: userId });
}

export async function serverFlush() {
  ensureInit();
  await flush();
}
