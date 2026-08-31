import { useEffect, useRef } from "react";

export function useWebSocket(onScheduleUpdated) {
  const callbackRef = useRef(onScheduleUpdated);

  useEffect(() => {
    callbackRef.current = onScheduleUpdated;
  }, [onScheduleUpdated]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    const socket = new WebSocket(`${protocol}://localhost:3000/ws`);

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

    socket.onerror = () => {
      // Dashboard still works without WS.
      // HTTP refresh remains available.
    };

    return () => {
      socket.close();
    };
  }, []);
}
