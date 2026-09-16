import { ensureWorldBooted } from "@/server/seed/bootstrap";
import {
  advanceLivePulse,
  ensureLivePulse,
  getLiveSnapshot,
  subscribeLive,
} from "@/server/live/pulse";

export async function bootNexusRuntime(options?: { tick?: boolean }) {
  await ensureWorldBooted();
  ensureLivePulse();
  // Serverless isolates often don't keep intervals alive between requests.
  if (options?.tick !== false && (process.env.VERCEL || options?.tick)) {
    advanceLivePulse();
  }
  return getLiveSnapshot();
}

export { subscribeLive, getLiveSnapshot, advanceLivePulse };
