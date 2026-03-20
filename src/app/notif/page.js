'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/ui/navigation-menu'
import Footer from '@/components/ui/footer'
import LoadingEffect from '@/components/ui/loading-effect'
import { ErrorMessageBoxWithButton, SuccessMessageBox } from '@/components/ui/message-box' 
import { ArrowLeft, Bell, MessageCircle, Check, X } from 'lucide-react'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/lib/notificationApi'
import { getConversationDetail } from '@/lib/chatApi'
import { AlertConfirmationRedDialog } from '@/components/ui/alert-dialog'
import ChatModal from '@/components/ui/chatmodal'
import { getEcho } from '@/lib/echo'
import Cookies from 'js-cookie'

function NotifikasiPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State management
  const [filter, setFilter] = useState('all')
  const [allNotifications, setAllNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  
  const [highlightId, setHighlightId] = useState(searchParams.get('highlight'))

  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatUser, setChatUser] = useState({ id: '', name: '', nim: '', conversationId: '' })

  // Auto-hide success message
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => {
      setSuccessMessage('')
    }, 5000)
    return () => clearTimeout(timer)
  }, [successMessage])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getNotifications()

      if (response.status === 'success') {
        const transformedNotifications = response.data.notifications.map(notif => ({
          id: notif.id_notification,
          type: notif.type,
          judul: notif.title,
          isi: notif.message,
          tanggal: notif.sent_at,
          kelas: notif.metadata?.class_code || null,
          pengumum: notif.sender || 'System',
          isRead: notif.is_read,
          metadata: notif.metadata
        }))

        setAllNotifications(transformedNotifications)
      } else {
        setError(response.message || 'Gagal mengambil notifikasi')
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.message || 'Gagal mengambil notifikasi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // WebSocket Real-time Notification Listener
  useEffect(() => {
    const echo = getEcho()
    if (!echo) {
      console.warn('[NotifPage] Echo not initialized')
      return
    }

    // Get user ID dengan cookies dan localStorage fallback
    let userId = null
    const userIdFromCookie = Cookies.get('user_id')
    if (userIdFromCookie) {
      userId = userIdFromCookie
    } else {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          userId = user.id_user_si
        } catch (err) {
          console.error('[NotifPage] Failed to parse user data:', err)
        }
      }
    }

    if (!userId) return

    const setupSubscription = () => {
      const pusher = echo.connector?.pusher
      if (!pusher) return

      const state = pusher.connection.state
      if (state === 'connected') {
        subscribeToChannel()
      } else {
        pusher.connection.bind('connected', subscribeToChannel)
      }
    }

    const subscribeToChannel = () => {
      const channel = echo.private(`user.${userId}`)

      channel
        .listen('.NewNotification', (event) => {
          console.log('[NotifPage] 🔔 New notification received:', event)

          // Transform to match API response format (consistent with fetchNotifications)
          const newNotif = {
            id: event.notification.id_notification,
            type: event.notification.type,
            judul: event.notification.title,
            isi: event.notification.message,
            tanggal: event.notification.sent_at || new Date().toISOString(),
            kelas: event.notification.metadata?.class_code || null,
            pengumum: event.notification.sender || 'System',
            isRead: event.notification.is_read || false,
            metadata: event.notification.metadata || {}
          }
          
          console.log('[NotifPage] ✅ Adding new notification to list:', newNotif)
          
          setAllNotifications(prev => {
            // Check for duplicates by notification ID
            const exists = prev.some(n => n.id === newNotif.id)
            if (exists) {
              console.log('[NotifPage] ⚠️ Notification already exists, skipping')
              return prev
            }

            // Add new notification at the beginning
            return [newNotif, ...prev]
          })
        })
    }

    setupSubscription()

    return () => {
      if (userId) echo.leave(`user.${userId}`)
    }
  }, [])

  // Logic Auto Scroll & Highlight (akan berjalan setelah notifikasi dimuat)
  useEffect(() => {
    if (!highlightId || loading || allNotifications.length === 0) return

    const scrollToNotification = () => {
      const targetNotif = allNotifications.find(n => n.id.toString() === highlightId.toString())
      
      if (targetNotif) {
        const element = document.getElementById(`notif-${targetNotif.id}`)
        
        if (element) {
          console.log('Scrolling to notification:', highlightId)
          const yOffset = -120
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          
          window.scrollTo({ top: y, behavior: 'smooth' })
          
          // Efek highlight
          const originalTransition = element.style.transition
          const originalBg = element.style.backgroundColor

          element.style.transition = 'background-color 0.5s ease'
          element.style.backgroundColor = '#FEF3C7' 
          
          // Hapus highlight dan parameter URL setelah 3 detik
          setTimeout(() => {
            setHighlightId(null)
            window.history.replaceState({}, '', '/notif') 
            element.style.backgroundColor = originalBg
            element.style.transition = originalTransition
          }, 3000)
        }
      }
    }

    const timer = setTimeout(scrollToNotification, 300)
    return () => clearTimeout(timer)

  }, [highlightId, loading, allNotifications])


  const handleMarkAsRead = async (notificationId) => {
    const isTempId = typeof notificationId === 'string' && notificationId.startsWith('temp-')

    // Optimistic update
    setAllNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    )

    if (isTempId) return

    try {
      const response = await markAsRead(notificationId)
      if (response.status !== 'success') {
        setError(response.message || 'Gagal menandai notifikasi')
      }
    } catch (err) {
      console.error('Error marking as read:', err)
      // Revert on error
      setAllNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: false } : notif
        )
      )
      setError('Gagal menandai notifikasi sebagai dibaca')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (isMarkingAsRead) return
    
    try {
      setIsMarkingAsRead(true)
      setError(null)
      
      // Filter notifikasi berdasarkan tab yang aktif
      const notificationsToMark = filter === 'all' 
        ? allNotifications 
        : allNotifications.filter(notif => notif.type === filter)
      
      // Get IDs yang perlu di-mark (skip temp IDs)
      const idsToMark = notificationsToMark
        .filter(n => !(typeof n.id === 'string' && n.id.startsWith('temp-')))
        .map(n => n.id)
      
      if (idsToMark.length === 0) {
        setSuccessMessage('Tidak ada notifikasi yang perlu ditandai sebagai dibaca')
        setIsMarkingAsRead(false)
        return
      }
      
      // Mark as read via API (satu per satu karena tidak ada bulk endpoint)
      const markPromises = idsToMark.map(id => markAsRead(id))
      await Promise.allSettled(markPromises)
      
      // Update UI: mark yang sesuai filter sebagai read
      setAllNotifications(prev =>
        prev.map(notif => {
          if (filter === 'all' || notif.type === filter) {
            return { ...notif, isRead: true }
          }
          return notif
        })
      )
      
      // Success message berdasarkan filter
      const filterLabel = filter === 'all' ? 'Semua notifikasi' : 
                          filter === 'announcement' ? 'Semua pengumuman' : 
                          'Semua chat'
      setSuccessMessage(`${filterLabel} telah ditandai sebagai dibaca`)
      
    } catch (err) {
      console.error('Error marking all as read:', err)
      setError(err.message || 'Gagal menandai notifikasi sebagai dibaca')
      fetchNotifications()
    } finally {
      setIsMarkingAsRead(false)
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      const isTempId = typeof notificationId === 'string' && notificationId.startsWith('temp-')
      
      // Optimistic update
      setAllNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      )

      if (isTempId) return

      const response = await deleteNotification(notificationId)
      
      if (response.status === 'success') {
        setSuccessMessage('Notifikasi berhasil dihapus')
      } else {
        setError(response.message || 'Gagal menghapus notifikasi')
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
      setError('Gagal menghapus notifikasi')
      fetchNotifications()
    }
  }

  const handleDeleteAll = () => {
    setShowDeleteAllDialog(true)
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id)
    }

    if (notif.type === 'chat' && notif.metadata?.id_conversation) {
      try {
        const response = await getConversationDetail(notif.metadata.id_conversation)
        const otherParticipant = response.data?.conversation?.other_participant
        
        setChatUser({
          id: otherParticipant?.id_user_si?.toString() || '',
          name: otherParticipant?.name || 'User',
          nim: otherParticipant?.nim || '',
          conversationId: notif.metadata.id_conversation.toString()
        })
        setIsChatOpen(true)
      } catch (err) {
        console.error('Error fetching conversation:', err)
      }
    }
  }

  const confirmDeleteAll = async () => {
    if (isDeleting) return
    
    try {
      setShowDeleteAllDialog(false)
      setIsDeleting(true)
      setError(null)
      
      // Filter notifikasi berdasarkan tab yang aktif
      const notificationsToDelete = filter === 'all' 
        ? allNotifications 
        : allNotifications.filter(notif => notif.type === filter)
      
      // Get real IDs (skip temp IDs)
      const realIds = notificationsToDelete
        .filter(n => !(typeof n.id === 'string' && n.id.startsWith('temp-')))
        .map(n => n.id)

      if (realIds.length === 0) {
        setSuccessMessage('Tidak ada notifikasi yang perlu dihapus')
        setIsDeleting(false)
        return
      }

      const deletePromises = realIds.map(id => deleteNotification(id))
      const results = await Promise.allSettled(deletePromises)
      
      const failedCount = results.filter(r => r.status === 'rejected').length
      
      if (failedCount > 0) {
        setError(`Gagal menghapus ${failedCount} notifikasi`)
        fetchNotifications()
        return
      }

      // Remove deleted notifications from state
      if (filter === 'all') {
        setAllNotifications([])
      } else {
        setAllNotifications(prev => 
          prev.filter(notif => notif.type !== filter)
        )
      }
      
      // Success message berdasarkan filter
      const filterLabel = filter === 'all' ? 'Semua notifikasi' : 
                          filter === 'announcement' ? 'Semua pengumuman' : 
                          'Semua chat'
      setSuccessMessage(`${filterLabel} berhasil dihapus`)
    } catch (err) {
      console.error('Error deleting all notifications:', err)
      setError(err.message || 'Gagal menghapus notifikasi')
      fetchNotifications()
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredNotifications = filter === 'all'
    ? allNotifications
    : allNotifications.filter(notif => notif.type === filter)

  const formatDate = (dateString) => {
    // Handle tanggal tidak valid
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Baru saja'
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return date.toLocaleDateString('id-ID', options)
  }

  // Count unread berdasarkan filter yang aktif
  const unreadCount = filteredNotifications.filter(n => !n.isRead).length

  if (loading) {
    return <LoadingEffect message="Memuat notifikasi..." />
  } else if (error && allNotifications.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Urbanist, sans-serif' }}>
        <Navbar />
        <main style={{ flex: 1, backgroundColor: '#E6EEE9', padding: '32px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '600px', width: '100%', padding: '0 24px' }}>
            <ErrorMessageBoxWithButton 
              message={error}
              onRetry={fetchNotifications}
            />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Urbanist, sans-serif' }}>
      <Navbar />

      <main style={{ flex: 1, backgroundColor: '#E6EEE9', padding: '32px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          {/* Success/Error Messages */}
          <div className="fixed top-20 right-4 z-50 space-y-2" style={{ maxWidth: '400px' }}>
            {successMessage && (
              <SuccessMessageBox message={successMessage} />
            )}
            {error && allNotifications.length > 0 && (
              <ErrorMessageBoxWithButton 
                message={error}
                onRetry={fetchNotifications}
              />
            )}
          </div>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: '#015023',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '16px',
                fontFamily: 'Urbanist, sans-serif'
              }}
            >
              <ArrowLeft size={20} />
              Kembali
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#015023', margin: 0 }}>
                  Notifikasi & Pengumuman
                </h1>
                <p style={{ fontSize: '16px', color: '#015023', opacity: 0.7, marginTop: '8px' }}>
                  {unreadCount > 0 
                    ? `${unreadCount} ${filter === 'all' ? 'notifikasi' : filter === 'announcement' ? 'pengumuman' : 'chat'} belum dibaca` 
                    : `Semua ${filter === 'all' ? 'notifikasi' : filter === 'announcement' ? 'pengumuman' : 'chat'} sudah dibaca`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAsRead || isDeleting}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#015023',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: (isMarkingAsRead || isDeleting) ? 'not-allowed' : 'pointer',
                      fontFamily: 'Urbanist, sans-serif',
                      transition: 'opacity 0.2s',
                      opacity: isMarkingAsRead ? '0.6' : '1'
                    }}
                    onMouseEnter={(e) => !(isMarkingAsRead || isDeleting) && (e.target.style.opacity = '0.9')}
                    onMouseLeave={(e) => !(isMarkingAsRead || isDeleting) && (e.target.style.opacity = '1')}
                  >
                    {isMarkingAsRead ? 'Memproses...' : `Tandai Semua Dibaca`}
                  </button>
                )}

                {filteredNotifications.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    disabled={isMarkingAsRead || isDeleting}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#BE0414', 
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: (isMarkingAsRead || isDeleting) ? 'not-allowed' : 'pointer',
                      fontFamily: 'Urbanist, sans-serif',
                      transition: 'opacity 0.2s',
                      opacity: isDeleting ? '0.6' : '1'
                    }}
                    onMouseEnter={(e) => !(isMarkingAsRead || isDeleting) && (e.target.style.opacity = '0.9')}
                    onMouseLeave={(e) => !(isMarkingAsRead || isDeleting) && (e.target.style.opacity = '1')}
                  >
                    {isDeleting ? 'Menghapus...' : 'Hapus Semua'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            borderBottom: '2px solid rgba(1, 80, 35, 0.1)',
            paddingBottom: '0',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
            className="hide-scrollbar"
          >
            {[
              { value: 'all', label: 'Semua', icon: Bell },
              { value: 'announcement', label: 'Pengumuman', icon: Bell },
              { value: 'chat', label: 'Chat', icon: MessageCircle }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  style={{
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderBottom: filter === tab.value ? '3px solid #015023' : '3px solid transparent',
                    color: filter === tab.value ? '#015023' : 'rgba(1, 80, 35, 0.5)',
                    fontSize: '14px',
                    fontWeight: filter === tab.value ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'Urbanist, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <Icon size={16} />
                  <span style={{ fontSize: '14px' }}>{tab.label}</span>
                  {tab.value === 'all' && allNotifications.length > 0 && (
                    <span style={{
                      marginLeft: '2px',
                      fontSize: '12px',
                      opacity: 0.7
                    }}>
                      ({allNotifications.length})
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Notifications List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredNotifications.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                border: '2px solid rgba(1, 80, 35, 0.2)'
              }}>
                <Bell size={48} style={{ color: '#015023', opacity: 0.3, margin: '0 auto 16px' }} />
                <p style={{ fontSize: '18px', color: '#015023', opacity: 0.7 }}>
                  Tidak ada notifikasi
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const Icon = notif.type === 'chat' ? MessageCircle : Bell;
                const isHighlighted = highlightId && (notif.id.toString() === highlightId.toString());
                
                return (
                  <div 
                    key={notif.id}
                    id={`notif-${notif.id}`}
                    onClick={() => notif.type === 'chat' && handleNotificationClick(notif)}
                    style={{
                      backgroundColor: isHighlighted ? '#FEF3C7' : (notif.isRead ? 'white' : '#F0FDF4'),
                      borderRadius: '16px',
                      padding: '24px',
                      border: isHighlighted ? '2px solid #DABC4E' : '1px solid rgba(1, 80, 35, 0.1)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'all 0.3s ease',
                      boxShadow: isHighlighted ? '0 4px 12px rgba(218, 188, 78, 0.3)' : 'none',
                      cursor: notif.type === 'chat' ? 'pointer' : 'default'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!notif.isRead && (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#015023'
                          }} />
                        )}
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          backgroundColor: notif.type === 'chat' ? '#DABC4E' : '#015023',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Icon size={14} />
                          {notif.type === 'chat' ? 'Chat' : 'Pengumuman'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#015023',
                        marginBottom: '8px',
                        marginTop: 0
                      }}>
                        {notif.judul}
                      </h3>

                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '12px',
                        fontSize: '14px',
                        color: '#015023',
                        opacity: 0.7
                      }}>
                        <span>{notif.pengumum}</span>
                        <span>•</span>
                        <span>{formatDate(notif.tanggal)}</span>
                      </div>

                      {notif.type === 'announcement' && notif.metadata?.subject_name && (
                        <div style={{
                          marginBottom: '12px',
                          padding: '12px',
                          backgroundColor: '#E0FFEAFF',
                          borderRadius: '8px',
                          borderLeft: '4px solid #015023'
                        }}>
                          <p style={{ fontSize: '14px', color: '#015023', margin: '0 0 4px 0' }}>
                            <strong>Yth.</strong> {notif.metadata.student_name || 'Mahasiswa'} ({notif.metadata.student_nim || 'NIM'})
                          </p>
                          <p style={{ fontSize: '14px', color: '#015023', margin: '0 0 4px 0' }}>
                            <strong>Matakuliah:</strong> {notif.metadata.subject_code} - {notif.metadata.subject_name}
                          </p>
                          <p style={{ fontSize: '14px', color: '#015023', margin: '0 0 4px 0' }}>
                            <strong>Kelas:</strong> {notif.metadata.class_code}
                          </p>
                          {notif.metadata.lecturer_name && (
                            <p style={{ fontSize: '14px', color: '#015023', margin: 0 }}>
                              <strong>Dosen:</strong> {notif.metadata.lecturer_name}
                            </p>
                          )}
                        </div>
                      )}

                      <p style={{
                        fontSize: '16px',
                        color: '#015023',
                        opacity: 0.8,
                        lineHeight: '1.6',
                        margin: '0 0 16px 0',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {notif.isi}
                      </p>

                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'flex-end'
                      }}>
                        {!notif.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notif.id)
                            }}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: '#015023',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'opacity 0.2s',
                              border: 'none'
                            }}
                            title="Tandai sudah dibaca"
                          >
                            <Check size={20} strokeWidth={3} />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNotification(notif.id)
                          }}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: '#BE0414',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 0.2s',
                            border: 'none'
                          }}
                          title="Hapus notifikasi"
                        >
                          <X size={20} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AlertConfirmationRedDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
        onConfirm={confirmDeleteAll}
        title={`Hapus Semua ${filter === 'all' ? 'Notifikasi' : filter === 'announcement' ? 'Pengumuman' : 'Chat'}`}
        description={`Apakah Anda yakin ingin menghapus SEMUA ${filter === 'all' ? 'notifikasi' : filter === 'announcement' ? 'pengumuman' : 'chat'}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
      />

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false)
          fetchNotifications()
        }}
        userId={chatUser.id}
        userName={chatUser.name}
        userNim={chatUser.nim}
        conversationId={chatUser.conversationId}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingEffect message="Memuat notifikasi..." />}>
      <NotifikasiPage />
    </Suspense>
  )
}