import { loadMaterialsFromCSV } from './js/utils/simpleCSVLoader.js';

document.addEventListener('DOMContentLoaded', function() {
    // Helper function to retrieve form submissions (for testing only)
    window.getGeoplySubmissions = function() {
        const submissions = JSON.parse(localStorage.getItem('geoplySubmissions') || '[]');
        console.log('Saved submissions:', submissions);
        return submissions;
    };
    
    // Helper function to clear saved submissions (for testing only)
    window.clearGeoplySubmissions = function() {
        localStorage.removeItem('geoplySubmissions');
        console.log('All submissions cleared');
        return true;
    };
    
    // Global variables
    let currentPage = 1;
    const totalPages = 3; // Updated to reflect the actual number of pages
    const form = document.getElementById('geoplyForm');
    const progressFill = document.getElementById('progressFill');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Store the project type for conditional logic
    let selectedProjectType = '';
    
    // Initialize progress bar
    updateProgress(currentPage);
    
    // Load questions from JSON file and then materials
    console.log('[Init] Starting form initialization...');
    
    fetch('questions.json')
        .then(response => {
            console.log('[Questions] Response status:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(async data => {
            console.log('[Questions] Loaded successfully, found pages:', data.pages?.length);
            console.log('[Materials] Starting materials load...');
            
            try {
                // Load materials using the CSV loader
                console.log('[Materials] Calling loadMaterialsFromCSV...');
                const { cladding, roofing } = await loadMaterialsFromCSV('materials.csv');
                console.log('[Materials] Loaded successfully:', { 
                    claddingCount: cladding?.length, 
                    roofingCount: roofing?.length 
                });

                // Find and update the fields
                const claddingField = findField(data, 'cladding');
                const roofingField = findField(data, 'roofing');
                
                console.log('[Materials] Fields found in questions data:', { 
                    foundCladding: !!claddingField, 
                    foundRoofing: !!roofingField 
                });

                if (claddingField) {
                    console.log('[Materials] Updating cladding options...');
                    claddingField.options = cladding.map(item => ({
                        value: item.Value,
                        title: item.Title,
                        description: item.Description,
                        image: item.ImageURL,
                        price: parseFloat(item.Price || 0)
                    }));
                }
                
                if (roofingField) {
                    roofingField.options = roofing.map(item => ({
                        value: item.Value,
                        title: item.Title,
                        description: item.Description,
                        image: item.ImageURL,
                        price: parseFloat(item.Price || 0)
                    }));
                }

                // Build form with updated data
                buildForm(data);
                initializeEventListeners();
            } catch (error) {
                console.error('Error loading materials:', error);
                // If materials fail to load, still build the form with original data
                buildForm(data);
                initializeEventListeners();
            }
        })
        .catch(error => {
            console.error('Error loading questions:', error);
        });
        
    // Helper function to find a field by ID in the form data
    function findField(data, fieldId) {
        for (const page of data.pages) {
            if (page.fields) {
                for (const field of page.fields) {
                    if (field.id === fieldId) {
                        return field;
                    }
                }
            }
        }
        return null;
    }
    
    // Function to build the form based on questions data
    function buildForm(data) {
        // Clear any existing content
        form.innerHTML = '';
        
        // Loop through each page in the data
        data.pages.forEach((page, pageIndex) => {
            const pageNum = pageIndex + 1;
            const isActive = pageNum === 1 ? 'active' : '';
            
            // Create page container
            const pageDiv = document.createElement('div');
            pageDiv.className = `form-page ${isActive}`;
            pageDiv.id = `page${pageNum}`;
            
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
            } else if (page.type === 'form-fields') {
                // Create form fields
                page.fields.forEach(field => {
                    const formGroup = document.createElement('div');
                    formGroup.className = 'form-group';
                    
                    // Check if field has conditional logic and mark it
                    if (field.conditional) {
                        // Store the condition in a data attribute for later reference
                        formGroup.dataset.conditionalField = field.conditional.field;
                        formGroup.dataset.conditionalValue = field.conditional.value;
                        formGroup.classList.add('conditional-field');
                        
                        // Initially hide if condition doesn't match
                        if (field.conditional.field === 'projectType' && selectedProjectType !== field.conditional.value) {
                            formGroup.style.display = 'none';
                        }
                    }
                    
                    // Skip if it's a card-selection or carousel-selection, we'll handle labels inside those
                    if (field.type !== 'card-selection' && field.type !== 'carousel-selection') {
                        // Create label
                        const label = document.createElement('label');
                        
                        // Only set the for attribute for valid form control elements
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
                            input = document.createElement('select');
                            input.id = field.id;
                            input.name = field.id;
                            if (field.required) input.required = true;
                            
                            // Add default option
                            const defaultOption = document.createElement('option');
                            defaultOption.value = '';
                            defaultOption.textContent = field.placeholder || 'Select an option';
                            defaultOption.disabled = true;
                            defaultOption.selected = true;
                            input.appendChild(defaultOption);
                            
                            // Add options
                            field.options.forEach(option => {
                                const optionEl = document.createElement('option');
                                optionEl.value = option.value;
                                optionEl.textContent = option.label;
                                input.appendChild(optionEl);
                            });
                            break;
                            
                        case 'card-selection': {
                            // For roof type selection, similar to project type but within a form field
                            input = document.createElement('div');
                            input.className = 'card-options';
                            input.id = field.id + 'Container';
                            
                            // Create hidden input to store the selected value
                            const hiddenInput = document.createElement('input');
                            hiddenInput.type = 'hidden';
                            hiddenInput.id = field.id;
                            hiddenInput.name = field.id;
                            if (field.required) hiddenInput.required = true;
                            input.appendChild(hiddenInput);
                            
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
                                
                                input.appendChild(card);
                            });
                            break;
                        }
                        case 'carousel-selection': {
                            // Create carousel container
                            input = document.createElement('div');
                            input.className = 'carousel-container';
                            input.id = field.id + 'Container';
                            
                            // Create hidden input to store the selected value
                            const hiddenInput = document.createElement('input');
                            hiddenInput.type = 'hidden';
                            hiddenInput.id = field.id;
                            hiddenInput.name = field.id;
                            if (field.required) hiddenInput.required = true;
                            input.appendChild(hiddenInput);
                            
                            // Create carousel wrapper
                            const carouselWrapper = document.createElement('div');
                            carouselWrapper.className = 'carousel-wrapper';
                            
                            // Create carousel options
                            const carouselOptions = document.createElement('div');
                            carouselOptions.className = 'carousel-options';
                            
                            // Add each carousel option
                            field.options.forEach(option => {
                                const item = document.createElement('div');
                                item.className = 'carousel-item';
                                item.dataset.value = option.value;
                                
                                // Item content with real image if available
                                const imageContent = option.image 
                                    ? `<img src="${option.image}" alt="${option.title}" class="carousel-item-img">` 
                                    : `<div class="placeholder-image">${option.title}</div>`;
                                
                                item.innerHTML = `
                                    <div class="carousel-item-image">
                                        ${imageContent}
                                    </div>
                                    <div class="carousel-item-title">${option.title}</div>
                                    <div class="carousel-item-description">${option.description}</div>
                                    ${option.price ? `<div class="carousel-item-price">£${option.price}/m²</div>` : ''}
                                `;
                                
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
                            input.appendChild(carouselWrapper);
                            break;
                        }
                    }
                    
                    formGroup.appendChild(input);
                    
                    // Add error message container
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.id = `${field.id}Error`;
                    errorMsg.textContent = field.errorMessage || 'This field is required';
                    formGroup.appendChild(errorMsg);
                    
                    pageDiv.appendChild(formGroup);
                });
            }
            
            // Add navigation buttons - create a flex container for all buttons
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
            
            // Add the page to the form
            form.appendChild(pageDiv);
        });
        
        // Add restart button at the bottom of the form
        const additionalButtons = document.createElement('div');
        additionalButtons.className = 'restart-button-container';
        additionalButtons.innerHTML = `
            <button type="button" class="btn btn-secondary" id="restartForm">Restart</button>
        `;
        form.appendChild(additionalButtons);
    }
    
    // Function to update conditional fields based on project type
    function updateConditionalFields() {
        const conditionalFields = document.querySelectorAll('.conditional-field');
        
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
    }
    
    // Initialize all event listeners
    function initializeEventListeners() {
        // Card selection event listeners for both project type and roof type
        const cardOptions = document.querySelectorAll('.card-option:not(.disabled)');
        cardOptions.forEach(card => {
            card.addEventListener('click', function() {
                // Get all cards in the same container
                const container = this.closest('.card-options');
                const siblingCards = container.querySelectorAll('.card-option');
                
                // Deselect all sibling cards
                siblingCards.forEach(c => c.classList.remove('selected'));
                
                // Select this card
                this.classList.add('selected');
                
                // If this is a form field card (like roof type)
                if (this.dataset.targetInput) {
                    // Update the hidden input value
                    const targetInput = document.getElementById(this.dataset.targetInput);
                    if (targetInput) {
                        targetInput.value = this.dataset.value;
                    }
                } else if (this.closest('#page1')) {
                    // This is the project type selection
                    selectedProjectType = this.dataset.value;
                    updateConditionalFields();
                }
            
                // Enable the next button if a card is selected
                const pageNum = this.closest('[id^="page"]').id.replace('page', '');
                const nextBtn = document.querySelector(`.next-btn[data-page="${pageNum}"]`);
                if (nextBtn) {
                    nextBtn.classList.remove('btn-disabled');
                    nextBtn.disabled = false;
                }
            });
        });
        
        // Carousel item selection event listeners
        const carouselItems = document.querySelectorAll('.carousel-item');
        carouselItems.forEach(item => {
            item.addEventListener('click', function() {
                // If this item has quantity, don't select it (just let quantity controls work)
                if (this.querySelector('.quantity-control')) return;
                
                // Find all items in the same carousel
                const container = this.closest('.carousel-options');
                const siblingItems = container.querySelectorAll('.carousel-item');
                
                // Find the hidden input for this carousel
                const carouselContainer = this.closest('.carousel-container');
                const hiddenInput = carouselContainer.querySelector('input[type="hidden"]');
                
                // Deselect all sibling items
                siblingItems.forEach(i => i.classList.remove('carousel-item-selected'));
                
                // Select this item
                this.classList.add('carousel-item-selected');
                
                // Update the hidden input value
                if (hiddenInput) {
                    hiddenInput.value = this.dataset.value;
                }
            });
        });
        
        // Carousel navigation event listeners
        const carouselPrevBtns = document.querySelectorAll('.carousel-prev');
        const carouselNextBtns = document.querySelectorAll('.carousel-next');
        
        carouselPrevBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const carousel = this.closest('.carousel-wrapper').querySelector('.carousel-options');
                carousel.scrollBy({ left: -200, behavior: 'smooth' });
            });
        });
        
        carouselNextBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const carousel = this.closest('.carousel-wrapper').querySelector('.carousel-options');
                carousel.scrollBy({ left: 200, behavior: 'smooth' });
            });
        });
        
        // Quantity buttons event listeners
        const quantityDecreaseBtns = document.querySelectorAll('.quantity-decrease');
        const quantityIncreaseBtns = document.querySelectorAll('.quantity-increase');
        
        quantityDecreaseBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.nextElementSibling;
                let value = parseInt(input.value);
                if (value > 0) {
                    input.value = value - 1;
                }
            });
        });
        
        quantityIncreaseBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.previousElementSibling;
                let value = parseInt(input.value);
                input.value = value + 1;
            });
        });
        
        // Next buttons
        const nextButtons = document.querySelectorAll('.next-btn');
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                const pageNum = parseInt(this.dataset.page);
                if (validatePage(pageNum)) {
                    showPage(pageNum + 1);
                }
            });
        });
        
        // Previous buttons
        const prevButtons = document.querySelectorAll('.prev-btn');
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                const pageNum = parseInt(this.dataset.page);
                showPage(pageNum - 1);
            });
        });
        
        // Restart form button
        const restartButton = document.getElementById('restartForm');
        if (restartButton) {
            restartButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to start over? All your progress will be lost.')) {
                    // Clear all submissions from localStorage
                    localStorage.removeItem('geoplySubmissions');
                    console.log('All submissions cleared');
                    
                    // Reset the form
                    resetForm();
                }
            });
        }
        
        // Save for later buttons (bookmark icons)
        const saveButtons = document.querySelectorAll('[id^="saveForLaterBtn"]');
        saveButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Collect current form data
                const formData = new FormData(form);
                const formObject = {};
                
                formData.forEach((value, key) => {
                    formObject[key] = value;
                });
                
                // Add selected project type
                const selectedCard = document.querySelector('.card-option.selected');
                if (selectedCard) {
                    formObject.projectType = selectedCard.dataset.value;
                }
                
                // Add timestamp
                formObject.savedAt = new Date().toISOString();
                
                // Format as JSON
                const jsonData = JSON.stringify(formObject, null, 2);
                
                // Display the JSON data
                alert('Current Form Data as JSON:\n\n' + jsonData);
                
                // Also log to console for easier viewing
                console.log('Current Form Data:', formObject);
            });
        });
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const isValid = validateForm();
            
            if (isValid) {
                // Collect form data
                const formData = new FormData(form);
                const formObject = {};
                
                formData.forEach((value, key) => {
                    formObject[key] = value;
                });
                
                // Add selected project type
                const selectedCard = document.querySelector('.card-option.selected');
                if (selectedCard) {
                    formObject.projectType = selectedCard.dataset.value;
                }
                
                // Add submission timestamp
                formObject.submittedAt = new Date().toISOString();
                
                // Prepare JSON data for webhook
                const jsonData = JSON.stringify(formObject, null, 2);
                
                // Log the JSON data (for testing/debugging)
                console.log('Form data ready for webhook:', jsonData);
                
                // Store in localStorage for demonstration (remove in production)
                const submissions = JSON.parse(localStorage.getItem('geoplySubmissions') || '[]');
                submissions.push(formObject);
                localStorage.setItem('geoplySubmissions', JSON.stringify(submissions));
                
                // Webhook will be implemented later
                // fetch('WEBHOOK_URL', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: jsonData
                // });
                
                alert('Form submitted successfully! We will contact you shortly.\n\nThe form data has been formatted as JSON and is ready to be sent via webhook.');
                
                // Reset form
                resetForm();
            }
        });
        
        // Add click animation to primary buttons
        const primaryButtons = document.querySelectorAll('.btn-primary');
        primaryButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Add clicked class
                this.classList.add('clicked');
                
                // Remove clicked class after animation completes
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 600);
            });
        });
    }
    
    // Function to update progress bar
    function updateProgress(page) {
        // Calculate progress percentage
        const progress = (page - 1) / (totalPages - 1) * 100;
        
        // Update progress bar width
        if (progressFill) {
            progressFill.style.width = progress + '%';
            console.log('Progress updated to: ' + progress + '%');
        } else {
            console.error('Progress fill element not found');
        }
        
        // Update step indicators
        if (progressSteps && progressSteps.length > 0) {
            progressSteps.forEach((step, index) => {
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
    
    // Function to show a specific page
    function showPage(pageId) {
        // Hide all pages
        const pages = document.querySelectorAll('.form-page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Show the selected page
        const targetPage = document.getElementById('page' + pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            currentPage = pageId;
            updateProgress(currentPage);
        }
    }
    
    // Function to validate the current page
    function validatePage(pageNum) {
        const page = document.getElementById('page' + pageNum);
        if (!page) return true;
        
        // Check if there's a selected card on page 1
        if (pageNum === 1) {
            const selectedCard = page.querySelector('.card-option.selected');
            if (!selectedCard) {
                alert('Please select a project type to continue.');
                return false;
            }
        }
        
        // For page 2, check if roof type is selected if it's a card-selection
        if (pageNum === 2) {
            const roofTypeContainer = page.querySelector('#roofTypeContainer');
            if (roofTypeContainer) {
                const selectedRoof = roofTypeContainer.querySelector('.card-option.selected');
                const hiddenInput = document.getElementById('roofType');
                
                if (!selectedRoof && hiddenInput && hiddenInput.required) {
                    alert('Please select a roof type to continue.');
                    return false;
                }
            }
        }
        
        // Check required fields on the current page
        const requiredFields = page.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            const errorElement = document.getElementById(field.id + 'Error');
            
            if (!field.value.trim()) {
                if (errorElement) errorElement.classList.add('visible');
                field.style.borderColor = 'var(--error-color)';
                isValid = false;
            } else {
                if (errorElement) errorElement.classList.remove('visible');
                field.style.borderColor = 'var(--border-color)';
            }
        });
        
        return isValid;
    }
    
    // Function to validate the entire form
    function validateForm() {
        let isValid = true;
        
        // Validate each page
        for (let i = 1; i <= totalPages; i++) {
            if (!validatePage(i)) {
                isValid = false;
                showPage(i);
                break;
            }
        }
        
        return isValid;
    }
    
    // Function to reset the form
    function resetForm() {
        // Deselect all cards
        const cards = document.querySelectorAll('.card-option');
        cards.forEach(card => card.classList.remove('selected'));
        
        // Reset selectedProjectType
        selectedProjectType = '';
        
        // Clear all inputs
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.value = '';
            input.style.borderColor = 'var(--border-color)';
        });
        
        // Reset quantity inputs to 0
        const quantityInputs = form.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.value = '0';
        });
        
        // Hide all error messages
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.classList.remove('visible'));
        
        // Show first page
        showPage(1);
    }
});
