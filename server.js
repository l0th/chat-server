package com.demo.chat;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
import org.json.JSONObject;

import javax.swing.*;
import java.net.URISyntaxException;

public class SocketClient {
    private Socket socket;
    private JTextArea messageArea;
    private String username;

    public SocketClient(JTextArea messageArea, String username) {
        this.messageArea = messageArea;
        this.username = username;
        try {
            socket = IO.socket("https://chat-server-5s97.onrender.com");
            socket.on(Socket.EVENT_CONNECT, args -> {
                appendMessage("[System] Đã kết nối tới máy chủ chat.");
                socket.emit("register", username); // Đăng ký username khi kết nối
            });
            socket.on("chat_message", onChatMessage);
            socket.on("private_message", onPrivateMessage);
            socket.connect();
        } catch (URISyntaxException e) {
            appendMessage("[Lỗi] Không thể kết nối: " + e.getMessage());
        }
    }

    public void sendMessage(String username, String message) {
        JSONObject msg = new JSONObject();
        msg.put("username", username);
        msg.put("message", message);
        System.out.println("📤 Sending (public): " + msg);
        socket.emit("chat_message", msg);
    }

    public void sendPrivateMessage(JSONObject msg) {
        System.out.println("📤 Sending (private): " + msg);
        socket.emit("private_message", msg);
    }

    private final Emitter.Listener onChatMessage = args -> {
        JSONObject msg = (JSONObject) args[0];
        System.out.println("📥 Received from server (public): " + msg);
        String text = msg.getString("username") + ": " + msg.getString("message");
        appendMessage(text);
    };

    private final Emitter.Listener onPrivateMessage = args -> {
        JSONObject msg = (JSONObject) args[0];
        System.out.println("📥 Received from server (private): " + msg);
        String from = msg.optString("from", "???");
        String text = from + " (riêng): " + msg.getString("message");
        appendMessage(text);
    };

    private void appendMessage(String msg) {
        SwingUtilities.invokeLater(() -> messageArea.append(msg + "\n"));
    }
}
