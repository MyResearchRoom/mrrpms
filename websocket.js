const WebSocket = require("ws");
const url = require("url");
const jwt = require("jsonwebtoken");
const { getUserProjects } = require("./services/projectService");
const { ADMIN } = require("./utils/constants");

let room = [];
const chatRoom = new Map();

exports.getActiveUsers = (projectId) => {
  const clients = chatRoom.get(projectId) || [];
  return room
    .filter((user) => clients.has(user.ws))
    .map((user) => ({ id: user.id, role: user.role }));
};


exports.sendMessage = (payload, projectId) => {
  try {
    const clients = chatRoom.get(projectId) || new Set();
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    }
    for (const client of room || []) {
      if (
        client.ws.readyState === WebSocket.OPEN &&
        !clients.has(client.ws) &&
        (client.projectIds.includes(projectId) || client.role === ADMIN)
      ) {
        client.ws.send(
          JSON.stringify({
            type: "notification",
            type2: "chat",
            message: payload.message,
          })
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

exports.sendNotification = (payload, projectId, senderId, senderRole) => {
  try {
    for (const client of room || []) {
      if (
        (client.ws.readyState === WebSocket.OPEN &&
          !(client.id === senderId && client.role === senderRole) &&
          client.projectIds.includes(projectId)) ||
        client.role === ADMIN
      ) {
        client.ws.send(JSON.stringify(payload));
      }
    }
  } catch (error) {
    console.log(error);
  }
};

exports.setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", async (ws, req) => {
    const { query } = url.parse(req.url, true);
    const { token } = query;

    if (!token) {
      ws.close(4001, "Token missing");
      return;
    }

    let user;
    try {
      user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch {
      ws.close(4002, "Invalid token");
      return;
    }

    const projectIds = await getUserProjects(user.id, user.role);

    const existingUserIndex = room.findIndex(
      (u) => u.id === user.id && u.role === user.role
    );
    if (existingUserIndex !== -1) room[existingUserIndex].ws = ws;
    else room.push({ id: user.id, role: user.role, projectIds, ws });

    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg);
        const { type, projectId } = data;
        if (type === "join") {
          if (!projectIds.includes(projectId) && user.role !== ADMIN) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Access denied to project",
              })
            );
            return;
          }

          if (!chatRoom.has(projectId)) {
            chatRoom.set(projectId, new Set());
          }
          chatRoom.get(projectId).add(ws);
          ws.send(JSON.stringify({ type: "joined" }));
        }

        if (type === "leave") {
          if (!projectIds.includes(projectId) && user.role !== ADMIN) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Access denied to project",
              })
            );
            return;
          }
          if (chatRoom.has(projectId)) {
            chatRoom.get(projectId).delete(ws);
          }
          ws.send(JSON.stringify({ type: "left" }));
        }
      } catch (err) {
        console.error("Invalid message format", err);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" })
        );
      }
    });

    ws.send(
      JSON.stringify({ type: "info", message: "Connected to WebSocket server" })
    );

    ws.on("close", () => {
      room = room.filter((u) => u.ws !== ws);
      for (const [projectId, clients] of chatRoom) {
        if (clients.has(ws)) {
          clients.delete(ws);
        }
      }
    });
  });

  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  console.log("✅ WebSocket server initialized");
};
