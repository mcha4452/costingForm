/**
 * FormValidator.js
 * Handles form validation logic
 */

class FormValidator {
    constructor() {
        this.form = document.getElementById('geoplyForm');
    }

    /**
     * Validate a specific page of the form
     * @param {number} pageNum - The page number to validate
     * @param {string} projectType - The currently selected project type
     * @returns {boolean} Whether the page is valid
     */
    validatePage(pageNum, projectType) {
        const page = document.getElementById('page' + pageNum);
        if (!page) return true;
        
        // Check if there's a selected card on page 1
        if (pageNum === 1) {
            const selectedCard = page.querySelector('.card-option.selected');
            if (!selectedCard) {
                alert('Please select a project type to continue.');
                return false;
            }
        }
        
        // For page 2, check if roof type is selected if it's a card-selection
        if (pageNum === 2) {
            const roofTypeContainer = page.querySelector('#roofTypeContainer');
            if (roofTypeContainer) {
                const selectedRoof = roofTypeContainer.querySelector('.card-option.selected');
                const hiddenInput = document.getElementById('roofType');
                
                if (!selectedRoof && hiddenInput && hiddenInput.required) {
                    alert('Please select a roof type to continue.');
                    return false;
                }
            }
        }
        
        // Check required fields on the current page
        const requiredFields = page.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            const errorElement = document.getElementById(field.id + 'Error');
            
            if (!field.value.trim()) {
                if (errorElement) errorElement.classList.add('visible');
                field.style.borderColor = 'var(--error-color)';
                isValid = false;
            } else {
                if (errorElement) errorElement.classList.remove('visible');
                field.style.borderColor = 'var(--border-color)';
            }
        });
        
        return isValid;
    }

    /**
     * Validate the entire form
     * @param {number} totalPages - Total number of pages in the form
     * @param {Function} setCurrentPage - Function to navigate to a specific page
     * @returns {boolean} Whether the form is valid
     */
    validateForm(totalPages, setCurrentPage) {
        let isValid = true;
        
        // Validate each page
        for (let i = 1; i <= totalPages; i++) {
            if (!this.validatePage(i)) {
                isValid = false;
                setCurrentPage(i);
                break;
            }
        }
        
        return isValid;
    }

    /**
     * Validate a specific field
     * @param {Element} field - The field to validate
     * @returns {boolean} Whether the field is valid
     */
    validateField(field) {
        if (!field) return true;
        
        const errorElement = document.getElementById(field.id + 'Error');
        let isValid = true;
        
        // Check if field is required and empty
        if (field.required && !field.value.trim()) {
            if (errorElement) errorElement.classList.add('visible');
            field.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            if (errorElement) errorElement.classList.remove('visible');
            field.style.borderColor = 'var(--border-color)';
        }
        
        // Additional validation based on field type
        if (isValid && field.type === 'email' && field.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                if (errorElement) {
                    errorElement.textContent = 'Please enter a valid email address';
                    errorElement.classList.add('visible');
                }
                field.style.borderColor = 'var(--error-color)';
                isValid = false;
            }
        }
        
        // Phone validation
        if (isValid && field.type === 'tel' && field.value.trim()) {
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
        
        return isValid;
    }
}

export default FormValidator;
