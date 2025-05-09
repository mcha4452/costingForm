/**
 * imageHandler.js
 * Utility functions for handling CDN images in carousel cards
 */

/**
 * Initialize image handling for carousel items
 * This adds proper event handlers and initializes loading states
 */
export function initImageHandling() {
    console.log('Initializing image handling for carousel items');
    
    // Find all CDN images in carousel items
    const cdnImages = document.querySelectorAll('.cdn-image');
    
    cdnImages.forEach(img => {
        // Set loading state when image starts loading
        img.closest('.carousel-item-image').classList.add('loading');
        
        // Handle successful load
        img.addEventListener('load', () => {
            // Remove loading state
            img.closest('.carousel-item-image').classList.remove('loading');
        });
        
        // Handle load error
        // Note: The inline onerror handler is the primary fallback method
        // This is a secondary backup in case the inline handler fails
        img.addEventListener('error', () => {
            console.warn('Image failed to load:', img.src);
            
            // Remove loading state
            img.closest('.carousel-item-image').classList.remove('loading');
            
            // Add error class to image
            img.classList.add('image-error');
            
            // Replace with placeholder if not already done by the inline handler
            if (!img.closest('.carousel-item-image').querySelector('.placeholder-image')) {
                const title = img.alt || 'No Image';
                const placeholder = document.createElement('div');
                placeholder.className = 'placeholder-image';
                placeholder.textContent = title;
                
                // Replace image with placeholder
                img.closest('.carousel-item-image').innerHTML = '';
                img.closest('.carousel-item-image').appendChild(placeholder);
            }
        });
    });
}

/**
 * Check if a URL is a valid image URL
 * @param {string} url - The URL to check
 * @returns {boolean} Whether the URL is valid
 */
export function isValidImageUrl(url) {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return false;
    }
    
    // Check if the URL has a valid protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return false;
    }
    
    // Check if the URL has a valid image extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
    
    // For URLs from known CDNs, we can be more permissive (URLs might not have file extensions)
    const isFromKnownCDN = url.includes('cdn.') || 
                          url.includes('.cloudfront.net') ||
                          url.includes('.amazonaws.com') ||
                          url.includes('.website-files.com');
    
    return hasImageExtension || isFromKnownCDN;
}

/**
 * Refresh all carousel images
 * Useful for when new carousel items are added dynamically
 */
export function refreshCarouselImages() {
    console.log('Refreshing carousel images');
    
    // Reinitialize image handling
    initImageHandling();
}

/**
 * Get the default placeholder image path
 * @returns {string} The path to the default placeholder image
 */
export function getDefaultPlaceholderImage() {
    return 'assets/window-icon.svg';
}
