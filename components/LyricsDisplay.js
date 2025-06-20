import { useState, useEffect, useRef } from 'react'

const LyricsDisplay = ({ lyrics, currentTime, onLyricClick }) => {
  const [isStarted, setIsStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false)
  const lyricsContainerRef = useRef(null)

  // Auto-scroll functionality based on currentTime
  useEffect(() => {
    if (!autoScrollEnabled || !isStarted || !lyrics || lyrics.length === 0) return

    // Find the current lyric based on time
    let newIndex = 0
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        newIndex = i
      } else {
        break
      }
    }

    // Only update if the time-based index is ahead of current position
    // This allows manual navigation to "override" the timing temporarily
    setCurrentIndex(prev => Math.max(prev, newIndex))
  }, [currentTime, autoScrollEnabled, isStarted, lyrics])

  // Handle keyboard navigation when container is focused
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isStarted || !lyrics || lyrics.length === 0) return
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        // Disable auto-scroll when user manually navigates
        setAutoScrollEnabled(false)
        setCurrentIndex(prev => Math.min(prev + 1, lyrics.length - 1))
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        // Disable auto-scroll when user manually navigates
        setAutoScrollEnabled(false)
        setCurrentIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        // Toggle auto-scroll with 'A' key
        setAutoScrollEnabled(prev => !prev)
      }
    }

    const container = lyricsContainerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      return () => container.removeEventListener('keydown', handleKeyDown)
    }
  }, [isStarted, lyrics])

  const handleStartSingAlong = () => {
    setIsStarted(true)
    setCurrentIndex(0)
    // Focus the container for keyboard navigation
    setTimeout(() => {
      lyricsContainerRef.current?.focus()
    }, 100)
  }

  const handleLyricClick = (index) => {
    // Disable auto-scroll when user manually clicks
    setAutoScrollEnabled(false)
    setCurrentIndex(index)
    if (onLyricClick) {
      onLyricClick(lyrics[index])
    }
  }

  const handleReset = () => {
    setIsStarted(false)
    setCurrentIndex(0)
    setAutoScrollEnabled(false)
  }

  const toggleAutoScroll = () => {
    setAutoScrollEnabled(prev => !prev)
  }

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg font-medium">
          No lyrics available for this song.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Just enjoy the music and sing along!
        </p>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to sing?</h3>
        <p className="text-gray-600 mb-8">
          Start the YouTube video, then click below when you're ready to begin!
        </p>
        <button
          onClick={handleStartSingAlong}
          className="btn-primary text-lg py-4 px-8"
        >
          Start Sing Along
        </button>
        <div className="mt-6 text-sm text-gray-500 space-y-1">
          <p>Use arrow keys or click lyrics to navigate manually</p>
          <p>Or enable auto-scroll to sync with the music timing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-center items-center gap-4 pb-4 border-b border-gray-200">
        <button
          onClick={handleReset}
          className="btn-outline text-sm py-2 px-4"
        >
          Reset
        </button>
        <button
          onClick={toggleAutoScroll}
          className={`text-sm py-2 px-4 rounded-lg font-medium transition-all ${
            autoScrollEnabled 
              ? 'bg-lime text-black shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {autoScrollEnabled ? '🤖 Auto-Scroll ON' : '👆 Manual Mode'}
        </button>
        <div className="text-sm text-gray-500 flex items-center">
          {currentIndex + 1} / {lyrics.length}
        </div>
      </div>

      {/* Lyrics Container - Focusable for keyboard navigation */}
      <div 
        ref={lyricsContainerRef}
        tabIndex={0}
        className="outline-none focus:ring-2 focus:ring-lime/50 rounded-lg p-4"
      >
        <div className="text-center space-y-4">
          {/* Previous lyrics - simple and clickable */}
          {currentIndex > 0 && (
            <div className="space-y-2 mb-6">
              {lyrics.slice(Math.max(0, currentIndex - 2), currentIndex).map((lyric, index) => {
                const actualIndex = currentIndex - (currentIndex > 1 ? 2 : 1) + index
                return (
                  <div
                    key={`past-${actualIndex}`}
                    onClick={() => handleLyricClick(actualIndex)}
                    className="text-lg text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                  >
                    {lyric.text}
                  </div>
                )
              })}
            </div>
          )}

          {/* Current lyric - highlighted simply */}
          <div className="my-8">
            <div className="bg-lime text-black text-xl md:text-2xl font-bold py-4 px-6 rounded-lg">
              {lyrics[currentIndex]?.text}
            </div>
          </div>

          {/* Next lyrics - simple preview */}
          {currentIndex < lyrics.length - 1 && (
            <div className="space-y-2 mt-6">
              {lyrics.slice(currentIndex + 1, currentIndex + 4).map((lyric, index) => {
                const actualIndex = currentIndex + 1 + index
                return (
                  <div
                    key={`next-${actualIndex}`}
                    onClick={() => handleLyricClick(actualIndex)}
                    className={`text-lg cursor-pointer hover:text-gray-800 transition-colors ${
                      index === 0 ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {lyric.text}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Simple progress bar */}
        <div className="mt-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-lime h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / lyrics.length) * 100}%`
              }}
            ></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-4 text-sm text-gray-500">
          <div>Use ↑↓ arrow keys or click lyrics to navigate</div>
          <div className="mt-1">Press 'A' key or button above to toggle auto-scroll</div>
          {autoScrollEnabled && (
            <div className="mt-2 text-lime font-medium">
              🤖 Auto-scrolling with music timing
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LyricsDisplay 