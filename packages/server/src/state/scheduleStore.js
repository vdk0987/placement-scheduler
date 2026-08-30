import { computeMetrics } from "../../../engine/index.js";
import { AppError } from "../utils/appError.js";

const clone = (value) => structuredClone(value);

export class ScheduleStore {
  constructor(initialState = {}) {
    this.currentState = {
      schedule: initialState.schedule ?? [],
      unscheduled: initialState.unscheduled ?? [],
      metrics: initialState.metrics ?? {},
    };

    this.dataset = {
      companies: initialState.companies ?? [],
      students: initialState.students ?? [],
      rooms: initialState.rooms ?? [],
    };

    this.pendingPreview = null;
  }

  getDataset() {
    return clone(this.dataset);
  }

  getState() {
    return clone(this.currentState);
  }

  getSchedule(day) {
    const schedule = this.currentState.schedule;

    if (day === undefined) {
      return clone(schedule);
    }

    const numericDay = Number(day);

    if (!Number.isInteger(numericDay)) {
      throw new AppError("day must be a valid integer", 400);
    }

    return clone(
      schedule.filter((interview) => Number(interview.day) === numericDay),
    );
  }

  getUnscheduled() {
    return clone(this.currentState.unscheduled);
  }

  getMetrics() {
    return clone(this.currentState.metrics);
  }

  createPreview({ disruption, nextState, diff }) {
    const previewId = crypto.randomUUID();

    this.pendingPreview = {
      id: previewId,
      createdAt: new Date().toISOString(),
      disruption: clone(disruption),
      nextState: clone(nextState),
      diff: clone(diff),
    };

    return {
      previewId,
      createdAt: this.pendingPreview.createdAt,
      disruption: clone(disruption),
      diff: clone(diff),
    };
  }

  getPreview() {
    if (!this.pendingPreview) {
      return null;
    }

    return {
      previewId: this.pendingPreview.id,
      createdAt: this.pendingPreview.createdAt,
      disruption: clone(this.pendingPreview.disruption),
      diff: clone(this.pendingPreview.diff),
    };
  }

  commitPreview(previewId) {
    if (!this.pendingPreview) {
      throw new AppError("No pending replan preview exists", 404);
    }

    if (previewId && previewId !== this.pendingPreview.id) {
      throw new AppError("Preview ID does not match the pending preview", 409);
    }

    this.currentState = clone(this.pendingPreview.nextState);

    const committed = {
      previewId: this.pendingPreview.id,
      disruption: clone(this.pendingPreview.disruption),
      diff: clone(this.pendingPreview.diff),
      state: this.getState(),
    };

    this.pendingPreview = null;

    return committed;
  }

  clearPreview() {
    this.pendingPreview = null;
  }

  replaceState(nextState) {
    const schedule = nextState.schedule ?? [];
    const unscheduled = nextState.unscheduled ?? [];

    this.currentState = {
      schedule,
      unscheduled,
      metrics:
        nextState.metrics ??
        computeMetrics({
          schedule,
          unscheduled,
          rooms: this.dataset.rooms,
        }),
    };
  }
}
