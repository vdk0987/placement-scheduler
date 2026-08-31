import {
  generateTimeSlots,
  getInterviewDuration,
  getInterviewStart,
  minutesToTime,
} from "../../utils/schedule.js";

import "../styles/ScheduleGrid.css";

const DAY_START = 9 * 60;
const DAY_END = 19 * 60;

const DISPLAY_TICK = 30;

export default function ScheduleGrid({ schedule, loading }) {
  const slots = generateTimeSlots(DAY_START, DAY_END, DISPLAY_TICK);

  const rooms = [
    ...new Set(schedule.map((interview) => interview.roomId ?? interview.room)),
  ].sort();

  if (loading) {
    return <div className="schedule-empty">Loading schedule...</div>;
  }

  if (schedule.length === 0) {
    return <div className="schedule-empty">No interviews scheduled.</div>;
  }

  return (
    <div className="schedule-grid-wrapper">
      <div
        className="schedule-grid"
        style={{
          gridTemplateColumns: `120px repeat(${slots.length}, minmax(70px, 1fr))`,
        }}
      >
        <div className="grid-corner">Room</div>

        {slots.map((slot) => (
          <div className="time-header" key={slot}>
            {minutesToTime(slot)}
          </div>
        ))}

        {rooms.map((roomId) => (
          <RoomRow
            key={roomId}
            roomId={roomId}
            schedule={schedule}
            slots={slots}
          />
        ))}
      </div>
    </div>
  );
}

function RoomRow({ roomId, schedule, slots }) {
  const roomInterviews = schedule.filter(
    (interview) => (interview.roomId ?? interview.room) === roomId,
  );

  return (
    <>
      <div className="room-label">{roomId}</div>

      {slots.map((slot) => {
        const interview = roomInterviews.find((item) =>
          occupiesSlot(item, slot),
        );

        return (
          <div key={`${roomId}-${slot}`} className="schedule-cell">
            {interview && <InterviewBlock interview={interview} />}
          </div>
        );
      })}
    </>
  );
}

function occupiesSlot(interview, slot) {
  const start = getInterviewStart(interview);

  const end = start + getInterviewDuration(interview);

  return slot >= start && slot < end;
}

function InterviewBlock({ interview }) {
  const tier = interview.companyTier ?? interview.tier ?? 2;

  return (
    <div
      className={`interview-block tier-${tier}`}
      title={[
        interview.companyId,
        interview.studentId,
        interview.panelId ?? interview.panel,
      ]
        .filter(Boolean)
        .join(" • ")}
    >
      <strong>{interview.companyId}</strong>

      <span>{interview.studentId}</span>
    </div>
  );
}
