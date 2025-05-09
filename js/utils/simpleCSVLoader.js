/**
 * A simple CSV loader that doesn't depend on PapaParse
 */

/**
 * Load and parse the CSV file containing window and door dimensions
 * @param {string} csvPath - Path to the CSV file
 * @returns {Promise<Object>} Object with windows, doors, and skylights arrays
 */
export async function loadOpeningsFromCSV(csvPath) {
    try {
        console.log('Simple loader - attempting to load CSV from:', csvPath);
        
        // Load the CSV using fetch with a timestamp to avoid caching issues
        const response = await fetch(csvPath + '?t=' + new Date().getTime(), {
            cache: 'no-store', // Force bypass cache
            headers: {'Cache-Control': 'no-cache'} // Extra anti-cache headers
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV file: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV loaded successfully, size:', csvText.length);
        
        // Simple CSV parser
        const rows = csvText.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        
        const data = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip empty rows
            
            const values = rows[i].split(',');
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
                
                // Try to convert numeric values
                if (!isNaN(row[header])) {
                    row[header] = parseFloat(row[header]);
                }
            });
            
            data.push(row);
        }
        
        console.log(`Parsed ${data.length} rows from CSV`);
        
        // Filter windows and doors
        const windows = data.filter(row => 
            row.Type === 'Windows and doorways' && 
            row.Name && 
            row.Name.includes('WINDOW')
        );
        
        const doors = data.filter(row => 
            row.Type === 'Windows and doorways' && 
            row.Name && 
            row.Name.includes('DOOR')
        );
        
        // Filter skylights (Type is 'Roof')
        const skylights = data.filter(row => 
            row.Type === 'Roof' && 
            row.Name && 
            row.Name.includes('SKYLIGHT')
        );
        
        console.log(`Found ${windows.length} windows, ${doors.length} doors, and ${skylights.length} skylights`);
        
        // Debug log for skylights to check roof types
        skylights.forEach(row => {
            console.log(`Skylight: ${row.Name}, Roof Type: ${row.RoofType || 'undefined'}`);
        });
        
        // Transform to the format expected by the carousel
        const windowOptions = windows.map(row => {
            const parts = row.Name.split('-');
            const code = parts[parts.length - 1];
            const modelName = row.Name.split('_')[0]; // Extract SKYLARK200 or SKYLARK250
            
            return {
                value: `${modelName}_${code}`, // Include model name in the value
                title: `${modelName} ${code}`, // Include model name in the title
                description: `${row.Name}\nHeight: ${row['Opening Height (mm)']}mm\nWidth: ${row['Opening Width(mm)']}mm (${row['Opening Area (m2)']}m²)`,
                image: `window-${code.toLowerCase()}.jpg`,
                imageURL: row.ImageURL || '', // Extract CDN Image URL
                quantity: true,
                fullName: row.Name
            };
        });
        
        const doorOptions = doors.map(row => {
            const parts = row.Name.split('-');
            const code = parts[parts.length - 1];
            const modelName = row.Name.split('_')[0]; // Extract SKYLARK200 or SKYLARK250
            
            return {
                value: `${modelName}_${code}`, // Include model name in the value
                title: `${modelName} ${code}`, // Include model name in the title
                description: `${row.Name}\nHeight: ${row['Opening Height (mm)']}mm\nWidth: ${row['Opening Width(mm)']}mm (${row['Opening Area (m2)']}m²)`,
                image: `door-${code.toLowerCase()}.jpg`,
                imageURL: row.ImageURL || '', // Extract CDN Image URL
                quantity: true,
                fullName: row.Name
            };
        });
        
        const skylightOptions = skylights.map(row => {
            const parts = row.Name.split('-');
            const code = parts.slice(1).join('-'); // Get everything after the first dash
            const modelName = row.Name.split('_')[0]; // Extract SKYLARK200 or SKYLARK250
            
            // Debug log for each skylight being processed
            console.log(`Processing skylight: ${row.Name}, Model: ${modelName}, Code: ${code}, Roof Type: ${row.RoofType || 'undefined'}`);
            
            return {
                value: row.Name, // Use the full name as the value for more precise matching
                title: `${modelName} ${code}`, // Include model name in the title
                description: `${row.Name}\nHeight: ${row['Opening Height (mm)']}mm\nWidth: ${row['Opening Width(mm)']}mm (${row['Opening Area (m2)']}m²)\nRoof Type: ${row.RoofType || 'Not specified'}`,
                image: `skylight-${code.toLowerCase()}.jpg`,
                imageURL: row.ImageURL || '', // Extract CDN Image URL
                quantity: true,
                fullName: row.Name,
                roofType: row.RoofType || '' // Include roof type information
            };
        });
        
        // Remove duplicates (same code from different SKYLARK models)
        const uniqueWindowOptions = removeDuplicates(windowOptions, 'value');
        const uniqueDoorOptions = removeDuplicates(doorOptions, 'value');
        const uniqueSkylightOptions = removeDuplicates(skylightOptions, 'value');
        
        console.log(`Returning ${uniqueWindowOptions.length} unique window options, ${uniqueDoorOptions.length} unique door options, and ${uniqueSkylightOptions.length} unique skylight options`);
        
        return {
            windows: uniqueWindowOptions,
            doors: uniqueDoorOptions,
            skylights: uniqueSkylightOptions
        };
    } catch (error) {
        console.error('Error loading or processing CSV:', error);
        throw error; // Re-throw to allow caller to handle it
    }
}

