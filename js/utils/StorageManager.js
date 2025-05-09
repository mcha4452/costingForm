/**
 * StorageManager.js
 * Handles storage operations for the GeoplyForm
 */

class StorageManager {
    /**
     * Initialize the storage manager
     * @param {string} storageKey - The key to use for localStorage
     */
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    /**
     * Save a form submission to localStorage
     * @param {Object} formData - The form data to save
     */
    saveSubmission(formData) {
        const submissions = this.getAllSubmissions();
        submissions.push(formData);
        localStorage.setItem(this.storageKey, JSON.stringify(submissions));
    }

    /**
     * Get all saved submissions
     * @returns {Array} Array of saved submissions
     */
    getAllSubmissions() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    /**
     * Clear all saved submissions
     */
    clearAllSubmissions() {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Save form state for later continuation
     * @param {Object} formState - The current form state
     */
    saveFormState(formState) {
        localStorage.setItem(`${this.storageKey}_state`, JSON.stringify(formState));
    }

    /**
     * Get saved form state
     * @returns {Object|null} The saved form state or null if none exists
     */
    getSavedFormState() {
        const savedState = localStorage.getItem(`${this.storageKey}_state`);
        return savedState ? JSON.parse(savedState) : null;
    }

    /**
     * Clear saved form state
     */
    clearSavedFormState() {
        localStorage.removeItem(`${this.storageKey}_state`);
    }
}

export default StorageManager;
