    /**
    * BuildDetailsPage.js
    * Handles the build details page with form fields and conditional logic
    */

import CardSelection from '../components/CardSelection.js';
import CarouselSelection from '../components/CarouselSelection.js';
import FormFields from '../components/FormFields.js';
import { loadDimensionsFromCSV, loadMaterialsFromCSV } from '../utils/simpleCSVLoader.js';
import { initImageHandling, refreshCarouselImages } from '../utils/imageHandler.js';

class BuildDetailsPage {
    /**
     * Initialize the build details page
     * @param {Element} pageElement - The page container element
     * @param {Object} formState - The form state manager
     */
    constructor(pageElement, formState) {
        this.pageElement = pageElement;
        this.formState = formState;
        this.windowsSelection = null;
        this.doorsSelection = null;
        this.skylightsSelection = null;
        this.claddingSelection = null;
        this.roofingSelection = null;
        this.formFields = null;
        this.dimensionOptions = [];
        this.materialsData = { cladding: [], roofing: [] };
        
        // Subscribe to form state changes to detect wall depth changes
        this.formState.subscribe(this.handleFormStateChange.bind(this));
        
        this.init();
        this.loadDimensionData();
        this.loadMaterialsData();
        
        // Initialize image handling after a short delay to ensure DOM is ready
        setTimeout(() => {
            initImageHandling();
        }, 500);
    }

    /**
     * Initialize the page components
     */
    init() {
        // Initialize windows selection if it exists
        const windowsContainer = this.pageElement.querySelector('#windowsContainer');
        if (windowsContainer) {
            console.log('Initializing windows carousel - items count:', windowsContainer.querySelectorAll('.carousel-item').length);
            
            this.windowsSelection = new CarouselSelection(
                windowsContainer,
                {},
                this.handleWindowsSelection.bind(this)
            );
            console.log('Windows carousel initialized');
        } else {
            console.warn('Could not find windows container');
        }
        
        // Initialize doors selection if it exists
        const doorsContainer = this.pageElement.querySelector('#doorsContainer');
        if (doorsContainer) {
            console.log('Initializing doors carousel - items count:', doorsContainer.querySelectorAll('.carousel-item').length);
            
            this.doorsSelection = new CarouselSelection(
                doorsContainer,
                {},
                this.handleDoorsSelection.bind(this)
            );
            console.log('Doors carousel initialized');
        } else {
            console.warn('Could not find doors container');
        }
        
        // Initialize skylights selection if it exists
        const skylightsContainer = this.pageElement.querySelector('#skylightsContainer');
        if (skylightsContainer) {
            console.log('Initializing skylights carousel - items count:', skylightsContainer.querySelectorAll('.carousel-item').length);
            
            this.skylightsSelection = new CarouselSelection(
                skylightsContainer,
                {},
                this.handleSkylightsSelection.bind(this)
            );
            console.log('Skylights carousel initialized');
        } else {
            console.warn('Could not find skylights container');
        }
        
        // Note: We no longer attempt to initialize or display cladding and roofing carousels
        // They are processed in the background via processCladdingData and processRoofingData methods
        
        // Initialize form fields
        this.formFields = new FormFields(
            this.pageElement,
            {},
            this.handleFieldChange.bind(this)
        );
        
        // Update conditional fields based on project type
        this.updateConditionalFields();
        
        // Reset skylights when page is initialized/reinitialized
        this.resetSkylights();
        
        // Filter windows and doors based on wall depth
        this.filterOpeningsByWallDepth();
        
        // Filter dimensions by wall depth
        this.filterDimensionsByWallDepth();
        
        // Initialize standard specs section
        this.updateStandardSpecsSection();

        // Add event listeners to update standard specs when roof type changes
        const roofTypeCards = this.pageElement.querySelectorAll('#roofTypeContainer .card-option');
        if (roofTypeCards.length > 0) {
            console.log('Adding click event listeners to roof type cards');
            roofTypeCards.forEach(card => {
                card.addEventListener('click', () => {
                    console.log('Roof type card clicked, updating standard specs');
                    setTimeout(() => this.updateStandardSpecsSection(), 100);
                });
            });
        } else {
            console.warn('No roof type cards found');
        }
        
        // Add event listener for project type
        window.addEventListener('projectTypeChanged', (e) => {
            console.log('Project type changed event received:', e.detail);
            setTimeout(() => this.updateStandardSpecsSection(), 100);
        });
    }

    /**
     * Load dimension data asynchronously
     */
    async loadDimensionData() {
        try {
            this.dimensionOptions = await loadDimensionsFromCSV('dimensions.csv');
            console.log('Dimension options loaded:', this.dimensionOptions.length);
            // Call filter initially after data is loaded
            this.filterDimensionsByWallDepth();
            // Note: No need to call populateLengthOptions() separately since filterDimensionsByWallDepth now handles it
        } catch (error) {
            console.error('Failed to load dimension data:', error);
            // Handle error appropriately, maybe show a message to the user
            this.dimensionOptions = []; // Ensure it's an empty array on error
        }
    }
    
    /**
     * Load materials data (cladding and roofing) asynchronously
     */
    async loadMaterialsData() {
        try {
            console.log('Loading materials data from CSV...');
            this.materialsData = await loadMaterialsFromCSV('materials.csv');
            console.log('Materials data loaded:', 
                        this.materialsData.cladding.length, 'cladding options,', 
                        this.materialsData.roofing.length, 'roofing options');
            
            // Process the loaded material data in the background
            // Note: We're not displaying the carousels, but still processing the data
            this.processCladdingData();
            this.processRoofingData();
            
            // Update standard specs section with the loaded materials
            this.updateStandardSpecsSection();
        } catch (error) {
            console.error('Failed to load materials data:', error);
            this.materialsData = { cladding: [], roofing: [] }; // Ensure they're empty arrays on error
        }
    }
    
