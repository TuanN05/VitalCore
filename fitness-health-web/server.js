// Nạp các thư viện cần thiết
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Nạp các biến môi trường từ file .env

// Khởi tạo ứng dụng express
const app = express();
const port = 3000; // Cổng mà server sẽ lắng nghe

// Sử dụng middleware
app.use(cors()); // Cho phép các yêu cầu từ nguồn khác (frontend)
app.use(express.json()); // Cho phép server đọc dữ liệu JSON từ request

// Khởi tạo model AI của Google
// Lấy API key từ biến môi trường đã được nạp từ file .env
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Tạo một "endpoint" API tên là /chat
// Frontend sẽ gửi yêu cầu POST đến địa chỉ này
app.post("/chat", async (req, res) => {
  try {
    // Lấy tin nhắn của người dùng từ body của request
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Gửi tin nhắn đến Gemini và chờ kết quả
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const aiReply = response.text();

    // Trả về câu trả lời của AI cho frontend
    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Error calling Google AI:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
