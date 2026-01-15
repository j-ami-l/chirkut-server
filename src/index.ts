import express from "express";
import http from "http";
import cors from "cors";
import "dotenv/config";
import { setupWebSocket } from "./ws";

const app = express();
app.use(cors());

app.get("/", (_, res) => {
  res.send("Global Chat Backend Running");
});

const server = http.createServer(app);
setupWebSocket(server);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