    /**
     * Process cladding data in the background without displaying the carousel
     */
    processCladdingData() {
        const formData = this.formState.getFormData();
        
        // If there's a previous cladding selection, make sure it's in form state
        if (formData.cladding && this.materialsData.cladding) {
            // Validate that the selected option exists in our data
            const validOption = this.materialsData.cladding.find(opt => opt.Value === formData.cladding);
            if (!validOption) {
                // If not valid, clear the selection
                this.formState.updateFormData({ cladding: null });
            }
        }
    }
    
    /**
     * Process roofing data in the background without displaying the carousel
     */
    processRoofingData() {
        const formData = this.formState.getFormData();
        
        // If there's a previous roofing selection, make sure it's in form state
        if (formData.roofing && this.materialsData.roofing) {
            // Validate that the selected option exists in our data
            const validOption = this.materialsData.roofing.find(opt => opt.Value === formData.roofing);
            if (!validOption) {
                // If not valid, clear the selection
                this.formState.updateFormData({ roofing: null });
            }
        }
    }
    
    /**
     * Populate the length select dropdown with options from the loaded CSV data.
     * This is now filtered by wall depth, similar to height and width.
     */
    populateLengthOptions() {
        if (!this.dimensionOptions || this.dimensionOptions.length === 0) {
            console.log('Dimension options not loaded yet or empty, skipping length population.');
            return; 
        }

        const lengthSelect = this.pageElement.querySelector('#length'); // Find the length select
        if (!lengthSelect) {
            console.warn('Length select element (#length) not found.');
            return; // Exit if the element doesn't exist
        }

        const formData = this.formState.getFormData();
        const wallDepth = formData.wallDepth;

        // Filter options for 'Length' Type and matching wall depth (or 'any')
        const lengthOptions = this.dimensionOptions
            .filter(opt => {
                const isLengthType = opt.Type === 'Length';
                // If wallDepth is selected, filter by it, otherwise show all length options
                const wallDepthMatch = !wallDepth || !opt.WallDepth || 
                                      opt.WallDepth.toLowerCase() === 'any' || 
                                      String(opt.WallDepth) === String(wallDepth);
                return isLengthType && wallDepthMatch;
            })
            .sort((a, b) => parseFloat(a.Value) - parseFloat(b.Value)); // Sort numerically

        console.log(`Populating Length dropdown with ${lengthOptions.length} options for wall depth: ${wallDepth || 'any'}.`);

        // Update the select element using the helper
        this.updateSelectWithOptions(lengthSelect, lengthOptions, formData.length, 'length');
    }
    
    /**
     * Handle form state changes
     * @param {Object} newState - The new form state
     * @param {Object} oldState - The previous form state
     */
    handleFormStateChange(newState, oldState) {
        // Check if wall depth has changed
        if (newState.wallDepth !== oldState.wallDepth) {
            console.log('Wall depth changed from', oldState.wallDepth, 'to', newState.wallDepth);
            this.filterOpeningsByWallDepth(newState.wallDepth);
            this.filterDimensionsByWallDepth(newState.wallDepth);
        }
        
        // Check if roof type has changed
        if (newState.roofType !== oldState.roofType) {
            console.log('Roof type changed from', oldState.roofType, 'to', newState.roofType);
            this.filterOpeningsByWallDepth(); // Refilter openings when roof type changes
            this.updateStandardSpecsSection(); // Update standard specs when roof type changes
        }
        
        // Check if height has changed
        if (newState.height !== oldState.height) {
            console.log('Height changed from', oldState.height, 'to', newState.height);
            
            // Reset all window and door selections when height changes
            this.resetWindows();
            this.resetDoors();
            
            // Then filter openings based on the new height
            this.filterOpeningsByWallDepth(); 
        }
        
        // Check if width has changed
        if (newState.width !== oldState.width) {
            console.log('Width changed from', oldState.width, 'to', newState.width);
            this.filterOpeningsByWallDepth(); // Refilter openings when width changes
        }
        
        // Check if length has changed
        if (newState.length !== oldState.length) {
            console.log('Length changed from', oldState.length, 'to', newState.length);
            // You might add any specific handling for length changes here if needed
        }
        
        // Check if project type has changed
        if (newState.projectType !== oldState.projectType) {
            console.log('Project type changed from', oldState.projectType, 'to', newState.projectType);
            this.updateStandardSpecsSection(); // Update standard specs when project type changes
        }
    }

    /**
     * Get size suffix (S, M, L, XL) for the current width selection
     * @returns {string|null} Size suffix or null if not found
     */
    getWidthSizeSuffix() {
        // Get current width and wall depth values from form state
        const formData = this.formState.getFormData();
        const width = formData.width;
        const wallDepth = formData.wallDepth;
        
        if (!width || !wallDepth) {
            console.log('Missing width or wall depth, cannot determine size suffix');
            return null;
        }
        
        console.log(`Looking for size suffix for width ${width} and wall depth ${wallDepth}`);
        
        // Find the matching dimension option in our loaded data
        const matchingDimension = this.dimensionOptions.find(dim => 
            dim.Type === 'Width' && 
            String(dim.Value) === String(width) && 
            String(dim.WallDepth) === String(wallDepth)
        );
        
        if (matchingDimension && matchingDimension.Size) {
            console.log(`Found size suffix: ${matchingDimension.Size} for width ${width}`);
            return matchingDimension.Size;
        }
        
        console.log(`No size suffix found for width ${width} and wall depth ${wallDepth}`);
        return null;
    }

