'use client';

import { useState, useEffect, useRef, useCallback, Fragment, forwardRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import Cookies from 'js-cookie';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatContext } from '@/lib/chat-context';
import { getEcho } from '@/lib/echo';
import { getNotifications, markAsRead } from '@/lib/notificationApi';
import { getConversationDetail } from '@/lib/chatApi';

const NavbarNotification = forwardRef(({ className, isChatOpen, chatUser, setChatUser, setIsChatOpen }, ref) => {
  const router = useRouter();
  
  const { activeChatConversation } = useChatContext();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const processedIdsRef = useRef(new Set());
  const fetchNotificationsRef = useRef(null);
  const isChatOpenRef = useRef(isChatOpen);
  const activeChatConversationRef = useRef(activeChatConversation);
  
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
    activeChatConversationRef.current = activeChatConversation;
  }, [isChatOpen, activeChatConversation]);
  useEffect(() => {
    const handleNotificationsDismissed = (e) => {
      const { notificationIds } = e.detail || {};
      
      if (notificationIds && notificationIds.length > 0) {
        console.log('[NavbarNotification] Removing dismissed notifications:', notificationIds);
        
        setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      } else {
        if (fetchNotificationsRef.current) {
          fetchNotificationsRef.current();
        }
      }
    };
    
    const handleChatClosed = () => {
      setTimeout(() => {
        if (fetchNotificationsRef.current) {
          fetchNotificationsRef.current();
        }
      }, 2000); 
    };
    
    window.addEventListener('chatNotificationsDismissed', handleNotificationsDismissed);
    window.addEventListener('chatModalClosed', handleChatClosed);
    
    return () => {
      window.removeEventListener('chatNotificationsDismissed', handleNotificationsDismissed);
      window.removeEventListener('chatModalClosed', handleChatClosed);
    };
  }, []);

  // Fetch notifications initial
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getNotifications();

      if (response.status === 'success') {
        setUnreadCount(response.data.unread_count || 0);
        
        const transformed = response.data.notifications.slice(0, 10).map(notif => ({
          id: String(notif.id_notification),
          type: notif.type,
          title: notif.title,
          message: notif.message,
          date: notif.sent_at,
          isRead: notif.is_read,
          metadata: notif.metadata
        }));
        setNotifications(transformed);

        transformed.forEach(n => processedIdsRef.current.add(n.id));
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchNotificationsRef.current = fetchNotifications;
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // WebSocket Real-time Notification Listener
  useEffect(() => {
    const echo = getEcho();
    if (!echo) {
      console.warn('[NavbarNotification] Echo not initialized');
      return;
    }

    let userId = Cookies.get('user_id');
    if (!userId) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          userId = JSON.parse(userStr).id_user_si;
        } catch (err) { console.error(err); }
      }
    }

    if (!userId) return;

    let channel = null;
    let isSubscribed = false;

    const subscribeToChannel = () => {
      if (isSubscribed) return;
      
      try {
        channel = echo.private(`user.${userId}`);
        isSubscribed = true;

        channel
          .listen('.NewNotification', (event) => {
            console.log('[NavbarNotification] New notification received:', event);
            
            const rawId = event.notification?.id_notification || event.id_notification;
            const stringId = rawId ? String(rawId) : null;

            if (stringId && processedIdsRef.current.has(stringId)) {
                console.log(`[NavbarNotification] Duplicate event blocked: ${stringId}`);
                return;
            }

            if (stringId) {
                processedIdsRef.current.add(stringId);
            }

            const notifType = event.notification?.type || event.type;
            const notifMetadata = event.notification?.metadata || event.metadata;
            const activeConvId = activeChatConversationRef.current;
            
            if (notifType === 'chat' && activeConvId && notifMetadata?.id_conversation) {
              if (String(notifMetadata.id_conversation) === String(activeConvId)) {
                console.log('Chat notification suppressed - conversation is active');
                if (rawId) {
                    markAsRead(rawId).catch(err => console.error('Failed to auto-read:', err));
                }
                return; 
              }
            }
            
            const newNotif = {
                id: stringId || `temp-${Date.now()}`,
                type: notifType,
                title: event.notification?.title || event.title,
                message: event.notification?.message || event.message,
                date: event.notification?.sentAt || new Date().toISOString(),
                isRead: event.notification?.isRead || false,
                metadata: notifMetadata
            };

            setNotifications(prev => {
                if (prev.some(n => String(n.id) === String(newNotif.id))) {
                    return prev;
                }
                return [newNotif, ...prev].slice(0, 10);
            });

            if (!newNotif.isRead) {
                setUnreadCount(prev => prev + 1);
            }
          })
          .error((error) => {
            console.error('[NavbarNotification] ❌ Channel subscription error:', error);
            isSubscribed = false;
          });
      } catch (err) {
        console.error('[NavbarNotification] ❌ Failed to subscribe:', err);
        isSubscribed = false;
      }
    };

    const pusher = echo.connector?.pusher;
    if (pusher) {
        if (pusher.connection.state === 'connected') {
            subscribeToChannel();
        } else {
            pusher.connection.bind('connected', subscribeToChannel);
        }
    }

    return () => {
      if (channel && userId) {
        echo.leave(`user.${userId}`);
      }
    };
  }, []); 

  const handleMarkAsRead = async (notificationId) => {
    const isTempId = typeof notificationId === 'string' && notificationId.startsWith('temp-');
    const notification = notifications.find(n => n.id === notificationId);
    const wasUnread = notification && !notification.isRead;

    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    if (isTempId) return;

    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hari ini';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          ref={ref}
          className={cn(
            "relative text-brand-yellow hover:opacity-80 transition-colors duration-200 focus:outline-none",
            className
          )}
          style={{ color: '#DABC4E' }}
        >
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" fill="currentColor" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold cursor-pointer">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto hide-scrollbar"
      >
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold" style={{ color: 'brand-green', fontFamily: 'Urbanist, sans-serif' }}>
              Notifikasi
            </span>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#BE0414', color: 'white', fontFamily: 'Urbanist, sans-serif' }}>
                {unreadCount} baru
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm" style={{ color: 'brand-green', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
            Memuat...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm" style={{ color: 'brand-green', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
            Tidak ada notifikasi
          </div>
        ) : (
          notifications.map((notification, index) => (
            <Fragment key={notification.id}>
              <DropdownMenuItem
                className="flex-col items-start p-3 cursor-pointer"
                onClick={async () => {
                  if (!notification.isRead) {
                    await handleMarkAsRead(notification.id);
                  }
                  
                  if (notification.type === 'chat' && notification.metadata?.id_conversation) {
                    try {
                      const response = await getConversationDetail(notification.metadata.id_conversation);
                      const otherParticipant = response.data?.conversation?.other_participant;
                      
                      setChatUser({
                        id: otherParticipant?.id_user_si?.toString() || '',
                        name: otherParticipant?.name || 'User',
                        nim: otherParticipant?.nim || '',
                        conversationId: notification.metadata.id_conversation.toString()
                      });
                      setIsChatOpen(true);
                      
                      // Remove chat notification immediately
                      setTimeout(() => {
                        setNotifications(prev => prev.filter(n => n.id !== notification.id));
                      }, 100);
                    } catch (err) {
                      console.error('Error fetching conversation:', err);
                    }
                  } else {
                    router.push(`/notif?highlight=${notification.id}`);
                  }
                }}
              >
                <div>
                  <div className="flex items-start justify-between w-full mb-1">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="px-2 py-0.5 rounded text-xs font-semibold shrink-0"
                        style={{
                          backgroundColor: notification.type === 'chat' ? '#DABC4E' : '#015023',
                          color: 'white'
                        }}
                      >
                        {notification.type === 'chat' ? 'Chat' : 'Info'}
                      </div>
                      <p className="font-semibold text-sm line-clamp-1" style={{ color: 'brand-green', fontFamily: 'Urbanist, sans-serif' }}>
                        {notification.title}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5 ml-2" />
                    )}
                  </div>
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: 'brand-green', opacity: 0.7, fontFamily: 'Urbanist, sans-serif' }}>
                    {notification.message}
                  </p>
                  <p className="text-xs" style={{ color: 'brand-green', opacity: 0.5, fontFamily: 'Urbanist, sans-serif' }}>
                    {formatDate(notification.date)}
                  </p>
                </div>
              </DropdownMenuItem>
              {index < notifications.length - 1 && <DropdownMenuSeparator />}
            </Fragment>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notif" className="text-center w-full cursor-pointer font-semibold text-sm py-2" style={{ color: 'brand-green', fontFamily: 'Urbanist, sans-serif' }}>
            Lihat Semua Notifikasi
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

NavbarNotification.displayName = "NavbarNotification";

export default NavbarNotification;