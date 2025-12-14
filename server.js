const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const userSockets = {}; // Map username => socket.id

app.get("/", (req, res) => {
    res.send("Socket.IO server is running!");
});

io.on("connection", socket => {
    console.log("Client connected:", socket.id);

    socket.on("identify", data => {
        const username = data.username;
        userSockets[username] = socket.id;
        console.log(`✅ ${username} registered with socket ID ${socket.id}`);
    });

    // Nhận tin nhắn nội bộ và broadcast lại
    socket.on("chat_message", msg => {
        console.log("📩 Public:", msg);
        io.emit("chat_message", msg);
    });

    // Nhận tin nhắn riêng và chuyển đến người nhận
    socket.on("private_message", msg => {
        console.log("📩 Private from", msg.from, "to", msg.to);
        const toId = userSockets[msg.to];
        if (toId) {
            io.to(toId).emit("private_message", msg);
        } else {
            console.log("❌ Không tìm thấy người nhận:", msg.to);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        for (let user in userSockets) {
            if (userSockets[user] === socket.id) {
                console.log(`❌ ${user} has disconnected.`);
                delete userSockets[user];
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