    /**
     * Get size suffix (S, M, L, XL) for the current height selection
     * @returns {string|null} Size suffix or null if not found
     */
    getHeightSizeSuffix() {
        // Get current height and wall depth values from form state
        const formData = this.formState.getFormData();
        const height = formData.height;
        const wallDepth = formData.wallDepth;
        
        if (!height || !wallDepth) {
            console.log('Missing height or wall depth, cannot determine size suffix');
            return null;
        }
        
        console.log(`Looking for size suffix for height ${height} and wall depth ${wallDepth}`);
        
        // Find the matching dimension option in our loaded data
        const matchingDimension = this.dimensionOptions.find(dim => 
            dim.Type === 'Height' && 
            String(dim.Value) === String(height) && 
            String(dim.WallDepth) === String(wallDepth)
        );
        
        if (matchingDimension && matchingDimension.Size) {
            console.log(`Found size suffix: ${matchingDimension.Size} for height ${height}`);
            return matchingDimension.Size;
        }
        
        console.log(`No size suffix found for height ${height} and wall depth ${wallDepth}`);
        return null;
    }

    /**
     * Filter windows and doors based on selected wall depth and height
     * @param {string} [wallDepthOverride] - Optional wall depth to use instead of getting from form state
     */
    filterOpeningsByWallDepth(wallDepthOverride) {
        const wallDepth = wallDepthOverride || this.formState.getFormData().wallDepth;
        console.log('Filtering openings by wall depth:', wallDepth);
        
        if (!wallDepth) {
            console.log('No wall depth selected yet, showing all options');
            return; // No filtering if wall depth not selected yet
        }
        
        // Get the roof type from form state
        const roofType = this.formState.getFormData().roofType;
        console.log('Current roof type:', roofType);
        
        // Get the current size suffix based on selected height for windows and doors
        const heightSizeSuffix = this.getHeightSizeSuffix();
        console.log('Current height size suffix for filtering windows/doors:', heightSizeSuffix);
        
        // Get the current size suffix based on width for skylights
        const widthSizeSuffix = this.getWidthSizeSuffix();
        console.log('Current width size suffix for filtering skylights:', widthSizeSuffix);
        
        // Add debug logging to help identify the issue
        console.log('DEBUG - Wall Depth:', wallDepth, 'Roof Type:', roofType, 
                  'Height Size Suffix:', heightSizeSuffix, 'Width Size Suffix:', widthSizeSuffix);
        
        // Determine which model to show based on wall depth
        const modelPrefix = wallDepth === '200mm' ? 'SKYLARK200' : 'SKYLARK250';
        console.log('Showing only', modelPrefix, 'models');
        
        // Filter windows
        if (this.windowsSelection) {
            const windowItems = this.pageElement.querySelectorAll('#windowsContainer .carousel-item');
            let visibleCount = 0;
            
            console.log(`Found ${windowItems.length} window items to filter`);
            
            windowItems.forEach(item => {
                // Get the hidden value input
                const valueInput = item.querySelector('.carousel-item-value');
                
                if (valueInput) {
                    const value = valueInput.value;
                    console.log(`Window item value: ${value}`);
                    
                    // Check if the item matches both wall depth (model prefix) and size suffix (if available)
                    const matchesWallDepth = value.startsWith(modelPrefix);
                    
                    // Extract the size suffix from the item name (after the dash and before the digit)
                    let itemSizeSuffix = null;
                    const sizeMatch = value.match(/[-_]([SMLX]+)\d/);
                    if (sizeMatch && sizeMatch[1]) {
                        itemSizeSuffix = sizeMatch[1];
                    }
                    
                    // Perform an exact match on the size suffix
                    const matchesSizeSuffix = !heightSizeSuffix || (itemSizeSuffix === heightSizeSuffix);
                    
                    // For debugging
                    if (matchesWallDepth) {
                        console.log(`${value} matches wall depth ${wallDepth} (${modelPrefix})`);
                    } else {
                        console.log(`${value} does NOT match wall depth ${wallDepth} (${modelPrefix})`);
                    }
                    
                    if (matchesSizeSuffix) {
                        console.log(`${value} matches height size suffix ${heightSizeSuffix}, item suffix: ${itemSizeSuffix}`);
                    } else {
                        console.log(`${value} does NOT match height size suffix ${heightSizeSuffix}, item suffix: ${itemSizeSuffix}`);
                    }
                    
                    // Only show items that match both criteria
                    if (matchesWallDepth && matchesSizeSuffix) {
                        item.style.display = ''; // Show matching items
                        visibleCount++;
                        console.log(`Showing window item: ${value}`);
                    } else {
                        item.style.display = 'none'; // Hide non-matching items
                        console.log(`Hiding window item: ${value}`);
                        
                        // If this item has a quantity, reset it to zero
                        const quantityInput = item.querySelector('.quantity-input');
                        if (quantityInput) {
                            // Get the item value
                            const itemValue = valueInput.value;
                            
                            // Reset quantity to zero in the UI
                            quantityInput.value = 0;
                            quantityInput.classList.remove('quantity-has-value');
                            item.classList.remove('carousel-item-has-quantity');
                            
                            // Hide the quantity control
                            const quantityControl = item.querySelector('.quantity-control');
                            if (quantityControl) {
                                quantityControl.style.display = 'none';
                            }
                            
                            // Update form state to remove this item
                            const windowsData = this.formState.getFormData().windows || {};
                            if (windowsData[itemValue]) {
                                delete windowsData[itemValue];
                                this.formState.updateFormData({ windows: windowsData });
                            }
                        }
                    }
                } else {
                    console.warn('No value input found for window item');
                }
            });
            
            console.log(`Filtered windows: ${visibleCount} visible items of ${windowItems.length} total`);
            
            // Refresh the carousel to handle the new layout
            if (typeof this.windowsSelection.updateTouchScrollIndicators === 'function') {
                this.windowsSelection.updateTouchScrollIndicators();
            }
            
            // Refresh image handling for newly visible images
            refreshCarouselImages();
        }
        
        // Filter doors
        if (this.doorsSelection) {
            const doorItems = this.pageElement.querySelectorAll('#doorsContainer .carousel-item');
            let visibleCount = 0;
            
            console.log(`Found ${doorItems.length} door items to filter`);
            
            doorItems.forEach(item => {
                // Get the hidden value input
                const valueInput = item.querySelector('.carousel-item-value');
                
                if (valueInput) {
                    const value = valueInput.value;
                    console.log(`Door item value: ${value}`);
                    
                    // Check if the item matches both wall depth (model prefix) and size suffix (if available)
                    const matchesWallDepth = value.startsWith(modelPrefix);
                    
                    // Extract the size suffix from the item name (after the dash and before the digit)
                    let itemSizeSuffix = null;
                    const sizeMatch = value.match(/[-_]([SMLX]+)\d/);
                    if (sizeMatch && sizeMatch[1]) {
                        itemSizeSuffix = sizeMatch[1];
                    }
                    
                    // Perform an exact match on the size suffix
                    const matchesSizeSuffix = !heightSizeSuffix || (itemSizeSuffix === heightSizeSuffix);
                    
                    // For debugging
                    if (matchesWallDepth) {
                        console.log(`${value} matches wall depth ${wallDepth} (${modelPrefix})`);
                    } else {
                        console.log(`${value} does NOT match wall depth ${wallDepth} (${modelPrefix})`);
                    }
                    
                    if (matchesSizeSuffix) {
                        console.log(`${value} matches height size suffix ${heightSizeSuffix}, item suffix: ${itemSizeSuffix}`);
                    } else {
                        console.log(`${value} does NOT match height size suffix ${heightSizeSuffix}, item suffix: ${itemSizeSuffix}`);
                    }
                    
                    // Only show items that match both criteria
                    if (matchesWallDepth && matchesSizeSuffix) {
                        item.style.display = ''; // Show matching items
                        visibleCount++;
                        console.log(`Showing door item: ${value}`);
                    } else {
                        item.style.display = 'none'; // Hide non-matching items
                        console.log(`Hiding door item: ${value}`);
                        
                        // If this item has a quantity, reset it to zero
                        const quantityInput = item.querySelector('.quantity-input');
                        if (quantityInput) {
                            // Get the item value
                            const itemValue = valueInput.value;
                            
                            // Reset quantity to zero in the UI
                            quantityInput.value = 0;
                            quantityInput.classList.remove('quantity-has-value');
                            item.classList.remove('carousel-item-has-quantity');
                            
                            // Hide the quantity control
                            const quantityControl = item.querySelector('.quantity-control');
                            if (quantityControl) {
                                quantityControl.style.display = 'none';
                            }
                            
                            // Update form state to remove this item
                            const doorsData = this.formState.getFormData().doors || {};
                            if (doorsData[itemValue]) {
                                delete doorsData[itemValue];
                                this.formState.updateFormData({ doors: doorsData });
                            }
                        }
                    }
                } else {
                    console.warn('No value input found for door item');
                }
            });
            
            console.log(`Filtered doors: ${visibleCount} visible items of ${doorItems.length} total`);
            
            // Refresh the carousel to handle the new layout
            if (typeof this.doorsSelection.updateTouchScrollIndicators === 'function') {
                this.doorsSelection.updateTouchScrollIndicators();
            }
            
            // Refresh image handling for newly visible images
            refreshCarouselImages();
        }
        
        // Filter skylights by wall depth, roof type, and width size suffix
        if (this.skylightsSelection) {
            const skylightItems = this.pageElement.querySelectorAll('#skylightsContainer .carousel-item');
            let visibleCount = 0;
            
            console.log(`Found ${skylightItems.length} skylight items to filter by wall depth, roof type, and width size suffix`);
            
            // Skip filtering if roof type is not selected
            if (!roofType) {
                // Hide all skylights if no roof type is selected
                skylightItems.forEach(item => {
                    item.style.display = 'none';
                });
                
                // Hide the entire skylights section
                const skylightsFormGroup = this.pageElement.querySelector('#skylightsContainer').closest('.form-group');
                if (skylightsFormGroup) {
                    skylightsFormGroup.style.display = 'none';
                    console.log('Hiding skylights section as no roof type is selected');
                }
                return;
            }
            
            skylightItems.forEach(item => {
                // Get the hidden value input
                const valueInput = item.querySelector('.carousel-item-value');
                const roofTypeInput = item.querySelector('.skylight-roof-type');
                
                if (valueInput && roofTypeInput) {
                    const value = valueInput.value;
                    const skylightRoofType = roofTypeInput.value;
                    
                    console.log(`Checking skylight: ${value}, roof type: ${skylightRoofType}, selected roof type: ${roofType}`);
                    
                    // Extract the size suffix from the item name
                    let itemSizeSuffix = null;
                    const sizeMatch = value.match(/[-_]([SMLX]+)(\d|$)/);
                    if (sizeMatch && sizeMatch[1]) {
                        itemSizeSuffix = sizeMatch[1];
                    }
                    
                    // Special case: Show 200mm mono-pitch skylights when roof type is mono-pitch AND wall depth is 200mm
                    const isMonoPitchAt200mm = roofType === 'mono-pitch' && skylightRoofType === 'mono-pitch' && 
                                          value.includes('SKYLARK200') && wallDepth === '200mm';
                    
                    // Determine if this skylight should be shown based on criteria
                    const matchesRoofType = skylightRoofType === roofType;
                    const matchesWallDepth = (wallDepth === '200mm' && value.includes('SKYLARK200')) || 
                                            (wallDepth === '250mm' && value.includes('SKYLARK250'));
                    
                    // Perform an exact match on the size suffix for skylights
                    // Skip the size suffix check if it's a mono-pitch skylight at 200mm depth (always show these)
                    const matchesSizeSuffix = isMonoPitchAt200mm || !widthSizeSuffix || (itemSizeSuffix === widthSizeSuffix);
                    
                    // Should show if it matches all criteria, or if it's the special case mono-pitch at 200mm
                    const shouldShow = isMonoPitchAt200mm || (matchesRoofType && matchesWallDepth && matchesSizeSuffix);
                    
                    console.log(`Skylight ${value} - correct roof type: ${matchesRoofType}, ` +
                                `correct wall depth: ${matchesWallDepth}, ` +
                                `correct size suffix: ${matchesSizeSuffix} (item: ${itemSizeSuffix}, target: ${widthSizeSuffix}), ` +
                                `is mono-pitch at 200mm: ${isMonoPitchAt200mm}, ` +
                                `should show: ${shouldShow}`);
                    
                    if (shouldShow) {
                        item.style.display = ''; // Show matching items
                        visibleCount++;
                        console.log(`Showing skylight item: ${value} (${skylightRoofType})`);
                    } else {
                        item.style.display = 'none'; // Hide non-matching items
                        console.log(`Hiding skylight item: ${value} (${skylightRoofType})`);
                        
                        // If this item has a quantity, reset it to zero
                        const quantityInput = item.querySelector('.quantity-input');
                        if (quantityInput) {
                            // Get the item value
                            const itemValue = valueInput.value;
                            
                            // Reset quantity to zero in the UI
                            quantityInput.value = 0;
                            quantityInput.classList.remove('quantity-has-value');
                            item.classList.remove('carousel-item-has-quantity');
                            
                            // Hide the quantity control
                            const quantityControl = item.querySelector('.quantity-control');
                            if (quantityControl) {
                                quantityControl.style.display = 'none';
                            }
                            
                            // Update form state to remove this item
                            const skylightsData = this.formState.getFormData().skylights || {};
                            if (skylightsData[itemValue]) {
                                delete skylightsData[itemValue];
                                this.formState.updateFormData({ skylights: skylightsData });
                            }
                        }
                    }
                } else {
                    console.warn('Missing value or roof type input for skylight item');
                    item.style.display = 'none';
                }
            });
            
            console.log(`Filtered skylights: ${visibleCount} visible items of ${skylightItems.length} total`);
            
            // Refresh the carousel to handle the new layout
            if (typeof this.skylightsSelection.updateTouchScrollIndicators === 'function') {
                this.skylightsSelection.updateTouchScrollIndicators();
            }
            
            // Refresh image handling for newly visible images
            refreshCarouselImages();
            
            // Hide the entire skylights section if no skylights are available for the selected depth and roof type
            const skylightsFormGroup = this.pageElement.querySelector('#skylightsContainer').closest('.form-group');
            if (skylightsFormGroup) {
                if (visibleCount === 0) {
                    skylightsFormGroup.style.display = 'none';
                    console.log('Hiding skylights section as no skylights are available for the selected options');
                } else {
                    skylightsFormGroup.style.display = '';
                    console.log('Showing skylights section with', visibleCount, 'available options');
                }
            }
        }
    }

