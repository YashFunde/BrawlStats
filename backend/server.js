const express = require("express");
const cors = require("cors");
require("dotenv").config();

const playerRoute = require("./routes/player");
const battlelogRoute = require("./routes/battlelog");

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());


// API Routes
app.use("/api/player", playerRoute);
app.use("/api/battlelog", battlelogRoute);


// Health Check
app.get("/", (req, res) => {
    res.json({
        message: "BrawlStats API is running!"
    });
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});