const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const frontendDir = path.join(__dirname, "frontend");

let deviceState = {
  light: false
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
    sendJson(res, 200, deviceState);
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/toggle") {
    deviceState.light = !deviceState.light;
    console.log("Light state:", deviceState.light);
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