    /**
     * Filter height, width, and length dimension selects based on selected wall depth
     * @param {string} [wallDepthOverride] - Optional wall depth to use instead of getting from form state
     */
    filterDimensionsByWallDepth(wallDepthOverride) {
        if (!this.dimensionOptions || this.dimensionOptions.length === 0) {
            console.log('Dimension options not loaded yet or empty, skipping dimension filter.');
            return; 
        }

        const formData = this.formState.getFormData();
        const wallDepth = wallDepthOverride || formData.wallDepth;
        console.log('Filtering dimensions by wall depth. Value from formState:', wallDepth, '(Type:', typeof wallDepth + ')');
        if (this.dimensionOptions.length > 0) {
             console.log('First 5 Dimension Options for check:', JSON.stringify(this.dimensionOptions.slice(0, 5), null, 2));
        }

        if (!wallDepth) {
            console.log('No wall depth selected, cannot filter dimensions yet.');
            // Optionally clear or disable dimension selects here
            return; 
        }

        // Find select elements using the correct IDs
        const heightSelect = this.pageElement.querySelector('#height'); 
        const widthSelect = this.pageElement.querySelector('#width'); 
        const lengthSelect = this.pageElement.querySelector('#length');

        if (!heightSelect) {
             console.warn('Building Height select element (#height) not found.'); 
        }
        if (!widthSelect) {
            console.warn('Building Width select element (#width) not found.'); 
        }
        if (!lengthSelect) {
            console.warn('Building Length select element (#length) not found.');
        }

        // Filter options based on wall depth (allow 'any' or exact match)
        const availableOptions = this.dimensionOptions.filter(opt => {
             const wallDepthMatch = opt.WallDepth && (opt.WallDepth.toLowerCase() === 'any' || String(opt.WallDepth) === String(wallDepth));
             // Log comparison for the first few non-matching items to see why
             if (!wallDepthMatch && this.dimensionOptions.indexOf(opt) < 5) { // Log first 5 potential mismatches
                console.log(`Mismatch Check: Option WallDepth='${opt.WallDepth}' (Type: ${typeof opt.WallDepth}), Input WallDepth='${wallDepth}' (Type: ${typeof wallDepth}), Match Result: ${wallDepthMatch}`);
             }
             return wallDepthMatch;
         });
         
        // Separate into height, width, and length
        const heightOptions = availableOptions
            .filter(opt => opt.Type === 'Height')
            .sort((a, b) => parseFloat(a.Value) - parseFloat(b.Value)); // Sort numerically
            
        const widthOptions = availableOptions
            .filter(opt => opt.Type === 'Width')
            .sort((a, b) => parseFloat(a.Value) - parseFloat(b.Value)); // Sort numerically

        const lengthOptions = availableOptions
            .filter(opt => opt.Type === 'Length')
            .sort((a, b) => parseFloat(a.Value) - parseFloat(b.Value)); // Sort numerically

        console.log(`Available Heights for ${wallDepth}:`, heightOptions.length);
        console.log(`Available Widths for ${wallDepth}:`, widthOptions.length);
        console.log(`Available Lengths for ${wallDepth}:`, lengthOptions.length);

        // Update the select elements using the helper
        if (heightSelect) {
             this.updateSelectWithOptions(heightSelect, heightOptions, formData.height, 'height'); 
        }
        if (widthSelect) {
            this.updateSelectWithOptions(widthSelect, widthOptions, formData.width, 'width'); 
        }
        if (lengthSelect) {
            this.updateSelectWithOptions(lengthSelect, lengthOptions, formData.length, 'length');
        }
    }

