// src/app/dashboard/page.jsx
'use client';

import { Container, SectionTitle, Card, CardHeader, CardContent, ScheduleItem, NotificationItem } from '@/components/ui/container-dashboard';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { useState, useEffect } from 'react';
import { getMySchedules, formatTime, getDayName, formatDate } from '@/lib/scheduleApi';
import { getNotifications, markAsRead } from '@/lib/notificationApi';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { ArrowRight, Bell, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { getEcho } from '@/lib/echo';

export default function Dashboard() {
    const router = useRouter();
    const [schedules, setSchedules] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState('mahasiswa');
    const [todayDate, setTodayDate] = useState('');
    const [error, setError] = useState(null);

    // Get today's date and user role
    useEffect(() => {
        const today = new Date();
        setTodayDate(formatDate(today));
        
        const role = Cookies.get('roles') || 'mahasiswa';
        setUserRole(role);
        
        fetchData(role);
    }, []);

    // WebSocket Real-time Notification Listener for Announcements
    useEffect(() => {
        const echo = getEcho();
        if (!echo) {
            console.warn('[Dashboard] Echo not initialized');
            return;
        }

        // Get user ID - PRIORITY: Cookies, FALLBACK: localStorage
        let userId = null;
        
        const userIdFromCookie = Cookies.get('user_id');
        if (userIdFromCookie) {
            userId = userIdFromCookie;
        } else {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userId = user.id_user_si;
                } catch (err) {
                    console.error('[Dashboard] Failed to parse user data:', err);
                }
            }
        }

        if (!userId) {
            console.warn('[Dashboard] No user ID found');
            return;
        }

        console.log('[Dashboard] Setting up WebSocket subscription for user:', userId);

        let channel = null;
        let isSubscribed = false;

        const setupSubscription = () => {
            const pusher = echo.connector?.pusher;
            if (!pusher) {
                console.error('[Dashboard] Pusher instance not found');
                return;
            }

            const state = pusher.connection.state;
            console.log('[Dashboard] Current connection state:', state);

            if (state === 'connected') {
                subscribeToChannel();
            } else {
                console.log('[Dashboard] Waiting for connection...');
                pusher.connection.bind('connected', subscribeToChannel);
            }
        };

        const subscribeToChannel = () => {
            if (isSubscribed) {
                console.log('[Dashboard] Already subscribed, skipping');
                return;
            }

            console.log('[Dashboard] Subscribing to private channel: user.' + userId);
            
            try {
                channel = echo.private(`user.${userId}`);

                channel.listen('.NewNotification', (event) => {
                    console.log('[Dashboard] 🔔 New notification received:', event);

                    // Only add if it's an announcement type
                    if (event.notification?.type === 'announcement') {
                        // Transform to match API response format (same structure as fetchData)
                        const newAnnouncement = {
                            id_notification: event.notification.id_notification,
                            type: event.notification.type,
                            title: event.notification.title,
                            message: event.notification.message,
                            sent_at: event.notification.sent_at || new Date().toISOString(),
                            created_at: event.notification.sent_at || new Date().toISOString(),
                            read_at: event.notification.read_at || null,
                            is_read: event.notification.is_read || false,
                            sender: event.notification.sender || 'System',
                            metadata: event.notification.metadata || {}
                        };

                        console.log('[Dashboard] ✅ Adding new announcement to list:', newAnnouncement);

                        setAnnouncements(prev => {
                            // Check if notification already exists
                            const exists = prev.some(n => n.id_notification === newAnnouncement.id_notification);
                            if (exists) {
                                console.log('[Dashboard] ⚠️ Announcement already exists, skipping');
                                return prev;
                            }
                            // Add new announcement at the beginning
                            return [newAnnouncement, ...prev];
                        });
                    } else {
                        console.log('[Dashboard] ℹ️ Notification is not announcement type, ignoring');
                    }
                });

                isSubscribed = true;
                console.log('[Dashboard] ✅ Successfully subscribed to user.' + userId);
            } catch (error) {
                console.error('[Dashboard] ❌ Error subscribing to channel:', error);
            }
        };

        setupSubscription();

        // Cleanup
        return () => {
            if (channel) {
                try {
                    console.log('[Dashboard] 🧹 Leaving channel: user.' + userId);
                    echo.leave(`user.${userId}`);
                } catch (error) {
                    console.error('[Dashboard] Error leaving channel:', error);
                }
            }
        };
    }, []); // Run once on mount

    const fetchData = async (role) => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch schedules and announcements in parallel
            const [schedulesRes, notificationsRes] = await Promise.all([
                getMySchedules(role),
                getNotifications({ type: 'announcement' })
            ]);

            if (schedulesRes.status === 'success') {
                setSchedules(schedulesRes.data || []);
            } else {
                throw new Error(schedulesRes.message || 'Gagal mengambil data jadwal');
            }

            if (notificationsRes.status === 'success') {
                setAnnouncements(notificationsRes.data.notifications || []);
            } else {
                throw new Error(notificationsRes.message || 'Gagal mengambil data pengumuman');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.response?.data?.message || error.message || 'Terjadi kesalahan saat memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper: get today's date (YYYY-MM-DD) in Asia/Jakarta timezone
    const getTodayDateYMDInJakarta = () => {
        return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    };

    // Filter today's schedules
    const getTodaySchedules = () => {
        // Use Asia/Jakarta (UTC+7) date for comparison
        const todayDateString = getTodayDateYMDInJakarta(); // Format: YYYY-MM-DD
        
        // Filter schedules by today's date
        return schedules.filter(classItem => {
            if (!classItem.schedules || classItem.schedules.length === 0) return false;
            return classItem.schedules.some(schedule => schedule.date === todayDateString);
        });
    };

return (
<div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#E6EEE9' }}>
    {/* Background Decorations */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Circle */}
        <div 
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
            style={{ backgroundColor: '#015023' }}
        />
        {/* Top Left Circle */}
        <div 
            className="absolute top-40 -left-32 w-96 h-96 rounded-full opacity-5"
            style={{ backgroundColor: '#015023' }}
        />
        {/* Bottom Right Circle */}
        <div 
            className="absolute -bottom-32 right-20 w-80 h-80 rounded-full opacity-8"
            style={{ backgroundColor: '#015023' }}
        />
        {/* Decorative dots pattern */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: '#DABC4E' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full opacity-15" style={{ backgroundColor: '#DABC4E' }} />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: '#DABC4E' }} />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full opacity-15" style={{ backgroundColor: '#DABC4E' }} />
    </div>

    {/* Navbar */}
    <Navbar />
    
    {/* Main Content */}
    <main className="flex-1 relative z-10">
    <Container className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
            <ErrorMessageBoxWithButton 
                message={error}
                action={() => fetchData(userRole)}
            />
        )}
        
        {/* Jadwal Section */}
        <section className="mb-12">
        <SectionTitle>Jadwal Harian</SectionTitle>
        
        <Card>
            <CardHeader date={todayDate} />
            <CardContent>
            {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                    Memuat jadwal...
                </div>
            ) : error ? (
                <div className="text-center py-8 text-gray-500">
                    Gagal memuat data jadwal
                </div>
            ) : (() => {
                const todaySchedules = getTodaySchedules();
                return todaySchedules.length > 0 ? (
                    todaySchedules.map((classItem) => {
                        // Get today's schedules for this class (Asia/Jakarta)
                        const todayDateString = getTodayDateYMDInJakarta();
                        const todayClassSchedules = classItem.schedules?.filter(
                            schedule => schedule.date === todayDateString
                        ) || [];
                        
                        return todayClassSchedules.map((schedule, idx) => (
                            <ScheduleItem
                                key={`${classItem.id_class}-${idx}`}
                                matakuliah={classItem.subject?.name_subject || '-'}
                                waktu={classItem.start_time && classItem.end_time 
                                    ? `${formatTime(classItem.start_time)} - ${formatTime(classItem.end_time)}`
                                    : '-'
                                }
                                kelas={`Kelas ${classItem.code_class}`}
                                dosen={`Dosen: ${classItem.dosen || '-'}`}
                                sks={`${classItem.subject.sks || 0} SKS`}
                                kode={classItem.subject.code_subject || '-'}
                                pertemuan={`${schedule.pertemuan || 'Pertemuan Ke-'}`}
                            />
                        ));
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Tidak ada jadwal hari ini
                    </div>
                );
            })()}
            </CardContent>
        </Card>
        </section>

        {/* Notifikasi Section */}
        <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
            <SectionTitle>Pengumuman</SectionTitle>
            <Link 
                href="/notif" 
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#015023',
                    fontSize: '16px',
                    fontWeight: '600',
                    fontFamily: 'Urbanist, sans-serif',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                    justifyContent: 'flex-end',
                    textAlign: 'right'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
                Lihat semua pengumuman
                <ArrowRight size={20} />
            </Link>
        </div>
        
        <Card>
            <CardHeader date={todayDate} />
            <CardContent>
            {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                    Memuat pengumuman...
                </div>
            ) : error ? (
                <div className="text-center py-8 text-gray-500">
                    Gagal memuat data pengumuman
                </div>
            ) : announcements.length > 0 ? (
                announcements.slice(0, 3).map((notif) => (
                    <NotificationItem
                        key={notif.id_notification}
                        tag={notif.metadata?.class_code || 'Pengumuman Umum'}
                        title={notif.title || 'Pengumuman'}
                        content={notif.message}
                        date={notif.sent_at || notif.created_at}
                        pengumum={notif.sender || 'System'}
                        metadata={notif.metadata}
                        onClick={async () => {
                            // Mark as read
                            try {
                                await markAsRead(notif.id_notification);
                            } catch (err) {
                                console.error('Error marking as read:', err);
                            }
                            // Redirect to notif page with highlight
                            router.push(`/notif?highlight=${notif.id_notification}`);
                        }}
                    />
                ))
            ) : (
                <div className="text-center py-8 text-gray-500">
                    Tidak ada pengumuman baru
                </div>
            )}
            </CardContent>
        </Card>
        </section>
    </Container>
    </main>
    
    {/* Footer */}
    <Footer />
</div>
);
}