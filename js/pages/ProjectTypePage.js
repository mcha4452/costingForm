/**
 * ProjectTypePage.js
 * Handles the project type selection page
 */

import CardSelection from '../components/CardSelection.js';

class ProjectTypePage {
    /**
     * Initialize the project type page
     * @param {Element} pageElement - The page container element
     * @param {Object} formState - The form state manager
     */
    constructor(pageElement, formState) {
        this.pageElement = pageElement;
        this.formState = formState;
        this.cardOptions = null;
        this.roofTypeSelection = null;
        this.wallDepthSelection = null;
        this.selfBuildTypeSelection = null;
        
        this.init();
    }

    /**
     * Initialize the page
     */
    init() {
        // Find the card options container
        const cardContainer = this.pageElement.querySelector('.card-options');
        
        if (cardContainer) {
            // Initialize the card selection component with allowReselection flag set to true
            this.cardOptions = new CardSelection(
                cardContainer,
                { allowReselection: true },
                this.handleProjectTypeSelection.bind(this)
            );
        }

        // Initialize self build type selection if it exists
        let selfBuildTypeContainer = this.pageElement.querySelector('#selfBuildTypeContainer');
        // If not found in the page, look for it in the body (in case it was moved there)
        if (!selfBuildTypeContainer) {
            selfBuildTypeContainer = document.getElementById('selfBuildTypeContainer');
        }
        
        if (selfBuildTypeContainer) {
            this.selfBuildTypeSelection = new CardSelection(
                selfBuildTypeContainer,
                {},
                this.handleSelfBuildTypeSelection.bind(this)
            );
            
            // Initialize self build type selection from form state if available
            const formData = this.formState.getFormData();
            if (formData.selfBuildType) {
                this.selfBuildTypeSelection.setSelectedValue(formData.selfBuildType);
                
                // If we have a self build type already selected, show the badge
                if (formData.projectType === 'self-build') {
                    this.updateSelfBuildCardBadge(formData.selfBuildType);
                }
            }
            
            // Hide it initially, it will be shown when self-build is selected
            selfBuildTypeContainer.style.display = 'none';
        }

        // Initialize roof type selection if it exists
        const roofTypeContainer = this.pageElement.querySelector('#roofTypeContainer');
        if (roofTypeContainer) {
            this.roofTypeSelection = new CardSelection(
                roofTypeContainer,
                {},
                this.handleRoofTypeSelection.bind(this)
            );
            
            // Initialize roof type selection from form state if available
            const formData = this.formState.getFormData();
            if (formData.roofType) {
                this.roofTypeSelection.setSelectedValue(formData.roofType);
            }
        }
        
        // Initialize wall depth selection if it exists
        const wallDepthContainer = this.pageElement.querySelector('#wallDepthContainer');
        if (wallDepthContainer) {
            this.wallDepthSelection = new CardSelection(
                wallDepthContainer,
                {},
                this.handleWallDepthSelection.bind(this)
            );
            
            // Initialize wall depth selection from form state if available
            const formData = this.formState.getFormData();
            if (formData.wallDepth) {
                this.wallDepthSelection.setSelectedValue(formData.wallDepth);
            }
        }
    }

    /**
     * Handle project type selection
     * @param {string} value - The selected project type value
     * @param {Element} cardElement - The selected card element
     * @param {boolean} isReselection - Whether this is a reselection of an already selected card
     */
    handleProjectTypeSelection(value, cardElement, isReselection) {
        console.log('Project type selected:', value, 'isReselection:', isReselection);
        
        // First get the previous project type
        const previousType = this.formState.getProjectType();
        
        // Update the form state with the newly selected project type
        this.formState.setProjectType(value);
        
        // Show/hide self build type selection based on the selected project type
        const selfBuildTypeContainer = document.getElementById('selfBuildTypeContainer');
        
        // Look for or create the overlay
        let overlay = document.getElementById('selfBuildTypeOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'selfBuildTypeOverlay';
            document.body.appendChild(overlay);
        }
        
        if (selfBuildTypeContainer) {
            if (value === 'self-build') {
                console.log('Self build selected, showing popup.');
                
                // If we're switching from turnkey to self-build, reset the self build type selection
                if (previousType === 'turnkey') {
                    this.resetSelfBuildType();
                }
                
                // Always show the popup for self-build, whether it's a new selection or reselection
                // Move the container out of the form and to the body for proper overlay positioning
                if (selfBuildTypeContainer.parentElement !== document.body) {
                    // Store the original parent for later restoration
                    selfBuildTypeContainer.dataset.originalParent = selfBuildTypeContainer.parentElement.id;
                    document.body.appendChild(selfBuildTypeContainer);
                }
                
                // Ensure the container has the popup-container class for proper z-indexing
                if (!selfBuildTypeContainer.classList.contains('popup-container')) {
                    selfBuildTypeContainer.classList.add('popup-container');
                }
                
                // Show the overlay and container
                overlay.style.display = 'block';
                selfBuildTypeContainer.style.display = 'block';
                
                // Clean up any existing click handlers
                if (this._handleOverlayClick) {
                    overlay.removeEventListener('click', this._handleOverlayClick);
                }
                
                // Create a new handler
                this._handleOverlayClick = (e) => {
                    if (e.target === overlay) {
                        // Only hide if a self build type has been selected
                        if (this.selfBuildTypeSelection && this.selfBuildTypeSelection.getSelectedValue()) {
                            overlay.style.display = 'none';
                            selfBuildTypeContainer.style.display = 'none';
                        }
                    }
                };
                
                // Add the click handler
                overlay.addEventListener('click', this._handleOverlayClick);
                
            } else if (value === 'turnkey') {
                // Hide the overlay and container
                overlay.style.display = 'none';
                selfBuildTypeContainer.style.display = 'none';
                
                // Clear self build type selection when switching to turnkey
                this.resetSelfBuildType();
                
                // Always enable next button for turnkey
                const nextBtn = document.querySelector(`.next-btn[data-page="1"]`);
                if (nextBtn) {
                    nextBtn.classList.remove('btn-disabled');
                    nextBtn.disabled = false;
                }
            }
        }
    }

