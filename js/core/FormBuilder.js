/**
 * FormBuilder.js
 * Builds the form structure from JSON data
 */

import { loadOpeningsFromCSV } from '../utils/simpleCSVLoader.js';
import { getOpeningsData } from '../data/openingsData.js';

class FormBuilder {
    constructor(formElement, formState, eventManager) {
        this.form = formElement;
        this.formState = formState;
        this.eventManager = eventManager;
        this.formData = null;
    }

    /**
     * Load questions from JSON file
     * @param {string} jsonUrl - URL to the questions JSON file
     * @returns {Promise} Promise that resolves when form is built
     */
    async loadQuestions(jsonUrl) {
        try {
            // Load the base questions from JSON
            const response = await fetch(jsonUrl);
            this.formData = await response.json();
            
            // Load windows, doors, and skylights data from CSV
            try {
                console.log('Loading windows, doors, and skylights data from CSV file...');
                
                // Define possible CSV file paths to try
                const possiblePaths = [
                    'All BlocksOpenings.csv',                   // Local path
                    './All BlocksOpenings.csv',                 // Explicit local path
                    '../All BlocksOpenings.csv',                // Parent directory
                    '/Users/anderew/Desktop/geoplyForm/costing-form/All BlocksOpenings.csv' // Absolute path
                ];
                
                // Try each path until one works
                let csvData = null;
                let csvLoadSuccess = false;
                
                for (const path of possiblePaths) {
                    try {
                        console.log('Attempting to load CSV from:', path);
                        csvData = await loadOpeningsFromCSV(path);
                        console.log('Successfully loaded CSV from:', path);
                        csvLoadSuccess = true;
                        break; // Exit the loop if successful
                    } catch (e) {
                        console.warn(`Failed to load from ${path}:`, e);
                    }
                }
                
                if (!csvLoadSuccess) {
                    console.warn('Could not load CSV from any path, falling back to module data');
                    csvData = getOpeningsData(); // Fallback to hardcoded data in module
                }
                
                // Find the Build Details page
                const buildDetailsPage = this.formData.pages.find(page => page.title === 'Build Details');
                if (!buildDetailsPage) {
                    console.warn('Could not find Build Details page in form data');
                } else {
                    // Update windows options
                    if (csvData.windows && csvData.windows.length > 0) {
                        const windowsField = buildDetailsPage.fields.find(field => field.id === 'windows');
                        if (windowsField) {
                            windowsField.options = csvData.windows;
                            console.log('Updated windows options with data - count:', csvData.windows.length);
                        } else {
                            console.warn('Could not find windows field in Build Details page');
                        }
                    } else {
                        console.warn('No windows data available');
                    }
                    
                    // Update doors options
                    if (csvData.doors && csvData.doors.length > 0) {
                        const doorsField = buildDetailsPage.fields.find(field => field.id === 'doors');
                        if (doorsField) {
                            doorsField.options = csvData.doors;
                            console.log('Updated doors options with data - count:', csvData.doors.length);
                        } else {
                            console.warn('Could not find doors field in Build Details page');
                        }
                    } else {
                        console.warn('No doors data available');
                    }
                    
                    // Update skylights options
                    if (csvData.skylights && csvData.skylights.length > 0) {
                        const skylightsField = buildDetailsPage.fields.find(field => field.id === 'skylights');
                        if (skylightsField) {
                            skylightsField.options = csvData.skylights;
                            console.log('Updated skylights options with data - count:', csvData.skylights.length);
                        } else {
                            console.warn('Could not find skylights field in Build Details page');
                        }
                    } else {
                        console.warn('No skylights data available');
                    }
                }
            } catch (error) {
                console.error('Error loading or processing openings data:', error);
                // Continue with empty options arrays from questions.json
            }
            
            // Build the form with the updated data
            this.buildForm(this.formData);
            return this.formData;
        } catch (error) {
            console.error('Error loading questions:', error);
            throw error;
        }
    }

