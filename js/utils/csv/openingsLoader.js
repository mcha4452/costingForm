/**
 * openingsLoader.js
 * Utility to load and process CSV data for windows and doors
 */

// Use global Papa if available, otherwise try to import
const Papa = window.Papa || null;

/**
 * Load and process the openings CSV data
 * @param {string} csvPath - Path to the CSV file
 * @returns {Promise<Object>} Object with windows, doors, and skylights arrays
 */
export async function loadOpeningsFromCSV(csvPath) {
    try {
        console.log('Attempting to load CSV from path:', csvPath);
        
        // Try loading with fetch instead of fs
        let csvData;
        try {
            const response = await fetch(csvPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            csvData = await response.text();
            console.log('CSV loaded successfully via fetch');
        } catch (fetchError) {
            console.warn('Fetch failed, trying window.fs:', fetchError);
            // Fallback to window.fs if fetch fails
            csvData = await window.fs.readFile(csvPath, { encoding: 'utf8' });
            console.log('CSV loaded successfully via window.fs');
        }
        
        // Parse the CSV data
        if (!Papa) {
            console.error('PapaParse library not found');
            throw new Error('PapaParse library not found');
        }
        
        const parsedData = Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        
        // Filter out windows and doors
        const windowsData = parsedData.data.filter(row => 
            row.Type === 'Windows and doorways' && row.Name.includes('WINDOW')
        );
        
        const doorsData = parsedData.data.filter(row => 
            row.Type === 'Windows and doorways' && row.Name.includes('DOOR')
        );
        
        // Create skylights data from windows data
        // We're using window data as the basis for skylights since they're structurally similar
        const skylightsData = windowsData.map(window => {
            // Create a copy of the window data
            const skylight = {...window};
            // Replace "WINDOW" with "SKYLIGHT" in the name
            skylight.Name = window.Name.replace('WINDOW', 'SKYLIGHT');
            return skylight;
        });
        
        // Transform to carousel option format
        const windowOptions = transformToOptions(windowsData, 'window');
        const doorOptions = transformToOptions(doorsData, 'door');
        const skylightOptions = transformToOptions(skylightsData, 'skylight');
        
        console.log(`Loaded ${windowOptions.length} window options, ${doorOptions.length} door options, and ${skylightOptions.length} skylight options from CSV`);
        
        return {
            windows: windowOptions,
            doors: doorOptions,
            skylights: skylightOptions
        };
    } catch (error) {
        console.error('Error loading or processing openings CSV:', error);
        return { windows: [], doors: [], skylights: [] };
    }
}

/**
 * Transform CSV rows to carousel option format
 * @param {Array} rows - The CSV data rows
 * @param {string} type - Either 'window', 'door', or 'skylight'
 * @returns {Array} Formatted carousel options
 */
function transformToOptions(rows, type) {
    // Transform each row to option format
    const options = rows.map(row => {
        // Extract code (S1, M1, etc.) from the name
        const parts = row.Name.split('-');
        const code = parts[parts.length - 1];
        
        return {
            value: code,
            title: code,
            description: `${row['Opening Width(mm)']}mm × ${row['Opening Height (mm)']}mm (${row['Opening Area (m2)']}m²)`,
            image: `${type}-${code.toLowerCase()}.jpg`,
            quantity: true
        };
    });
    
    // Remove duplicates (same code might appear in different SKYLARK models)
    const uniqueOptions = [...new Map(options.map(item => 
        [item.value, item])).values()];
    
    return uniqueOptions;
}
