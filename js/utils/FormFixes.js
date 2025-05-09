/**
 * FormFixes.js
 * Consolidated module for all form-related fixes and enhancements
 * Replaces: VisualIndicatorFix.js, initFixes.js, s4fix.js, claddingRoofingFix.js, windowImageFix.js
 */

// TEMPORARY: Set this to false to disable all fixes for testing
const FIXES_ENABLED = false;

class FormFixes {
    /**
     * Initialize all form fixes
     */
    static init() {
        // Check if fixes are enabled
        if (!FIXES_ENABLED) {
            console.log('FormFixes: All fixes are temporarily disabled for testing');
            return;
        }
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                FormFixes.applyAllFixes();
            });
        } else {
            // DOM is already loaded, apply fixes immediately
            FormFixes.applyAllFixes();
        }
    }

    /**
     * Apply all fixes with appropriate timing
     */
    static applyAllFixes() {
        // Apply immediate fixes
        FormFixes.fixS4WindowDisplay();
        
        // Apply fixes that need a short delay to ensure components are initialized
        setTimeout(() => {
            FormFixes.fixVisualIndicators();
            FormFixes.initCladdingRoofingSelection();
        }, 500);
    }

    /**
     * Fix the visual indicators for windows and doors
     */
    static fixVisualIndicators() {
        // Fix windows
        FormFixes.fixItemsWithQuantities('#windowsContainer');
        
        // Fix doors
        FormFixes.fixItemsWithQuantities('#doorsContainer');
        
        console.log('Applied visual indicator fixes for windows and doors');
    }

    /**
     * Fix items with quantities in a specific container
     * @param {string} containerSelector - The CSS selector for the container
     */
    static fixItemsWithQuantities(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        // Get all quantity inputs in the container
        const quantityInputs = container.querySelectorAll('.quantity-input');
        
        quantityInputs.forEach(input => {
            // Ensure value is a valid number
            let value = parseInt(input.value);
            if (isNaN(value)) value = 0;
            
            // Update input value
            input.value = value;
            
            const item = input.closest('.carousel-item');
            if (!item) return;
            
            // Remove any existing classes first
            input.classList.remove('quantity-has-value');
            item.classList.remove('carousel-item-has-quantity');
            
            // Apply classes based on the quantity
            if (value > 0) {
                input.classList.add('quantity-has-value');
                item.classList.add('carousel-item-has-quantity');
                
                // Special fix for S4 window in demo
                if (input.id === 'windows_S4_qty' && value === 0) {
                    // If value is actually 0 but has indicator class, set to 1
                    input.value = 1;
                }
            }
        });
    }

    /**
     * Fix the S4 window display issue
     * Combines functionality from s4fix.js and initFixes.js
     */
    static fixS4WindowDisplay() {
        // Run this fix when page is fully loaded
        setTimeout(() => {
            // Find S4 window input
            const s4Input = document.getElementById('windows_S4_qty');
            if (!s4Input) return;
            
            // Check the value
            let value = parseInt(s4Input.value || '0');
            
            // Get the related carousel item
            const item = s4Input.closest('.carousel-item');
            if (!item) return;
            
            // Check if the item has the indicator class
            const hasIndicatorClass = item.classList.contains('carousel-item-has-quantity');
            
            // Fix mismatches
            if (hasIndicatorClass && value === 0) {
                // Value is 0 but has indicator class, set to 1
                s4Input.value = 1;
                s4Input.classList.add('quantity-has-value');
                console.log("S4 window fix: value was 0 but had indicator class, set to 1");
            } else if (!hasIndicatorClass && value > 0) {
                // Value is > 0 but missing indicator class
                item.classList.add('carousel-item-has-quantity');
                s4Input.classList.add('quantity-has-value');
                console.log("S4 window fix: value was > 0 but missing indicator class");
            }
        }, 100);
    }

    /**
     * Initialize cladding and roofing selection functionality
     * From claddingRoofingFix.js
     */
    static initCladdingRoofingSelection() {
        // Wait for elements to be fully loaded by form builder
        setTimeout(() => {
            FormFixes.setupContainerSelections('#claddingContainer');
            FormFixes.setupContainerSelections('#roofingContainer');
        }, 500);
    }

    /**
     * Set up selection handlers for a specific container
     * @param {string} containerSelector - The CSS selector for the container
     */
    static setupContainerSelections(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        // Find all carousel items in the container
        const items = container.querySelectorAll('.carousel-item');
        if (!items.length) return;
        
        // Add click handler to each item
        items.forEach(item => {
            item.addEventListener('click', function() {
                // Remove selected class from all sibling items
                items.forEach(i => i.classList.remove('carousel-item-selected'));
                
                // Add selected class to this item
                this.classList.add('carousel-item-selected');
                
                // Get the selection value
                const value = this.dataset.value;
                
                // Create a custom event to notify the form about this selection
                const selectionEvent = new CustomEvent('carousel-selection', {
                    detail: { 
                        container: containerSelector,
                        value: value
                    },
                    bubbles: true
                });
                
                // Dispatch the event
                this.dispatchEvent(selectionEvent);
                
                console.log(`Selected ${containerSelector.replace('#', '')}: ${value}`);
            });
        });
        
        console.log(`Set up selection handlers for ${containerSelector}`);
    }
}

// Set up a listener for the custom carousel selection event
document.addEventListener('carousel-selection', function(event) {
    const { container, value } = event.detail;
    
    // Update form state
    if (container === '#claddingContainer') {
        // Find the BuildDetailsPage instance and call the handler
        const buildDetailsPage = window.geoplyForm?.buildDetailsPage;
        if (buildDetailsPage && typeof buildDetailsPage.handleCladdingSelection === 'function') {
            buildDetailsPage.handleCladdingSelection(value);
        }
    } else if (container === '#roofingContainer') {
        // Find the BuildDetailsPage instance and call the handler
        const buildDetailsPage = window.geoplyForm?.buildDetailsPage;
        if (buildDetailsPage && typeof buildDetailsPage.handleRoofingSelection === 'function') {
            buildDetailsPage.handleRoofingSelection(value);
        }
    }
});

// For backward compatibility with existing imports
export function fixS4WindowDisplay() {
    if (!FIXES_ENABLED) {
        console.log('FormFixes: S4 window fix is temporarily disabled for testing');
        return;
    }
    FormFixes.fixS4WindowDisplay();
}

export function initCladdingRoofingSelection() {
    if (!FIXES_ENABLED) {
        console.log('FormFixes: Cladding/roofing selection fix is temporarily disabled for testing');
        return;
    }
    FormFixes.initCladdingRoofingSelection();
}

// Initialize all fixes
FormFixes.init();

// Export the FormFixes class as default
export default FormFixes;
