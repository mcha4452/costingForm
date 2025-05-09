/**
 * ProgressBar.js
 * Component for managing the form progress bar and step indicators
 */

class ProgressBar {
    /**
     * Initialize a progress bar component
     * @param {Element} progressFill - The progress fill element
     * @param {NodeList} progressSteps - The progress step indicators
     * @param {number} totalPages - Total number of pages in the form
     */
    constructor(progressFill, progressSteps, totalPages) {
        this.progressFill = progressFill;
        this.progressSteps = progressSteps;
        this.totalPages = totalPages;
        this.currentPage = 1;
    }

    /**
     * Update the progress bar and step indicators
     * @param {number} page - The current page number
     */
    updateProgress(page) {
        this.currentPage = page;
        
        // Show the current page and hide others
        this.showPage(page);
        
        // Calculate progress percentage
        const progress = (page - 1) / (this.totalPages - 1) * 100;
        
        // Update progress bar width
        if (this.progressFill) {
            this.progressFill.style.width = progress + '%';
            console.log('Progress updated to: ' + progress + '%');
        } else {
            console.error('Progress fill element not found');
        }
        
        // Update step indicators
        if (this.progressSteps && this.progressSteps.length > 0) {
            this.progressSteps.forEach((step, index) => {
                if (index + 1 <= page) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        } else {
            console.error('Progress steps not found');
        }
    }
    
    /**
     * Show a specific page and hide others
     * @param {number} pageId - The page number to show
     */
    showPage(pageId) {
        console.log('ProgressBar.showPage called with pageId:', pageId);
        
        // Hide all pages
        const pages = document.querySelectorAll('.form-page');
        console.log('Found', pages.length, 'form pages');
        pages.forEach(page => {
            page.classList.remove('active');
            console.log('Removed active class from', page.id);
        });
        
        // Show the selected page
        const targetPage = document.getElementById('page' + pageId);
        if (targetPage) {
            console.log('Adding active class to', targetPage.id);
            targetPage.classList.add('active');
            
            // Force the page to be visible with inline style as a fallback
            targetPage.style.display = 'block';
            
            // Scroll to the top of the page
            window.scrollTo(0, 0);
        } else {
            console.error('Page ' + pageId + ' not found');
        }
    }

    /**
     * Get the current progress percentage
     * @returns {number} The current progress percentage
     */
    getProgressPercentage() {
        return (this.currentPage - 1) / (this.totalPages - 1) * 100;
    }

    /**
     * Reset the progress bar to the first page
     */
    reset() {
        this.updateProgress(1);
    }
}

export default ProgressBar;
