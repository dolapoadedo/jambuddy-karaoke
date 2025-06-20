import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'
import Head from 'next/head'
import Logo from '../components/Logo'

export default function Home() {
  const [socket, setSocket] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchStatus, setSearchStatus] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Prevent multiple socket connections
    if (socket) {
      socket.disconnect()
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001', {
      forceNew: true // Force a new connection
    })
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      console.log('Home page socket connected:', socketInstance.id)
    })

    socketInstance.on('partner-found', ({ roomId, song, partner }) => {
      console.log('Partner found!', { roomId, songTitle: song?.title, partner })
      setIsSearching(false)
      setSearchStatus(`Partner found! Connecting to ${partner}...`)
      
      // Disconnect socket before navigating to prevent conflicts
      socketInstance.disconnect()
      setSocket(null)
      
      setTimeout(() => {
        console.log('Redirecting to room:', roomId)
        router.push(`/room/${roomId}`)
      }, 1000) // Reduced timeout
    })

    socketInstance.on('error', (error) => {
      console.error('Socket error on home page:', error)
      setIsSearching(false)
      setSearchStatus('Error occurred. Please try again.')
    })

    socketInstance.on('searching', ({ queueLength }) => {
      setSearchStatus(`Finding your duet partner... (${queueLength} in queue)`)
    })

    return () => {
      if (socketInstance.connected) {
        socketInstance.disconnect()
      }
    }
  }, [router])

  const findPartner = () => {
    if (!socket || isSearching) return
    
    console.log('Starting partner search...')
    setIsSearching(true)
    setSearchStatus('Joining the queue...')
    socket.emit('find-partner')
  }

  const cancelSearch = () => {
    if (!socket) return
    
    setIsSearching(false)
    setSearchStatus('')
    socket.emit('cancel-search')
  }

  return (
    <>
      <Head>
        <title>JamBuddy - Sing Together!</title>
        <meta name="description" content="Find a partner and sing karaoke together in real-time with JamBuddy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen hero-bg bg-pattern relative overflow-hidden">
        {/* Enhanced Floating Decorations */}
        <div className="floating-music-note">🎵</div>
        <div className="floating-star">✨</div>

        {/* Header */}
        <header className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Logo />
            <div className="hidden md:flex items-center gap-4">
              <div className="nav-pill">🎵 Real-time</div>
              <div className="nav-pill">💬 Chat</div>
              <div className="nav-pill">⚡ Instant</div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 px-6 py-8 min-h-[calc(100vh-200px)] flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              
              {/* Left Content - 60% */}
              <div className="hero-content space-y-8">
                <div>
                  <h1 className="hero-title mb-6">
                    <span className="text-gray-800" style={{fontWeight: 900}}>YO, LET'S</span>
                    <br />
                    <span className="highlight-lime" style={{fontWeight: 900}}>SING</span>{" "}
                    <span className="text-gray-800" style={{fontWeight: 900}}>TOGETHER!</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed mb-4">
                    🎮 Ready to start the <span className="font-bold text-lime">game</span> together?
                  </p>
                  
                  <div className="text-sm text-gray-500 font-bold mb-8 tracking-wide">
                    EASY • FUN • INSTANT MATCHING
                  </div>

                  {/* User Avatars */}
                  <div className="flex items-center gap-4 mb-10">
                    <div className="flex -space-x-3">
                      <div className="avatar avatar-lime bg-lime flex items-center justify-center text-xl">🎤</div>
                      <div className="avatar avatar-coral bg-coral flex items-center justify-center text-xl">🎵</div>
                      <div className="avatar avatar-orange bg-orange flex items-center justify-center text-xl">🎶</div>
                      <div className="avatar avatar-purple bg-purple flex items-center justify-center text-xl">🎸</div>
                    </div>
                    <span className="text-gray-400 font-bold text-lg">+∞</span>
                  </div>
                </div>

                {/* Main Action */}
                {!isSearching ? (
                  <div className="space-y-6">
                    <button
                      onClick={findPartner}
                      disabled={isSearching}
                      className="btn-primary text-xl py-5 px-12 font-black flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="mic-pulse">🎤</span>
                      FIND A SINGING PARTNER
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="sticker-card max-w-md p-8">
                      <div className="text-5xl mb-4 animate-bounce-soft">🎵</div>
                      <div className="w-8 h-8 mx-auto mb-4">
                        <div className="w-full h-full border-4 border-gray-200 border-t-lime rounded-full animate-spin"></div>
                      </div>
                      <p className="text-lg font-bold text-gray-800 mb-2">{searchStatus}</p>
                      <p className="text-sm text-gray-500">Getting the band together...</p>
                    </div>
                    <button
                      onClick={cancelSearch}
                      className="btn-outline"
                    >
                      Cancel Search
                    </button>
                  </div>
                )}
              </div>

              {/* Right Illustration - 40% */}
              <div className="hero-illustration">
                <img 
                  src="/undraw_happy-music_na4p.svg" 
                  alt="Happy Music Illustration" 
                  className="w-full max-w-lg animate-float"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="relative z-10 px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="sticker-card feature-card group">
                <div className="text-5xl mb-4 group-hover:animate-wiggle">🎵</div>
                <h3 className="section-title text-2xl mb-3 highlight-lime">Sync Magic</h3>
                <p className="text-gray-600 leading-relaxed">
                  Perfectly timed lyrics that light up as you sing - never miss a beat!
                </p>
              </div>

              <div className="sticker-card feature-card group">
                <div className="text-5xl mb-4 group-hover:animate-bounce-soft">⚡</div>
                <h3 className="section-title text-2xl mb-3 highlight-orange">Lightning Fast</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get matched instantly and start your duet in seconds!
                </p>
              </div>

              <div className="sticker-card feature-card group">
                <div className="text-5xl mb-4 group-hover:animate-float">💬</div>
                <h3 className="section-title text-2xl mb-3 highlight-purple">Chat & Vibe</h3>
                <p className="text-gray-600 leading-relaxed">
                  Chat with your singing buddy and make new friends worldwide!
                </p>
              </div>
            </div>

            {/* Song Collection */}
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="section-title mb-4 text-gray-800">🎶 Hit Songs Collection</h2>
              <p className="text-gray-500 mb-12 font-medium">Choose from our bangers playlist 🔥</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Don't Stop Believin'", artist: "Journey", emoji: "⭐" },
                  { title: "Bohemian Rhapsody", artist: "Queen", emoji: "👑" },
                  { title: "Sweet Caroline", artist: "Neil Diamond", emoji: "💎" },
                  { title: "Livin' on a Prayer", artist: "Bon Jovi", emoji: "🙏" },
                ].map((song, index) => (
                  <div key={index} className="song-card">
                    <div className="song-icon">
                      {song.emoji}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-800">{song.title}</div>
                      <div className="text-sm text-gray-500">{song.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Gaming Style */}
        <section className="relative z-10 py-20 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-center">
              <div className="space-y-4">
                <div className="text-6xl font-black text-gray-800">16,950,070</div>
                <div className="text-gray-600 font-bold text-lg">ACTIVE SINGERS WORLDWIDE ➤</div>
              </div>
              <div className="space-y-4">
                <div className="text-6xl font-black text-gray-800">1,374,000</div>
                <div className="text-gray-600 font-bold text-lg">DUETS THIS MONTH ➤</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-12 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Logo />
            </div>
            <div className="text-sm text-gray-500 font-medium">
              © 2025 JamBuddy • Made with ❤️ for music lovers worldwide
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 