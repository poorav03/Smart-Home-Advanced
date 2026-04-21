const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const frontendDir = path.join(__dirname, "frontend");

let deviceState = {
  light: false,
  fan: false,
  doorLocked: true,
  securityMode: false,
  temperature: 24,
  powerLoad: 1.8
};

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".glb": "model/gltf-binary"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream"
    });
    res.end(data);
  });
}

function updateDerivedState() {
  let powerLoad = 0.4;

  if (deviceState.light) {
    powerLoad += 0.6;
  }

  if (deviceState.fan) {
    powerLoad += 0.5;
  }

  if (deviceState.securityMode) {
    powerLoad += 0.2;
  }

  deviceState.powerLoad = Number(powerLoad.toFixed(1));
  deviceState.temperature = deviceState.fan ? 22 : 24;
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/status") {
    updateDerivedState();
    sendJson(res, 200, deviceState);
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/toggle") {
    deviceState.light = !deviceState.light;
    updateDerivedState();
    console.log("Light state:", deviceState.light);
    sendJson(res, 200, deviceState);
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/devices") {
    updateDerivedState();
    sendJson(res, 200, deviceState);
    return;
  }

  if (req.method === "POST" && requestUrl.pathname.startsWith("/device/")) {
    const deviceKey = requestUrl.pathname.replace("/device/", "");
    const toggleableDevices = {
      light: "light",
      fan: "fan",
      door: "doorLocked",
      security: "securityMode"
    };

    const stateKey = toggleableDevices[deviceKey];

    if (!stateKey) {
      sendJson(res, 404, { error: "Unknown device" });
      return;
    }

    deviceState[stateKey] = !deviceState[stateKey];
    updateDerivedState();
    sendJson(res, 200, deviceState);
    return;
  }

  const requestedPath = requestUrl.pathname === "/"
    ? path.join(frontendDir, "index.html")
    : path.join(frontendDir, requestUrl.pathname.replace(/^\/+/, ""));
  const normalizedPath = path.normalize(requestedPath);

  if (!normalizedPath.startsWith(frontendDir)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  sendFile(res, normalizedPath);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});
