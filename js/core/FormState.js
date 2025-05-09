/**
 * FormState.js
 * Manages the application state for the GeoplyForm
 */

class FormState {
    constructor() {
        // Core state properties
        this.currentPage = 1;
        this.totalPages = 3;
        this.selectedProjectType = '';
        this.formData = {};
        
        // Event callbacks
        this.onStateChange = null;
        
        // Subscribers for state changes
        this.subscribers = [];
    }

    /**
     * Set the current page and trigger state change event
     * @param {number} pageNum - The page number to navigate to
     */
    setCurrentPage(pageNum) {
        console.log('FormState.setCurrentPage called with:', pageNum);
        if (pageNum >= 1 && pageNum <= this.totalPages) {
            this.currentPage = pageNum;
            console.log('Current page updated to:', pageNum);
            this.triggerStateChange('pageChange', { page: pageNum });
        } else {
            console.error('Invalid page number:', pageNum, 'Total pages:', this.totalPages);
        }
    }

    /**
     * Get the current page number
     * @returns {number} The current page number
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Set the selected project type
     * @param {string} projectType - The selected project type
     */
    setProjectType(projectType) {
        this.selectedProjectType = projectType;
        this.formData.projectType = projectType;
        this.triggerStateChange('projectTypeChange', { projectType });
    }

    /**
     * Get the selected project type
     * @returns {string} The selected project type
     */
    getProjectType() {
        return this.selectedProjectType;
    }

    /**
     * Update form data with new values
     * @param {Object} data - Key-value pairs to update in the form data
     */
    updateFormData(data) {
        // Log keys being updated for debugging
        console.log('Updating form data with keys:', Object.keys(data));
        
        // Special debug for windows and doors
        if (data.windows) {
            console.log('Windows data being updated:', data.windows);
        }
        
        if (data.doors) {
            console.log('Doors data being updated:', data.doors);
        }
        
        // Store old state for subscribers
        const oldState = { ...this.formData };
        
        // Update the form data
        this.formData = { ...this.formData, ...data };
        
        // Log the current state of windows and doors after update
        if (this.formData.windows) {
            console.log('Current windows data:', this.formData.windows);
        }
        
        if (this.formData.doors) {
            console.log('Current doors data:', this.formData.doors);
        }
        
        // Trigger state change event
        this.triggerStateChange('formDataChange', { formData: this.formData });
        
        // Notify subscribers
        this.notifySubscribers(this.formData, oldState);
    }

    /**
     * Get the current form data
     * @returns {Object} The current form data
     */
    getFormData() {
        return { ...this.formData };
    }

    /**
     * Reset the form state to initial values
     */
    resetState() {
        const oldState = { ...this.formData };
        this.currentPage = 1;
        this.selectedProjectType = '';
        this.formData = {};
        this.triggerStateChange('formReset', {});
        this.notifySubscribers(this.formData, oldState);
    }

    /**
     * Set the callback function for state changes
     * @param {Function} callback - Function to call when state changes
     */
    setStateChangeCallback(callback) {
        this.onStateChange = callback;
    }

    /**
     * Subscribe to form state changes
     * @param {Function} callback - Function to call when form data changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        if (typeof callback !== 'function') {
            console.error('Subscribe callback must be a function');
            return () => {}; // Return empty unsubscribe function
        }
        
        this.subscribers.push(callback);
        console.log('Added subscriber, total subscribers:', this.subscribers.length);
        
        // Return unsubscribe function
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
            console.log('Removed subscriber, remaining subscribers:', this.subscribers.length);
        };
    }
    
    /**
     * Notify all subscribers of state changes
     * @param {Object} newState - The new form state
     * @param {Object} oldState - The previous form state
     */
    notifySubscribers(newState, oldState) {
        if (this.subscribers.length > 0) {
            console.log('Notifying', this.subscribers.length, 'subscribers of state change');
            this.subscribers.forEach(callback => {
                try {
                    callback(newState, oldState);
                } catch (error) {
                    console.error('Error in subscriber callback:', error);
                }
            });
        }
    }

    /**
     * Trigger the state change callback
     * @param {string} eventType - Type of state change event
     * @param {Object} data - Data associated with the state change
     */
    triggerStateChange(eventType, data) {
        console.log('triggerStateChange called with event:', eventType, data);
        if (typeof this.onStateChange === 'function') {
            console.log('Executing state change callback');
            this.onStateChange(eventType, data);
        } else {
            console.error('No state change callback registered');
        }
    }
}

export default FormState;
