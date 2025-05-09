# CSV Implementation Guide for GeoplyForm

## Introduction

This guide explains the process of implementing new CSV data sources in the GeoplyForm application. CSV files provide a flexible way to manage product options, dimensions, materials, and other configuration data without changing the codebase.

## 1. CSV File Structure Requirements

### Basic Structure

CSV files should follow these conventions:
- First row must contain column headers
- Column names should be clear and consistent
- Required fields depend on the specific data type

### Example CSV Structure

```csv
Type,Value,Title,Description,ImageURL,Price
Option1,value1,Display Title,Detailed description,https://example.com/image1.jpg,100
Option1,value2,Another Title,Another description,https://example.com/image2.jpg,150
Option2,value3,Third Title,Third description,https://example.com/image3.jpg,125
```

### Common Fields

- **Type**: Category or grouping (e.g., "Cladding", "Roofing")
- **Value**: Unique identifier/key for the option
- **Title**: Display name shown to users
- **Description**: Detailed information about the option
- **ImageURL**: URL to the image representing the option
- **Price**: Cost associated with the option (optional)

## 2. Adding a New CSV Loader Function

Add a new loading function to `js/utils/simpleCSVLoader.js`:

```javascript
/**
 * Load and parse a custom CSV file
 * @param {string} csvPath - Path to the CSV file
 * @returns {Promise<Array<Object>>} Array of parsed objects
 */
export async function loadNewDataTypeFromCSV(csvPath) {
    try {
        console.log('Loading new data type from CSV:', csvPath);
        
        // Load the CSV with cache-busting to avoid browser caching
        const response = await fetch(csvPath + '?t=' + new Date().getTime(), {
            cache: 'no-store', 
            headers: {'Cache-Control': 'no-cache'}
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV file: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV loaded successfully, size:', csvText.length);
        
        // Parse CSV
        const rows = csvText.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        
        const data = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip empty rows
            
            const values = rows[i].split(',');
            const row = {};
            
            headers.forEach((header, index) => {
                // Handle missing values
                let value = values[index] ? values[index].trim() : '';
                
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                
                // Store in row object
                row[header] = value;
                
                // Convert numeric values
                if (value !== '' && !isNaN(value)) {
                    row[header] = parseFloat(value);
                }
            });
            
            // Validate required fields - customize this validation for your data type
            if (row.Type && row.Value && row.Title) {
                data.push(row);
            } else {
                console.warn('Skipping invalid row in CSV:', rows[i], 'Parsed:', row);
            }
        }
        
        console.log(`Parsed ${data.length} rows from CSV`);
        
        // Optional: Process the data further if needed
        // For example, grouping by Type:
        const groupedData = data.reduce((groups, item) => {
            const group = item.Type;
            groups[group] = groups[group] || [];
            groups[group].push({
                Value: item.Value,
                Title: item.Title,
                Description: item.Description || '',
                ImageURL: item.ImageURL || '',
                Price: parseFloat(item.Price || 0)
            });
            return groups;
        }, {});
        
        return groupedData; // Or return data if no grouping is needed
    } catch (error) {
        console.error('Error loading or processing CSV:', error);
        throw error;
    }
}
```

## 3. Integrating with Page Classes

### 3.1 Import the Loader

In your page class (e.g., `js/pages/YourPage.js`):

```javascript
import { loadNewDataTypeFromCSV } from '../utils/simpleCSVLoader.js';
```

### 3.2 Add Class Properties and Load Method

```javascript
class YourPage {
    constructor(pageElement, formState) {
        this.pageElement = pageElement;
        this.formState = formState;
        // Add property to store loaded data
        this.newDataItems = {};
        
        // Load data
        this.loadNewData();
    }
    
    /**
     * Load new data asynchronously
     */
    async loadNewData() {
        try {
            console.log('Loading new data from CSV...');
            this.newDataItems = await loadNewDataTypeFromCSV('your-data-file.csv');
            console.log('New data loaded:', Object.keys(this.newDataItems).length, 'categories');
            
            // Update UI with loaded data
            this.updateNewDataDisplay();
        } catch (error) {
            console.error('Failed to load new data:', error);
            this.newDataItems = {}; // Ensure it's an empty object on error
        }
    }
}
```

### 3.3 Create UI Update Method

