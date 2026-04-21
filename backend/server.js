const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let deviceState = {
    light: false
};

// GET status
app.get("/status", (req, res) => {
    res.json(deviceState);
});

// TOGGLE device
app.post("/toggle", (req, res) => {
    deviceState.light = !deviceState.light;
    console.log("Light state:", deviceState.light);
    res.json(deviceState);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});