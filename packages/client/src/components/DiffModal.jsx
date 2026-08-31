import "../styles/DiffModal.css";

export default function DiffModal({ preview, onClose, onCommit, loading }) {
  const diff = preview.diff ?? {};

  const changed = diff.changed ?? [];

  const cancelled = diff.cancelled ?? [];

  const newlyUnscheduled = diff.newlyUnscheduled ?? [];

  const notify = diff.notify ?? [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="diff-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title" onClick={(event) => event.stopPropagation()}>
        <header className="diff-header">
          <div>
            <h2 id="preview-title">Replan Preview</h2>

            <p>Review changes before committing.</p>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="diff-content">
          <DiffSummary changed={changed} cancelled={cancelled} unscheduled={newlyUnscheduled} />

          <section className="diff-section">
          <h3>Changed Interviews</h3>

          {changed.length === 0 ? (
            <EmptyState>No interview positions changed.</EmptyState>
          ) : (
            <div className="change-list">
              {changed.map((change) => (
                <ChangeRow key={change.interviewId} change={change} />
              ))}
            </div>
          )}
          </section>

          <section className="diff-section">
          <h3>Newly Unscheduled</h3>

          {newlyUnscheduled.length === 0 ? (
            <EmptyState>No additional interviews were dropped.</EmptyState>
          ) : (
            newlyUnscheduled.map((item) => (
              <div key={item.interviewId} className="unscheduled-change">
                <strong>{item.interviewId}</strong>

                <span>{item.reason}</span>
              </div>
            ))
          )}
          </section>

          <section className="diff-section">
          <h3>Notifications</h3>

          <NotificationList notifications={notify} />
          </section>
        </div>

        <footer className="diff-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>

          <button
            className="commit-button"
            disabled={loading}
            onClick={onCommit}
          >
            {loading ? "Applying..." : "Commit Replan"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function DiffSummary({ changed, cancelled, unscheduled }) {
  return (
    <div className="diff-summary">
      <SummaryCard value={changed.length} label="Moved" />

      <SummaryCard value={cancelled.length} label="Cancelled" />

      <SummaryCard value={unscheduled.length} label="Newly unscheduled" />
    </div>
  );
}

function SummaryCard({ value, label }) {
  return (
    <div className="summary-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ChangeRow({ change }) {
  return (
    <div className="change-row">
      <strong>{change.interviewId}</strong>

      <div className="before-after">
        <Position label="Before" position={change.before} />

        <span className="arrow">→</span>

        <Position label="After" position={change.after} />
      </div>
    </div>
  );
}

function Position({ label, position }) {
  if (!position) {
    return null;
  }

  return (
    <div className="position">
      <span>{label}</span>

      <strong>
        Day {position.day}
        {" · "}
        {position.time ?? position.startTime ?? position.startMinute}
      </strong>

      <small>
        {position.room ?? position.roomId}
        {" · "}
        {position.panel ?? position.panelId}
      </small>
    </div>
  );
}

function NotificationList({ notifications }) {
  if (notifications.length === 0) {
    return <EmptyState>No notifications required.</EmptyState>;
  }

  return (
    <div className="notification-list">
      {notifications.map((item, index) => (
        <div
          className="notification"
          key={`${index}-${item.studentId ?? item.companyId}`}
        >
          <div>
            <strong>{item.studentId ?? item.companyId ?? "Recipient"}</strong>

            <p>{item.message}</p>
          </div>

          <button onClick={() => navigator.clipboard.writeText(item.message)}>
            Copy
          </button>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>;
}