```javascript
/**
 * Update UI elements with the loaded data
 */
updateNewDataDisplay() {
    // Find the category containers
    Object.keys(this.newDataItems).forEach(category => {
        const containerID = `#${category.toLowerCase()}Container`;
        const container = this.pageElement.querySelector(containerID);
        
        if (!container) {
            console.warn(`Container for ${category} not found: ${containerID}`);
            return;
        }
        
        // Get carousel options container
        const carouselOptions = container.querySelector('.carousel-options');
        if (!carouselOptions) {
            console.warn(`Carousel options container for ${category} not found`);
            return;
        }
        
        // Clear existing items
        carouselOptions.innerHTML = '';
        
        // Add items
        this.newDataItems[category].forEach(option => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.dataset.value = option.Value;
            
            // Create item content with data
            let itemContent = `
                <div class="carousel-item-image">
                    <img src="${option.ImageURL}" alt="${option.Title}" loading="lazy">
                </div>
                <div class="carousel-item-content">
                    <h4>${option.Title}</h4>
                    <p>${option.Description}</p>
                </div>
            `;
            
            item.innerHTML = itemContent;
            carouselOptions.appendChild(item);
        });
        
        console.log(`Added ${this.newDataItems[category].length} items to ${category} carousel`);
        
        // Initialize/reinitialize carousel
        // ... (carousel initialization code)
    });
}
```

### 3.4 Update Reset Method

Ensure your reset method refreshes the data:

```javascript
/**
 * Reset the page
 */
reset() {
    // Reset other components
    // ...
    
    // Reload data
    this.loadNewData();
}
```

## 4. Handling User Selections

When users make selections from your data-driven UI:

```javascript
/**
 * Handle user selection
 * @param {string} category - The category (e.g., "Material")
 * @param {string} value - The selected value
 */
handleSelection(category, value) {
    // Update form state with selection
    const formKey = category.toLowerCase();
    
    // Create an object with the new selection
    const update = {};
    update[formKey] = value;
    
    // Update form state
    this.formState.updateFormData(update);
    
    // Optional: Update UI to reflect selection
    this.updateSelectionVisuals(category, value);
}
```

## 5. Displaying Selected Values in Summary

In your summary/contact page:

```javascript
/**
 * Update the summary with selected options
 */
updateSummary() {
    // Get current form data
    const formData = this.formState.getFormData();
    let summaryHTML = '';
    
    // For each category in your data
    const categories = ['Category1', 'Category2', 'Category3'];
    categories.forEach(category => {
        const formKey = category.toLowerCase();
        const selectedValue = formData[formKey];
        
        if (selectedValue) {
            // Get the display title from the source data
            let displayTitle = selectedValue; // Default to the value itself
            
            // Try to find the title from the original data source
            const dataPage = window.geoplyForm?.dataPage;
            if (dataPage && dataPage.newDataItems && dataPage.newDataItems[category]) {
                const selectedItem = dataPage.newDataItems[category].find(
                    item => item.Value === selectedValue
                );
                if (selectedItem) {
                    displayTitle = selectedItem.Title;
                }
            }
            
            // Add to summary HTML
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-label">${category}:</div>
                    <div class="summary-value">${displayTitle}</div>
                </div>
            `;
        }
    });
    
    // Update summary container
    this.summaryContainer.innerHTML = summaryHTML;
}
```

## 6. Implementation Checklist

Follow these steps when adding a new CSV data source:

1. [ ] Create the CSV file with proper headers
2. [ ] Add the CSV file to project root (or appropriate directory)
3. [ ] Add or adapt a loader function in simpleCSVLoader.js
4. [ ] Add data property and loading method to relevant page class
5. [ ] Create UI update method to display the data
6. [ ] Implement handlers for user selection
7. [ ] Update reset method to reload data when needed
8. [ ] Modify summary display to show correct titles/values
9. [ ] Test the implementation thoroughly

## 7. Best Practices

- Use cache-busting when loading CSV files to ensure changes are reflected
- Always validate CSV data before using it (check for required fields)
- Provide clear error handling for missing or malformed CSV files
- Use fallbacks when displaying data (e.g., show raw values if titles can't be found)
- Document the expected CSV structure for each data type

## 8. Examples

See these existing implementations for reference:

- Materials CSV: Cladding and roofing options (see `BuildDetailsPage.js`)
- Dimensions CSV: Width, height, and length options (see `BuildDetailsPage.js`)
- Openings CSV: Windows, doors, and skylights (see `loadOpeningsFromCSV` function)

## Conclusion

Following this guide will help you maintain a consistent approach to loading and using CSV data throughout the application, making it more maintainable and easier to update options without code changes. 