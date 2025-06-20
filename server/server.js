const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const { nanoid } = require('nanoid')
const fs = require('fs')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002"],
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002"],
  methods: ["GET", "POST"]
}))
app.use(express.json())

// Load songs data
const songsData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'songs.json'), 'utf8'))

// In-memory storage
const matchingQueue = []
const activeRooms = new Map()
const userRooms = new Map() // Track which room each user is in

// Helper function to get random song
function getRandomSong() {
  const songs = songsData.songs
  return songs[Math.floor(Math.random() * songs.length)]
}

// Helper function to create a new room
function createRoom(user1, user2) {
  const roomId = nanoid(8)
  const song = getRandomSong()
  
  const room = {
    id: roomId,
    song,
    users: [
      { id: user1.id, username: user1.username, socketId: user1.socketId },
      { id: user2.id, username: user2.username, socketId: user2.socketId }
    ],
    messages: [],
    createdAt: Date.now()
  }
  
  activeRooms.set(roomId, room)
  userRooms.set(user1.id, roomId)
  userRooms.set(user2.id, roomId)
  
  return room
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Handle find partner request
  socket.on('find-partner', () => {
    const user = {
      id: socket.id,
      username: `Singer${Math.floor(Math.random() * 1000)}`,
      socketId: socket.id,
      joinedAt: Date.now()
    }

    // Add user to queue
    matchingQueue.push(user)
    console.log(`User ${socket.id} joined matching queue. Queue length: ${matchingQueue.length}`)

    // Emit queue status
    socket.emit('searching', { queueLength: matchingQueue.length })

    // Try to match users
    if (matchingQueue.length >= 2) {
      const user1 = matchingQueue.shift()
      const user2 = matchingQueue.shift()

      // Create room
      const room = createRoom(user1, user2)

      // Join both users to the room
      const socket1 = io.sockets.sockets.get(user1.socketId)
      const socket2 = io.sockets.sockets.get(user2.socketId)

      if (socket1 && socket2) {
        // Join both users to the Socket.IO room
        socket1.join(room.id)
        socket2.join(room.id)

        // Notify both users with complete room data
        socket1.emit('partner-found', {
          roomId: room.id,
          song: room.song,
          partner: user2.username
        })

        socket2.emit('partner-found', {
          roomId: room.id,
          song: room.song,
          partner: user1.username
        })

        // Mark room as newly created to allow flexible joining
        room.isNewlyCreated = true
        room.createdAt = Date.now()
        
        // Automatically clear the newly created flag after 30 seconds
        setTimeout(() => {
          if (room.isNewlyCreated) {
            room.isNewlyCreated = false
            console.log(`Room ${room.id} newly-created flag cleared after timeout`)
          }
        }, 30000) // 30 second grace period

        console.log(`\n=== ROOM CREATION DEBUG ===`)
        console.log(`✅ Match created! Room: ${room.id}`)
        console.log(`Song: ${room.song.title}`)
        console.log(`User 1: ${user1.username} (${user1.socketId})`)
        console.log(`User 2: ${user2.username} (${user2.socketId})`)
        console.log(`Room users count: ${room.users.length}`)
        console.log(`Active rooms after creation:`, Array.from(activeRooms.keys()))
        console.log(`=============================\n`)
      } else {
        console.error(`Failed to find sockets for matched users: ${user1.socketId}, ${user2.socketId}`)
      }
    }

    // Update queue status for remaining users
    matchingQueue.forEach(queuedUser => {
      const queuedSocket = io.sockets.sockets.get(queuedUser.socketId)
      if (queuedSocket) {
        queuedSocket.emit('searching', { queueLength: matchingQueue.length })
      }
    })
  })

  // Handle cancel search
  socket.on('cancel-search', () => {
    const userIndex = matchingQueue.findIndex(user => user.socketId === socket.id)
    if (userIndex !== -1) {
      matchingQueue.splice(userIndex, 1)
      console.log(`User ${socket.id} left matching queue. Queue length: ${matchingQueue.length}`)
      
      // Update queue status for remaining users
      matchingQueue.forEach(queuedUser => {
        const queuedSocket = io.sockets.sockets.get(queuedUser.socketId)
        if (queuedSocket) {
          queuedSocket.emit('searching', { queueLength: matchingQueue.length })
        }
      })
    }
  })

  // Handle join room
  socket.on('join-room', ({ roomId, username }) => {
    console.log(`\n=== JOIN ROOM DEBUG ===`)
    console.log(`User ${socket.id} attempting to join room ${roomId}`)
    console.log(`Username: ${username}`)
    console.log(`Active rooms:`, Array.from(activeRooms.keys()))
    
    const room = activeRooms.get(roomId)
    if (!room) {
      console.log(`❌ Room ${roomId} not found!`)
      console.log(`All rooms data:`, Array.from(activeRooms.entries()).map(([id, r]) => ({
        id, 
        users: r.users.map(u => ({ username: u.username, socketId: u.socketId })),
        isNewlyCreated: r.isNewlyCreated,
        createdAt: new Date(r.createdAt).toISOString()
      })))
      socket.emit('error', { message: 'Room not found' })
      return
    }
    
    console.log(`✅ Room ${roomId} found!`)
    console.log(`Room users:`, room.users.map(u => ({ username: u.username, socketId: u.socketId })))
    console.log(`Room isNewlyCreated: ${room.isNewlyCreated}`)
    console.log(`Current socket ID: ${socket.id}`)
    console.log(`========================\n`)

    socket.join(roomId)
    userRooms.set(socket.id, roomId)

    // Find or create user in room
    let user = room.users.find(u => u.socketId === socket.id)
    if (!user) {
      // Try to find disconnected user (old socket ID no longer exists)
      user = room.users.find(u => !io.sockets.sockets.get(u.socketId))
      if (user) {
        console.log(`Updating socket ID for user ${user.username}: ${user.socketId} -> ${socket.id}`)
        user.socketId = socket.id
      } else if (room.users.length < 2) {
        // If we still can't find the user and room isn't full, create a new user entry
        user = {
          id: socket.id,
          username: username || `Singer${Math.floor(Math.random() * 1000)}`,
          socketId: socket.id
        }
        room.users.push(user)
        console.log(`Created new user entry for ${user.username} in room ${roomId}`)
      } else {
        // Room is full but we couldn't match the user - this shouldn't happen normally
        console.log(`Warning: Room ${roomId} is full but couldn't match user ${socket.id}`)
      }
    }

    // Update username if provided
    if (user && username) {
      user.username = username
    }

    // Send room data to user
    const partner = room.users.find(u => u.socketId !== socket.id)
    socket.emit('room-data', {
      song: room.song,
      partner: partner ? partner.username : null,
      messages: room.messages || []
    })

    // Notify partner if they exist and are connected
    if (partner) {
      const partnerSocket = io.sockets.sockets.get(partner.socketId)
      if (partnerSocket) {
        partnerSocket.emit('partner-joined', { partner: username || user?.username })
      }
    }

    // Clear newly created flag once both users are connected
    const connectedUsers = room.users.filter(u => io.sockets.sockets.get(u.socketId))
    if (connectedUsers.length === 2 && room.isNewlyCreated) {
      room.isNewlyCreated = false
      console.log(`Room ${roomId} fully initialized with both users`)
    }

    console.log(`User ${socket.id} joined room ${roomId}, partner: ${partner ? partner.username : 'none'}, connected users: ${connectedUsers.length}/2`)
  })

  // Handle player synchronization
  socket.on('sync-player', ({ roomId, action, time }) => {
    const room = activeRooms.get(roomId)
    if (!room) return

    // Broadcast to other users in the room (not including sender)
    socket.to(roomId).emit('sync-player', { action, time })
    console.log(`Player sync in room ${roomId}: ${action}${time !== undefined ? ` at ${time}s` : ''}`)
  })

  // Handle chat messages
  socket.on('chat-message', ({ roomId, username, text, timestamp }) => {
    console.log(`\n=== CHAT MESSAGE DEBUG ===`)
    console.log(`Socket ${socket.id} sending chat message`)
    console.log(`Room ID: ${roomId}`)
    console.log(`Username: ${username}`)
    console.log(`Text: ${text}`)
    
    const room = activeRooms.get(roomId)
    if (!room) {
      console.log(`❌ Room ${roomId} not found for chat message!`)
      console.log(`Active rooms:`, Array.from(activeRooms.keys()))
      return
    }

    console.log(`✅ Room found. Users in room:`, room.users.map(u => ({ username: u.username, socketId: u.socketId })))
    
    // Check if the sender is actually in the room
    const senderInRoom = room.users.find(u => u.socketId === socket.id)
    console.log(`Sender in room:`, senderInRoom ? 'YES' : 'NO')

    const message = {
      username,
      text,
      timestamp: timestamp || Date.now()
    }

    // Store message in room
    room.messages.push(message)
    console.log(`Message stored. Total messages in room: ${room.messages.length}`)

    // Broadcast to all users in the room
    const socketsInRoom = io.sockets.adapter.rooms.get(roomId)
    console.log(`Sockets in Socket.IO room:`, socketsInRoom ? Array.from(socketsInRoom) : 'NONE')
    
    io.to(roomId).emit('chat-message', message)
    console.log(`✅ Chat message broadcasted to room ${roomId}`)
    console.log(`=========================\n`)
  })

  // Handle leave room
  socket.on('leave-room', ({ roomId }) => {
    handleUserLeaveRoom(socket, roomId)
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
    
    // Remove from matching queue
    const queueIndex = matchingQueue.findIndex(user => user.socketId === socket.id)
    if (queueIndex !== -1) {
      matchingQueue.splice(queueIndex, 1)
      console.log(`User ${socket.id} removed from queue. Queue length: ${matchingQueue.length}`)
    }

    // Don't immediately clean up rooms on disconnect - users might be reconnecting
    // Only clean up if they were actually in a room and it's not newly created
    const roomId = userRooms.get(socket.id)
    if (roomId) {
      const room = activeRooms.get(roomId)
      if (room && !room.isNewlyCreated) {
        handleUserLeaveRoom(socket, roomId)
      } else if (room) {
        console.log(`User ${socket.id} disconnected from newly created room ${roomId}, not cleaning up yet`)
      }
    }
  })

  function handleUserLeaveRoom(socket, roomId) {
    const room = activeRooms.get(roomId)
    if (!room) return

    // Find the leaving user
    const leavingUser = room.users.find(u => u.socketId === socket.id)
    if (!leavingUser) return

    // Remove user from room
    room.users = room.users.filter(u => u.socketId !== socket.id)
    userRooms.delete(socket.id)

    // Notify remaining users
    if (room.users.length > 0) {
      room.users.forEach(user => {
        const userSocket = io.sockets.sockets.get(user.socketId)
        if (userSocket) {
          userSocket.emit('partner-left')
        }
      })
    }

    // Clean up empty rooms (but give some time for users to reconnect)
    if (room.users.length === 0) {
      setTimeout(() => {
        const currentRoom = activeRooms.get(roomId)
        if (currentRoom && currentRoom.users.length === 0) {
          // Also check if there are any sockets still in the Socket.IO room
          const socketsInRoom = io.sockets.adapter.rooms.get(roomId)
          const hasActiveSockets = socketsInRoom && socketsInRoom.size > 0
          
          if (!hasActiveSockets) {
            activeRooms.delete(roomId)
            console.log(`Room ${roomId} deleted (empty after grace period)`)
          } else {
            console.log(`Room ${roomId} kept alive - has ${socketsInRoom.size} active socket(s)`)
          }
        }
      }, 10000) // 10 second grace period
    }

    socket.leave(roomId)
    console.log(`User ${socket.id} left room ${roomId}`)
  }
})

// API Routes
app.get('/api/songs', (req, res) => {
  res.json(songsData)
})

app.get('/api/stats', (req, res) => {
  res.json({
    activeRooms: activeRooms.size,
    usersInQueue: matchingQueue.length,
    connectedUsers: io.engine.clientsCount
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Cleanup old empty rooms periodically
setInterval(() => {
  const now = Date.now()
  const roomsToDelete = []

  activeRooms.forEach((room, roomId) => {
    // Delete rooms older than 1 hour with no users
    if (room.users.length === 0 && (now - room.createdAt) > 3600000) {
      roomsToDelete.push(roomId)
    }
  })

  roomsToDelete.forEach(roomId => {
    activeRooms.delete(roomId)
    console.log(`Cleaned up old room: ${roomId}`)
  })
}, 300000) // Run every 5 minutes

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🎤 Karaoke Server running on port ${PORT}`)
  console.log(`📊 Loaded ${songsData.songs.length} songs`)
}) 