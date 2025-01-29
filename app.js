import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app); // Keep this for Socket.IO
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'))); // Use path.join for consistency

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.render('index');
});

io.on('connection', (socket) => {
  socket.on('sendMessage', async (message) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `You are Bharat Medtech, a medical AI assistant. Provide a helpful and accurate response to this medical query: ${message}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Send the response word by word to simulate typing (consider optimization below)
      const words = text.split(' ');
      let currentText = '';

      for (const word of words) {
        currentText += word + ' ';
        socket.emit('botReply', currentText.trim());
        await new Promise(resolve => setTimeout(resolve, 50)); // Slightly faster typing
      }
      socket.emit('botReplyDone'); // Signal the client that the response is complete

    } catch (error) {
      console.error('Error:', error);
      socket.emit('botReply', 'I apologize, but I encountered an error. Please try again.');
    }
  });
});


// Vercel Specific:  Use process.env.PORT or 3000
const PORT = process.env.PORT || 3000;

// IMPORTANT:  Listen on the server object, not just app
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// For Vercel, you might not need this, but it's good to have for local development
export default app; // Export the app for potential testing or other uses