import { CONFIG } from "../recruiterData.js";
import { randomInt } from "./helpers.js";

export function generateRooms(rng) {
  const rooms = [];

  for (let i = 0; i < CONFIG.TOTAL_ROOMS; i++) {
    const id =
      `room-${String(i + 1).padStart(2, "0")}`;

    const isSpecial = i >= 17;

    const room = {
      id,

      name: isSpecial
        ? `Special Interview Room ${i + 1}`
        : `Interview Room ${i + 1}`,

      capacity: isSpecial
        ? randomInt(rng, 12, 20)
        : randomInt(rng, 4, 10),

      features: isSpecial
        ? ["AV", "VIDEO", "PROJECTOR"]
        : [],
    };

    rooms.push(room);
  }

  return rooms;
}
