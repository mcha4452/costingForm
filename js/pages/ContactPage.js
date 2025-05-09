/**
 * ContactPage.js
 * Handles the contact information page
 */

import FormFields from '../components/FormFields.js';

class ContactPage {
    /**
     * Initialize the contact page
     * @param {Element} pageElement - The page container element
     * @param {Object} formState - The form state manager
     */
    constructor(pageElement, formState) {
        this.pageElement = pageElement;
        this.formState = formState;
        this.formFields = null;
        this.summaryContainer = null;
        
        this.init();
    }

    /**
     * Initialize the page components
     */
    init() {
        // Add a summary section at the top of the page
        this.addSummarySection();
        
        // Initialize form fields
        this.formFields = new FormFields(
            this.pageElement,
            {},
            this.handleFieldChange.bind(this)
        );
    }
    
    /**
     * Add a summary section to display the choices made so far
     */
    addSummarySection() {
        const insertPoint = this.pageElement.querySelector('h2');
        
        if (!insertPoint) return;
        
        // Create summary container
        const summarySection = document.createElement('div');
        summarySection.className = 'summary-section';
        summarySection.innerHTML = `
            <h3>Your Selections</h3>
            <div class="summary-container" id="summaryContainer"></div>
        `;
        
        // Insert after the h2 heading
        insertPoint.parentNode.insertBefore(summarySection, insertPoint.nextSibling);
        
        // Store reference to the summary container
        this.summaryContainer = summarySection.querySelector('#summaryContainer');
        
        // Initial population of the summary
        this.updateSummary();
    }
    
    /**
     * Update the summary section with form data
     */
    updateSummary() {
        if (!this.summaryContainer) return;
        
        // Get the current form data
        const formData = this.formState.getFormData();
        
        // Create HTML for summary
        let summaryHTML = '<div class="summary-content">';
        
        // Project Type
        const projectTypeMap = {
            'turnkey': 'Turnkey Build',
            'structureOnly': 'Structure Only'
        };
        
        summaryHTML += `<div class="summary-item">
            <div class="summary-label">Project Type:</div>
            <div class="summary-value">${projectTypeMap[formData.projectType] || formData.projectType}</div>
        </div>`;
        
        // Building Type
        const buildingTypeMap = {
            'garden_room': 'Garden Room',
            'garden_office': 'Garden Office',
            'garden_gym': 'Garden Gym',
            'garden_studio': 'Garden Studio',
            'garden_pod': 'Garden Pod'
        };
        
        if (formData.buildingType) {
            summaryHTML += `<div class="summary-item">
                <div class="summary-label">Building Type:</div>
                <div class="summary-value">${buildingTypeMap[formData.buildingType] || formData.buildingType}</div>
            </div>`;
        }
        
        // Dimensions
        if (formData.width && formData.height && formData.length) {
            summaryHTML += `<div class="summary-item">
                <div class="summary-label">Dimensions:</div>
                <div class="summary-value">${formData.width}m × ${formData.height}m × ${formData.length}m</div>
            </div>`;
        }
        
        // Windows
        if (formData.windows && Object.keys(formData.windows).length > 0) {
            summaryHTML += `<div class="summary-item">
                <div class="summary-label">Windows:</div>
                <div class="summary-value">`;
            
            for (const [type, quantity] of Object.entries(formData.windows)) {
                if (quantity > 0) {
                    summaryHTML += `${type}: ${quantity}, `;
                }
            }
            
            // Remove trailing comma and space
            summaryHTML = summaryHTML.replace(/, $/, '');
            summaryHTML += `</div></div>`;
        }
        
        // Doors
        if (formData.doors && Object.keys(formData.doors).length > 0) {
            summaryHTML += `<div class="summary-item">
                <div class="summary-label">Doors:</div>
                <div class="summary-value">`;
            
            for (const [type, quantity] of Object.entries(formData.doors)) {
                if (quantity > 0) {
                    summaryHTML += `${type}: ${quantity}, `;
                }
            }
            
            // Remove trailing comma and space
            summaryHTML = summaryHTML.replace(/, $/, '');
            summaryHTML += `</div></div>`;
        }
        
        // Cladding (only for turnkey builds)
        if (formData.projectType === 'turnkey' && formData.cladding) {
            // Fetch material data from the materialsData if available through BuildDetailsPage
            let claddingTitle = formData.cladding; // Default to the value
            const buildDetailsPage = window.geoplyForm?.buildDetailsPage;
            if (buildDetailsPage && buildDetailsPage.materialsData && buildDetailsPage.materialsData.cladding) {
                // Find matching cladding option
                const claddingOption = buildDetailsPage.materialsData.cladding.find(
                    opt => opt.Value === formData.cladding
                );
                if (claddingOption) {
                    claddingTitle = claddingOption.Title;
                }
            }
            
            summaryHTML += `<div class="summary-item">
                <div class="summary-label">Cladding:</div>
                <div class="summary-value">${claddingTitle}</div>
            </div>`;
        }
        
        // Roofing (only for turnkey builds)
        if (formData.projectType === 'turnkey' && formData.roofing) {
            // Fetch material data from the materialsData if available through BuildDetailsPage
            let roofingTitle = formData.roofing; // Default to the value
            const buildDetailsPage = window.geoplyForm?.buildDetailsPage;
            if (buildDetailsPage && buildDetailsPage.materialsData && buildDetailsPage.materialsData.roofing) {
                // Find matching roofing option
                const roofingOption = buildDetailsPage.materialsData.roofing.find(
                    opt => opt.Value === formData.roofing
                );
                if (roofingOption) {
                    roofingTitle = roofingOption.Title;
                }
            }
            
            summaryHTML += `<div class="summary-item">
                <div class="summary-label">Roofing:</div>
                <div class="summary-value">${roofingTitle}</div>
            </div>`;
        }
        
        summaryHTML += '</div>';
        
        // Add an edit button to go back
        summaryHTML += `<button type="button" class="btn btn-secondary btn-sm" id="editSelections">Edit Selections</button>`;
        
        // Update the container
        this.summaryContainer.innerHTML = summaryHTML;
        
        // Add event listener to the edit button
        const editButton = this.summaryContainer.querySelector('#editSelections');
        if (editButton) {
            editButton.addEventListener('click', () => {
                this.formState.setCurrentPage(2); // Go back to Build Details page
            });
        }
    }

    /**
     * Handle field change
     * @param {string} fieldId - The ID of the changed field
     * @param {string} value - The new field value
     */
    handleFieldChange(fieldId, value) {
        // Update form state with the changed field value
        const formData = {};
        formData[fieldId] = value;
        
        this.formState.updateFormData(formData);
    }

    /**
     * Validate all fields on the page
     * @returns {boolean} Whether all fields are valid
     */
    validate() {
        return this.formFields ? this.formFields.validateAllFields() : true;
    }

    /**
     * Get all contact information as an object
     * @returns {Object} All contact field values
     */
    getContactInfo() {
        return this.formFields ? this.formFields.getAllValues() : {};
    }

    /**
     * Reset the page
     */
    reset() {
        if (this.formFields) {
            this.formFields.reset();
        }
        
        // Update the summary display
        this.updateSummary();
    }
}

export default ContactPage;
