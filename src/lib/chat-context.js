'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const ChatContext = createContext(undefined);

export function ChatProvider({ children }) {
  const [activeChatConversation, setActiveChatConversation] = useState(null);
  
  // Open chat for a specific conversation
  const openChat = (conversationId) => {
    console.log('[ChatContext] 📂 Chat opened for conversation:', conversationId);
    setActiveChatConversation(conversationId);
  };
  
  // Close chat
  const closeChat = () => {
    console.log('[ChatContext] 📪 Chat closed');
    setActiveChatConversation(null);
  };
  
  // Check if a conversation is currently open
  const isChatOpen = (conversationId) => {
    return activeChatConversation === conversationId;
  };
  
  // Check if ANY chat is open
  const isAnyChatOpen = () => {
    return activeChatConversation !== null;
  };
  
  return (
    <ChatContext.Provider 
      value={{ 
        activeChatConversation, 
        openChat, 
        closeChat, 
        isChatOpen, 
        isAnyChatOpen 
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
