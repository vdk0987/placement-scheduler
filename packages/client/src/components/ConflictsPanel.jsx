import { useMemo, useState } from "react";

import "../styles/ConflictsPanel.css";

export default function ConflictsPanel({ unscheduled }) {
  const [sortBy, setSortBy] = useState("priority");
  const [expandedReasons, setExpandedReasons] = useState({});

  const grouped = useMemo(() => {
    const sorted = [...unscheduled].sort((a, b) => {
      if (sortBy === "cgpa") {
        return (b.studentCgpa ?? 0) - (a.studentCgpa ?? 0);
      }

      return (b.priority ?? 0) - (a.priority ?? 0);
    });

    return sorted.reduce((groups, item) => {
      const reason = item.reason ?? "Unknown reason";

      if (!groups[reason]) {
        groups[reason] = [];
      }

      groups[reason].push(item);

      return groups;
    }, {});
  }, [unscheduled, sortBy]);

  return (
    <div className="conflicts-panel">
      <div className="conflicts-header">
        <div>
          <h2>Unscheduled</h2>

          <span>{unscheduled.length} interviews</span>
        </div>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="priority">Priority</option>

          <option value="cgpa">CGPA</option>
        </select>
      </div>

      {unscheduled.length === 0 && (
        <div className="no-conflicts">✓ Everything scheduled</div>
      )}

      {Object.entries(grouped).map(([reason, interviews]) => (
        <div className="reason-group" key={reason}>
          <button
            className="reason-title"
            type="button"
            aria-expanded={Boolean(expandedReasons[reason])}
            onClick={() =>
              setExpandedReasons((current) => ({
                ...current,
                [reason]: !current[reason],
              }))
            }
          >
            <span>{reason}</span>

            <span className="reason-meta">
              <strong>{interviews.length}</strong>
              <span className="reason-chevron" aria-hidden="true">
                {expandedReasons[reason] ? "⌃" : "⌄"}
              </span>
            </span>
          </button>

          {expandedReasons[reason] && interviews.map((interview) => (
            <UnscheduledItem
              key={
                interview.id ?? `${interview.companyId}-${interview.studentId}`
              }
              interview={interview}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function UnscheduledItem({ interview }) {
  return (
    <div className="unscheduled-item">
      <strong>{interview.companyId}</strong>

      <span>{interview.studentId}</span>

      {interview.studentCgpa && (
        <small>CGPA: {Number(interview.studentCgpa).toFixed(2)}</small>
      )}
    </div>
  );
}
