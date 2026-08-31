import {
  generateTimeSlots,
  getInterviewDuration,
  getInterviewEnd,
  getInterviewStart,
  minutesToTime,
} from "../utils/schedule.js";
import { useState } from "react";
import { getCompanyName } from "../utils/companies.js";
import "../styles/ScheduleGrid.css";

const DAY_START = 9 * 60;
const DAY_END = 19 * 60;
const DISPLAY_TICK = 30;

export default function ScheduleGrid({ schedule, loading }) {
  const [hoveredInterview, setHoveredInterview] = useState(null);
  const slots = generateTimeSlots(DAY_START, DAY_END, DISPLAY_TICK);
  const rooms = [...new Set(schedule.map((item) => item.roomId ?? item.room))].sort();

  if (loading) return <div className="schedule-empty">Loading schedule...</div>;
  if (schedule.length === 0) return <div className="schedule-empty">No interviews scheduled.</div>;

  return (
    <div className="schedule-grid-wrapper">
      <div className="schedule-grid">
        <div className="grid-corner">Room</div>
        <div className="time-track time-header" aria-label="Schedule timeline">
          {slots.map((slot) => (
            <span className="time-label" key={slot} style={{ left: `${((slot - DAY_START) / (DAY_END - DAY_START)) * 100}%` }}>
              {minutesToTime(slot)}
            </span>
          ))}
        </div>
        {rooms.map((roomId) => <RoomRow key={roomId} roomId={roomId} schedule={schedule} onInterviewHover={setHoveredInterview} />)}
      </div>
      {hoveredInterview && <InterviewDetails {...hoveredInterview} />}
    </div>
  );
}

function RoomRow({ roomId, schedule, onInterviewHover }) {
  const interviews = schedule.filter((item) => (item.roomId ?? item.room) === roomId);
  return <>
    <div className="room-label">{roomId}</div>
    <div className="schedule-cell time-track">
      {interviews.map((interview) => <InterviewBlock key={interview.id ?? interview.interviewId ?? `${interview.companyId}-${interview.studentId}-${getInterviewStart(interview)}`} interview={interview} roomId={roomId} onHover={onInterviewHover} />)}
    </div>
  </>;
}

function InterviewBlock({ interview, roomId, onHover }) {
  const tier = interview.companyTier ?? interview.tier ?? 2;
  const start = Math.max(DAY_START, getInterviewStart(interview));
  const end = Math.min(DAY_END, start + getInterviewDuration(interview));
  const left = ((start - DAY_START) / (DAY_END - DAY_START)) * 100;
  const width = Math.max(((end - start) / (DAY_END - DAY_START)) * 100, 2.5);
  const compact = getInterviewDuration(interview) < 30;
  const label = [interview.companyId, interview.studentId, interview.panelId ?? interview.panel].filter(Boolean).join(" • ");

  function showDetails(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const cardHeight = 172;
    onHover({
      interview,
      roomId,
      position: {
        left: Math.min(rect.left, window.innerWidth - 296),
        top: rect.top > cardHeight ? rect.top - cardHeight - 10 : rect.bottom + 10,
      },
    });
  }

  return <div className={`interview-block tier-${tier}${compact ? " compact" : ""}`} style={{ left: `${left}%`, width: `${width}%` }} aria-label={label} tabIndex="0" onMouseEnter={showDetails} onMouseLeave={() => onHover(null)} onFocus={showDetails} onBlur={() => onHover(null)}>
    <strong className={compact ? "sr-only" : ""}>{interview.companyId ?? "Company"}</strong>
    {!compact && <span>{minutesToTime(start)} – {minutesToTime(end)}</span>}
  </div>;
}

function InterviewDetails({ interview, roomId, position }) {
  return <div className="interview-details-card" style={position} role="tooltip">
    <span className="details-eyebrow">Scheduled interview</span>
    <strong>{getCompanyName(interview.companyId)}</strong>
    <span className="company-reference">{interview.companyId ?? "Company not assigned"}</span>
    <div className="details-grid">
      <Detail label="Student" value={interview.studentId ?? "—"} />
      <Detail label="Time" value={`${minutesToTime(getInterviewStart(interview))} – ${minutesToTime(getInterviewEnd(interview))}`} />
      <Detail label="Room" value={roomId ?? "—"} />
      <Detail label="Panel" value={interview.panelId ?? interview.panel ?? "—"} />
    </div>
  </div>;
}

function Detail({ label, value }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