    /**
     * Updates the options of a select element and handles the current selection.
     * @param {HTMLSelectElement} selectElement - The select element to update.
     * @param {Array<Object>} optionsData - Array of { Value, Label } objects for the options.
     * @param {string|number} currentSelection - The currently selected value in the form state.
     * @param {string} formStateKey - The key in the form state to update (e.g., 'buildingHeight').
     */
     updateSelectWithOptions(selectElement, optionsData, currentSelection, formStateKey) {
        if (!selectElement) {
            // Warning already logged by caller
            return;
        }

        const previousValue = selectElement.value; // Store previous value from the DOM element itself
        selectElement.innerHTML = ''; // Clear existing options

        // Add a default "Select..." option
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Select...';
        placeholder.disabled = true; // Make it non-selectable unless it's the only option
        selectElement.appendChild(placeholder);

        let selectionStillValid = false;
        let firstValidValue = ''; // Keep track of the first valid option's value

        optionsData.forEach((opt, index) => {
            const option = document.createElement('option');
            option.value = opt.Value;
            option.textContent = opt.Label;
            selectElement.appendChild(option);
            if (index === 0) {
                firstValidValue = opt.Value; // Store the first value
            }
            // Use String comparison as values might be numbers or strings
            if (String(opt.Value) === String(currentSelection)) {
                selectionStillValid = true;
            }
        });

        // If no valid options were added (only placeholder exists)
        if (optionsData.length === 0) {
            placeholder.textContent = 'N/A for selected depth';
            placeholder.selected = true; // Select the placeholder
            selectionStillValid = false; // Force reset
            firstValidValue = ''; // No valid first value
        } else {
            // If we have options, make placeholder non-selected initially
            placeholder.selected = false;
        }


        let newValueToSet;
        if (selectionStillValid && currentSelection !== '' && currentSelection !== null) {
            // Keep the current selection if it's still valid and not empty
            newValueToSet = currentSelection;
        } else {
            // Selection is no longer valid, wasn't set, was empty, or only N/A available
            newValueToSet = firstValidValue; // Select the first available valid option or empty string if none
        }
        
        selectElement.value = newValueToSet; // Set the final value on the select element

        // Update form state ONLY if the effective value needs changing
        // Compare against the value currently in formState, not the previous DOM value
        const currentStateValue = this.formState.getFormData()[formStateKey];
        if (String(currentStateValue) !== String(newValueToSet)) {
            console.log(`Updating ${formStateKey} from '${currentStateValue || 'none'}' to '${newValueToSet || 'none'}' due to filtering.`);
            this.formState.updateFormData({ [formStateKey]: newValueToSet });
            
            // Manually trigger change event for potentially dependent logic
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    /**
     * Handle windows selection
     * @param {string} value - The selected window value (now includes model name, e.g., SKYLARK250_S1)
     * @param {number} quantity - The selected quantity
     * @param {string} inputId - The ID of the quantity input
     */
    handleWindowsSelection(value, quantity, inputId) {
        // Update form state with the window selection
        const windowsData = this.formState.getFormData().windows || {};
        windowsData[value] = quantity;
        
        this.formState.updateFormData({ windows: windowsData });
        
        // Ensure the DOM is updated correctly
        const input = document.getElementById(inputId);
        if (input) {
            // Make sure the input's value matches the quantity in the state
            input.value = quantity;
            
            // Update classes based on the quantity
            const item = input.closest('.carousel-item');
            if (item) {
                if (quantity > 0) {
                    input.classList.add('quantity-has-value');
                    item.classList.add('carousel-item-has-quantity');
                } else {
                    input.classList.remove('quantity-has-value');
                    item.classList.remove('carousel-item-has-quantity');
                }
            }
        }
    }

    /**
     * Handle doors selection
     * @param {string} value - The selected door value (now includes model name, e.g., SKYLARK250_S1)
     * @param {number} quantity - The selected quantity
     * @param {string} inputId - The ID of the quantity input
     */
    handleDoorsSelection(value, quantity, inputId) {
        // Update form state with the door selection
        const doorsData = this.formState.getFormData().doors || {};
        doorsData[value] = quantity;
        
        this.formState.updateFormData({ doors: doorsData });
        
        // Ensure the DOM is updated correctly
        const input = document.getElementById(inputId);
        if (input) {
            // Make sure the input's value matches the quantity in the state
            input.value = quantity;
            
            // Update classes based on the quantity
            const item = input.closest('.carousel-item');
            if (item) {
                if (quantity > 0) {
                    input.classList.add('quantity-has-value');
                    item.classList.add('carousel-item-has-quantity');
                } else {
                    input.classList.remove('quantity-has-value');
                    item.classList.remove('carousel-item-has-quantity');
                }
            }
        }
    }

    /**
     * Handle skylights selection
     * @param {string} value - The selected skylight value (now includes model name, e.g., SKYLARK250_S1)
     * @param {number} quantity - The selected quantity
     * @param {string} inputId - The ID of the quantity input
     */
    handleSkylightsSelection(value, quantity, inputId) {
        // Update form state with the skylight selection
        const skylightsData = this.formState.getFormData().skylights || {};
        skylightsData[value] = quantity;
        
        this.formState.updateFormData({ skylights: skylightsData });
        
        // Ensure the DOM is updated correctly
        const input = document.getElementById(inputId);
        if (input) {
            // Make sure the input's value matches the quantity in the state
            input.value = quantity;
            
            // Update classes based on the quantity
            const item = input.closest('.carousel-item');
            if (item) {
                if (quantity > 0) {
                    input.classList.add('quantity-has-value');
                    item.classList.add('carousel-item-has-quantity');
                } else {
                    input.classList.remove('quantity-has-value');
                    item.classList.remove('carousel-item-has-quantity');
                }
            }
        }
    }

    /**
     * Handle cladding selection
     * @param {string} value - The selected cladding value
     */
    handleCladdingSelection(value) {
        // Update form state with the selected cladding
        this.formState.updateFormData({ cladding: value });
        console.log('Cladding selection updated in background:', value);
    }

    /**
     * Handle roofing selection
     * @param {string} value - The selected roofing value
     */
    handleRoofingSelection(value) {
        // Update form state with the selected roofing
        this.formState.updateFormData({ roofing: value });
        console.log('Roofing selection updated in background:', value);
    }

    /**
     * Handle field change
     * @param {string} fieldId - The ID of the changed field
     * @param {string} value - The new field value
     */
    handleFieldChange(fieldId, value) {
        // Update form state with the changed field value
        const formData = {};
        formData[fieldId] = value;
        
        this.formState.updateFormData(formData);
        
        // If height or width field is changed, update filtering
        if (fieldId === 'height' || fieldId === 'width') {
            // After the state is updated, filter openings based on height and wall depth
            setTimeout(() => {
                this.filterOpeningsByWallDepth();
            }, 0);
        }
    }

    /**
     * Update conditional fields based on project type
     */
    updateConditionalFields() {
        const conditionalFields = this.pageElement.querySelectorAll('.conditional-field');
        const selectedProjectType = this.formState.getProjectType();
        
        conditionalFields.forEach(field => {
            const condField = field.dataset.conditionalField;
            const condValue = field.dataset.conditionalValue;
            
            if (condField === 'projectType') {
                if (selectedProjectType === condValue) {
                    field.style.display = 'block';
                    
                    // Reset required attribute on all inputs within this field
                    const inputs = field.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => {
                        if (input.hasAttribute('data-required')) {
                            input.required = true;
                        }
                    });
                } else {
                    field.style.display = 'none';
                    
                    // Remove required attribute on all inputs within this field
                    const inputs = field.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => {
                        if (input.required) {
                            // Store that this was required originally
                            input.setAttribute('data-required', 'true');
                            input.required = false;
                        }
                    });
                }
            }
        });
        
        // Update standard specs section when project type changes
        this.updateStandardSpecsSection();
    }

