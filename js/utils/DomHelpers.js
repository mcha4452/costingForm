/**
 * DomHelpers.js
 * Utility functions for DOM manipulation
 */

class DomHelpers {
    /**
     * Show an element by adding a class or setting display style
     * @param {Element|string} element - DOM element or selector
     * @param {string} displayType - Display type (default: 'block')
     */
    static show(element, displayType = 'block') {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.style.display = displayType;
        }
    }

    /**
     * Hide an element by setting display to none
     * @param {Element|string} element - DOM element or selector
     */
    static hide(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.style.display = 'none';
        }
    }

    /**
     * Toggle the visibility of an element
     * @param {Element|string} element - DOM element or selector
     * @param {string} displayType - Display type when showing (default: 'block')
     */
    static toggle(element, displayType = 'block') {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.style.display = el.style.display === 'none' ? displayType : 'none';
        }
    }

    /**
     * Add a class to an element
     * @param {Element|string} element - DOM element or selector
     * @param {string} className - Class to add
     */
    static addClass(element, className) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el && className) {
            el.classList.add(className);
        }
    }

    /**
     * Remove a class from an element
     * @param {Element|string} element - DOM element or selector
     * @param {string} className - Class to remove
     */
    static removeClass(element, className) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el && className) {
            el.classList.remove(className);
        }
    }

    /**
     * Toggle a class on an element
     * @param {Element|string} element - DOM element or selector
     * @param {string} className - Class to toggle
     */
    static toggleClass(element, className) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el && className) {
            el.classList.toggle(className);
        }
    }

    /**
     * Set the text content of an element
     * @param {Element|string} element - DOM element or selector
     * @param {string} text - Text content to set
     */
    static setText(element, text) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.textContent = text;
        }
    }

    /**
     * Set the HTML content of an element
     * @param {Element|string} element - DOM element or selector
     * @param {string} html - HTML content to set
     */
    static setHtml(element, html) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.innerHTML = html;
        }
    }

    /**
     * Get the value of a form field
     * @param {Element|string} element - DOM element or selector
     * @returns {string} The field value
     */
    static getValue(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        return el ? el.value : '';
    }

    /**
     * Set the value of a form field
     * @param {Element|string} element - DOM element or selector
     * @param {string} value - Value to set
     */
    static setValue(element, value) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.value = value;
        }
    }

    /**
     * Create a DOM element with attributes and properties
     * @param {string} tagName - HTML tag name
     * @param {Object} attributes - Attributes to set on the element
     * @param {string|Element} content - Text content or child element to append
     * @returns {Element} The created element
     */
    static createElement(tagName, attributes = {}, content = null) {
        const element = document.createElement(tagName);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Set content
        if (content) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof Element) {
                element.appendChild(content);
            }
        }
        
        return element;
    }

    /**
     * Find the closest parent element matching a selector
     * @param {Element} element - Starting element
     * @param {string} selector - CSS selector to match
     * @returns {Element|null} The matching parent or null
     */
    static getClosest(element, selector) {
        return element.closest(selector);
    }

    /**
     * Get all form data as an object
     * @param {Element|string} form - Form element or selector
     * @returns {Object} Form data as key-value pairs
     */
    static getFormData(form) {
        const formElement = typeof form === 'string' ? document.querySelector(form) : form;
        if (!formElement) return {};
        
        const formData = new FormData(formElement);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        return data;
    }
}

export default DomHelpers;
