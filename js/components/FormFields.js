/**
 * FormFields.js
 * Component for managing standard form fields
 */

class FormFields {
    /**
     * Initialize a form fields component
     * @param {Element} container - The container element for the form fields
     * @param {Object} options - Configuration options
     * @param {Function} onFieldChange - Callback for field value changes
     */
    constructor(container, options = {}, onFieldChange = null) {
        this.container = container;
        this.options = options;
        this.onFieldChange = onFieldChange;
        this.fields = {};
        
        // Initialize the component
        this.init();
    }

    /**
     * Initialize the component and set up event listeners
     */
    init() {
        // Find all form fields in the container
        const inputs = this.container.querySelectorAll('input, select, textarea');
        
        // Store references to all fields and add event listeners
        inputs.forEach(input => {
            // Skip hidden inputs that are part of other components
            if (input.type === 'hidden' && input.id.includes('Type')) {
                return;
            }
            
            // Store reference to the field
            this.fields[input.id] = input;
            
            // Add change event listener
            input.addEventListener('change', this.handleFieldChange.bind(this));
            input.addEventListener('input', this.handleFieldInput.bind(this));
        });
    }

    /**
     * Handle field change events
     * @param {Event} event - The change event
     */
    handleFieldChange(event) {
        const field = event.target;
        
        // Validate the field
        this.validateField(field);
        
        // Call the field change callback if provided
        if (typeof this.onFieldChange === 'function') {
            this.onFieldChange(field.id, field.value, field);
        }
    }

    /**
     * Handle field input events (for real-time validation)
     * @param {Event} event - The input event
     */
    handleFieldInput(event) {
        const field = event.target;
        
        // Clear error styling when user starts typing
        const errorElement = document.getElementById(field.id + 'Error');
        if (errorElement) {
            errorElement.classList.remove('visible');
        }
        
        field.style.borderColor = 'var(--border-color)';
    }

    /**
     * Validate a single field
     * @param {Element} field - The field to validate
     * @returns {boolean} Whether the field is valid
     */
    validateField(field) {
        if (!field) return true;
        
        const errorElement = document.getElementById(field.id + 'Error');
        let isValid = true;
        
        // Check if field is required and empty
        if (field.required && !field.value.trim()) {
            if (errorElement) {
                errorElement.textContent = 'This field is required';
                errorElement.classList.add('visible');
            }
            field.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            // Additional validation based on field type
            if (field.type === 'email' && field.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value)) {
                    if (errorElement) {
                        errorElement.textContent = 'Please enter a valid email address';
                        errorElement.classList.add('visible');
                    }
                    field.style.borderColor = 'var(--error-color)';
                    isValid = false;
                }
            } else if (field.type === 'tel' && field.value.trim()) {
                const phonePattern = /^[\d\+\-\(\)\s]{7,20}$/;
                if (!phonePattern.test(field.value)) {
                    if (errorElement) {
                        errorElement.textContent = 'Please enter a valid phone number';
                        errorElement.classList.add('visible');
                    }
                    field.style.borderColor = 'var(--error-color)';
                    isValid = false;
                }
            }
            
            // If valid, clear any error styling
            if (isValid) {
                if (errorElement) errorElement.classList.remove('visible');
                field.style.borderColor = 'var(--border-color)';
            }
        }
        
        return isValid;
    }

    /**
     * Validate all fields in the container
     * @returns {boolean} Whether all fields are valid
     */
    validateAllFields() {
        let isValid = true;
        
        // Validate each field
        Object.values(this.fields).forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * Get the value of a specific field
     * @param {string} fieldId - The ID of the field
     * @returns {string} The field value
     */
    getFieldValue(fieldId) {
        return this.fields[fieldId] ? this.fields[fieldId].value : '';
    }

    /**
     * Set the value of a specific field
     * @param {string} fieldId - The ID of the field
     * @param {string} value - The value to set
     */
    setFieldValue(fieldId, value) {
        if (this.fields[fieldId]) {
            this.fields[fieldId].value = value;
        }
    }

    /**
     * Get all field values as an object
     * @returns {Object} All field values as key-value pairs
     */
    getAllValues() {
        const values = {};
        
        Object.entries(this.fields).forEach(([id, field]) => {
            values[id] = field.value;
        });
        
        return values;
    }

    /**
     * Set multiple field values at once
     * @param {Object} values - Object with field IDs as keys and values to set
     */
    setValues(values) {
        Object.entries(values).forEach(([id, value]) => {
            this.setFieldValue(id, value);
        });
    }

    /**
     * Reset all fields to their default values
     */
    reset() {
        Object.values(this.fields).forEach(field => {
            field.value = '';
            field.style.borderColor = 'var(--border-color)';
            
            const errorElement = document.getElementById(field.id + 'Error');
            if (errorElement) {
                errorElement.classList.remove('visible');
            }
        });
    }
}

export default FormFields;