    /**
     * Update the standard specs section based on project type and roof type
     * Displays materials marked as standard in the CSV
     */
    updateStandardSpecsSection() {
        const formData = this.formState.getFormData();
        const projectType = formData.projectType || this.formState.getProjectType();
        const roofType = formData.roofType;
        
        console.log('### Updating standard specs section ###');
        console.log('Project type:', projectType);
        console.log('Roof type:', roofType);
        
        // First, remove any existing standard specs section
        const existingSection = this.pageElement.querySelector('.standard-specs-section');
        if (existingSection) {
            console.log('Removing existing standard specs section');
            existingSection.remove();
        }
        
        // Only show for turnkey projects
        if (projectType !== 'turnkey') {
            console.log(`Not showing standard specs - project type is "${projectType}" not "turnkey"`);
            return;
        }
        
        // If no roof type is selected, don't display anything
        if (!roofType) {
            console.log('Not showing standard specs - no roof type selected');
            return;
        }
        
        console.log('Materials available:', {
            cladding: this.materialsData.cladding?.map(m => `${m.Title} (Standard: ${m.Standard || 'none'})`) || [],
            roofing: this.materialsData.roofing?.map(m => `${m.Title} (Standard: ${m.Standard || 'none'})`) || []
        });
        
        // Find all standard materials based on the roof type
        const standardMaterials = [];
        
        // For cladding materials
        if (this.materialsData.cladding && this.materialsData.cladding.length > 0) {
            this.materialsData.cladding.forEach(material => {
                if (material.Standard) {
                    const standardValue = material.Standard.toLowerCase();
                    console.log(`Checking cladding "${material.Title}" with standard value "${standardValue}" against roof type "${roofType}"`);
                    
                    // Convert roof type to format matching our CSV standards
                    let normalizedRoofType = roofType;
                    if (roofType === 'mono-pitch') normalizedRoofType = 'mono';
                    if (roofType === 'double-pitch') normalizedRoofType = 'double';
                    
                    if (standardValue === 'both' || 
                        (standardValue === 'mono' && normalizedRoofType === 'mono') ||
                        (standardValue === 'double' && normalizedRoofType === 'double')) {
                        console.log(`Adding standard cladding: ${material.Title}`);
                        standardMaterials.push({
                            type: 'Cladding',
                            title: material.Title,
                            image: material.ImageURL
                        });
                    } else {
                        console.log(`Skipping cladding: ${material.Title} - standard type doesn't match roof type`);
                    }
                }
            });
        }
        
        // For roofing materials
        if (this.materialsData.roofing && this.materialsData.roofing.length > 0) {
            this.materialsData.roofing.forEach(material => {
                if (material.Standard) {
                    const standardValue = material.Standard.toLowerCase();
                    console.log(`Checking roofing "${material.Title}" with standard value "${standardValue}" against roof type "${roofType}"`);
                    
                    // Convert roof type to format matching our CSV standards
                    let normalizedRoofType = roofType;
                    if (roofType === 'mono-pitch') normalizedRoofType = 'mono';
                    if (roofType === 'double-pitch') normalizedRoofType = 'double';
                    
                    if (standardValue === 'both' || 
                        (standardValue === 'mono' && normalizedRoofType === 'mono') ||
                        (standardValue === 'double' && normalizedRoofType === 'double')) {
                        console.log(`Adding standard roofing: ${material.Title}`);
                        standardMaterials.push({
                            type: 'Roofing',
                            title: material.Title,
                            image: material.ImageURL
                        });
                    }
                }
            });
        }
        
        // If no standard materials are found, don't add the section
        if (standardMaterials.length === 0) {
            console.log('No standard materials found for roof type:', roofType);
            return;
        }
        
        console.log('Found standard materials:', standardMaterials);
        
        // Create the section directly
        const standardSpecsSection = document.createElement('div');
        standardSpecsSection.className = 'standard-specs-section';
        standardSpecsSection.innerHTML = `
            <h3>Standard Specifications</h3>
            <p>The following materials come standard with your build:</p>
            <div class="standard-specs-grid"></div>
        `;
        
        // Append cards to the grid
        const grid = standardSpecsSection.querySelector('.standard-specs-grid');
        standardMaterials.forEach(material => {
            const card = document.createElement('div');
            card.className = 'standard-spec-card';
            card.innerHTML = `
                <div class="standard-spec-image">
                    <img src="${material.image}" alt="${material.title}" loading="lazy">
                </div>
                <div class="standard-spec-content">
                    <h4>${material.title}</h4>
                    <p>${material.type}</p>
                </div>
            `;
            grid.appendChild(card);
        });
        
        // Add the section to the page right before the navigation buttons
        const formButtons = this.pageElement.querySelector('.form-buttons');
        if (formButtons) {
            this.pageElement.insertBefore(standardSpecsSection, formButtons);
            console.log('Standard specs section added before form buttons');
        } else {
            // If no form buttons, append to the end
            this.pageElement.appendChild(standardSpecsSection);
            console.log('Standard specs section added at the end of the page');
        }
        
        // Initialize image handling for the new images
        setTimeout(() => {
            try {
                refreshCarouselImages();
                console.log('Images refreshed');
            } catch (error) {
                console.error('Error refreshing images:', error);
            }
        }, 100);
    }

