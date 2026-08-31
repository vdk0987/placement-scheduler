import { getMetrics, getSchedule, getUnscheduled } from "../api/client.js";

import { useCallback, useEffect, useState } from "react";

export function useSchedule(selectedDay) {
  const [schedule, setSchedule] = useState([]);

  const [unscheduled, setUnscheduled] = useState([]);

  const [metrics, setMetrics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [scheduleResponse, unscheduledResponse, metricsResponse] =
        await Promise.all([
          getSchedule(selectedDay),
          getUnscheduled(),
          getMetrics(),
        ]);

      setSchedule(scheduleResponse.schedule ?? scheduleResponse.data ?? []);

      setUnscheduled(
        unscheduledResponse.unscheduled ?? unscheduledResponse.data ?? [],
      );

      setMetrics(
        metricsResponse.metrics ?? metricsResponse.data ?? metricsResponse,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    schedule,
    unscheduled,
    metrics,

    loading,
    error,

    refresh,
  };
}
