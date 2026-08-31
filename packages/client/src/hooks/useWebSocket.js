import { useEffect, useRef } from "react";

export function useWebSocket(onScheduleUpdated) {
  const callbackRef = useRef(onScheduleUpdated);

  useEffect(() => {
    callbackRef.current = onScheduleUpdated;
  }, [onScheduleUpdated]);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL;

    if (!wsUrl) {
      console.warn("VITE_WS_URL is not configured");

      return;
    }

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "schedule:updated") {
          callbackRef.current?.();
        }
      } catch (error) {
        console.error("Invalid WebSocket message", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    return () => {
      socket.close();
    };
  }, []);
}
