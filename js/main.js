/**
 * main.js
 * Entry point for the GeoplyForm application
 */

// Import core modules
import FormState from './core/FormState.js';
import EventManager from './core/EventManager.js';
import FormBuilder from './core/FormBuilder.js';

// Import utility modules
import FormValidator from './utils/FormValidator.js';
import DomHelpers from './utils/DomHelpers.js';
import StorageManager from './utils/StorageManager.js';

// Import components
import ProgressBar from './components/ProgressBar.js';
import CardSelection from './components/CardSelection.js';
import CarouselSelection from './components/CarouselSelection.js';
import FormFields from './components/FormFields.js';

// Import visual indicator fix utilities
import FormFixes, { fixS4WindowDisplay } from './utils/FormFixes.js';

// Import page modules
import ProjectTypePage from './pages/ProjectTypePage.js';
import BuildDetailsPage from './pages/BuildDetailsPage.js';
import ContactPage from './pages/ContactPage.js';

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core components
    const formState = new FormState();
    const eventManager = new EventManager();
    const storageManager = new StorageManager('geoplySubmissions');
    
    // DOM elements
    const form = document.getElementById('geoplyForm');
    const progressFill = document.getElementById('progressFill');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Initialize UI components
    const progressBar = new ProgressBar(progressFill, progressSteps, formState.totalPages);
    
    // Initialize the form builder
    const formBuilder = new FormBuilder(form, formState, eventManager);
    
    // Initialize page components
    let projectTypePage = null;
    let buildDetailsPage = null;
    let contactPage = null;
    
    // Expose components for external scripts
    window.geoplyForm = {
        formState,
        buildDetailsPage: null,
        updateBuildDetailsPage: (page) => {
            window.geoplyForm.buildDetailsPage = page;
        }
    };
    
    // Add helper methods to window for testing (these will be removed in production)
    window.getGeoplySubmissions = function() {
        const submissions = storageManager.getAllSubmissions();
        console.log('Saved submissions:', submissions);
        return submissions;
    };
    
    window.clearGeoplySubmissions = function() {
        storageManager.clearAllSubmissions();
        console.log('All submissions cleared');
        return true;
    };
    
    // Update progress bar when page changes
    formState.setStateChangeCallback(handleStateChange);
    
    /**
     * Handle state changes from form state
     * @param {string} eventType - Type of state change
     * @param {Object} data - State change data
     */
    function handleStateChange(eventType, data) {
        console.log('State change handler called with:', eventType, data);
        
        if (eventType === 'pageChange') {
            // Update progress bar
            progressBar.updateProgress(data.page);
            
            // Force a small delay before updating page visibility to ensure clean DOM updates
            setTimeout(() => {
                // Handle DOM updates for page change
                updatePageVisibility(data.page);
                
                // Update contact page summary if we're on page 3
                if (data.page === 3 && contactPage) {
                    contactPage.updateSummary();
                }
            }, 10);
        } else if (eventType === 'projectTypeChange') {
            if (buildDetailsPage) {
                buildDetailsPage.updateConditionalFields();
            }
        } else if (eventType === 'formDataChange') {
            // If we're on the contact page, update the summary when form data changes
            if (formState.getCurrentPage() === 3 && contactPage) {
                contactPage.updateSummary();
            }
        } else if (eventType === 'formReset') {
            resetForm();
        }
    }
    
    /**
     * Update which page is visible in the DOM
     * @param {number} pageNum - The page number to show
     */
    function updatePageVisibility(pageNum) {
        console.log('Updating page visibility to show only page:', pageNum);
        
        // First ensure all pages are inactive by removing all active classes
        document.querySelectorAll('.form-page').forEach(page => {
            page.classList.remove('active');
            // Remove any inline display styles that might be interfering
            page.style.display = '';
        });
        
        // Now only activate the target page
        const targetPage = document.getElementById('page' + pageNum);
        if (targetPage) {
            console.log('Setting page visible:', pageNum);
            targetPage.classList.add('active');
        } else {
            console.error('Target page not found:', pageNum);
            return;
        }
        
        // Debug check - make sure only one page has the active class
        const activePages = document.querySelectorAll('.form-page.active');
        console.log('Number of active pages after update:', activePages.length);
        
        if (activePages.length > 1) {
            console.error('Multiple active pages detected, fixing...');
            // Keep only the target page active
            activePages.forEach(page => {
                if (page.id !== 'page' + pageNum) {
                    console.log('Force removing active class from:', page.id);
                    page.classList.remove('active');
                }
            });
        }
    }
    
    // Add a helper function to detect and fix any visible Contact page issues
