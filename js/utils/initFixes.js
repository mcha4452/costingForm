/**
 * initFixes.js
 * Contains immediate fixes for window/door quantity indicators
 */

// Function to fix the S4 window display issue
export function fixS4WindowDisplay() {
    // Wait for DOM content to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyS4Fix);
    } else {
        // DOM is already loaded, apply fix immediately
        applyS4Fix();
    }
}

function applyS4Fix() {
    // Run this fix when page is fully loaded
    setTimeout(() => {
        // Find S4 window input
        const s4Input = document.getElementById('windows_S4_qty');
        if (!s4Input) return;
        
        // Check the value
        let value = parseInt(s4Input.value || '0');
        
        // If input has class but value is 0, set to 1
        if (s4Input.classList.contains('quantity-has-value') && value === 0) {
            s4Input.value = 1;
            
            // Also update the carousel item styling
            const item = s4Input.closest('.carousel-item');
            if (item) {
                item.classList.add('carousel-item-has-quantity');
            }
            
            console.log("Fixed S4 window display - value was 0 but had class applied");
        }
        
        // If value > 0 but classes are missing, add them
        if (value > 0) {
            s4Input.classList.add('quantity-has-value');
            
            const item = s4Input.closest('.carousel-item');
            if (item) {
                item.classList.add('carousel-item-has-quantity');
            }
            
            console.log("Fixed S4 window display - value > 0 but missing classes");
        }
    }, 100);
}

// Run S4 fix immediately
fixS4WindowDisplay();
