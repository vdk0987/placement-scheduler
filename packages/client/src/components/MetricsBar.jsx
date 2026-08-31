import { formatMinutes, formatPercent } from "../utils/formatting.js";

import "../styles/MetricsBar.css";

export default function MetricsBar({ metrics }) {
  return (
    <section className="metrics-bar">
      <Metric
        label="Scheduled"
        value={formatPercent(
          metrics.scheduling?.percentScheduled ??
            metrics.summary?.scheduleRate ??
            metrics.percentScheduled ??
            metrics.scheduledPercentage,
        )}
      />

      <Metric
        label="Room Utilization"
        value={formatPercent(
          metrics.roomUtilization?.overall?.utilizationPercent ??
            metrics.roomUtilization,
        )}
      />

      <Metric
        label="Avg. Student Wait"
        value={formatMinutes(
          metrics.studentWaitTime?.averageWaitMinutes ??
            metrics.averageStudentWaitTime ??
            metrics.averageWaitTime,
        )}
      />

      <Metric label="Clashes" value={metrics.feasibility?.clashCount ?? metrics.clashCount ?? 0} />
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}
