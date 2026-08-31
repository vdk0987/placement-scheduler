import { replan, createTimeGrid, DISRUPTION_TYPES } from "../../../engine/index.js";

import { AppError } from "../utils/appError.js";

export function runReplan({ type, payload, store }) {
  const currentState = store.getState();
  const dataset = store.getDataset();
  const timeGrid = createTimeGrid();

  const event = buildEvent(type, payload);

  return replan({
    event,
    currentState,
    dataset,
    timeGrid,
  });
}

function buildEvent(type, payload) {
  switch (type) {
    case "company-late": {
      const { companyId, hours } = payload;

      if (!companyId) {
        throw new AppError("companyId is required", 400);
      }

      if (typeof hours !== "number" || !Number.isFinite(hours) || hours <= 0) {
        throw new AppError("hours must be a positive number", 400);
      }

      return {
        type: DISRUPTION_TYPES.COMPANY_LATE,
        companyId,
        hours,
      };
    }

    case "panel-drop": {
      const { panelId } = payload;

      if (!panelId) {
        throw new AppError("panelId is required", 400);
      }

      return {
        type: DISRUPTION_TYPES.PANEL_DROP,
        panelId,
      };
    }

    case "student-withdraw": {
      const { studentId } = payload;

      if (!studentId) {
        throw new AppError("studentId is required", 400);
      }

      return {
        type: DISRUPTION_TYPES.STUDENT_WITHDRAW,
        studentId,
      };
    }

    case "room-unavailable": {
      const { roomId, day, from, to } = payload;

      if (!roomId) {
        throw new AppError("roomId is required", 400);
      }

      if (!Number.isInteger(day)) {
        throw new AppError("day must be an integer", 400);
      }

      const startMinute = timeToMinutes(from);

      const endMinute = timeToMinutes(to);

      if (
        startMinute === null ||
        endMinute === null ||
        startMinute >= endMinute
      ) {
        throw new AppError("from and to must be valid HH:MM times", 400);
      }

      return {
        type: DISRUPTION_TYPES.ROOM_UNAVAILABLE,

        roomId,
        day,
        startMinute,
        endMinute,
      };
    }

    default:
      throw new AppError(`Unsupported disruption type: ${type}`, 400);
  }
}

function timeToMinutes(value) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}
