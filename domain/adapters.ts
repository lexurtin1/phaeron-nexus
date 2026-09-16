import type { Client } from "@/data/types";
import type { Organisation } from "./entities";

/** Adapt Organisation → legacy Client shape for existing UI. */
export function organisationToClient(org: Organisation): Client {
  const {
    liveTraffic: _t,
    liveLatency: _l,
    liveTimestamps: _ts,
    ...rest
  } = org;
  return rest;
}

export function clientToOrganisation(client: Client): Organisation {
  const now = Math.floor(Date.now() / 1000);
  const liveTimestamps = Array.from({ length: 60 }, (_, i) => now - (59 - i));
  const liveTraffic = liveTimestamps.map(
    (_, i) =>
      Math.round(
        client.apiCalls24h / 86_400 +
          Math.sin(i / 5) * (client.apiCalls24h / 200_000) +
          (i % 7) * 2
      ) || 1
  );
  const liveLatency = liveTimestamps.map(
    (_, i) =>
      Number(
        (
          client.latencyP99 +
          Math.sin(i / 4) * client.latencyP99 * 0.08
        ).toFixed(1)
      )
  );
  return {
    ...client,
    liveTraffic,
    liveLatency,
    liveTimestamps,
  };
}
