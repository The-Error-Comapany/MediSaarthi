import React, { useEffect, useRef } from "react";
import {io} from "socket.io-client";
import Plotly from "plotly.js-dist";

const SOCKET_URL = "http://localhost:8000";

export default function RealtimeAdherence({ userId }) {
  const plotRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    const socket = io(SOCKET_URL, { query: { userId } });

    socket.on("adherence_update", (data) => {
      const { labels, taken, missed } = data;
      const traces = [
        { x: labels, y: taken, name: "Taken", type: "bar", marker: { color: "#4caf50" } },
        { x: labels, y: missed, name: "Missed", type: "bar", marker: { color: "#f44336" } },
      ];
      const layout = { title: "Medicine Adherence (Live)", barmode: "group" };
      Plotly.react(plotRef.current, traces, layout);
    });

    return () => socket.disconnect();
  }, [userId]);

  return <div ref={plotRef} style={{ width: "100%", height: "450px" }} />;
}