    /**
     * Handle self build type selection
     * @param {string} value - The selected self build type value
     */
    handleSelfBuildTypeSelection(value) {
        // Update form state with the selected self build type
        this.formState.updateFormData({ selfBuildType: value });
        
        // Find the next button for page 1 and enable it
        const nextBtn = document.querySelector(`.next-btn[data-page="1"]`);
        if (nextBtn) {
            nextBtn.classList.remove('btn-disabled');
            nextBtn.disabled = false;
        }
        
        // Hide the overlay and container after selection
        const overlay = document.getElementById('selfBuildTypeOverlay');
        const selfBuildTypeContainer = document.getElementById('selfBuildTypeContainer');
        
        if (overlay && selfBuildTypeContainer) {
            setTimeout(() => {
                overlay.style.display = 'none';
                selfBuildTypeContainer.style.display = 'none';
                
                // Update the badge on the self-build card
                this.updateSelfBuildCardBadge(value);
            }, 300); // Short delay for better UX
        }
    }
    
    /**
     * Update the self build card with a badge showing the selected type
     * @param {string} selectedType - The selected self build type value
     */
    updateSelfBuildCardBadge(selectedType) {
        // Find the self-build card
        const selfBuildCard = this.pageElement.querySelector('.card-option[data-value="self-build"]');
        if (!selfBuildCard) return;
        
        // Remove any existing badge
        const existingBadge = selfBuildCard.querySelector('.selected-type-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // If no type selected or type is null, don't add a badge
        if (!selectedType) return;
        
        // Get the display name for the selected type
        let displayName = selectedType;
        if (selectedType === 'flat-pack') {
            displayName = 'Flat Pack';
        } else if (selectedType === 'pre-assembled') {
            displayName = 'Pre-assembled';
        }
        
        // Create a badge element
        const badge = document.createElement('div');
        badge.className = 'selected-type-badge';
        badge.textContent = displayName;
        
        // Add the badge to the card
        selfBuildCard.appendChild(badge);
    }

    /**
     * Handle roof type selection
     * @param {string} value - The selected roof type value
     */
    handleRoofTypeSelection(value) {
        // Update form state with the selected roof type
        this.formState.updateFormData({ roofType: value });
    }
    
    /**
     * Handle wall depth selection
     * @param {string} value - The selected wall depth value
     */
    handleWallDepthSelection(value) {
        // Update form state with the selected wall depth
        this.formState.updateFormData({ wallDepth: value });
    }

    /**
     * Get the selected project type
     * @returns {string} The selected project type value
     */
    getSelectedProjectType() {
        return this.cardOptions ? this.cardOptions.getSelectedValue() : null;
    }

    /**
     * Get the selected self build type
     * @returns {string} The selected self build type value
     */
    getSelectedSelfBuildType() {
        return this.selfBuildTypeSelection ? this.selfBuildTypeSelection.getSelectedValue() : null;
    }

    /**
     * Get the selected roof type
     * @returns {string} The selected roof type value
     */
    getSelectedRoofType() {
        return this.roofTypeSelection ? this.roofTypeSelection.getSelectedValue() : null;
    }
    
    /**
     * Get the selected wall depth
     * @returns {string} The selected wall depth value
     */
    getSelectedWallDepth() {
        return this.wallDepthSelection ? this.wallDepthSelection.getSelectedValue() : null;
    }

    /**
     * Reset the page
     */
    reset() {
        if (this.cardOptions) {
            this.cardOptions.reset();
        }
        
        if (this.selfBuildTypeSelection) {
            this.selfBuildTypeSelection.reset();
        }
        
        if (this.roofTypeSelection) {
            this.roofTypeSelection.reset();
        }
        
        if (this.wallDepthSelection) {
            this.wallDepthSelection.reset();
        }
        
        // Reset any badges
        this.updateSelfBuildCardBadge(null);
    }
    
    /**
     * Reset the self build type selection specifically
     */
    resetSelfBuildType() {
        if (this.selfBuildTypeSelection) {
            this.selfBuildTypeSelection.reset();
            this.formState.updateFormData({ selfBuildType: null });
            
            // Remove the badge
            this.updateSelfBuildCardBadge(null);
            
            // Disable the next button if we're on the first page and self-build is selected
            if (this.formState.getCurrentPage() === 1 && this.getSelectedProjectType() === 'self-build') {
                const nextBtn = document.querySelector(`.next-btn[data-page="1"]`);
                if (nextBtn) {
                    nextBtn.classList.add('btn-disabled');
                    nextBtn.disabled = true;
                }
            }
        }
    }
}

export default ProjectTypePage;
