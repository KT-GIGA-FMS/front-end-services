"use client";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useEffect, useRef, useState } from "react";

const HTTP_URL =  process.env.NEXT_PUBLIC_SOCKJS_HTTP || "";

export default function StompSockJsProbe({ topic = "/topic/telemetry", sendDest = "/app/ping" }) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [last, setLast] = useState("");

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(HTTP_URL), // ← 서버의 withSockJS()와 매칭
      reconnectDelay: 1000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (m) => console.log("[STOMP]", m),
      onConnect: () => {
        setConnected(true);
        client.subscribe(topic, (msg) => setLast(msg.body));
        client.publish({
          destination: sendDest,
          body: JSON.stringify({ hi: "front", ts: Date.now() }),
        });
      },
      onStompError: (f) => console.error("STOMP error:", f.headers["message"], f.body),
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;
    return () => client.deactivate();
  }, [topic, sendDest]);

  return (
    <div className="p-4 border rounded">
      <div>connected: {String(connected)}</div>
      <pre className="text-xs mt-2 whitespace-pre-wrap break-all">{last}</pre>
    </div>
  );
}
