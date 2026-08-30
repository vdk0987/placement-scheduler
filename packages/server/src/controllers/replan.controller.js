import {
  runReplan,
  normalizeReplanResult,
} from "../services/replan.service.js";

import { computeMetrics } from "../../../engine/metrics.js";

export function createReplanController({ store, websocketServer }) {
  function preview(type) {
    return (req, res, next) => {
      try {
        const result = runReplan({
          type,
          payload: req.body,
          store,
        });

        const normalized = normalizeReplanResult(result);

        const dataset = store.getDataset();

        const nextState = {
          schedule: normalized.schedule,
          unscheduled: normalized.unscheduled,
          metrics: computeMetrics({
            schedule: normalized.schedule,
            unscheduled: normalized.unscheduled,
            rooms: dataset.rooms,
          }),
        };

        const preview = store.createPreview({
          disruption: {
            type,
            target: extractTarget(type, req.body),
            params: req.body,
          },
          nextState,
          diff: normalized.diff,
        });

        res.status(200).json({
          success: true,
          mode: "preview",
          ...preview,
          nextMetrics: nextState.metrics,
        });
      } catch (error) {
        next(error);
      }
    };
  }

  function getPreview(req, res) {
    const preview = store.getPreview();

    if (!preview) {
      return res.status(404).json({
        success: false,
        message: "No pending replan preview exists",
      });
    }

    res.json({
      success: true,
      ...preview,
    });
  }

  function commit(req, res, next) {
    try {
      const { previewId } = req.body ?? {};

      const committed = store.commitPreview(previewId);

      websocketServer.broadcast("schedule:updated", {
        schedule: committed.state.schedule,
        metrics: committed.state.metrics,
        diff: committed.diff,
        disruption: committed.disruption,
      });

      res.status(200).json({
        success: true,
        message: "Replan committed successfully",
        previewId: committed.previewId,
        diff: committed.diff,
        metrics: committed.state.metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    preview,
    getPreview,
    commit,
  };
}

function extractTarget(type, payload) {
  switch (type) {
    case "company-late":
      return payload.companyId;

    case "panel-drop":
      return payload.panelId;

    case "student-withdraw":
      return payload.studentId;

    case "room-unavailable":
      return payload.roomId;

    default:
      return null;
  }
}
