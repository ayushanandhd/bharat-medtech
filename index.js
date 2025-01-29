const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');
const { fileURLToPath } = require('url');


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.render(path.join(__dirname, 'views', 'index.ejs'));
});

io.on('connection', (socket) => {
  socket.on('sendMessage', async (message) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `You are Bharat Medtech, a medical AI assistant. Provide a helpful and accurate response to this medical query: ${message}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Send the response word by word to simulate typing
      const words = text.split(' ');
      let currentText = '';
      
      for (const word of words) {
        currentText += word + ' ';
        socket.emit('botReply', currentText.trim());
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error:', error);
      socket.emit('botReply', 'I apologize, but I encountered an error. Please try again.');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
