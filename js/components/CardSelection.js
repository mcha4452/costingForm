/**
 * CardSelection.js
 * Component for card-based selection UI
 */

class CardSelection {
    /**
     * Initialize a card selection component
     * @param {Element} container - The container element for the cards
     * @param {Object} options - Configuration options
     * @param {Function} onSelectionChange - Callback for selection changes
     */
    constructor(container, options = {}, onSelectionChange = null) {
        this.container = container;
        this.options = options;
        this.onSelectionChange = onSelectionChange;
        this.selectedCard = null;
        this.allowReselection = options.allowReselection || false;
        
        // Initialize the component
        this.init();
    }

    /**
     * Initialize the component and set up event listeners
     */
    init() {
        // Find all card options that aren't disabled
        this.cards = this.container.querySelectorAll('.card-option:not(.disabled)');
        
        // Add click event listeners to each card
        this.cards.forEach(card => {
            card.addEventListener('click', this.handleCardClick.bind(this));
        });
        
        // Check if there's already a selected card
        const preselected = this.container.querySelector('.card-option.selected');
        if (preselected) {
            this.selectedCard = preselected;
        }
    }

    /**
     * Handle card click events
     * @param {Event} event - The click event
     */
    handleCardClick(event) {
        const clickedCard = event.currentTarget;
        
        // Check if this card is already selected
        const isReselection = clickedCard === this.selectedCard;
        const value = clickedCard.dataset.value;
        console.log('Card clicked, value:', value, 'isReselection:', isReselection);
        
        // Special case for self-build - we always want to process this
        const isSelfBuild = value === 'self-build';
        
        // For normal cards, if it's already selected and reselection is not allowed, do nothing
        if (isReselection && !this.allowReselection && !isSelfBuild) {
            console.log('Card already selected and reselection not allowed. Doing nothing.');
            return;
        }
        
        // Deselect all cards
        this.cards.forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select the clicked card
        clickedCard.classList.add('selected');
        this.selectedCard = clickedCard;
        
        // Update hidden input if this card has a target input
        if (clickedCard.dataset.targetInput) {
            const targetInput = document.getElementById(clickedCard.dataset.targetInput);
            if (targetInput) {
                targetInput.value = value;
            }
        }
        
        // Call the selection change callback if provided
        if (typeof this.onSelectionChange === 'function') {
            console.log('Calling selection change callback with value:', value, 'isReselection:', isReselection);
            this.onSelectionChange(value, clickedCard, isReselection);
        }
        
        // Enable the next button if it exists and is disabled
        this.enableNextButton();
    }

    /**
     * Enable the next button associated with this card selection
     */
    enableNextButton() {
        // Find the page this card selection is on
        const page = this.container.closest('[id^="page"]');
        if (!page) {
            console.warn('Cannot find parent page for card selection - container might be in a popup');
            return;
        }
        
        const pageNum = page.id.replace('page', '');
        console.log('Enabling next button for page:', pageNum);
        
        const nextBtn = document.querySelector(`.next-btn[data-page="${pageNum}"]`);
        console.log('Next button found:', nextBtn);
        
        if (nextBtn) {
            nextBtn.classList.remove('btn-disabled');
            nextBtn.disabled = false;
            console.log('Next button enabled');
        } else {
            console.error('Next button not found for page:', pageNum);
        }
    }

    /**
     * Get the currently selected value
     * @returns {string|null} The selected value or null if nothing is selected
     */
    getSelectedValue() {
        return this.selectedCard ? this.selectedCard.dataset.value : null;
    }

    /**
     * Get the currently selected card element
     * @returns {Element|null} The selected card element or null
     */
    getSelectedCard() {
        return this.selectedCard;
    }

    /**
     * Programmatically select a card by its value
     * @param {string} value - The value to select
     * @returns {boolean} Whether the selection was successful
     */
    selectByValue(value) {
        // Find the card with the matching value
        const card = Array.from(this.cards).find(card => card.dataset.value === value);
        
        if (card) {
            // Simulate a click on the card
            card.click();
            return true;
        }
        
        return false;
    }

    /**
     * Programmatically set a card as selected by its value
     * @param {string} value - The value to select
     * @returns {boolean} Whether the selection was successful
     */
    setSelectedValue(value) {
        // Find the card with the matching value
        const card = Array.from(this.cards).find(card => card.dataset.value === value);
        
        if (card) {
            // Mark all cards as unselected
            this.cards.forEach(c => c.classList.remove('selected'));
            
            // Select the card
            card.classList.add('selected');
            this.selectedCard = card;
            
            // Update any hidden inputs
            if (card.dataset.targetInput) {
                const targetInput = document.getElementById(card.dataset.targetInput);
                if (targetInput) {
                    targetInput.value = value;
                }
            }
            
            // Enable next button if needed
            this.enableNextButton();
            
            return true;
        }
        
        return false;
    }

    /**
     * Reset the selection
     */
    reset() {
        // Deselect all cards
        this.cards.forEach(card => {
            card.classList.remove('selected');
        });
        
        this.selectedCard = null;
        
        // Reset any associated hidden input
        if (this.container.id && this.container.id.endsWith('Container')) {
            const inputId = this.container.id.replace('Container', '');
            const input = document.getElementById(inputId);
            if (input) {
                input.value = '';
            }
        }
    }
}

export default CardSelection;