    /**
     * Validate all fields on the page
     * @returns {boolean} Whether all fields are valid
     */
    validate() {
        let isValid = true;
        
        // Validate form fields
        if (this.formFields && !this.formFields.validateAllFields()) {
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Reset the page
     */
    reset() {
        // Reset all components
        if (this.windowsSelection) this.windowsSelection.reset();
        if (this.doorsSelection) this.doorsSelection.reset();
        if (this.skylightsSelection) this.skylightsSelection.reset();
        
        // Reset cladding and roofing data in form state
        this.formState.updateFormData({ 
            cladding: null,
            roofing: null 
        });
        
        if (this.formFields) this.formFields.reset();
        
        // Reload materials data to refresh background processing
        this.loadMaterialsData();
    }
    
    /**
     * Reset all window selections
     */
    resetWindows() {
        console.log('Resetting all window selections');
        
        // Clear window selections in the form state
        this.formState.updateFormData({ windows: {} });
        
        // Reset the UI for windows
        if (this.windowsSelection) {
            // Reset through the component
            this.windowsSelection.reset();
            
            // Manually ensure all quantity controls are hidden
            const windowItems = this.pageElement.querySelectorAll('#windowsContainer .carousel-item');
            windowItems.forEach(item => {
                // Reset item classes
                item.classList.remove('carousel-item-has-quantity');
                
                // Reset quantity input
                const quantityInput = item.querySelector('.quantity-input');
                if (quantityInput) {
                    quantityInput.value = 0;
                    quantityInput.classList.remove('quantity-has-value');
                }
                
                // Hide quantity control
                const quantityControl = item.querySelector('.quantity-control');
                if (quantityControl) {
                    quantityControl.style.display = 'none';
                }
            });
        }
    }
    
    /**
     * Reset all door selections
     */
    resetDoors() {
        console.log('Resetting all door selections');
        
        // Clear door selections in the form state
        this.formState.updateFormData({ doors: {} });
        
        // Reset the UI for doors
        if (this.doorsSelection) {
            // Reset through the component
            this.doorsSelection.reset();
            
            // Manually ensure all quantity controls are hidden
            const doorItems = this.pageElement.querySelectorAll('#doorsContainer .carousel-item');
            doorItems.forEach(item => {
                // Reset item classes
                item.classList.remove('carousel-item-has-quantity');
                
                // Reset quantity input
                const quantityInput = item.querySelector('.quantity-input');
                if (quantityInput) {
                    quantityInput.value = 0;
                    quantityInput.classList.remove('quantity-has-value');
                }
                
                // Hide quantity control
                const quantityControl = item.querySelector('.quantity-control');
                if (quantityControl) {
                    quantityControl.style.display = 'none';
                }
            });
        }
    }

    /**
     * Reset skylights selection and visibility
     * This ensures skylights are properly filtered when returning to the page
     */
    resetSkylights() {
        console.log('Resetting skylights selection');
        
        // Get the current form data
        const formData = this.formState.getFormData();
        const wallDepth = formData.wallDepth;
        const roofType = formData.roofType;
        
        console.log('Current wall depth:', wallDepth, 'roof type:', roofType);
        
        // If there's no skylights container, exit early
        const skylightsContainer = this.pageElement.querySelector('#skylightsContainer');
        if (!skylightsContainer) {
            console.warn('Could not find skylights container');
            return;
        }
        
        // Hide all skylights initially
        const skylightItems = skylightsContainer.querySelectorAll('.carousel-item');
        skylightItems.forEach(item => {
            item.style.display = 'none';
            
            // Reset quantity to zero
            const quantityInput = item.querySelector('.quantity-input');
            if (quantityInput) {
                quantityInput.value = 0;
                quantityInput.classList.remove('quantity-has-value');
                item.classList.remove('carousel-item-has-quantity');
            }
        });
        
        // Clear skylights data in form state
        if (formData.skylights) {
            this.formState.updateFormData({ skylights: {} });
        }
        
        // Hide the entire skylights section initially
        const skylightsFormGroup = skylightsContainer.closest('.form-group');
        if (skylightsFormGroup) {
            skylightsFormGroup.style.display = 'none';
        }
        
        console.log('Skylights reset completed');
    }
}

export default BuildDetailsPage;