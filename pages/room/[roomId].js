import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import YouTube from 'react-youtube'
import io from 'socket.io-client'
import LyricsDisplay from '../../components/LyricsDisplay'
import ChatBox from '../../components/ChatBox'
import Logo from '../../components/Logo'

export default function Room() {
  const router = useRouter()
  const { roomId } = router.query
  const [socket, setSocket] = useState(null)
  const [player, setPlayer] = useState(null)
  const [song, setSong] = useState(null)
  const [partner, setPartner] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [messages, setMessages] = useState([])
  const [username] = useState(`Singer${Math.floor(Math.random() * 1000)}`)
  const timeUpdateInterval = useRef(null)

  useEffect(() => {
    if (!roomId) {
      console.log('No roomId available yet')
      return
    }

    console.log('Connecting to room:', roomId)
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001', {
      forceNew: true,
      timeout: 5000
    })
    setSocket(socketInstance)

    // Wait a moment for connection to establish
    socketInstance.on('connect', () => {
      console.log('Room socket connected:', socketInstance.id, 'joining room:', roomId)
      // Join the room
      socketInstance.emit('join-room', { roomId, username })
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      // Redirect to home on connection failure
      router.push('/')
    })

    // Socket event handlers
    socketInstance.on('room-data', ({ song: roomSong, partner: roomPartner, messages: roomMessages }) => {
      console.log('Received room data:', { song: roomSong?.title, partner: roomPartner })
      if (roomSong) {
        setSong(roomSong)
        setPartner(roomPartner)
        if (roomMessages && roomMessages.length > 0) {
          setMessages(roomMessages)
        }
      } else {
        console.error('No song data received')
      }
    })

    socketInstance.on('error', ({ message }) => {
      console.error('Socket error in room:', message)
      // Only redirect if room genuinely not found, add delay to prevent immediate redirect
      if (message === 'Room not found') {
        console.log('Room not found, waiting 3 seconds before redirect')
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    })

    socketInstance.on('partner-joined', ({ partner: newPartner }) => {
      setPartner(newPartner)
      setMessages(prev => [...prev, {
        type: 'system',
        text: `🎉 ${newPartner} joined the duet! Let's rock this song! 🎤`,
        timestamp: Date.now()
      }])
    })

    socketInstance.on('partner-left', () => {
      setPartner(null)
      setMessages(prev => [...prev, {
        type: 'system',
        text: '👋 Your partner left the room. Find another singing buddy!',
        timestamp: Date.now()
      }])
    })

    socketInstance.on('sync-player', ({ action, time }) => {
      if (!player) return

      switch (action) {
        case 'play':
          player.playVideo()
          setIsPlaying(true)
          if (time !== undefined) {
            player.seekTo(time, true)
          }
          break
        case 'pause':
          player.pauseVideo()
          setIsPlaying(false)
          break
        case 'seek':
          player.seekTo(time, true)
          setCurrentTime(time)
          break
      }
    })

    socketInstance.on('chat-message', (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current)
      }
      socketInstance.disconnect()
    }
  }, [roomId, player])

  // Update current time when playing
  useEffect(() => {
    if (isPlaying && player) {
      timeUpdateInterval.current = setInterval(() => {
        const time = player.getCurrentTime()
        setCurrentTime(time)
      }, 100)
    } else {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current)
      }
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current)
      }
    }
  }, [isPlaying, player])

  const onPlayerReady = (event) => {
    setPlayer(event.target)
  }

  const onPlayerStateChange = (event) => {
    const isNowPlaying = event.data === YouTube.PlayerState.PLAYING
    setIsPlaying(isNowPlaying)

    if (socket && partner) {
      if (isNowPlaying) {
        socket.emit('sync-player', {
          roomId,
          action: 'play',
          time: event.target.getCurrentTime()
        })
      } else if (event.data === YouTube.PlayerState.PAUSED) {
        socket.emit('sync-player', {
          roomId,
          action: 'pause'
        })
      }
    }
  }

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', { roomId })
    }
    router.push('/')
  }

  const sendMessage = (message) => {
    if (socket && message.trim()) {
      socket.emit('chat-message', {
        roomId,
        username,
        text: message,
        timestamp: Date.now()
      })
    }
  }

  if (!song) {
    return (
      <div className="min-h-screen hero-bg bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <div className="w-full h-full border-4 border-gray-200 border-t-lime rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-800 text-lg font-bold">Setting up your stage...</p>
          <p className="text-gray-500 text-sm mt-2">Getting the band together!</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{song.title} - {song.artist} | JamBuddy</title>
      </Head>

      <div className="min-h-screen hero-bg bg-pattern">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Logo size="small" />
              <div className="border-l border-gray-300 pl-6">
                <div className="sticker-card bg-white p-3 inline-block">
                  <h1 className="text-lg font-display font-bold text-gray-800">
                    <span className="highlight-lime">{song.title}</span>
                  </h1>
                  <p className="text-gray-500 text-sm font-medium">{song.artist}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm">
                {partner ? (
                  <div className="status-badge status-online">
                    <span className="font-bold">Duet with {partner}</span>
                  </div>
                ) : (
                  <div className="status-badge status-waiting">
                    <span>Waiting for partner...</span>
                  </div>
                )}
              </div>
              <button
                onClick={leaveRoom}
                className="btn-outline text-sm py-2 px-4"
              >
                Leave Room
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-[calc(100vh-120px)]">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            {/* YouTube Player */}
            <div className="sticker-card-static mx-4">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="section-title text-xl text-gray-800">Now Playing</h2>
              </div>
              
              <div className="mb-6">
                <div className="rounded-xl overflow-hidden bg-black">
                  <YouTube
                    videoId={song.youtubeId}
                    opts={{
                      width: '100%',
                      height: '400',
                      playerVars: {
                        autoplay: 0,
                        controls: 1,
                        modestbranding: 1,
                        rel: 0
                      }
                    }}
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="status-badge bg-gray-100 text-gray-700">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="flex items-center">
                  {isPlaying ? (
                    <div className="status-badge bg-lime text-black">
                      <span className="font-bold">Playing</span>
                    </div>
                  ) : (
                    <div className="status-badge bg-gray-200 text-gray-600">
                      <span>Paused</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lyrics Display */}
            <div className="sticker-card-static mx-4">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="section-title text-xl text-gray-800">Sing Along!</h2>
              </div>
              <div>
                <LyricsDisplay 
                  lyrics={song.lyrics} 
                  currentTime={currentTime}
                />
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <ChatBox
              messages={messages}
              onSendMessage={sendMessage}
              username={username}
            />
          </div>
        </div>
      </div>
    </>
  )
} 