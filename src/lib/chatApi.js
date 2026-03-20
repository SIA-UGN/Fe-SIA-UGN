import api from "./axios";

/**
 * Chat API Services
 * Semua endpoint untuk chat functionality
 */

/**
 * Get all conversations for current user
 * @returns {Promise} Response dengan data conversations
 */
export const getConversations = async () => {
    try {
        const response = await api.get('/chat/conversations');
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Find or create private conversation with another user
 * @param {number} recipientId - ID of the recipient user
 * @returns {Promise} Response dengan data conversation
 */
export const findOrCreatePrivateConversation = async (recipientId) => {
    try {
        const response = await api.post('/chat/conversations/private', {
            recipient_id: recipientId
        });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get all messages in a conversation
 * @param {number} conversationId - ID of the conversation
 * @returns {Promise} Response dengan data messages
 */
export const getMessages = async (conversationId) => {
    try {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Send a message to a conversation
 * @param {number} conversationId - ID of the conversation
 * @param {string} message - Message text to send
 * @returns {Promise} Response dengan data message baru
 */
export const sendMessage = async (conversationId, message) => {
    try {
        const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
            message: message
        });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get contact list (all users from classes)
 * @returns {Promise} Response dengan data contacts
 */
export const getContactList = async () => {
    try {
        const response = await api.get('/chat/contacts');
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Get conversation detail (untuk redirect dari notifikasi)
 * @param {number} conversationId - ID of the conversation
 * @returns {Promise} Response dengan detail conversation termasuk participants
 */
export const getConversationDetail = async (conversationId) => {
    try {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

/**
 * Mark messages as read
 * @param {number} conversationId - ID of the conversation
 * @param {Array<number>} messageIds - Array of message IDs to mark as read
 * @returns {Promise} Response dengan data marked messages
 */
export const markMessagesAsRead = async (conversationId, messageIds) => {
    try {
        const response = await api.post(`/chat/conversations/${conversationId}/read`, {
            message_ids: messageIds
        });
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
};

export default {
    getConversations,
    findOrCreatePrivateConversation,
    getMessages,
    sendMessage,
    getContactList,
    getConversationDetail,
    markMessagesAsRead,
};
