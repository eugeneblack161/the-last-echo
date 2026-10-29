export type Origin = "heretic" | "hollow" | "witness";

export type LocationId =
  | "start"
  | "heretic-chamber"
  | "hollow-chamber"
  | "witness-chamber";

export type SaveSlotId = 0 | 1 | 2;

export interface Artifact {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  image: string;
  actions: Action[];
}

export interface Action {
  id: string;
  label: string;
  targetLocationId?: LocationId;
}

export interface GameSave {
  characterName: string;
  origin: Origin;
  inventory: Artifact[];
  currentLocationId: LocationId;
  updatedAt: string;
}