    /**
     * Build the form based on questions data
     * @param {Object} data - The form structure data
     */
    buildForm(data) {
        // Clear any existing content
        this.form.innerHTML = '';
        
        // Loop through each page in the data
        data.pages.forEach((page, pageIndex) => {
            const pageNum = pageIndex + 1;
            
            // Create page container
            const pageDiv = document.createElement('div');
            pageDiv.className = 'form-page';
            pageDiv.id = `page${pageNum}`;
            
            // Set active class only on first page
            if (pageNum === 1) {
                pageDiv.classList.add('active');
            }
            
            // Add page title
            const pageTitle = document.createElement('h2');
            pageTitle.innerHTML = page.title;
            if (page.required) {
                pageTitle.innerHTML += ' <span class="required">*</span>';
            }
            pageDiv.appendChild(pageTitle);
            
            // Add page description if exists
            if (page.description) {
                const pageDesc = document.createElement('p');
                pageDesc.textContent = page.description;
                pageDiv.appendChild(pageDesc);
            }
            
            // Handle different page types
            if (page.type === 'card-selection') {
                this._buildCardSelectionPage(pageDiv, page);
            } else if (page.type === 'form-fields') {
                this._buildFormFieldsPage(pageDiv, page);
            }
            
            // Add navigation buttons
            this._addNavigationButtons(pageDiv, pageNum, data.pages.length);
            
            // Add the page to the form
            this.form.appendChild(pageDiv);
        });
        
        // Add restart button at the bottom of the form
        this._addRestartButton();
    }

    /**
     * Build a card selection page
     * @param {Element} pageDiv - The page container element
     * @param {Object} page - The page data
     * @private
     */
    _buildCardSelectionPage(pageDiv, page) {
        // Create card options container
        const cardOptions = document.createElement('div');
        cardOptions.className = 'card-options';
        
        // Add each card option
        page.options.forEach(option => {
            const card = document.createElement('div');
            card.className = `card-option ${option.disabled ? 'disabled' : ''}`;
            card.dataset.value = option.value;
            
            // Card content
            card.innerHTML = `
                <div class="card-icon">${option.emoji}</div>
                <div class="card-title">${option.title}</div>
                <div class="card-description">${option.description}</div>
            `;
            
            cardOptions.appendChild(card);
        });
        
        pageDiv.appendChild(cardOptions);
        
        // Handle additional fields if they exist
        if (page.fields && Array.isArray(page.fields)) {
            page.fields.forEach(field => {
                // Apply special handling for selfBuildType field
                if (field.id === 'selfBuildType') {
                    // Add a section title inside the container instead of a separate h3
                    const fieldDiv = document.createElement('div');
                    fieldDiv.id = field.id + 'Container';
                    fieldDiv.style.display = 'none'; // Initially hidden
                    fieldDiv.classList.add('popup-container'); // Add a class for easier styling
                    
                    // Add heading inside the container
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'section-title';
                    titleDiv.textContent = field.label;
                    if (field.required) {
                        titleDiv.innerHTML += ' <span class="required">*</span>';
                    }
                    
                    // Create input based on type
                    const input = this._createInputElement(field);
                    
                    // Add the title and input to the container
                    fieldDiv.appendChild(titleDiv);
                    fieldDiv.appendChild(input);
                    
                    // Add error message container
                    this._addErrorContainer(fieldDiv, field);
                    
                    // Add the container to the page
                    pageDiv.appendChild(fieldDiv);
                } else {
                    const formGroup = document.createElement('div');
                    formGroup.className = 'form-group';
                    
                    // Add conditional class if field has conditional properties
                    if (field.conditional) {
                        formGroup.classList.add('conditional-field');
                    }
                    
                    // For regular card selections, add a title
                    const fieldTitle = document.createElement('h3');
                    fieldTitle.textContent = field.label;
                    if (field.required) {
                        fieldTitle.innerHTML += ' <span class="required">*</span>';
                    }
                    formGroup.appendChild(fieldTitle);
                    
                    // Create input based on type
                    const input = this._createInputElement(field);
                    formGroup.appendChild(input);
                    
                    // Add error message container
                    this._addErrorContainer(formGroup, field);
                    
                    pageDiv.appendChild(formGroup);
                }
            });
        }
    }

