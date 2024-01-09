const WebSocket = require("ws");

const handleWesocket = function (server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    console.log("connected");

    ws.on("message", (message) => {
      const msgStr = message.toString();

      // sending notification to every device who accept notification permission
      wss.clients.forEach((client) => {
        if (ws !== client && client.readyState === WebSocket.OPEN) {
          client.send(msgStr);
        }
      });
    });

    ws.on("close", () => {
      console.log("connection closed");
    });
  });

  return wss;
};

module.exports = handleWesocket;
