import { ensureWorldBooted } from "@/server/seed/bootstrap";
import {
  ensureLivePulse,
  getLiveSnapshot,
  subscribeLive,
} from "@/server/live/pulse";

export async function bootNexusRuntime() {
  await ensureWorldBooted();
  ensureLivePulse();
  return getLiveSnapshot();
}

export { subscribeLive, getLiveSnapshot };