    /**
     * Build a form fields page
     * @param {Element} pageDiv - The page container element
     * @param {Object} page - The page data
     * @private
     */
    _buildFormFieldsPage(pageDiv, page) {
        // Check if we're on the Build Details page
        const isBuildDetailsPage = page.title === "Build Details";
        let dimensionsRow = null;
        let hasCreatedDimensionsRow = false;
        
        // Create form fields
        page.fields.forEach(field => {
            // Check if this is one of the dimension fields (length, width, height)
            const isDimensionField = isBuildDetailsPage && (field.id === 'length' || field.id === 'width' || field.id === 'height');
            
            // If this is a dimension field and we haven't created the dimensions row yet
            if (isDimensionField && !hasCreatedDimensionsRow) {
                dimensionsRow = document.createElement('div');
                dimensionsRow.className = 'dimensions-row';
                pageDiv.appendChild(dimensionsRow);
                hasCreatedDimensionsRow = true;
            }
            
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            // Check if field has conditional logic and mark it
            if (field.conditional) {
                // Store the condition in a data attribute for later reference
                formGroup.dataset.conditionalField = field.conditional.field;
                formGroup.dataset.conditionalValue = field.conditional.value;
                formGroup.classList.add('conditional-field');
                
                // Initially hide if condition doesn't match
                if (field.conditional.field === 'projectType' && 
                    this.formState.getProjectType() !== field.conditional.value) {
                    formGroup.style.display = 'none';
                }
            }
            
            // Skip if it's a card-selection or carousel-selection, we'll handle labels inside those
            if (field.type !== 'card-selection' && field.type !== 'carousel-selection') {
                this._addFieldLabel(formGroup, field);
            } else {
                // For card and carousel selections, add a title
                const fieldTitle = document.createElement('h3');
                fieldTitle.textContent = field.label;
                if (field.required) {
                    fieldTitle.innerHTML += ' <span class="required">*</span>';
                }
                formGroup.appendChild(fieldTitle);
            }
            
            // Create input based on type
            const input = this._createInputElement(field);
            formGroup.appendChild(input);
            
            // Add error message container
            this._addErrorContainer(formGroup, field);
            
            // Add this form group to the dimensions row if it's a dimension field, otherwise add to the page
            if (isDimensionField && dimensionsRow) {
                dimensionsRow.appendChild(formGroup);
            } else {
                pageDiv.appendChild(formGroup);
            }
        });
    }

    /**
     * Add a label for a form field
     * @param {Element} formGroup - The form group element
     * @param {Object} field - The field data
     * @private
     */
    _addFieldLabel(formGroup, field) {
        // Create label
        const label = document.createElement('label');
        
        // Only set the for attribute for form control elements
        // Input types that are valid form controls
        const formControlTypes = ['text', 'email', 'tel', 'select', 'textarea', 'radio', 'checkbox'];
        
        if (formControlTypes.includes(field.type)) {
            label.setAttribute('for', field.id);
        }
        
        label.textContent = field.label;
        if (field.required) {
            label.innerHTML += ' <span class="required">*</span>';
        }
        
        // Add tooltip if exists
        if (field.tooltip) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = `
                <span class="tooltip-icon">?</span>
                <span class="tooltip-text">${field.tooltip}</span>
            `;
            label.appendChild(tooltip);
        }
        
