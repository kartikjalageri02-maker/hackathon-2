import asyncio
from datetime import datetime, timezone
from typing import Set, Dict, Any
from fastapi import WebSocket


class WebSocketHub:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.seq = 0
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self.lock:
            self.active_connections.discard(websocket)

    async def broadcast(self, msg_type: str, payload: Any, machine_id: str | None = None):
        if not self.active_connections:
            return

        async with self.lock:
            self.seq += 1
            current_seq = self.seq

        envelope = {
            "type": msg_type,
            "seq": current_seq,
            "ts": datetime.now(timezone.utc).isoformat(),
            "machine_id": machine_id,
            "payload": payload,
        }

        # Send concurrently to all connected clients
        disconnected = set()
        for conn in list(self.active_connections):
            try:
                await conn.send_json(envelope)
            except Exception:
                disconnected.add(conn)

        if disconnected:
            async with self.lock:
                self.active_connections.difference_update(disconnected)


ws_hub = WebSocketHub()