function checkAndFixPageVisibility() {
    // If we detect both the Contact page and another page are visible, fix it
    const contactPage = document.querySelector('#page3');
    const doorsSection = document.querySelector('#page2');
    
    if (contactPage && contactPage.offsetParent !== null && 
        doorsSection && doorsSection.offsetParent !== null) {
        console.error('Both Contact and Build Details pages are visible! Fixing...');
        
        // Get current page from form state
        const currentPage = formState.getCurrentPage();
        console.log('Current page should be:', currentPage);
        
        // Force update visibility based on current state
        updatePageVisibility(currentPage);
    }
}

// Add a periodic check to catch and fix any page visibility issues
setInterval(checkAndFixPageVisibility, 500);

// Initialize the application
initializeApp();
    
    /**
     * Initialize the application
     */
    async function initializeApp() {
        try {
            // Load questions and build the form first
            await formBuilder.loadQuestions('questions.json');
            
            // Initialize page components
            initializePageComponents();
            
            // Initialize event listeners
            initializeEventListeners();
            
            // Set up state change handling and ensure initial page is shown correctly
            formState.setStateChangeCallback(handleStateChange);
            const initialPage = formState.getCurrentPage();
            updatePageVisibility(initialPage);
            progressBar.updateProgress(initialPage);
            console.log('Initial page set to:', initialPage);
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }
    
    /**
     * Initialize page components after form is built
     */
    function initializePageComponents() {
        // Initialize project type page (page 1)
        const page1Element = document.getElementById('page1');
        if (page1Element) {
            projectTypePage = new ProjectTypePage(page1Element, formState);
        }
        
        // Initialize build details page (page 2)
        const page2Element = document.getElementById('page2');
        if (page2Element) {
            buildDetailsPage = new BuildDetailsPage(page2Element, formState);
            // Store reference for external access
            if (window.geoplyForm) {
                window.geoplyForm.buildDetailsPage = buildDetailsPage;
            }
        }
        
        // Initialize contact page (page 3)
        const page3Element = document.getElementById('page3');
        if (page3Element) {
            contactPage = new ContactPage(page3Element, formState);
        }
    }
    
    /**
     * Initialize all event listeners
     */
    function initializeEventListeners() {
        // Next buttons
        const nextButtons = document.querySelectorAll('.next-btn');
        eventManager.addListenerToAll(nextButtons, 'click', function() {
            const pageNum = parseInt(this.dataset.page);
            console.log('Next button clicked for page:', pageNum);
            
            const isValid = validatePage(pageNum);
            console.log('Page validation result:', isValid);
            
            if (isValid) {
                console.log('Navigating to page:', pageNum + 1);
                // Update form state - page visibility will be handled by the state change handler
                formState.setCurrentPage(pageNum + 1);
            }
        });
        
        // Previous buttons
        const prevButtons = document.querySelectorAll('.prev-btn');
        eventManager.addListenerToAll(prevButtons, 'click', function(event) {
            // Prevent default behavior and stop propagation
            event.preventDefault();
            event.stopPropagation();
            
            const pageNum = parseInt(this.dataset.page);
            console.log('Previous button clicked for page:', pageNum);
            
            // DIRECT FIX: Immediately hide all pages first
            document.querySelectorAll('.form-page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show the correct previous page
            const prevPageNum = pageNum - 1;
            const prevPage = document.getElementById('page' + prevPageNum);
            if (prevPage) {
                prevPage.classList.add('active');
            }
            
            // Update form state properly
            formState.setCurrentPage(prevPageNum);
            
            // Force an extra check
            setTimeout(checkAndFixPageVisibility, 100);
        });
        
        // Restart form button
        const restartButton = document.getElementById('restartForm');
        if (restartButton) {
            eventManager.addListener(restartButton, 'click', function() {
                if (confirm('Are you sure you want to start over? All your progress will be lost.')) {
                    formState.resetState();
                }
            });
        }
        
        // Save for later buttons (bookmark icons)
        const saveButtons = document.querySelectorAll('[id^="saveForLaterBtn"]');
        eventManager.addListenerToAll(saveButtons, 'click', function() {
            // Get current form data from state
            const formData = formState.getFormData();
            
            // Add timestamp
            formData.savedAt = new Date().toISOString();
            
            // The windows, doors, and skylights data is already in the format we want (item name as key, quantity as value)
            // No transformation needed
            
            // Format as JSON
            const jsonData = JSON.stringify(formData, null, 2);
            
            // Display the JSON data
            alert('Current Form Data as JSON:\n\n' + jsonData);
            
            // Also log to console for easier viewing
            console.log('Current Form Data:', formData);
            
            // Save to storage
            storageManager.saveFormState(formData);
        });
        
        // Form submission
        eventManager.addListener(form, 'submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const isValid = validateForm();
            
            if (isValid) {
                // Get form data from state
                const formData = formState.getFormData();
                
                // Add submission timestamp
                formData.submittedAt = new Date().toISOString();
                
                // The windows, doors, and skylights data is already in the format we want (item name as key, quantity as value)
                // No transformation needed
                
                // Prepare form data for webhook
                // Add submission timestamp
                formData.submittedAt = new Date().toISOString();
                
                // Store submission
                storageManager.saveSubmission(formData);
                
                // Ensure all fields are present, even if blank
                // This helps with Zapier configuration
                
                // Get all available window, door, and skylight types from the form
                // This ensures we include all possible options in the payload
                const allWindowTypes = getAllOpeningTypes('windows');
                const allDoorTypes = getAllOpeningTypes('doors');
                const allSkylightTypes = getAllOpeningTypes('skylights');
                
                // Create objects with all opening types set to 0 by default
                const defaultWindows = {};
                const defaultDoors = {};
                const defaultSkylights = {};
                
                // Set all window types to 0 by default
                allWindowTypes.forEach(type => {
                    defaultWindows[type] = 0;
                });
                
                // Set all door types to 0 by default
                allDoorTypes.forEach(type => {
                    defaultDoors[type] = 0;
                });
                
                // Set all skylight types to 0 by default
                allSkylightTypes.forEach(type => {
                    defaultSkylights[type] = 0;
                });
                
                // Debug log to see what dimension values we have
                console.log('Building dimensions in form data:', {
                    length: formData.length,
                    width: formData.width,
                    height: formData.height,
                    wallDepth: formData.wallDepth,
                    roofType: formData.roofType
                });
                
                // Try to get building dimensions from the DOM if not in formData
                const lengthSelect = document.getElementById('buildingLength');
                const widthSelect = document.getElementById('buildingWidth');
                const heightSelect = document.getElementById('buildingHeight');
                const wallDepthSelect = document.getElementById('wallDepth');
                const roofTypeInput = document.getElementById('roofType');
                
                // Get values directly from the DOM elements if available
                // Use the correct property names as seen in the console log
                const buildingLength = formData.length || (lengthSelect ? lengthSelect.value : '');
                const buildingWidth = formData.width || (widthSelect ? widthSelect.value : '');
                const buildingHeight = formData.height || (heightSelect ? heightSelect.value : '');
                const wallDepth = formData.wallDepth || (wallDepthSelect ? wallDepthSelect.value : '');
                const roofType = formData.roofType || (roofTypeInput ? roofTypeInput.value : '');
                
                console.log('Building dimensions after DOM check:', {
                    length: buildingLength,
                    width: buildingWidth,
                    height: buildingHeight,
                    wallDepth: wallDepth,
                    roofType: roofType
                });
                
                // Merge defaults with actual selections
                const windowsData = { ...defaultWindows, ...(formData.windows || {}) };
                const doorsData = { ...defaultDoors, ...(formData.doors || {}) };
                const skylightsData = { ...defaultSkylights, ...(formData.skylights || {}) };
                
                // Get size suffixes from buildDetailsPage if available
                let wallBlockSuffix = '';
                let floorBlockSuffix = '';
                if (window.geoplyForm && window.geoplyForm.buildDetailsPage) {
                    // Get wallBlockSuffix (height) and floorBlockSuffix (width) suffixes
                    wallBlockSuffix = window.geoplyForm.buildDetailsPage.getHeightSizeSuffix() || '';
                    floorBlockSuffix = window.geoplyForm.buildDetailsPage.getWidthSizeSuffix() || '';
                    console.log('Size suffixes found - Wall Block:', wallBlockSuffix, 'Floor Block:', floorBlockSuffix);
                } else {
                    console.warn('Build details page reference not available, size suffixes will be empty');
                }

                const completeFormData = {
                    // General Info
                    projectType: formData.projectType || '',
                    selfBuildType: formData.selfBuildType || '',
                    projectName: formData.projectName || '',
                    
                    // Building Details - use values from DOM if not in formData
                    buildingLength: buildingLength,
                    buildingWidth: buildingWidth,
                    buildingHeight: buildingHeight,
                    wallDepth: wallDepth,
                    roofType: roofType,
                    // Add size suffixes
                    wallBlockSuffix: wallBlockSuffix,
                    floorBlockSuffix: floorBlockSuffix,
                    
                    // Windows, Doors, Skylights with all options included
                    windows: windowsData,
                    doors: doorsData,
                    skylights: skylightsData,
                    
                    // Finishes
                    cladding: formData.cladding || '',
                    roofing: formData.roofing || '',
                    
                    // Contact Info
                    name: formData.name || '',
                    email: formData.email || '',
                    phone: formData.phone || '',
                    address: formData.address || '',
                    postcode: formData.postcode || '',
                    comments: formData.comments || '',
                    preferredContact: formData.preferredContact || '',
                    howHeard: formData.howHeard || '',
                    
                    // Metadata
                    submittedAt: formData.submittedAt
                };
                
                // Use URLSearchParams to avoid the Content-Type: application/json CORS issue
                const urlEncodedData = new URLSearchParams();
                
                // Add all fields individually to the URL parameters
                // This ensures they're accessible as top-level fields in Zapier
                Object.entries(completeFormData).forEach(([key, value]) => {
                    // If the value is an object (like windows, doors, skylights), stringify it
                    if (typeof value === 'object' && value !== null) {
                        urlEncodedData.append(key, JSON.stringify(value));
                    } else {
                        urlEncodedData.append(key, value);
                    }
                });
                
                // Also include the complete payload as before (for backward compatibility)
                urlEncodedData.append('payload', JSON.stringify(completeFormData));
                
                // For debugging
                console.log('Sending data to Zapier:', completeFormData);
                console.log('URL encoded data:', urlEncodedData.toString());
                
                fetch('https://hooks.zapier.com/hooks/catch/22140673/2pi7h4e/', {
                    method: 'POST',
                    // No Content-Type header - browser will automatically set application/x-www-form-urlencoded
                    body: urlEncodedData
                })
                .then(response => {
                    if (response.ok) {
                        console.log('Data successfully sent to webhook');
                        alert('Form submitted successfully! We will contact you shortly.');
                    } else {
                        console.error('Failed to send data to webhook:', response.status);
                        alert('Form submitted successfully! We will contact you shortly.\n\nNote: There was an issue connecting to our system, but your data has been saved locally.');
                    }
                })
                .catch(error => {
                    console.error('Error sending data to webhook:', error);
                    alert('Form submitted successfully! We will contact you shortly.\n\nNote: There was an issue connecting to our system, but your data has been saved locally.');
                });
                
                // Reset form
                formState.resetState();
            }
        });
        
        // Add click animation to primary buttons
        const primaryButtons = document.querySelectorAll('.btn-primary');
        eventManager.addListenerToAll(primaryButtons, 'click', function(e) {
            // Add clicked class
            this.classList.add('clicked');
            
            // Remove clicked class after animation completes
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 600);
        });
    }
    
    /**
     * Function to validate the current page
     * @param {number} pageNum - The page number to validate
     * @returns {boolean} Whether the page is valid
     */
    function validatePage(pageNum) {
        switch(pageNum) {
            case 1:
                if (!projectTypePage || projectTypePage.getSelectedProjectType() === null) {
                    return false;
                }
                // If self-build is selected, self build type must also be selected
                if (projectTypePage.getSelectedProjectType() === 'self-build' && 
                    (!projectTypePage.getSelectedSelfBuildType() || projectTypePage.getSelectedSelfBuildType() === null)) {
                    return false;
                }
                return true;
            case 2:
                return buildDetailsPage ? buildDetailsPage.validate() : false;
            case 3:
                return contactPage ? contactPage.validate() : false;
            default:
                return true;
        }
    }
    
    /**
     * Function to validate the entire form
     * @returns {boolean} Whether the form is valid
     */
    function validateForm() {
        for (let i = 1; i <= formState.totalPages; i++) {
            if (!validatePage(i)) {
                formState.setCurrentPage(i);
                return false;
            }
        }
        return true;
    }
    
    /**
     * Function to reset the form
     */
    function resetForm() {
        // Reset all page components
        if (projectTypePage) projectTypePage.reset();
        if (buildDetailsPage) buildDetailsPage.reset();
        if (contactPage) contactPage.reset();
        
        // Reset progress bar
        progressBar.reset();
        
        // Ensure page 1 is visible
        updatePageVisibility(1);
    }
    
    /**
     * Helper function to get all opening types from the form
     * @param {string} openingType - The type of opening ('windows', 'doors', or 'skylights')
     * @returns {Array} - Array of opening type IDs
     */
    function getAllOpeningTypes(openingType) {
        // Get the container for the specified opening type
        const containerSelector = `#${openingType}Container`;
        const container = document.querySelector(containerSelector);
        
        if (!container) {
            console.warn(`Container for ${openingType} not found`);
            return [];
        }
        
        // Get all carousel items in the container
        const items = container.querySelectorAll('.carousel-item');
        const types = [];
        
        // Extract the opening type ID from each item
        items.forEach(item => {
            const typeId = item.dataset.value;
            if (typeId) {
                types.push(typeId);
            }
        });
        
        console.log(`Found ${types.length} ${openingType} types:`, types);
        return types;
    }
});
