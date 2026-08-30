import {
  replanCompanyLate,
  replanPanelDrop,
  replanStudentWithdraw,
  replanRoomUnavailable,
} from "../../../engine/index.js";

import { AppError } from "../utils/appError.js";

export function runReplan({ type, payload, store }) {
  const currentState = store.getState();
  const dataset = store.getDataset();

  const engineInput = {
    ...currentState,
    ...dataset,
  };

  switch (type) {
    case "company-late":
      return handleCompanyLate(payload, engineInput);

    case "panel-drop":
      return handlePanelDrop(payload, engineInput);

    case "student-withdraw":
      return handleStudentWithdraw(payload, engineInput);

    case "room-unavailable":
      return handleRoomUnavailable(payload, engineInput);

    default:
      throw new AppError(`Unsupported disruption type: ${type}`, 400);
  }
}

function handleCompanyLate(payload, input) {
  const { companyId, hours } = payload;

  if (!companyId) {
    throw new AppError("companyId is required", 400);
  }

  if (typeof hours !== "number" || !Number.isFinite(hours) || hours <= 0) {
    throw new AppError("hours must be a positive number", 400);
  }

  return replanCompanyLate({
    companyId,
    hours,
    ...input,
  });
}

function handlePanelDrop(payload, input) {
  const { panelId } = payload;

  if (!panelId) {
    throw new AppError("panelId is required", 400);
  }

  return replanPanelDrop({
    panelId,
    ...input,
  });
}

function handleStudentWithdraw(payload, input) {
  const { studentId } = payload;

  if (!studentId) {
    throw new AppError("studentId is required", 400);
  }

  return replanStudentWithdraw({
    studentId,
    ...input,
  });
}

function handleRoomUnavailable(payload, input) {
  const { roomId, day, from, to } = payload;

  if (!roomId) {
    throw new AppError("roomId is required", 400);
  }

  if (!Number.isInteger(day)) {
    throw new AppError("day must be an integer", 400);
  }

  if (typeof from !== "string" || typeof to !== "string") {
    throw new AppError("from and to must be time strings", 400);
  }

  return replanRoomUnavailable({
    roomId,
    day,
    from,
    to,
    ...input,
  });
}

export function normalizeReplanResult(result) {
  const schedule =
    result.schedule ??
    result.updatedSchedule ??
    result.updated ??
    [];

  const unscheduled =
    result.unscheduled ??
    result.stillUnscheduled ??
    [];

  const diff =
    result.diff ?? {
      changed: result.changed ?? [],
      cancelled: result.cancelled ?? [],
      newlyUnscheduled:
        result.newlyUnscheduled ?? [],
      notify: result.notify ?? [],
      metrics: result.metrics ?? {},
    };

  return {
    schedule,
    unscheduled,
    diff,
  };
}
