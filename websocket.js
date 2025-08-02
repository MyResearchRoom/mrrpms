// const WebSocket = require("ws");
// const url = require("url");
// const jwt = require("jsonwebtoken");

// let room = [];
// const chatRoom = new Map();

// exports.sendMessage = (payload, projectId) => {
//   try {
//     for (const client of chatRoom.get(projectId) || []) {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify(payload));
//       }
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// exports.sendNotification = (payload, projectId, senderId, senderRole) => {
//   return;
//   try {
//     for (const client of room || []) {
//       if (
//         client.ws.readyState === WebSocket.OPEN &&
//         !(client.id === senderId && client.role === senderRole)
//       ) {
//         client.ws.send(JSON.stringify(payload));
//       }
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// exports.setupWebSocket = (server) => {
//   const wss = new WebSocket.Server({ server });

//   wss.on("connection", async (ws, req) => {
//     const { query } = url.parse(req.url, true);
//     const { token } = query;

//     if (!token) {
//       ws.close(4001, "Invalid token");
//       return;
//     }

//     let user;
//     try {
//       user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     } catch (err) {
//       ws.close(4002, "Invalid token");
//       return;
//     }

//     if (
//       !room.some((u) => u.id === user.id && u.role === user.role && u.ws === ws)
//     ) {
//       room.push({
//         id: user.id,
//         role: user.role,
//         ws,
//       });
//     }

//     ws.on("message", (message) => {
//       try {
//         const data = JSON.parse(message);
//         if (data.type === "join") {
//           ws.projectId = data.projectId;
//           if (!chatRoom.has(data.projectId))
//             chatRoom.set(data.projectId, new Set());
//           chatRoom.get(data.projectId).add(ws);
//         }
//       } catch (err) {
//         console.error("Invalid message format", err);
//       }
//     });

//     ws.send(JSON.stringify({ message: "Connected" }));

//     ws.on("close", () => {
//       room = room.filter((client) => client !== ws);
//     });
//   });

//   console.log("WebSocket server initialized");
// };

const WebSocket = require("ws");
const url = require("url");
const jwt = require("jsonwebtoken");
const { getUserProjects } = require("./services/projectService");

let room = [];
const chatRoom = new Map();

exports.sendMessage = (payload, projectId) => {
  try {
    for (const client of chatRoom.get(projectId) || []) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
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
        client.ws.readyState === WebSocket.OPEN &&
        !(client.id === senderId && client.role === senderRole) &&
        client.projectIds.includes(projectId)
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
      ws.close(4001, "Invalid token");
      return;
    }

    let user;
    try {
      user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      ws.close(4002, "Invalid token");
      return;
    }

    if (
      !room.some((u) => u.id === user.id && u.role === user.role && u.ws === ws)
    ) {
      const projectIds = await getUserProjects(user.id, user.role);
      room.push({
        id: user.id,
        role: user.role,
        projectIds,
        ws,
      });
    }

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "join") {
          ws.projectId = data.projectId;
          if (!chatRoom.has(data.projectId))
            chatRoom.set(data.projectId, new Set());
          chatRoom.get(data.projectId).add(ws);
        }
      } catch (err) {
        console.error("Invalid message format", err);
      }
    });

    ws.send(JSON.stringify({ message: "Connected" }));

    ws.on("close", () => {
      room = room.filter((client) => client !== ws);
    });
  });

  console.log("WebSocket server initialized");
};
