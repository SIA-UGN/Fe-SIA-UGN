'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { ArrowLeft, Send, User, MessageCircle, Check } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import LoadingEffect from '@/components/ui/loading-effect';
import { findOrCreatePrivateConversation, getMessages, sendMessage as sendChatMessage, markMessagesAsRead } from '@/lib/chatApi';
import { getEcho } from '@/lib/echo';

function ChatPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const messagesEndRef = useRef(null);
	
	const userName = searchParams.get('user') || 'User';
	const userNim = searchParams.get('nim') || '';
	const userId = searchParams.get('userId') || '';
	
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [conversationId, setConversationId] = useState(null);
	const [currentUserId, setCurrentUserId] = useState(null);

	// Get current user ID
	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
				const { getProfile } = await import('@/lib/profileApi');
				const profileResponse = await getProfile();
				
				if (profileResponse.status === 'success' && profileResponse.data.id_user_si) {
					setCurrentUserId(profileResponse.data.id_user_si);
				}
			} catch (error) {
				console.error('Error getting current user:', error);
			}
		};

		fetchCurrentUser();
	}, []);

    // Initialize chat conversation
    useEffect(() => {
        if (!userId || !currentUserId) return;

        const initializeChat = async () => {
            try {
                setLoading(true);
                
                const conversationResponse = await findOrCreatePrivateConversation(userId);

                if (conversationResponse.data) {
                    const convId = conversationResponse.data.id_conversation;
                    setConversationId(convId);

                    const messagesResponse = await getMessages(convId);

                    if (messagesResponse.data) {
                        const messagesList = messagesResponse.data.messages || messagesResponse.data;
                        setMessages(messagesList);
                    }

                    // Subscribe to WebSocket
                    const echo = getEcho();
                    if (echo) {
                        try {
                            console.log('[ChatPage] Subscribing to chat.' + convId);
                            
                            echo.private(`chat.${convId}`)
                                .listen('NewChatMessage', (e) => {
                                    console.log('[ChatPage] New message received:', e);
                                    if (e.message.id_user_si !== currentUserId) {
                                        setMessages(prev => {
                                            const exists = prev.some(msg => msg.id_message === e.message.id_message);
                                            if (exists) return prev;
                                            return [...prev, e.message];
                                        });
                                        
                                        setTimeout(() => {
                                            markMessagesAsRead(convId, [e.message.id_message])
                                                .catch(err => console.error('Error auto-marking as read:', err));
                                        }, 1000);
                                    }
                                })
                                .listen('MessageRead', (e) => {
                                    console.log('[ChatPage] Message read event:', e);
                                    setMessages(prev => prev.map(msg => {
                                        if (msg.id_message === e.message_id) {
                                            return {
                                                ...msg,
                                                read_status: {
                                                    ...msg.read_status,
                                                    read_by_count: (msg.read_status?.read_by_count || 0) + 1,
                                                    read_by_users: [...(msg.read_status?.read_by_users || []), e.user_id],
                                                }
                                            };
                                        }
                                        return msg;
                                    }));
                                });
                            console.log('[ChatPage] WebSocket subscribed successfully');
                        } catch (wsError) {
                            console.error('[ChatPage] WebSocket subscription error:', wsError);
                        }
                    } else {
                        console.warn('[ChatPage] Echo not initialized yet');
                    }
                }
            } catch (error) {
                console.error('Error initializing chat:', error);
                alert('Gagal memuat chat. Silakan refresh halaman.');
            } finally {
                setLoading(false);
            }
        };

        initializeChat();

        return () => {
            if (conversationId) {
                const echo = getEcho();
                if (echo) {
                    try {
                        console.log('[ChatPage] Leaving chat.' + conversationId);
                        echo.leave(`chat.${conversationId}`);
                    } catch (e) {
                        console.error('Error leaving channel:', e);
                    }
                }
            }
        };
    }, [userId, currentUserId]);	// Scroll to bottom and mark as read
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		
		if (conversationId && messages.length > 0 && currentUserId) {
			const unreadMessageIds = messages
				.filter(msg => 
					msg.id_user_si !== currentUserId &&
					!msg.read_status?.is_read_by_me
				)
				.map(msg => msg.id_message);
			
			if (unreadMessageIds.length > 0) {
				setTimeout(() => {
					markMessagesAsRead(conversationId, unreadMessageIds)
						.catch(err => console.error('Error marking messages as read:', err));
				}, 1000);
			}
		}
	}, [messages, conversationId, currentUserId]);

	const handleSendMessage = async (e) => {
		e.preventDefault();

		if (!message.trim() || !conversationId) return;

		const messageToSend = message.trim();
		setMessage('');

		try {
			const response = await sendChatMessage(conversationId, messageToSend);
			
			if (response.data) {
				setMessages(prev => [...prev, response.data]);
			}
		} catch (error) {
			console.error('Error sending message:', error);
			setMessage(messageToSend);
			alert('Gagal mengirim pesan. Silakan coba lagi.');
		}
	};

	const formatTime = (date) => {
		return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	};

	const formatDate = (date) => {
		const messageDate = new Date(date);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (messageDate.toDateString() === today.toDateString()) {
			return 'Hari Ini';
		} else if (messageDate.toDateString() === yesterday.toDateString()) {
			return 'Kemarin';
		} else {
			return messageDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
		}
	};

	// Group messages by date
	const groupedMessages = messages.reduce((groups, message) => {
		const date = formatDate(message.sent_at || message.created_at);
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(message);
		return groups;
	}, {});

	return (
		<div className="min-h-screen bg-brand-light-sage">
			<Navbar />
			<div className="container mx-auto px-4 py-8 max-w-5xl h-screen flex flex-col">
				
				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 mb-6 font-medium hover:opacity-80 transition"
					style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
				>
					<ArrowLeft className="w-5 h-5" />
					Kembali
				</button>

				{/* Chat Container */}
				<div className="bg-white rounded-2xl shadow-lg flex flex-col flex-1 overflow-hidden" style={{ borderRadius: '16px' }}>
					
					{/* Chat Header */}
					<div className="p-6 border-b border-gray-200">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#015023' }}>
								<User className="w-6 h-6 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-bold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
									{userName}
								</h2>
								{userNim && (
									<p className="text-sm" style={{ color: '#015023', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
										NIM: {userNim}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Messages Area */}
					<ScrollArea className="flex-1">
						<div className="p-6 space-y-6">
						{loading ? (
							<div className="flex items-center justify-center h-full">
								<div className="flex flex-col items-center gap-2">
									<div className="w-6 h-6 border-2 border-[#015023] border-t-transparent rounded-full animate-spin"></div>
									<p className="text-sm text-[#015023]">Memuat percakapan...</p>
								</div>
							</div>
						) : messages.length === 0 ? (
							<div className="flex items-center justify-center h-full">
								<div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
									<MessageCircle className="w-12 h-12 text-[#015023] opacity-30 mx-auto mb-2" />
									<p style={{ color: '#015023', opacity: 0.6 }}>
										Belum ada pesan. Mulai percakapan!
									</p>
								</div>
							</div>
						) : (
							Object.entries(groupedMessages).map(([date, dateMessages]) => (
								<div key={date}>
									{/* Date Separator */}
									<div className="flex items-center gap-4 my-6">
										<div className="flex-1 h-px" style={{ backgroundColor: '#015023', opacity: 0.2 }}></div>
										<span className="text-sm font-medium px-3 py-1 rounded-lg" style={{ 
											backgroundColor: '#f3f4f6', 
											color: '#015023',
											fontFamily: 'Urbanist, sans-serif'
										}}>
											{date}
										</span>
										<div className="flex-1 h-px" style={{ backgroundColor: '#015023', opacity: 0.2 }}></div>
									</div>

									{/* Messages for this date */}
									{dateMessages.map((msg) => {
										const isMe = msg.id_user_si === currentUserId;
										const isRead = msg.read_status?.read_by_count > 0;
										
										return (
											<div key={msg.id_message} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
												<div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
													{!isMe && (
														<span className="text-xs font-semibold mb-1 px-1" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
															{msg.sender?.name || userName}
														</span>
													)}
													<div className="flex items-end gap-2">
														<div 
															className="px-4 py-3 rounded-2xl shadow-sm"
															style={{
																backgroundColor: isMe ? '#015023' : '#f3f4f6',
																color: isMe ? 'white' : '#015023',
																fontFamily: 'Urbanist, sans-serif',
																borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
															}}
														>
															<p className="whitespace-pre-wrap">{msg.message}</p>
															<div className="flex items-center justify-end gap-1 mt-1">
															<span className="text-xs" style={{ 
																color: isMe ? 'rgba(255,255,255,0.7)' : 'rgba(1,80,35,0.5)', 
																fontFamily: 'Urbanist, sans-serif' 
															}}>
																{formatTime(msg.created_at)}
															</span>
																{/* Read Status (Double Check) */}
																{isMe && (
																	<div className="flex items-center ml-1">
																		{isRead ? (
																			// Centang putih (sudah dibaca)
																			<div className="flex">
																				<Check className="w-3 h-3 text-white" strokeWidth={3} />
																				<Check className="w-3 h-3 text-white -ml-2" strokeWidth={3} />
																			</div>
																		) : (
																			// Centang abu-abu (belum dibaca)
																			<div className="flex">
																				<Check className="w-3 h-3 text-white/40" strokeWidth={3} />
																				<Check className="w-3 h-3 text-white/40 -ml-2" strokeWidth={3} />
																			</div>
																		)}
																	</div>
																)}
															</div>
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							))
						)}
						<div ref={messagesEndRef} />
						</div>
					</ScrollArea>

					{/* Message Input */}
					<div className="p-4 border-t border-gray-200">
						<form onSubmit={handleSendMessage} className="flex gap-3">
							<input
								type="text"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder="Ketik pesan..."
								className="flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-opacity-100"
								style={{
									fontFamily: 'Urbanist, sans-serif',
									borderColor: '#015023',
									borderRadius: '12px',
									opacity: 0.7
								}}
							/>
							<button
								type="submit"
								disabled={!message.trim()}
								className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
								style={{
									backgroundColor: '#015023',
									color: 'white',
									fontFamily: 'Urbanist, sans-serif',
									borderRadius: '12px'
								}}
							>
								<Send className="w-5 h-5" />
								Kirim
							</button>
						</form>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<LoadingEffect message="Memuat chat..." />}>
			<ChatPage />
		</Suspense>
	);
}
