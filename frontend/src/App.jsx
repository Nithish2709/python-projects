import { useState, useRef, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import axios from 'axios';

function App() {
  const defaultMessage = { id: 1, type: 'bot', text: 'Hello! I am your Real-Time AI Translator & Chatbot. How can I help you today?' };
  
  // State for all chats (History)
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error loading history", e);
      }
    }
    return [{
      id: Date.now(),
      title: 'New Chat',
      messages: [defaultMessage]
    }];
  });
  
  // State for currently active chat
  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem('currentChatId');
    if (saved) return Number(saved);
    return chats[0]?.id || Date.now();
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat', 'translate', 'ocr', 'image-translate'
  const [targetLang, setTargetLang] = useState('Spanish');

  const API_BASE = 'http://localhost:8000/api';

  // Save to local storage whenever chats or currentChatId changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chats));
    localStorage.setItem('currentChatId', currentChatId.toString());
  }, [chats, currentChatId]);

  // Current chat context
  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];
  const messages = currentChat?.messages || [];

  const updateCurrentChat = (updater) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        return updater(chat);
      }
      return chat;
    }));
  };

  const addMessage = (type, text, audioUrl = null) => {
    updateCurrentChat(chat => {
      const newMessages = [...chat.messages, { id: Date.now(), type, text, audioUrl }];
      
      // Update title if it's the first user message
      let newTitle = chat.title;
      if (chat.title === 'New Chat' && type === 'user') {
        newTitle = text.substring(0, 25) + (text.length > 25 ? '...' : '');
      }
      
      return { ...chat, messages: newMessages, title: newTitle };
    });
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      messages: [defaultMessage]
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const handleSendText = async (text) => {
    if (!text.trim()) return;
    addMessage('user', text);
    setIsTyping(true);

    try {
      if (mode === 'chat') {
        const formData = new FormData();
        formData.append('prompt', text);
        const res = await axios.post(`${API_BASE}/chat`, formData);
        await handleBotResponse(res.data.response);
      } else if (mode === 'translate') {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('target_lang', targetLang);
        const res = await axios.post(`${API_BASE}/translate`, formData);
        await handleBotResponse(`**Translated to ${targetLang}:**\n${res.data.translated_text}`);
      }
    } catch (error) {
      addMessage('bot', `❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendImage = async (file) => {
    if (!file) return;
    addMessage('user', `[Uploaded Image: ${file.name}]`);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      if (mode === 'ocr') {
        const res = await axios.post(`${API_BASE}/ocr`, formData);
        await handleBotResponse(`**Extracted Text:**\n${res.data.text}`);
      } else if (mode === 'image-translate') {
        formData.append('target_lang', targetLang);
        const res = await axios.post(`${API_BASE}/image-translate`, formData);
        await handleBotResponse(`**Translated Image Text to ${targetLang}:**\n${res.data.translated_text}`);
      }
    } catch (error) {
      addMessage('bot', `❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBotResponse = async (text) => {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('lang', 'en'); 
      const audioRes = await axios.post(`${API_BASE}/tts`, formData, { responseType: 'blob' });
      const audioUrl = URL.createObjectURL(audioRes.data);
      addMessage('bot', text, audioUrl);
    } catch (e) {
      addMessage('bot', text);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar 
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={createNewChat}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="main-content">
        <header className="header">
          <h1>NPL Based Real Time Translator and AI Assistant</h1>
        </header>
        
        <ChatWindow messages={messages} isTyping={isTyping} />
        
        <div className="input-container-wrapper">
          <InputArea 
            onSendText={handleSendText} 
            onSendImage={handleSendImage}
            mode={mode}
            setMode={setMode}
            targetLang={targetLang}
            setTargetLang={setTargetLang}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
