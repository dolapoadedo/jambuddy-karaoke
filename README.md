# 🎵 JamBuddy - Real-time Singing App

A real-time karaoke application where two users can be paired together and sing along to YouTube videos with synchronized lyrics and live chat.

## ✨ Features

- **Real-time Matching**: Instantly pairs users who want to sing together
- **Synchronized Lyrics**: Perfectly timed lyrics that highlight as the song plays
- **YouTube Integration**: Embedded YouTube videos with synchronized player controls
- **Live Chat**: Real-time messaging between singing partners
- **Responsive Design**: Beautiful, mobile-friendly interface with dark mode
- **Socket.io Real-time**: Seamless real-time communication and synchronization

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Video**: react-youtube (YouTube Player API)
- **Real-time**: Socket.io for WebSocket communication
- **Storage**: In-memory (no database required)

## 📁 Project Structure

```
karaoke-song-app/
├── components/
│   ├── LyricsDisplay.js      # Synchronized lyrics component
│   └── ChatBox.js            # Real-time chat component
├── pages/
│   ├── _app.js               # Next.js app wrapper
│   ├── index.js              # Home page with partner matching
│   └── room/[roomId].js      # Karaoke room with player & lyrics
├── server/
│   ├── package.json          # Server dependencies
│   └── server.js             # Express + Socket.io server
├── data/
│   └── songs.json            # Song data with timed lyrics
├── styles/
│   └── globals.css           # Global styles and Tailwind
├── package.json              # Frontend dependencies
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Clone or download the project**
```bash
# If you're in the project directory already, skip this step
cd karaoke-song-app
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install server dependencies**
```bash
cd server
npm install
cd ..
```

4. **Start both frontend and backend**
```bash
# Option 1: Start both with one command
npm run dev:all

# Option 2: Start separately (use two terminal windows)
# Terminal 1 - Start the server
npm run server

# Terminal 2 - Start the frontend
npm run dev
```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🎵 Available Songs

The app comes with 5 popular karaoke songs pre-loaded with timed lyrics:

1. **Don't Stop Believin'** - Journey
2. **Bohemian Rhapsody** - Queen  
3. **Sweet Caroline** - Neil Diamond
4. **Livin' on a Prayer** - Bon Jovi
5. **Mr. Brightside** - The Killers

## 🎮 How to Use

### For Users

1. **Find a Partner**
   - Visit http://localhost:3000
   - Click "🎤 Find a Singing Partner"
   - Wait to be matched with another user

2. **Sing Together**
   - Once matched, you'll be taken to a karaoke room
   - The YouTube video will be embedded at the top
   - Lyrics will appear below, highlighting the current line
   - Use the chat on the right to communicate
   - Player controls are synchronized between both users

3. **Chat & Enjoy**
   - Send messages to your singing partner
   - Leave the room anytime with the "Leave Room" button

### For Testing (Solo)

To test the app by yourself:

1. Open two browser windows/tabs to http://localhost:3000
2. Click "Find a Partner" in both windows
3. They will be automatically matched together
4. You can now test all features with both windows

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001
```

### Adding New Songs

Edit `data/songs.json` to add new songs:

```json
{
  "id": 6,
  "title": "Your Song Title",
  "artist": "Artist Name", 
  "youtubeId": "YouTube_Video_ID",
  "duration": 240,
  "lyrics": [
    { "time": 0, "text": "First line of lyrics" },
    { "time": 3.5, "text": "Second line..." }
  ]
}
```

**Getting YouTube Video ID**: From a URL like `https://www.youtube.com/watch?v=ABC123`, the ID is `ABC123`.

**Timing Lyrics**: Use the YouTube video's timestamp to sync lyrics accurately.

## 🧪 API Endpoints

The server provides these endpoints:

- `GET /api/songs` - Get all available songs
- `GET /api/stats` - Get current app statistics  
- `GET /health` - Health check

## 🌐 Socket.io Events

### Client → Server
- `find-partner` - Join the matching queue
- `cancel-search` - Leave the matching queue
- `join-room` - Join a karaoke room
- `sync-player` - Synchronize YouTube player state
- `chat-message` - Send a chat message
- `leave-room` - Leave the current room

### Server → Client
- `partner-found` - Notify when a partner is found
- `searching` - Update queue status
- `room-data` - Send room information
- `partner-joined` - Notify when partner joins
- `partner-left` - Notify when partner leaves
- `sync-player` - Receive player synchronization
- `chat-message` - Receive chat messages

## 🎨 Customization

### Styling
- Edit `styles/globals.css` for custom styles
- Modify `tailwind.config.js` for theme changes
- Update CSS classes in components for design changes

### Lyrics Display
- Adjust timing sensitivity in `components/LyricsDisplay.js`
- Change highlight colors in the CSS
- Modify the lyrics window size (currently shows 7 lines)

### Matching Logic
- Edit `server/server.js` to change matching algorithms
- Add user preferences, song selection, etc.

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy the .next folder to Vercel
```

### Backend (Railway/Heroku)
```bash
cd server
# Deploy the server folder to your hosting platform
```

### Environment Variables for Production
- Update `NEXT_PUBLIC_SOCKET_SERVER_URL` to your production server URL
- Configure CORS origins in `server/server.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.

## 🎤 Have Fun!

Enjoy singing with friends and strangers from around the world! 🌍🎵

---

**Need help?** Check the console logs in both the browser and server terminal for debugging information. 