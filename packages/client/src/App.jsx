import { useState } from "react";
import { previewReplan, commitPreview } from "./api/client.js";
import { useSchedule } from "./hooks/useSchedule.js";
import { useWebSocket } from "./hooks/useWebSocket.js";
import ScheduleGrid from "./components/ScheduleGrid.jsx";
import ConflictsPanel from "./components/ConflictsPanel.jsx";
import DisruptionControls from "./components/DisruptionControls.jsx";
import DiffModal from "./components/DiffModal.jsx";
import MetricsBar from "./components/MetricsBar.jsx";

const DAYS = [1, 2, 3, 4];

export default function App() {
  const [selectedDay, setSelectedDay] = useState(1);

  const [preview, setPreview] = useState(null);

  const [replanLoading, setReplanLoading] = useState(false);

  const [replanError, setReplanError] = useState(null);

  const { schedule, unscheduled, metrics, loading, error, refresh } =
    useSchedule(selectedDay);

  useWebSocket(refresh);

  async function handlePreview(type, payload) {
    try {
      setReplanLoading(true);
      setReplanError(null);

      const response = await previewReplan(type, payload);

      setPreview(response);
    } catch (error) {
      setReplanError(error.message);
    } finally {
      setReplanLoading(false);
    }
  }

  async function handleCommit() {
    if (!preview?.previewId) {
      return;
    }

    try {
      setReplanLoading(true);
      setReplanError(null);

      await commitPreview(preview.previewId);

      setPreview(null);

      await refresh();
    } catch (error) {
      setReplanError(error.message);
    } finally {
      setReplanLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Placement Scheduler</h1>

          <p>Coordinator Dashboard</p>
        </div>

        <button className="refresh-button" onClick={refresh}>
          Refresh
        </button>
      </header>

      {metrics && <MetricsBar metrics={metrics} />}

      {error && (
        <div className="error-banner">Failed to load schedule: {error}</div>
      )}

      {replanError && (
        <div className="error-banner">Replan failed: {replanError}</div>
      )}

      <section className="day-tabs">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={selectedDay === day ? "active" : ""}
          >
            Day {day}
          </button>
        ))}
      </section>

      <section className="dashboard-layout">
        <div className="main-column">
          <section className="card">
            <div className="section-header">
              <div>
                <h2>Schedule — Day {selectedDay}</h2>

                <p>Rooms × time slots</p>
              </div>
            </div>

            <ScheduleGrid schedule={schedule} loading={loading} />
          </section>

          <section className="card">
            <h2>Inject Disruption</h2>

            <DisruptionControls
              onPreview={handlePreview}
              loading={replanLoading}
            />
          </section>
        </div>

        <aside className="side-column">
          <section className="card">
            <ConflictsPanel unscheduled={unscheduled} />
          </section>
        </aside>
      </section>

      {preview && (
        <DiffModal
          preview={preview}
          onClose={() => setPreview(null)}
          onCommit={handleCommit}
          loading={replanLoading}
        />
      )}
    </main>
  );
}
