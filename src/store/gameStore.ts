import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import type {
  Artifact,
  GameSave,
  LocationId,
  Origin,
  SaveSlotId,
} from "@/types/game";

export const SAVE_SLOT_IDS: SaveSlotId[] = [0, 1, 2];

type SaveSlots = Record<SaveSlotId, GameSave | null>;

interface PersistedGameStore {
  saves: SaveSlots;
  activeSlotId: SaveSlotId | null;
  pendingSlotId: SaveSlotId | null;
}

interface GameStore extends PersistedGameStore {
  setPendingSlotId: (slotId: SaveSlotId | null) => void;
  startNewGame: (
    characterName: string,
    origin: Origin,
    slotId: SaveSlotId,
  ) => void;
  loadGame: (slotId: SaveSlotId) => void;
  setCurrentLocationId: (id: LocationId) => void;
  addToInventory: (artifact: Artifact) => void;
}

const ORIGIN_START_LOCATION: Record<Origin, LocationId> = {
  heretic: "heretic-chamber",
  hollow: "hollow-chamber",
  witness: "witness-chamber",
};

const browserStorage: StateStorage = {
  getItem: (name) => window.localStorage.getItem(name),
  setItem: (name, value) => window.localStorage.setItem(name, value),
  removeItem: (name) => window.localStorage.removeItem(name),
};

interface HydrationState {
  status: "loading" | "ready" | "error";
  setStatus: (status: HydrationState["status"]) => void;
}

export const useGameStoreHydration = create<HydrationState>((set) => ({
  status: "loading",
  setStatus: (status) => set({ status }),
}));

export function getFirstAvailableSlot(
  saves: SaveSlots,
): SaveSlotId | null {
  return SAVE_SLOT_IDS.find((slotId) => saves[slotId] === null) ?? null;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      saves: { 0: null, 1: null, 2: null },
      activeSlotId: null,
      pendingSlotId: null,
      setPendingSlotId: (pendingSlotId) => set({ pendingSlotId }),
      startNewGame: (characterName, origin, slotId) => {
        const save: GameSave = {
          characterName,
          origin,
          inventory: [],
          currentLocationId: ORIGIN_START_LOCATION[origin],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          saves: { ...state.saves, [slotId]: save },
          activeSlotId: slotId,
          pendingSlotId: null,
        }));
      },
      loadGame: (slotId) => {
        if (get().saves[slotId]) {
          set({ activeSlotId: slotId, pendingSlotId: null });
        }
      },
      setCurrentLocationId: (currentLocationId) => {
        const { activeSlotId, saves } = get();
        if (activeSlotId === null || !saves[activeSlotId]) return;

        set((state) => {
          const save = state.saves[activeSlotId];
          if (!save) return state;

          return {
            saves: {
              ...state.saves,
              [activeSlotId]: {
                ...save,
                currentLocationId,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
      addToInventory: (artifact) => {
        const { activeSlotId, saves } = get();
        if (activeSlotId === null || !saves[activeSlotId]) return;

        set((state) => {
          const save = state.saves[activeSlotId];
          if (!save) return state;

          return {
            saves: {
              ...state.saves,
              [activeSlotId]: {
                ...save,
                inventory: [...save.inventory, artifact],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
    }),
    {
      name: "the-last-echo-saves",
      storage: createJSONStorage(() => browserStorage),
      skipHydration: true,
      partialize: ({ saves, activeSlotId, pendingSlotId }) => ({
        saves,
        activeSlotId,
        pendingSlotId,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error("Не удалось загрузить сохранения игры.", error);
          useGameStoreHydration.getState().setStatus("error");
          return;
        }

        useGameStoreHydration.getState().setStatus("ready");
      },
    },
  ),
);
