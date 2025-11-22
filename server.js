const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Socket.IO server is running!");
});

const http = require("http").createServer(app);

const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Lắng nghe client connect
io.on("connection", socket => {
    console.log("Client connected:", socket.id);

    // Khi client gửi tin nhắn
    socket.on("chat_message", msg => {
        console.log("Message:", msg);

        // Gửi lại cho tất cả client
        io.emit("chat_message", msg);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Chạy server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
