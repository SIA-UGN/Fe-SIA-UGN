"use client";
import React, { useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ChatProvider } from '@/lib/chat-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/react-query/queryClient';
import { Toaster } from 'sonner';

export default function Providers({ children }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
