import type { Location, LocationId } from "@/types/game";

export const locations: Record<LocationId, Location> = {
  start: {
    id: "start",
    name: "Приют Скитальца",
    description: "Место, где начинается ваш путь.",
    image: "/hub/merchant-cart-scene.png",
    actions: [
      {
        id: "go-heretic",
        label: "Путь Еретика",
        targetLocationId: "heretic-chamber",
      },
      {
        id: "go-hollow",
        label: "Путь Пустого",
        targetLocationId: "hollow-chamber",
      },
      {
        id: "go-witness",
        label: "Путь Свидетеля",
        targetLocationId: "witness-chamber",
      },
    ],
  },
  "heretic-chamber": {
    id: "heretic-chamber",
    name: "Камера Еретика",
    description: "Здесь пахнет старыми книгами и пылью.",
    image: "/rooms/heretic-chamber.png",
    actions: [{ id: "back", label: "Вернуться", targetLocationId: "start" }],
  },
  "hollow-chamber": {
    id: "hollow-chamber",
    name: "Камера Пустого",
    description: "Холодное и пустое место.",
    image: "/rooms/hollow-chamber.png",
    actions: [{ id: "back", label: "Вернуться", targetLocationId: "start" }],
  },
  "witness-chamber": {
    id: "witness-chamber",
    name: "Камера Свидетеля",
    description: "Стены покрыты странными символами.",
    image: "/rooms/witness-chamber.png",
    actions: [{ id: "back", label: "Вернуться", targetLocationId: "start" }],
  },
};
