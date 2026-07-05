import React from 'react';
import { Plus, MessageSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const Sidebar = ({ chats, currentChatId, onSelectChat, onNewChat, isOpen, toggleSidebar }) => {
  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={onNewChat}>
            <Plus size={16} /> New Chat
          </button>
          <button className="toggle-sidebar-btn inner" onClick={toggleSidebar} title="Close Sidebar">
            <PanelLeftClose size={18} />
          </button>
        </div>
        
        <div className="chat-history-list">
          <div className="history-section-title">Recent</div>
          {chats.map(chat => (
            <button 
              key={chat.id} 
              className={`history-item ${chat.id === currentChatId ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare size={14} className="history-icon" />
              <span className="history-title">{chat.title}</span>
            </button>
          ))}
        </div>
      </div>
      
      {!isOpen && (
        <button className="toggle-sidebar-btn outer" onClick={toggleSidebar} title="Open Sidebar">
          <PanelLeftOpen size={18} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
