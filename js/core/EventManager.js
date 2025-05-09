/**
 * EventManager.js
 * Centralized event management for the GeoplyForm
 */

class EventManager {
    constructor() {
        // Store all event listeners for potential cleanup
        this.eventListeners = [];
    }

    /**
     * Add an event listener and store it for later cleanup
     * @param {Element} element - DOM element to attach the event to
     * @param {string} eventType - Type of event (e.g., 'click', 'submit')
     * @param {Function} callback - Event handler function
     * @param {Object} options - Optional event listener options
     */
    addListener(element, eventType, callback, options = {}) {
        if (!element) {
            console.error('Cannot add event listener to undefined element');
            return;
        }

        element.addEventListener(eventType, callback, options);
        
        // Store reference for cleanup
        this.eventListeners.push({
            element,
            eventType,
            callback,
            options
        });
    }

    /**
     * Add event listeners to multiple elements
     * @param {NodeList|Array} elements - Collection of DOM elements
     * @param {string} eventType - Type of event
     * @param {Function} callback - Event handler function
     * @param {Object} options - Optional event listener options
     */
    addListenerToAll(elements, eventType, callback, options = {}) {
        if (!elements || !elements.forEach) {
            console.error('Invalid elements collection for event listeners');
            return;
        }

        elements.forEach(element => {
            this.addListener(element, eventType, callback, options);
        });
    }

    /**
     * Remove a specific event listener
     * @param {Element} element - DOM element to remove the event from
     * @param {string} eventType - Type of event
     * @param {Function} callback - Original event handler function
     * @param {Object} options - Optional event listener options
     */
    removeListener(element, eventType, callback, options = {}) {
        if (!element) return;
        
        element.removeEventListener(eventType, callback, options);
        
        // Update stored listeners
        this.eventListeners = this.eventListeners.filter(listener => {
            return !(listener.element === element && 
                    listener.eventType === eventType && 
                    listener.callback === callback);
        });
    }

    /**
     * Remove all event listeners managed by this instance
     */
    removeAllListeners() {
        this.eventListeners.forEach(({ element, eventType, callback, options }) => {
            if (element) {
                element.removeEventListener(eventType, callback, options);
            }
        });
        
        this.eventListeners = [];
    }

    /**
     * Create a delegated event handler for dynamic elements
     * @param {Element} parentElement - Static parent element to attach the event to
     * @param {string} childSelector - CSS selector for child elements to delegate to
     * @param {string} eventType - Type of event
     * @param {Function} callback - Event handler function
     */
    addDelegatedListener(parentElement, childSelector, eventType, callback) {
        if (!parentElement) return;
        
        const delegatedCallback = (event) => {
            const targetElement = event.target.closest(childSelector);
            
            if (targetElement && parentElement.contains(targetElement)) {
                callback.call(targetElement, event, targetElement);
            }
        };
        
        this.addListener(parentElement, eventType, delegatedCallback);
    }
}

export default EventManager;
