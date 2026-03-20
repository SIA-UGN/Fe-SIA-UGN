import api from './axios';

/**
 * Notification API Module
 * Handles all notification-related API calls
 */

// ========================================
// NOTIFICATION APIS
// ========================================

/**
 * Get all notifications for authenticated user
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status: 'read' | 'unread'
 * @param {string} params.type - Filter by type: 'chat' | 'announcement'
 * @returns {Promise} - Notifications data
 */
export async function getNotifications(params = {}) {
    try {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.type) queryParams.append('type', params.type);

        const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Get unread notifications count
 * @returns {Promise} - Unread count data
 */
export async function getUnreadCount() {
    try {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Mark notification as read
 * @param {number} notificationId - The notification ID
 * @returns {Promise} - Success response
 */
export async function markAsRead(notificationId) {
    try {
        const response = await api.put(`/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Mark all notifications as read
 * @returns {Promise} - Success response
 */
export async function markAllAsRead() {
    try {
        const response = await api.put('/notifications/read-all');
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Delete notification
 * @param {number} notificationId - The notification ID
 * @returns {Promise} - Success response
 */
export async function deleteNotification(notificationId) {
    try {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

// ========================================
// ANNOUNCEMENT APIS (Admin/Manager/Dosen)
// ========================================

/**
 * Get all announcements (Admin/Manager/Dosen only)
 * @returns {Promise} - Announcements data
 */
export async function getAnnouncements() {
    try {
        const response = await api.get('/announcements');
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Create announcement (Admin/Manager/Dosen only)
 * @param {Object} data - Announcement data
 * @param {number|null} data.id_class - Class ID (null for broadcast)
 * @param {string} data.message - Announcement message
 * @returns {Promise} - Success response
 */
export async function createAnnouncement(data) {
    try {
        const response = await api.post('/announcements', data);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}
