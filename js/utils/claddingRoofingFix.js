/**
 * claddingRoofingFix.js
 * Contains additional functionality for cladding and roofing selection
 */

// Function to add click functionality to cladding and roofing items
export function initCladdingRoofingSelection() {
    // Wait for DOM content to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSelectionHandlers);
    } else {
        // DOM is already loaded, apply fix immediately
        setupSelectionHandlers();
    }
}

// Set up the selection handlers
function setupSelectionHandlers() {
    // Wait for elements to be fully loaded by form builder
    setTimeout(() => {
        setupContainerSelections('#claddingContainer');
        setupContainerSelections('#roofingContainer');
    }, 500);
}

// Set up selection handlers for a specific container
function setupContainerSelections(containerSelector) {
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

// Initialize immediately
initCladdingRoofingSelection();

// Also set up a listener for the custom event
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
