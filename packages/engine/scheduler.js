import SCHEDULIING_CONFIG from './types.js';
import { durationToTicks, fitsWithinDay } from './timeGrid.js'
import { checkStudentFeasibility, checkFeasibility } from './constraints.js'

function createScheduleState() {
  return {
    roomOccupancy: new Map(),

    panelOccupancy: new Map(),

    studentOccupancy: new Map(),
  };
}
