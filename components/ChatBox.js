import { useState, useRef, useEffect } from 'react'

const ChatBox = ({ messages, onSendMessage, username }) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  const formatMessage = (message) => {
    if (message.type === 'system') {
      return message.text
    }
    return message.text
  }

  const getMessageStyle = (message) => {
    if (message.type === 'system') {
      return 'chat-message-system'
    }
    if (message.username === username) {
      return 'chat-message-own'
    }
    return 'chat-message'
  }

  const getTimeString = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="card-game p-6 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="section-title text-xl text-gray-800">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No messages yet! Start chatting with your partner.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={getMessageStyle(message)}
            >
              {message.type !== 'system' && (
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">
                    {message.username === username ? (
                      <span className="text-black">You</span>
                    ) : (
                      <span className="text-gray-700">{message.username}</span>
                    )}
                  </span>
                  <span className="text-xs text-gray-400">
                    {getTimeString(message.timestamp)}
                  </span>
                </div>
              )}
              <div className={`${message.type === 'system' ? 'text-sm font-medium' : ''}`}>
                {formatMessage(message)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="input-game flex-1 text-sm"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary py-2 px-4 text-sm"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatBox 