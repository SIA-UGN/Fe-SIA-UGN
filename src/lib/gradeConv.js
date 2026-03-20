import api from "./axios";

/**
 * Semua fungsi terkait konversi nilai
 */

/**
 * Get all grade conversions
 * @returns {Promise<Array>} Array of grade conversion objects
 */
export const getGradeConversions = async () => {
    try {
        const response = await api.get("/grade-conversions");
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Get a grade conversion by ID
 * @param {number} id 
 * @returns {Promise<Object>} The grade conversion object
 */
export const getGradeConversionById = async (id) => {
    try {
        const response = await api.get(`/grade-conversions/${id}`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Create a new grade conversion
 * @param {Object} data 
 * @returns {Promise<Object>} The created grade conversion object
 */
export const createGradeConversion = async (data) => {
    try {
        const response = await api.post("/grade-conversions", data);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Update an existing grade conversion
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>} The updated grade conversion object
 */
export const updateGradeConversion = async (id, data) => {
    try {
        const response = await api.put(`/grade-conversions/${id}`, data);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}

/**
 * Delete a grade conversion
 * @param {number} id 
 * @returns {Promise<Object>} The deleted grade conversion object
 */
export const deleteGradeConversion = async (id) => {
    try {
        const response = await api.delete(`/grade-conversions/${id}`);
        return response.data;
    } catch (error) {
        throw (error.response?.data ?? error);
    }
}