/**
 * Load and parse the CSV file containing dimension options (height/width)
 * @param {string} csvPath - Path to the dimensions CSV file
 * @returns {Promise<Array<Object>>} Array of dimension option objects
 */
export async function loadDimensionsFromCSV(csvPath) {
    try {
        console.log('Simple loader - attempting to load Dimensions CSV from:', csvPath);
        
        // Load the CSV using fetch with a timestamp to avoid caching issues
        const response = await fetch(csvPath + '?t=' + new Date().getTime(), {
            cache: 'no-store', // Force bypass cache
            headers: {'Cache-Control': 'no-cache'} // Extra anti-cache headers
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch Dimensions CSV file: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('Dimensions CSV loaded successfully, size:', csvText.length);
        
        // Simple CSV parser
        const rows = csvText.split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        
        const data = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip empty rows
            
            const values = rows[i].split(',');
            const row = {};
            
            headers.forEach((header, index) => {
                // Use a default empty string if value is missing
                let value = values[index] ? values[index].trim() : '';

                // Remove surrounding quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }

                // Assign the cleaned value
                row[header] = value;

                // Attempt numeric conversion only if it's not an empty string and is a valid number
                if (row[header] !== '' && !isNaN(row[header])) {
                    row[header] = parseFloat(row[header]);
                } 
            });
            
            // Add validation: Ensure essential columns exist
            if (row.Type && row.Value !== undefined && row.Label && row.WallDepth !== undefined) {
                data.push(row);
            } else {
                console.warn('Skipping invalid row in dimensions.csv:', rows[i], 'Parsed:', row);
            }
        }
        
        console.log(`Parsed ${data.length} dimension rows from CSV`);
        return data;

    } catch (error) {
        console.error('Error loading or processing Dimensions CSV:', error);
        throw error; // Re-throw to allow caller to handle it
    }
}

/**
 * Load and parse the CSV file containing materials (cladding and roofing)
 * @param {string} csvPath - Path to the materials CSV file
 * @returns {Promise<Object>} Object with cladding and roofing arrays
 */
export async function loadMaterialsFromCSV(csvPath) {
    try {
        console.log('[Materials CSV] Starting load attempt from:', csvPath);
        
        // Load the CSV using fetch with a timestamp to avoid caching issues
        const timestamp = new Date().getTime();
        const urlWithTimestamp = csvPath + '?t=' + timestamp;
        console.log('[Materials CSV] Fetching with cache-busting URL:', urlWithTimestamp);
        
        const response = await fetch(urlWithTimestamp, {
            cache: 'no-store', // Force bypass cache
            headers: {'Cache-Control': 'no-cache'} // Extra anti-cache headers
        });
        
        console.log('[Materials CSV] Fetch response:', {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch Materials CSV file: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.text();
        console.log('[Materials CSV] Raw content length:', csvText.length);
        console.log('[Materials CSV] First 100 chars:', csvText.substring(0, 100));
        
        // Simple CSV parser
        const rows = csvText.split('\n');
        console.log('[Materials CSV] Number of rows:', rows.length);
        console.log('[Materials CSV] Headers:', rows[0]);
        
        const headers = rows[0].split(',').map(h => h.trim());
        console.log('[Materials CSV] Parsed headers:', headers);
        
        const data = [];
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip empty rows
            
            const values = rows[i].split(',');
            const row = {};
            
            headers.forEach((header, index) => {
                // Use a default empty string if value is missing
                let value = values[index] ? values[index].trim() : '';

                // Remove surrounding quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }

                // Assign the cleaned value
                row[header] = value;

                // Attempt numeric conversion only if it's not an empty string and is a valid number
                if (row[header] !== '' && !isNaN(row[header])) {
                    row[header] = parseFloat(row[header]);
                }
            });
            
            // Add validation: Ensure essential columns exist
            if (row.Type && row.Value && row.Title) {
                data.push(row);
            } else {
                console.warn('Skipping invalid row in materials.csv:', rows[i], 'Parsed:', row);
            }
        }
        
        console.log(`Parsed ${data.length} material rows from CSV`);
        
        // Filter by type
        const cladding = data.filter(row => row.Type === 'Cladding').map(row => ({
            Value: row.Value,
            Title: row.Title,
            Description: row.Description || '',
            ImageURL: row.ImageURL || '',
            Price: parseFloat(row.Price || 0),
            Standard: row.Standard || '' // Include the Standard field
        }));
        
        const roofing = data.filter(row => row.Type === 'Roofing').map(row => ({
            Value: row.Value,
            Title: row.Title,
            Description: row.Description || '',
            ImageURL: row.ImageURL || '',
            Price: parseFloat(row.Price || 0),
            Standard: row.Standard || '' // Include the Standard field
        }));
        
        console.log(`Found ${cladding.length} cladding options and ${roofing.length} roofing options`);
        console.log('Standard cladding:', cladding.filter(c => c.Standard).map(c => `${c.Title} (${c.Standard})`));
        console.log('Standard roofing:', roofing.filter(r => r.Standard).map(r => `${r.Title} (${r.Standard})`));
        
        return { cladding, roofing };
    } catch (error) {
        console.error('Error loading or processing Materials CSV:', error);
        throw error;
    }
}

/**
 * Remove duplicate items from an array based on a property
 * @param {Array} arr - The array to filter
 * @param {string} key - The property to check for duplicates
 * @returns {Array} Array with duplicates removed
 */
function removeDuplicates(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()];
}