        formGroup.appendChild(label);
    }

    /**
     * Create an input element based on field type
     * @param {Object} field - The field data
     * @returns {Element} The created input element
     * @private
     */
    _createInputElement(field) {
        let input;
        
        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
                input = document.createElement('input');
                input.type = field.type;
                input.id = field.id;
                input.name = field.id;
                if (field.placeholder) input.placeholder = field.placeholder;
                if (field.required) input.required = true;
                break;
                
            case 'textarea':
                input = document.createElement('textarea');
                input.id = field.id;
                input.name = field.id;
                if (field.placeholder) input.placeholder = field.placeholder;
                if (field.required) input.required = true;
                if (field.rows) input.rows = field.rows;
                break;
                
            case 'html': 
                // Custom HTML content
                input = document.createElement('div');
                input.id = field.id;
                input.innerHTML = field.html;
                break;
                
            case 'placeholder':
                // Placeholder for dynamic content
                input = document.createElement('div');
                input.id = field.id;
                if (field.html) {
                    input.innerHTML = field.html;
                }
                break;
                
            case 'select':
                input = this._createSelectElement(field);
                break;
                
            case 'card-selection':
                input = this._createCardSelectionElement(field);
                break;
                
            case 'carousel-selection':
                input = this._createCarouselElement(field);
                break;
                
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.id = field.id;
                input.name = field.id;
        }
        
        return input;
    }

    /**
     * Create a select dropdown element
     * @param {Object} field - The field data
     * @returns {Element} The created select element
     * @private
     */
    _createSelectElement(field) {
        const select = document.createElement('select');
        select.id = field.id;
        select.name = field.id;
        if (field.required) select.required = true;
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = field.placeholder || 'Select an option';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);
        
        // Add options
        field.options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            select.appendChild(optionEl);
        });
        
        return select;
    }

    /**
     * Create a card selection element
     * @param {Object} field - The field data
     * @returns {Element} The created card selection container
     * @private
     */
    _createCardSelectionElement(field) {
        // For roof type selection, similar to project type but within a form field
        const container = document.createElement('div');
        container.className = 'card-options';
        container.id = field.id + 'Container';
        
        // Create hidden input to store the selected value
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = field.id;
        hiddenInput.name = field.id;
        if (field.required) hiddenInput.required = true;
        container.appendChild(hiddenInput);
        
        // Add each card option
        field.options.forEach(option => {
            const card = document.createElement('div');
            card.className = `card-option ${option.disabled ? 'disabled' : ''}`;
            card.dataset.value = option.value;
            card.dataset.targetInput = field.id;
            
            // Card content
            card.innerHTML = `
                <div class="card-icon">${option.emoji}</div>
                <div class="card-title">${option.title}</div>
                <div class="card-description">${option.description}</div>
            `;
            
            container.appendChild(card);
        });
        
        return container;
    }

    /**
     * Create a carousel element
     * @param {Object} field - The field data
     * @returns {Element} The created carousel container
     * @private
     */
    _createCarouselElement(field) {
        // Create carousel container
        const container = document.createElement('div');
        container.className = 'carousel-container';
        container.id = field.id + 'Container';
        
        // Create carousel wrapper
        const carouselWrapper = document.createElement('div');
        carouselWrapper.className = 'carousel-wrapper';
        
        // Create carousel options
        const carouselOptions = document.createElement('div');
        carouselOptions.className = 'carousel-options';
        
        // Debug: log field options count
        console.log(`Creating carousel for ${field.id} with ${field.options.length} options`);
        
        // Add each carousel option
        field.options.forEach(option => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.dataset.value = option.value;
            
            // Check if this is a skylight item
            const isSkylight = field.id === 'skylights';
            
            // Item content
            const hasValidImageURL = option.imageURL && option.imageURL.trim().length > 0;
            
            let itemContent = `
                <div class="carousel-item-image">
                    ${hasValidImageURL ? 
                      `<img src="${option.imageURL}" alt="${option.title}" class="cdn-image" onerror="this.onerror=null; this.classList.add('image-error'); this.closest('.carousel-item-image').innerHTML='<div class=\'placeholder-image\'>${option.title}</div>';">` :
                      `<div class="placeholder-image">${option.title}</div>`
                    }
                </div>
                <div class="carousel-item-title">${option.title}</div>
                <div class="carousel-item-description">${option.description}</div>
                <input type="hidden" class="carousel-item-value" value="${option.value}">
            `;
            
            // Add type information for skylights
            if (isSkylight) {
                itemContent += `<input type="hidden" class="skylight-type" value="Roof">`;
                
                // Add roof type information (mono-pitch or double-pitch)
                if (option.roofType) {
                    itemContent += `<input type="hidden" class="skylight-roof-type" value="${option.roofType}">`;
                    
                    // Add a visual indicator of the roof type
                    const roofTypeLabel = option.roofType === 'mono-pitch' ? 'Mono Pitch' : 'Double Pitch';
                    const roofTypeClass = option.roofType === 'mono-pitch' ? 'mono-pitch-label' : 'double-pitch-label';
                    
                    itemContent += `<div class="roof-type-label ${roofTypeClass}">${roofTypeLabel}</div>`;
                }
            }
            
            item.innerHTML = itemContent;
            
            // If the option allows quantity selection
            if (option.quantity) {
                const quantityControl = document.createElement('div');
                quantityControl.className = 'quantity-control';
                quantityControl.innerHTML = `
                    <button type="button" class="quantity-btn quantity-decrease">-</button>
                    <input type="number" min="0" value="0" class="quantity-input" id="${field.id}_${option.value}_qty" name="${field.id}_${option.value}_qty">
                    <button type="button" class="quantity-btn quantity-increase">+</button>
                `;
                item.appendChild(quantityControl);
            }
            
            carouselOptions.appendChild(item);
        });
        
        // After adding all options, verify the count
        console.log(`Added ${carouselOptions.children.length} items to ${field.id} carousel`);
        
        // Add navigation buttons
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'carousel-nav carousel-prev';
        prevBtn.innerHTML = '&#10094;';
        prevBtn.setAttribute('aria-label', 'Previous item');
        
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'carousel-nav carousel-next';
        nextBtn.innerHTML = '&#10095;';
        nextBtn.setAttribute('aria-label', 'Next item');
        
        carouselWrapper.appendChild(prevBtn);
        carouselWrapper.appendChild(carouselOptions);
        carouselWrapper.appendChild(nextBtn);
        container.appendChild(carouselWrapper);
        
        return container;
    }

    /**
     * Add error message container for a field
     * @param {Element} formGroup - The form group element
     * @param {Object} field - The field data
     * @private
     */
    _addErrorContainer(formGroup, field) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.id = `${field.id}Error`;
        errorMsg.textContent = field.errorMessage || 'This field is required';
        formGroup.appendChild(errorMsg);
    }

    /**
     * Add navigation buttons to a page
     * @param {Element} pageDiv - The page container element
     * @param {number} pageNum - The page number
     * @param {number} totalPages - The total number of pages
     * @private
     */
    _addNavigationButtons(pageDiv, pageNum, totalPages) {
        // Create a flex container for all buttons
        const formButtons = document.createElement('div');
        formButtons.className = 'form-buttons';
        
        // Add left side for Previous button (only on pages after the first)
        const leftButtons = document.createElement('div');
        leftButtons.className = 'left-buttons';
        if (pageNum > 1) {
            const prevButton = document.createElement('button');
            prevButton.type = 'button';
            prevButton.className = 'btn btn-secondary prev-btn';
            prevButton.textContent = 'Previous';
            prevButton.dataset.page = pageNum;
            leftButtons.appendChild(prevButton);
        }
        formButtons.appendChild(leftButtons);
        
        // Create a container for the right-side buttons
        const rightButtons = document.createElement('div');
        rightButtons.className = 'right-buttons';
        
        // Next/Submit button
        const nextButton = document.createElement('button');
        nextButton.type = pageNum === totalPages ? 'submit' : 'button';
        
        // If it's the first page, disable the Next button until a selection is made
        if (pageNum === 1) {
            nextButton.className = 'btn btn-primary next-btn btn-disabled';
            nextButton.disabled = true;
        } else {
            nextButton.className = pageNum === totalPages ? 'btn btn-primary submit-btn' : 'btn btn-primary next-btn';
        }
        
        nextButton.textContent = pageNum === totalPages ? 'Submit' : 'Next';
        nextButton.dataset.page = pageNum;
        rightButtons.appendChild(nextButton);
        
        // Save button (bookmark icon)
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'btn-bookmark';
        saveButton.id = `saveForLaterBtn${pageNum}`;
        saveButton.title = 'Bookmark';
        saveButton.innerHTML = '<i class="fas fa-bookmark"></i>';
        rightButtons.appendChild(saveButton);
        
        formButtons.appendChild(rightButtons);
        pageDiv.appendChild(formButtons);
    }

    /**
     * Add restart button at the bottom of the form
     * @private
     */
    _addRestartButton() {
        const additionalButtons = document.createElement('div');
        additionalButtons.className = 'restart-button-container';
        additionalButtons.innerHTML = `
            <button type="button" class="btn btn-secondary" id="restartForm">Restart</button>
        `;
        this.form.appendChild(additionalButtons);
    }
}

export default FormBuilder;
