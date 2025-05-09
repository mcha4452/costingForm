/**
 * openingsData.js
 * Direct parsing of the CSV data for doors and windows
 */

// Pre-parsed window and door data from CSV
const openingsData = {
    windows: [
        { 
            value: 'S1', 
            title: 'S1', 
            description: 'Height: 900mm\nWidth: 564mm (0.5m²)', 
            image: 'window-s1.jpg', 
            quantity: true 
        },
        { 
            value: 'M1', 
            title: 'M1', 
            description: 'Height: 1200mm\nWidth: 564mm (0.7m²)', 
            image: 'window-m1.jpg', 
            quantity: true 
        },
        { 
            value: 'L1', 
            title: 'L1', 
            description: 'Height: 1500mm\nWidth: 564mm (0.9m²)', 
            image: 'window-l1.jpg', 
            quantity: true 
        },
        { 
            value: 'XL1', 
            title: 'XL1', 
            description: 'Height: 1800mm\nWidth: 564mm (1.0m²)', 
            image: 'window-xl1.jpg', 
            quantity: true 
        },
        { 
            value: 'S2', 
            title: 'S2', 
            description: 'Height: 900mm\nWidth: 1164mm (1.1m²)', 
            image: 'window-s2.jpg', 
            quantity: true 
        },
        { 
            value: 'M2', 
            title: 'M2', 
            description: 'Height: 1200mm\nWidth: 1164mm (1.4m²)', 
            image: 'window-m2.jpg', 
            quantity: true 
        },
        { 
            value: 'L2', 
            title: 'L2', 
            description: 'Height: 1500mm\nWidth: 1164mm (1.8m²)', 
            image: 'window-l2.jpg', 
            quantity: true 
        },
        { 
            value: 'XL2', 
            title: 'XL2', 
            description: 'Height: 1800mm\nWidth: 1164mm (2.1m²)', 
            image: 'window-xl2.jpg', 
            quantity: true 
        },
        { 
            value: 'S3', 
            title: 'S3', 
            description: 'Height: 1500mm\nWidth: 564mm (0.9m²)', 
            image: 'window-s3.jpg', 
            quantity: true 
        },
        { 
            value: 'M3', 
            title: 'M3', 
            description: 'Height: 1800mm\nWidth: 564mm (1.0m²)', 
            image: 'window-m3.jpg', 
            quantity: true 
        },
        { 
            value: 'S4', 
            title: 'S4', 
            description: 'Height: 1500mm\nWidth: 1164mm (1.8m²)', 
            image: 'window-s4.jpg', 
            quantity: true 
        },
        { 
            value: 'M4', 
            title: 'M4', 
            description: 'Height: 1800mm\nWidth: 1164mm (2.1m²)', 
            image: 'window-m4.jpg', 
            quantity: true 
        },
        { 
            value: 'L3', 
            title: 'L3', 
            description: 'Height: 1800mm\nWidth: 564mm (1.0m²)', 
            image: 'window-l3.jpg', 
            quantity: true 
        },
        { 
            value: 'L4', 
            title: 'L4', 
            description: 'Height: 1800mm\nWidth: 1164mm (2.1m²)', 
            image: 'window-l4.jpg', 
            quantity: true 
        },
        { 
            value: 'XL3', 
            title: 'XL3', 
            description: 'Height: 2100mm\nWidth: 564mm (1.2m²)', 
            image: 'window-xl3.jpg', 
            quantity: true 
        },
        { 
            value: 'XL4', 
            title: 'XL4', 
            description: 'Height: 2100mm\nWidth: 1164mm (2.4m²)', 
            image: 'window-xl4.jpg', 
            quantity: true 
        }
    ],
    doors: [
        { 
            value: 'S1', 
            title: 'S1', 
            description: 'Height: 1932mm\nWidth: 1164mm (2.3m²)', 
            image: 'door-s1.jpg', 
            quantity: true 
        },
        { 
            value: 'M1', 
            title: 'M1', 
            description: 'Height: 2232mm\nWidth: 1164mm (2.6m²)', 
            image: 'door-m1.jpg', 
            quantity: true 
        },
        { 
            value: 'L1', 
            title: 'L1', 
            description: 'Height: 2532mm\nWidth: 1164mm (3.0m²)', 
            image: 'door-l1.jpg', 
            quantity: true 
        },
        { 
            value: 'XL1', 
            title: 'XL1', 
            description: 'Height: 2832mm\nWidth: 1164mm (3.3m²)', 
            image: 'door-xl1.jpg', 
            quantity: true 
        },
        { 
            value: 'S2', 
            title: 'S2', 
            description: 'Height: 1932mm\nWidth: 2328mm (4.5m²)', 
            image: 'door-s2.jpg', 
            quantity: true 
        },
        { 
            value: 'M2', 
            title: 'M2', 
            description: 'Height: 2232mm\nWidth: 2328mm (5.2m²)', 
            image: 'door-m2.jpg', 
            quantity: true 
        },
        { 
            value: 'L2', 
            title: 'L2', 
            description: 'Height: 2532mm\nWidth: 2328mm (5.9m²)', 
            image: 'door-l2.jpg', 
            quantity: true 
        },
        { 
            value: 'XL2', 
            title: 'XL2', 
            description: 'Height: 2832mm\nWidth: 2328mm (6.6m²)', 
            image: 'door-xl2.jpg', 
            quantity: true 
        }
    ]
};

/**
 * Get window and door data without relying on CSV loading
 * @returns {Object} Object with windows and doors arrays
 */
export function getOpeningsData() {
    return openingsData;
}
