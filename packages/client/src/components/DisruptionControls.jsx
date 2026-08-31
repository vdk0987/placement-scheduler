import { useState } from "react";

import "../styles/DisruptionControls.jsx";

const INITIAL_VALUES = {
  companyId: "",
  hours: 3,

  panelId: "",

  studentId: "",

  roomId: "",
  day: 1,
  from: "09:00",
  to: "12:00",
};

export default function DisruptionControls({ onPreview, loading }) {
  const [type, setType] = useState("company-late");

  const [values, setValues] = useState(INITIAL_VALUES);

  function update(field, value) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = buildPayload(type, values);

    onPreview(type, payload);
  }

  return (
    <form className="disruption-controls" onSubmit={handleSubmit}>
      <div className="disruption-types">
        <TypeButton
          active={type === "company-late"}
          onClick={() => setType("company-late")}
        >
          Company Late
        </TypeButton>

        <TypeButton
          active={type === "panel-drop"}
          onClick={() => setType("panel-drop")}
        >
          Panel Drop
        </TypeButton>

        <TypeButton
          active={type === "student-withdraw"}
          onClick={() => setType("student-withdraw")}
        >
          Student Withdraw
        </TypeButton>

        <TypeButton
          active={type === "room-unavailable"}
          onClick={() => setType("room-unavailable")}
        >
          Room Unavailable
        </TypeButton>
      </div>

      {type === "company-late" && (
        <div className="control-fields">
          <Field label="Company ID">
            <input
              required
              value={values.companyId}
              onChange={(event) => update("companyId", event.target.value)}
              placeholder="company-01"
            />
          </Field>

          <Field label="Hours late">
            <input
              required
              min="1"
              type="number"
              value={values.hours}
              onChange={(event) => update("hours", Number(event.target.value))}
            />
          </Field>
        </div>
      )}

      {type === "panel-drop" && (
        <Field label="Panel ID">
          <input
            required
            value={values.panelId}
            onChange={(event) => update("panelId", event.target.value)}
            placeholder="company-01-panel-1"
          />
        </Field>
      )}

      {type === "student-withdraw" && (
        <Field label="Student ID">
          <input
            required
            value={values.studentId}
            onChange={(event) => update("studentId", event.target.value)}
            placeholder="student-0001"
          />
        </Field>
      )}

      {type === "room-unavailable" && (
        <div className="control-fields">
          <Field label="Room ID">
            <input
              required
              value={values.roomId}
              onChange={(event) => update("roomId", event.target.value)}
              placeholder="room-01"
            />
          </Field>

          <Field label="Day">
            <select
              value={values.day}
              onChange={(event) => update("day", Number(event.target.value))}
            >
              {[1, 2, 3, 4].map((day) => (
                <option key={day} value={day}>
                  Day {day}
                </option>
              ))}
            </select>
          </Field>

          <Field label="From">
            <input
              type="time"
              value={values.from}
              onChange={(event) => update("from", event.target.value)}
            />
          </Field>

          <Field label="To">
            <input
              type="time"
              value={values.to}
              onChange={(event) => update("to", event.target.value)}
            />
          </Field>
        </div>
      )}

      <button type="submit" disabled={loading} className="preview-button">
        {loading ? "Calculating..." : "Preview Replan"}
      </button>
    </form>
  );
}

function TypeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      className={active ? "disruption-type active" : "disruption-type"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="control-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function buildPayload(type, values) {
  switch (type) {
    case "company-late":
      return {
        companyId: values.companyId,
        hours: values.hours,
      };

    case "panel-drop":
      return {
        panelId: values.panelId,
      };

    case "student-withdraw":
      return {
        studentId: values.studentId,
      };

    case "room-unavailable":
      return {
        roomId: values.roomId,
        day: values.day,
        from: values.from,
        to: values.to,
      };

    default:
      return {};
  }
}
