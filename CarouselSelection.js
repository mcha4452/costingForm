/**
 * CarouselSelection.js
 * Component for carousel-based selection UI with quantity controls
 */

class CarouselSelection {
    /**
     * Initialize a carousel selection component
     * @param {Element} container - The container element for the carousel
     * @param {Object} options - Configuration options
     * @param {Function} onSelectionChange - Callback for selection changes
     */
    constructor(container, options = {}, onSelectionChange = null) {
        this.container = container;
        this.options = options;
        this.onSelectionChange = onSelectionChange;
        
        // Initialize the component
        this.init();
    }

    /**
     * Initialize the component and set up event listeners
     */
    init() {
        // Log container ID for debugging purposes
        console.log('Initializing carousel for container:', this.container.id);
        
        // Get carousel elements
        this.wrapper = this.container.querySelector('.carousel-wrapper');
        this.carouselOptions = this.container.querySelector('.carousel-options');
        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        this.items = this.container.querySelectorAll('.carousel-item');
        
        // Log item count for debugging
        console.log(`Found ${this.items.length} items in carousel ${this.container.id}`);
        
        // Set up navigation event listeners for desktop
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', this.handlePrevClick.bind(this));
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', this.handleNextClick.bind(this));
        }
        
        // Set up touch scroll indicator behaviors for mobile/tablet
        this.setupTouchScrollIndicators();
        
        // Set up window resize listener to handle responsive layout changes
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        
        // Set up quantity control event listeners
        this.setupQuantityControls();
        
        // Set up selection event listeners for non-quantity items (like cladding/roofing)
        this.setupSelectionListeners();
        
