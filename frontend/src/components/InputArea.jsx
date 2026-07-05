import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, MessageSquare, Languages, FileText } from 'lucide-react';

const InputArea = ({ onSendText, onSendImage, mode, setMode, targetLang, setTargetLang }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleSend = () => {
    if (text.trim()) {
      onSendText(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSendImage(file);
      // Reset input
      e.target.value = null;
    }
  };

  return (
    <div className="input-area">
      <div className="mode-selector">
        <button className={`mode-btn ${mode === 'chat' ? 'active' : ''}`} onClick={() => setMode('chat')}>
          <MessageSquare size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Chat
        </button>
        <button className={`mode-btn ${mode === 'translate' ? 'active' : ''}`} onClick={() => setMode('translate')}>
          <Languages size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Translate
        </button>
        <button className={`mode-btn ${mode === 'ocr' ? 'active' : ''}`} onClick={() => setMode('ocr')}>
          <FileText size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Image OCR
        </button>
        <button className={`mode-btn ${mode === 'image-translate' ? 'active' : ''}`} onClick={() => setMode('image-translate')}>
          <ImageIcon size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Image Translate
        </button>
      </div>

      {(mode === 'translate' || mode === 'image-translate') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Language:</span>
          <input 
            type="text" 
            className="target-lang-input"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          />
        </div>
      )}

      <div className="input-group">
        {(mode === 'ocr' || mode === 'image-translate') ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button className="btn-text" style={{ flex: 1, justifyContent: 'center' }} onClick={() => fileInputRef.current?.click()}>
              <ImageIcon size={18} /> Select Image File
            </button>
          </div>
        ) : (
          <>
            <button 
              className={`btn-icon ${isRecording ? 'is-recording' : ''}`} 
              onClick={toggleRecording}
              title="Voice Input"
            >
              <Mic size={18} />
            </button>
            <textarea
              className="text-input"
              placeholder="How can I help you today?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="btn-icon btn-primary" onClick={handleSend}>
              <Send size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InputArea;
