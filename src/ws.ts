import { WebSocketServer, WebSocket } from "ws";
import { ChatMessage, ServerMessage } from "./types";
import { pool } from "./db";

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (socket: WebSocket) => {
    console.log("Client connected");

    // 🔹 Send latest 20 messages
    const result = await pool.query(
      `SELECT username, content, created_at 
       FROM messages 
       ORDER BY created_at DESC 
       LIMIT 20`
    );

    result.rows.reverse().forEach((row) => {
      socket.send(JSON.stringify({
        type: "message",
        username: row.username,
        content: row.content,
        createdAt: row.created_at
      }));
    });

    socket.on("message", async (data) => {
      try {
        const msg: ChatMessage = JSON.parse(data.toString());
        if (msg.type !== "message") return;

        // 🔹 Save to DB
        const saved = await pool.query(
          `INSERT INTO messages (username, content)
           VALUES ($1, $2)
           RETURNING created_at`,
          [msg.username, msg.content]
        );

        const serverMsg: ServerMessage = {
          ...msg,
          createdAt: saved.rows[0].created_at
        };

        // 🔹 Broadcast
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(serverMsg));
          }
        });

      } catch {
        console.error("Invalid message");
      }
    });
  });
}
