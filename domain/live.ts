import type {
  Activity,
  FleetSnapshot,
  Organisation,
} from "@/domain/entities";
import type {
  Cluster,
  Incident,
  NetworkEvent,
  Note,
  Opportunity,
  Task,
  TeamActivity,
} from "@/data/types";

export type LivePatch = {
  tick: number;
  fleet: FleetSnapshot;
  organisations?: Organisation[];
  clusters?: Cluster[];
  incidents?: Incident[];
  networkEvents?: NetworkEvent[];
  activities?: Activity[];
  tasks?: Task[];
  notes?: Note[];
  opportunities?: Opportunity[];
  teamActivity?: TeamActivity[];
};
