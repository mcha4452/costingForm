/**
 * Skylight Selection Debug Script
 * 
 * This script ONLY adds debugging to identify why skylight options can't be selected
 * after submitting a form. It does NOT change any functionality.
 */

(function() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Add command to debug click event handlers
        window.checkClickHandlers = function() {
            console.log('\n[DEBUG] === CHECKING CAROUSEL ITEM CLICK HANDLERS ===');
            
            // Get all carousel items
            const allItems = document.querySelectorAll('.carousel-item');
            console.log(`[DEBUG] Found ${allItems.length} total carousel items`);
            
            // Try to clone an item to see if it's clickable after cloning
            if (allItems.length > 0) {
                const firstItem = allItems[0];
                console.log('[DEBUG] First carousel item:', firstItem.dataset.value);
                console.log('[DEBUG] Checking clickability...');
                
                // Create a test click event
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                
                // Track original event handlers by cloning and testing
                const clone = firstItem.cloneNode(true);
                let clickHandled = false;
                
                // Add a test handler to see if events work
                clone.addEventListener('click', function(e) {
                    clickHandled = true;
                    console.log('[DEBUG] Clone received click event');
                });
                
                // Add to document temporarily
                document.body.appendChild(clone);
                clone.dispatchEvent(clickEvent);
                document.body.removeChild(clone);
                
                console.log('[DEBUG] Clone click test result:', clickHandled ? 'Clickable' : 'Not clickable');
                
                // Check for possible event issues
                console.log('[DEBUG] Potential issues:');
                console.log('- Event bubbling disabled:', !clickEvent.bubbles);
                console.log('- Item has pointer-events:none:', getComputedStyle(firstItem).pointerEvents === 'none');
                console.log('- Item has display:none:', getComputedStyle(firstItem).display === 'none');
                console.log('- Item has visibility:hidden:', getComputedStyle(firstItem).visibility === 'hidden');
                console.log('- Item has opacity:0:', getComputedStyle(firstItem).opacity === '0');
            }
            
            // Also try to check quantity inputs
            const quantityInputs = document.querySelectorAll('.quantity-input');
            console.log(`[DEBUG] Found ${quantityInputs.length} quantity inputs`);
            
            if (quantityInputs.length > 0) {
                const firstInput = quantityInputs[0];
                console.log('[DEBUG] First quantity input value:', firstInput.value);
                console.log('[DEBUG] First quantity input disabled:', firstInput.disabled);
                console.log('[DEBUG] First quantity input readonly:', firstInput.readOnly);
            }
            
            console.log('[DEBUG] === END CLICK HANDLER CHECK ===\n');
            
            return 'Click handler check complete';
        };
        console.log('[DEBUG] Skylight debugging initialized');
        
        // Monitor for form submission
        monitorFormSubmission();
        
        // Monitor skylight container & selection
        monitorSkylightSelection();
        
        // Monitor form reset
        monitorFormReset();
        
        // Add form inspection command
        addInspectionCommands();
    });
    
    /**
     * Monitor the form submission process
     */
    function monitorFormSubmission() {
        const form = document.getElementById('geoplyForm');
        if (!form) {
            console.error('[DEBUG] Could not find form element');
            return;
        }
        
        // Monitor form submission without changing behavior
        form.addEventListener('submit', function(e) {
            // Don't interfere with normal submission - just log
            console.log('[DEBUG] Form submission detected');
            
            // Log the state before submission
            console.log('[DEBUG] Skylight state before submission (logging skipped)');
            
            // Check back after a delay to see post-submission state
            setTimeout(function() {
            console.log('[DEBUG] Skylight state after submission (logging skipped)');
            }, 500);
        });
    }
    
    /**
     * Monitor skylight selection events
     */
    function monitorSkylightSelection() {
        // Check for skylight container
        const skylightContainer = document.getElementById('skylightsContainer');
        if (!skylightContainer) {
            console.warn('[DEBUG] Skylight container not found initially');
            
            // Set up a mutation observer to detect when it's added
            const observer = new MutationObserver(function(mutations) {
                for (let mutation of mutations) {
                    if (mutation.addedNodes) {
                        for (let node of mutation.addedNodes) {
                            if (node.id === 'skylightsContainer') {
                                console.log('[DEBUG] Skylight container added to DOM');
                                setupSkylightListeners(node);
                                observer.disconnect();
                                return;
                            } else if (node.nodeType === 1) { // Element node
                                const container = node.querySelector('#skylightsContainer');
                                if (container) {
                                    console.log('[DEBUG] Skylight container found in added node');
                                    setupSkylightListeners(container);
                                    observer.disconnect();
                                    return;
                                }
                            }
                        }
                    }
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            console.log('[DEBUG] Skylight container found immediately');
            setupSkylightListeners(skylightContainer);
        }
    }
    
    /**
     * Set up listeners on skylight items
     */
    function setupSkylightListeners(container) {
        // Log initial state
        console.log('[DEBUG] Skylight container found, setting up debug listeners');
        
        // Find all skylight carousel items
        const skylightItems = container.querySelectorAll('.carousel-item');
        
        // Add click listeners to each skylight item
        skylightItems.forEach((item, index) => {
            // Add our debug click handler directly to the item
            item.addEventListener('click', function(e) {
                console.log(`\n[DEBUG] ==== SKYLIGHT CLICKED: ${item.dataset.value || 'unknown'} ====`);
                
                // Log detailed info about the clicked item
                const quantityInput = item.querySelector('.quantity-input');
                const quantity = quantityInput ? parseInt(quantityInput.value) || 0 : 0;
                
                console.log('[DEBUG] Skylight item state BEFORE click processing:');
                console.log('- Item DOM ID:', item.id);
                console.log('- Item dataset.value:', item.dataset.value);
                console.log('- Selected:', item.classList.contains('carousel-item-selected'));
                console.log('- Has quantity class:', item.classList.contains('carousel-item-has-quantity'));
                console.log('- Current quantity:', quantity);
                console.log('- Disabled:', item.classList.contains('disabled'));
                console.log('- CSS pointer-events:', getComputedStyle(item).pointerEvents);
                console.log('- CSS opacity:', getComputedStyle(item).opacity);
                console.log('- CSS display:', getComputedStyle(item).display);
                
                // Detailed event info
                console.log('\n[DEBUG] Click event details:');
                console.log('- Event target:', e.target.tagName, e.target.className);
                console.log('- Event bubbles:', e.bubbles);
                console.log('- Event cancelable:', e.cancelable);
                console.log('- Event handled:', !e.defaultPrevented);
                
                // Check for quantity control
                const quantityControl = item.querySelector('.quantity-control');
                console.log('\n[DEBUG] Quantity control:');
                console.log('- Has quantity control:', !!quantityControl);
                if (quantityControl) {
                    console.log('- Quantity increase button:', !!quantityControl.querySelector('.quantity-increase'));
                    console.log('- Quantity decrease button:', !!quantityControl.querySelector('.quantity-decrease'));
                    console.log('- Quantity input element:', !!quantityControl.querySelector('.quantity-input'));
                }
                
                // Log the item's full HTML
                console.log('\n[DEBUG] Item HTML structure:');
                console.log(item.outerHTML);
                
                // Check after a short delay if click had an effect
                setTimeout(function() {
                    const newQuantity = quantityInput ? parseInt(quantityInput.value) || 0 : 0;
                    console.log('\n[DEBUG] Skylight item state AFTER click processing:');
                    console.log('- Selected:', item.classList.contains('carousel-item-selected'));
                    console.log('- Has quantity class:', item.classList.contains('carousel-item-has-quantity'));
                    console.log('- Quantity changed:', quantity !== newQuantity);
                    console.log('- New quantity:', newQuantity);
                    console.log('=== END SKYLIGHT CLICK DEBUG ===\n');
                }, 100);
            });
        });
        
        console.log(`[DEBUG] Added debug listeners to ${skylightItems.length} skylight items`);
    }
    
    /**
     * Monitor form reset to see what happens to skylights
     */
    function monitorFormReset() {
        const resetBtn = document.getElementById('restartForm');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                console.log('[DEBUG] Form reset button clicked');
                
                // Log the state before reset
                logSkylightState('Before reset');
                
                // Check back after a delay to see post-reset state
                setTimeout(function() {
                    logSkylightState('After reset');
                }, 500);
            }, true);
        } else {
            console.warn('[DEBUG] Form reset button not found');
        }
    }
    
    /**
     * Add useful inspection commands to the console
     */
    function addInspectionCommands() {
        // Add command to inspect current skylights state
        window.debugSkylights = function() {
            logSkylightState('Manual inspection');
            return 'Skylight state logged to console';
        };
        
        // Add command to check event listeners
        window.debugSkylightEvents = function() {
            const container = document.getElementById('skylightsContainer');
            if (!container) {
                console.error('[DEBUG] Skylight container not found');
                return 'Skylight container not found';
            }
            
            const items = container.querySelectorAll('.carousel-item');
            console.log('[DEBUG] Found', items.length, 'skylight items');
            
            return 'Skylight events logged to console';
        };
        
        // Add command to check form state
        window.debugFormState = function() {
            if (window.geoplyForm && window.geoplyForm.formState) {
                const formState = window.geoplyForm.formState;
                console.log('[DEBUG] Form state:', {
                    currentPage: formState.getCurrentPage(),
                    formData: formState.getFormData()
                });
                return 'Form state logged to console';
            } else {
                console.error('[DEBUG] Form state not available');
                return 'Form state not available';
            }
        };
        
        console.log('[DEBUG] Inspection commands added. Try using:');
        console.log('  debugSkylights() - Log current skylight state');
        console.log('  debugSkylightEvents() - Check event handlers');
        console.log('  debugFormState() - Examine form state object');
    }
    
    // Add form submission monitoring command
    window.monitorNextSubmit = function() {
       console.log('[DEBUG] Will monitor next form submission');
        
    // Get the form element
    const form = document.getElementById('geoplyForm');
    if (!form) {
        console.error('[DEBUG] Could not find form element');
        return 'Form not found';
    }
    
    // Create one-time submission monitor
    const submitHandler = function(e) {
        console.log('\n[DEBUG] ======= FORM SUBMISSION DETECTED =======');
        
        // Capture form data before submission
        console.log('[DEBUG] Capturing form data before submission');
        captureFormState('Before Submission');
        
    // Check skylight state before submission
    logSkylightState('Before Submission');
    
    // Set up monitoring after submission is complete
    setTimeout(function() {
    console.log('\n[DEBUG] ======= FORM SUBMISSION COMPLETED =======');
    captureFormState('After Submission');
    logSkylightState('After Submission');
    
    // Remove this one-time handler
    form.removeEventListener('submit', submitHandler, true);
    console.log('[DEBUG] Submission monitoring completed');
    
    // Set up monitoring for next form
    setTimeout(function() {
    // Verify the current page
        const currentPage = document.querySelector('.form-page.active');
            console.log('[DEBUG] Current active page ID:', currentPage ? currentPage.id : 'none');
                
                if (currentPage && currentPage.id === 'page1') {
                    console.log('[DEBUG] Back to page 1, starting skylight monitoring');
                    // Check clickability in 5 seconds
                    setTimeout(function() {
                    console.log('\n[DEBUG] ======= CHECKING SKYLIGHTS IN NEW FORM =======');
                        window.checkClickHandlers();
                }, 5000);
                } else {
                        console.log('[DEBUG] Not on page 1 yet, skipping skylight check');
                        }
                    }, 2000); // Check 2 seconds after submission completes
                }, 500);
            };
            
            // Add submission monitor
            form.addEventListener('submit', submitHandler, true);
            
            return 'Form submission monitoring activated';
        };
        
        /**
         * Capture the complete form state
         */
        function captureFormState(label) {
            console.log(`[DEBUG] ----- Form State (${label}) -----`);
            
            // Get form state if available
            if (window.geoplyForm && window.geoplyForm.formState) {
                const formState = window.geoplyForm.formState;
                console.log('[DEBUG] Form state object:', {
                    currentPage: formState.getCurrentPage(),
                    getProjectType: formState.getProjectType && formState.getProjectType(),
                    getFormData: formState.getFormData && formState.getFormData()
                });
            } else {
                console.log('[DEBUG] Form state object not available');
            }
            
            // Capture DOM state
            // Add a basic skylight state logging function to avoid errors
function logSkylightState(label) {
    console.log(`[DEBUG] Basic skylight state (${label})`);
    const container = document.getElementById('skylightsContainer');
    if (container) {
        const items = container.querySelectorAll('.carousel-item');
        console.log(`Found ${items.length} skylight items, container visibility: ${container.style.display}`);
    } else {
        console.log('Skylight container not found');
    }
}

            const visiblePage = document.querySelector('.form-page.active');
            console.log('[DEBUG] Active page:', visiblePage ? visiblePage.id : 'none');
            
            // Check selected cards
            const selectedCards = document.querySelectorAll('.card-option.selected');
            console.log('[DEBUG] Selected cards:', selectedCards.length);
            selectedCards.forEach((card, i) => {
                console.log(`[DEBUG] Selected card ${i+1}:`, card.dataset.value);
            });
            
            // Check form structure
            const form = document.getElementById('geoplyForm');
            if (form) {
                const formPages = form.querySelectorAll('.form-page');
                console.log('[DEBUG] Form has', formPages.length, 'pages');
                
                // Check page 2 for skylights
                const page2 = document.getElementById('page2');
                if (page2) {
                    const skylightContainer = page2.querySelector('#skylightsContainer');
                    console.log('[DEBUG] Page 2 has skylight container:', !!skylightContainer);
                }
            }
        }
    
    /**
     * Check if an element is visible
     */
    function isElementVisible(el) {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               el.offsetParent !== null;
    }
})();