        // Apply styles to inputs that already have values
        this.applyInitialStyles();
    }
    
    createContinuousScroll() {
        // This method has been removed as continuous scrolling is not needed
    }
    
    /**
     * Handle window resize event
     * Adjusts the carousel view when switching between mobile and desktop
     */
    handleWindowResize() {
        // The CSS handles the actual item width changes
        // We can add specific JS resize handling here if needed
        
        // Check if we need to update scroll indicators based on screen size
        this.updateTouchScrollIndicators();
    }
    
    /**
     * Setup touch scroll indicators for mobile/tablet
     * Uses the semi-translucent preview to indicate more content
     */
    setupTouchScrollIndicators() {
        if (!this.carouselOptions) return;
        
        // Check if this carousel has more items than visible at once
        this.updateTouchScrollIndicators();
        
        // Add scroll event listener to update indicators
        this.carouselOptions.addEventListener('scroll', () => {
            // Check scroll position for potential visibility updates
            this.checkScrollPosition();
        });
    }
    
    /**
     * Update touch scroll indicators based on screen size and content
     */
    updateTouchScrollIndicators() {
        if (!this.carouselOptions || !this.items.length) return;
        
        // Determine how many items are visible at once based on screen width
        let itemsPerView = 3; // desktop default
        if (window.innerWidth <= 767) {
            itemsPerView = 1; // mobile - only one full item
        } else if (window.innerWidth <= 991) {
            itemsPerView = 3; // tablet (same as desktop for our 3-item requirement)
        }
        
        // Check if we have more items than visible at once
        const hasMoreContent = this.items.length > itemsPerView;
        
        // If no additional content, remove the mask effect
        if (!hasMoreContent) {
            this.carouselOptions.style.webkitMaskImage = 'none';
            this.carouselOptions.style.maskImage = 'none';
            this.carouselOptions.style.paddingRight = '0';
        } else {
            // Restore the mask effect
            if (window.innerWidth <= 991) { // Only for mobile/tablet
                this.carouselOptions.style.webkitMaskImage = '';
                this.carouselOptions.style.maskImage = '';
                this.carouselOptions.style.paddingRight = '';
            }
        }
        
        // Initial check of scroll position
        this.checkScrollPosition();
    }
    
    /**
     * Check scroll position to update scroll indicators
     */
    checkScrollPosition() {
        if (!this.carouselOptions || !this.wrapper) return;
        
        const isAtEnd = this.carouselOptions.scrollLeft + this.carouselOptions.offsetWidth >= 
                       this.carouselOptions.scrollWidth - 10; // 10px threshold
        
        // If at the end, remove mask effect and update UI
        if (isAtEnd && window.innerWidth <= 991) { // Only for mobile/tablet
            this.carouselOptions.style.webkitMaskImage = 'none';
            this.carouselOptions.style.maskImage = 'none';
            this.wrapper.classList.add('at-end'); // Add class to hide arrow indicator
        } else if (window.innerWidth <= 991) {
            // Not at end, restore mask effect for mobile/tablet
            this.carouselOptions.style.webkitMaskImage = '';
            this.carouselOptions.style.maskImage = '';
            this.wrapper.classList.remove('at-end'); // Show arrow indicator
        }
        
        // Also check if at the beginning to handle UI appropriately
        const isAtBeginning = this.carouselOptions.scrollLeft <= 10; // 10px threshold
        
        // Add class for being at the beginning if needed
        if (isAtBeginning) {
            this.wrapper.classList.add('at-beginning');
        } else {
            this.wrapper.classList.remove('at-beginning');
        }
    }

    /**
     * Set up quantity control buttons
     */
    setupQuantityControls() {
        console.log(`Setting up quantity controls for ${this.container.id}`);
        const decreaseBtns = this.container.querySelectorAll('.quantity-decrease');
        const increaseBtns = this.container.querySelectorAll('.quantity-increase');
        
        // First remove any existing event listeners to prevent duplicates
        // This helps when re-initializing components after form reset
        decreaseBtns.forEach(btn => {
            // Create a fresh bound handler to avoid reference issues
            const handler = this.handleQuantityDecrease.bind(this);
            // Store the handler on the element for later reference
            btn._decreaseHandler = handler;
            btn.addEventListener('click', handler);
        });
        
        increaseBtns.forEach(btn => {
            // Create a fresh bound handler to avoid reference issues
            const handler = this.handleQuantityIncrease.bind(this);
            // Store the handler on the element for later reference
            btn._increaseHandler = handler;
            btn.addEventListener('click', handler);
        });
        
        // CRITICAL FIX: Use a dedicated click handling function to ensure
        // it gets executed properly even after form resets
        this._setupItemClickHandlers();
        
        console.log(`Initialized quantity controls: ${decreaseBtns.length} decrease buttons, ${increaseBtns.length} increase buttons, ${this.items.length} items`);
    }
    
    /**
     * Set up click handlers for carousel items - separated for better maintainability
     * and to ensure proper reset behavior
     */
    _setupItemClickHandlers() {
        // Add click event to carousel items with quantity controls
        this.items.forEach(item => {
            const quantityControl = item.querySelector('.quantity-control');
            if (quantityControl) {
                // First remove any existing click handler to prevent duplicates
                if (item._clickHandler) {
                    item.removeEventListener('click', item._clickHandler);
                }
                
                // Create a direct click handler that intercepts clicks on the item itself
                const clickHandler = (event) => {
                    console.log('Carousel item clicked:', item.dataset.value);
                    
                    // Check if click was on the quantity control
                    const isControlClick = event.target.closest('.quantity-control');
                    console.log('Is control click:', isControlClick);
                    
                    if (!isControlClick) {
                        // Get the quantity input
                        const input = item.querySelector('.quantity-input');
                        if (input) {
                            const currentValue = parseInt(input.value) || 0;
                            console.log('Current value:', currentValue);
                            
                            // Only update if the current value is 0
                            if (currentValue === 0) {
                                // Set quantity to 1
                                input.value = 1;
                                console.log('Setting value to 1');
                                
                                // Force update the item state
                                item.classList.add('carousel-item-has-quantity');
                                input.classList.add('quantity-has-value');
                                
                                // Show the quantity control
                                quantityControl.style.display = 'flex';
                                
                                // Change decrease button to X for removal
                                const decreaseBtn = quantityControl.querySelector('.quantity-decrease');
                                if (decreaseBtn) {
                                    decreaseBtn.innerHTML = '&times;'; // X symbol
                                    decreaseBtn.classList.add('quantity-remove');
                                }
                                
                                // Notify about the change
                                this.notifyQuantityChange(input);
                                console.log('Notified about quantity change');
                            }
                        }
                    }
                };
                
                // Store the handler for later reference/removal
                item._clickHandler = clickHandler;
                
                // Add the click event directly
                item.addEventListener('click', clickHandler);
                
                console.log(`Added direct click handler to ${this.container.id} item:`, item.dataset.value);
            }
        });
    }
    
    /**
     * Set up selection event listeners for items without quantity controls
     */
    setupSelectionListeners() {
        // Check if this is a selection-only carousel (like cladding/roofing)
        // We'll identify these by checking if the first item has no quantity control
        if (this.items.length > 0) {
            const firstItem = this.items[0];
            const hasQuantityControl = firstItem.querySelector('.quantity-control') !== null;
            
            if (!hasQuantityControl) {
                // This is a selection-only carousel like cladding or roofing
                this.items.forEach(item => {
                    item.addEventListener('click', this.handleItemSelection.bind(this));
                });
            }
        }
    }

    /**
     * Handle previous button click
     */
    handlePrevClick() {
        if (this.carouselOptions) {
            // Get container width
            const containerWidth = this.carouselOptions.offsetWidth;
            
            // Calculate item width based on responsive design
            // 1 item for mobile, 3 items for desktop/tablet
            let itemsPerView = 3; // default for desktop/tablet
            
            // Check if we're on mobile (max-width: 767px)
            if (window.innerWidth <= 767) {
                itemsPerView = 1; // mobile view - one full item
            }
            
            const itemWidth = containerWidth / itemsPerView;
            
            // Scroll by one item width with smooth behavior
            this.carouselOptions.scrollBy({ left: -itemWidth, behavior: 'smooth' });
        }
    }

    /**
     * Handle next button click
     */
    handleNextClick() {
        if (this.carouselOptions) {
            // Get container width
            const containerWidth = this.carouselOptions.offsetWidth;
            
            // Calculate item width based on responsive design
            // 1 item for mobile, 3 items for desktop/tablet
            let itemsPerView = 3; // default for desktop/tablet
            
            // Check if we're on mobile (max-width: 767px)
            if (window.innerWidth <= 767) {
                itemsPerView = 1; // mobile view - one full item
            }
            
            const itemWidth = containerWidth / itemsPerView;
            
            // Scroll by one item width with smooth behavior
            this.carouselOptions.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
    }

    /**
     * Handle quantity decrease button click
     * @param {Event} event - The click event
     */
    handleQuantityDecrease(event) {
        const input = event.currentTarget.nextElementSibling;
        let value = parseInt(input.value);
        
        if (value > 0) {
            input.value = value - 1;
            this.notifyQuantityChange(input);
        }
    }

    /**
     * Handle quantity increase button click
     * @param {Event} event - The click event
     */
    handleQuantityIncrease(event) {
        const input = event.currentTarget.previousElementSibling;
        let value = parseInt(input.value);
        
        input.value = value + 1;
        this.notifyQuantityChange(input);
    }
    
    /**
     * Handle item selection for non-quantity items
     * @param {Event} event - The click event
     */
    handleItemSelection(event) {
        // Get the clicked item
        const item = event.currentTarget;
        
        // Remove selected class from all items
        this.items.forEach(i => {
            i.classList.remove('carousel-item-selected');
        });
        
        // Add selected class to clicked item
        item.classList.add('carousel-item-selected');
        
        // Call the callback if provided
        if (typeof this.onSelectionChange === 'function') {
            const itemValue = item.dataset.value;
            this.onSelectionChange(itemValue);
        }
    }

    /**
     * Notify about quantity changes
     * @param {Element} input - The quantity input element
     */
    notifyQuantityChange(input) {
        const item = input.closest('.carousel-item');
        // Force convert to number and ensure not NaN
        const quantity = Number(input.value) || 0;
        
        // Always update the input value to ensure it's a valid number
        input.value = quantity;
        
        // Apply visual feedback when quantity is greater than 0
        if (quantity > 0) {
            input.classList.add('quantity-has-value');
            if (item) {
                // Apply the class immediately
                item.classList.add('carousel-item-has-quantity');
                
                // Show the quantity control when quantity > 0
                const quantityControl = item.querySelector('.quantity-control');
                if (quantityControl) {
                    quantityControl.style.display = 'flex';
                    
                    // Change decrease button to X for removal when quantity is 1
                    const decreaseBtn = quantityControl.querySelector('.quantity-decrease');
                    if (decreaseBtn) {
                        if (quantity === 1) {
                            decreaseBtn.innerHTML = '&times;'; // X symbol
                            decreaseBtn.classList.add('quantity-remove');
                        } else {
                            decreaseBtn.innerHTML = '&minus;'; // Minus symbol
                            decreaseBtn.classList.remove('quantity-remove');
                        }
                    }
                }
            }
        } else {
            input.classList.remove('quantity-has-value');
            if (item) {
                item.classList.remove('carousel-item-has-quantity');
                
                // Hide the quantity control when quantity = 0
                const quantityControl = item.querySelector('.quantity-control');
                if (quantityControl) {
                    quantityControl.style.display = 'none';
                }
            }
        }
        
        // Call the callback if provided
        if (typeof this.onSelectionChange === 'function') {
            const itemValue = item ? item.dataset.value : null;
            this.onSelectionChange(itemValue, quantity, input.id);
        }
    }

    /**
     * Get all selected items with quantities
     * @returns {Array} Array of selected items with their quantities
     */
    getSelectedItems() {
        const selected = [];
        
        this.items.forEach(item => {
            const quantityInput = item.querySelector('.quantity-input');
            
            if (quantityInput && parseInt(quantityInput.value) > 0) {
                selected.push({
                    value: item.dataset.value,
                    quantity: parseInt(quantityInput.value),
                    inputId: quantityInput.id
                });
            }
        });
        
        return selected;
    }
    
    /**
     * Get the selected item value for selection-only carousels
     * @returns {string|null} The selected item value or null if none selected
     */
    getSelectedValue() {
        const selectedItem = this.container.querySelector('.carousel-item-selected');
        return selectedItem ? selectedItem.dataset.value : null;
    }
    
    /**
     * Set the selected item for selection-only carousels
     * @param {string} value - The value to select
     * @returns {boolean} Whether the operation was successful
     */
    setSelectedValue(value) {
        // Reset current selection
        this.items.forEach(item => {
            item.classList.remove('carousel-item-selected');
        });
        
        // Find and select the matching item
        const item = Array.from(this.items).find(item => item.dataset.value === value);
        if (item) {
            item.classList.add('carousel-item-selected');
            return true;
        }
        
        return false;
    }

    /**
     * Set the quantity for a specific item
     * @param {string} itemValue - The value of the item
     * @param {number} quantity - The quantity to set
     * @returns {boolean} Whether the operation was successful
     */
    setQuantity(itemValue, quantity) {
        const item = Array.from(this.items).find(item => item.dataset.value === itemValue);
        
        if (item) {
            const quantityInput = item.querySelector('.quantity-input');
            
            if (quantityInput) {
                quantityInput.value = quantity;
                this.notifyQuantityChange(quantityInput);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Reset all quantities to zero and clear selections
     */
    reset() {
        console.log(`Performing full reset of carousel: ${this.container.id}`);
        
        // Reset quantity inputs for both original items and clones
        const quantityInputs = this.container.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.value = '0';
            // Remove styles when resetting
            input.classList.remove('quantity-has-value');
            const item = input.closest('.carousel-item');
            if (item) {
                item.classList.remove('carousel-item-has-quantity');
                
                // Also hide the quantity control
                const quantityControl = item.querySelector('.quantity-control');
                if (quantityControl) {
                    quantityControl.style.display = 'none';
                }
            }
        });
        
        // Reset selections for selection-only items
        this.items.forEach(item => {
            item.classList.remove('carousel-item-selected');
        });
        
        // Re-setup the quantity controls to ensure all event listeners are fresh
        this._setupItemClickHandlers();
        
        console.log('Reset completed for carousel:', this.container.id);
    }
    
    /**
     * Apply styles to inputs that already have values when component initializes
     */
    applyInitialStyles() {
        // Handle quantity inputs
        const quantityInputs = this.container.querySelectorAll('.quantity-input');
        
        if (quantityInputs.length > 0) {
            // First, reset all items to ensure clean state
            const allItems = this.container.querySelectorAll('.carousel-item');
            allItems.forEach(item => {
                item.classList.remove('carousel-item-has-quantity');
                
                // Initially hide all quantity controls
                const quantityControl = item.querySelector('.quantity-control');
                if (quantityControl) {
                    quantityControl.style.display = 'none';
                }
            });
            
            // Then apply styles to items with quantities > 0
            quantityInputs.forEach(input => {
                // Force convert to number and ensure not NaN
                const quantity = Number(input.value) || 0;
                
                // Fix: Update the input value to reflect the actual number
                input.value = quantity;
                
                if (quantity > 0) {
                    input.classList.add('quantity-has-value');
                    const item = input.closest('.carousel-item');
                    if (item) {
                        // Add immediately without delay for initial load
                        item.classList.add('carousel-item-has-quantity');
                        
                        // Show quantity control for items with quantity > 0
                        const quantityControl = item.querySelector('.quantity-control');
                        if (quantityControl) {
                            quantityControl.style.display = 'flex';
                            
                            // Change decrease button to X for removal when quantity is 1
                            const decreaseBtn = quantityControl.querySelector('.quantity-decrease');
                            if (decreaseBtn && quantity === 1) {
                                decreaseBtn.innerHTML = '&times;'; // X symbol
                                decreaseBtn.classList.add('quantity-remove');
                            }
                        }
                    }
                } else {
                    // Ensure we remove classes for zero values
                    input.classList.remove('quantity-has-value');
                    const item = input.closest('.carousel-item');
                    if (item) {
                        item.classList.remove('carousel-item-has-quantity');
                    }
                }
            });
        } else {
            // This might be a selection-only carousel (like cladding/roofing)
            // Check for stored selection in the form state by detecting container ID
            const containerId = this.container.id;
            if (containerId) {
                // Currently we don't have access to form state here, selections will be loaded 
                // by the BuildDetailsPage component when it calls the handler methods
            }
        }
    }
}

export default CarouselSelection;