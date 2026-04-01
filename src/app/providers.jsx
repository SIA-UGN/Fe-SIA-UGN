"use client";
import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ChatProvider } from '@/lib/chat-context';
import { Toaster } from 'sonner';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ChatProvider>
        {children}
        <Toaster
          richColors
          closeButton
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Urbanist, sans-serif',
            },
          }}
        />
      </ChatProvider>
    </AuthProvider>
  );
}
