import { useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';

const ChatWindow = ({ messages, isTyping }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div className="chat-window">
      {messages.map((msg) => (
        <div key={msg.id} className={`message-row ${msg.type}`}>
          <div className="message-content">
            <div className={`avatar ${msg.type}`}>
              {msg.type === 'user' ? 'U' : 'AI'}
            </div>
            <div className="message-text">
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              {msg.audioUrl && (
                <div className="audio-controls">
                  <button className="btn-icon" style={{border: '1px solid var(--border-color)'}} onClick={() => playAudio(msg.audioUrl)} title="Play Audio">
                    <Volume2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="message-row bot">
          <div className="message-content">
            <div className="avatar bot">AI</div>
            <div className="message-text">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
