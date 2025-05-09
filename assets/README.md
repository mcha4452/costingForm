# Design Your GEO PLY Project Form Assets

This folder contains assets used in the project form.

## Emoji Usage

The form uses native emoji characters for the project type cards:

- 🏗️ (Construction Building) - Used for "Self Build Chassis"
- 🧰 (Toolbox) - Used for "Self Build Full Kit"
- 🏡 (House with Garden) - Used for "Turnkey Build"

These emoji characters are directly embedded in the HTML via JavaScript and don't require separate image files.

## Button Icons

The form uses Font Awesome icons from the included CDN for button iconography:

- `fa-bookmark` - For the bookmark button
- Other icons as needed throughout the interface

## Current Functionality

*   **Multi-Page Configuration:** A step-by-step form (currently 3 pages) guides users through the configuration process.
*   **Dynamic Form Generation:** Form structure, questions, and options are loaded dynamically from `questions.json`.
*   **Project Type Selection:** Users select a project type via interactive cards on the first page (`js/pages/ProjectTypePage.js`).
*   **Detailed Build Configuration (`js/pages/BuildDetailsPage.js`):
    *   Input fields for core building specifications.
    *   Selection of building dimensions (Length, Width, Height).
    *   **Dynamic Filtering:**
        *   Height and Width options are filtered based on the selected "Wall Depth" (using data from `dimensions.csv`).
        *   Window and Door options are also filtered based on "Wall Depth" (likely using `All BlocksOpenings.csv`).
    *   **Component Selection:** Interactive carousels are used for selecting Windows, Doors, Skylights, Cladding, and Roofing, including quantity inputs for openings.
    *   **Conditional Logic:** Form fields are shown/hidden based on the selected Project Type.
*   **Contact Information & Summary (`js/pages/ContactPage.js`):
    *   Collects user contact details.
    *   Displays a summary of the user's configuration choices.
*   **Input Validation:** Each step requires validation before proceeding.
*   **State Management:** A central `FormState` module (`js/core/FormState.js`) manages user selections and navigation.
*   **Local Submission Storage:** Completed configurations are saved to the browser's local storage (`js/utils/StorageManager.js`).
*   **Modular JavaScript:** Frontend logic is organized into core modules, utilities, UI components, and page-specific handlers within the `js/` directory.
*   **CSV Data Integration:** Uses PapaParse library to load configuration data from CSV files (`dimensions.csv`, `All BlocksOpenings.csv`).

## Structure

*   `index.html`: Main entry point, loads styles and main JavaScript module.
*   `style.css`: Contains all styling for the form.
*   `js/main.js`: Main application script, initializes modules, manages pages, and handles form submission.
*   `js/core/`: Contains core application logic (FormState, EventManager, FormBuilder).
*   `js/pages/`: Contains modules for each form page (ProjectType, BuildDetails, Contact).
*   `js/components/`: Reusable UI components (ProgressBar, CardSelection, CarouselSelection, FormFields).
*   `js/utils/`: Utility functions (Validation, DOM Helpers, Storage, CSV Loading).
*   `questions.json`: Defines the structure and content of the form pages.
*   `dimensions.csv`: Stores dimension options (Height, Width) filterable by wall depth.
*   `All BlocksOpenings.csv`: Likely stores data for Window and Door options.
*   `assets/`: Contains static assets, including this README.

## Setup

Simply open `index.html` in a web browser. No build step is required.

## Future Development

*   Integration with a backend or webhook (e.g., Zapier, mentioned in `js/main.js`) to process submissions.
*   Cost calculation based on selections.
*   Enhanced UI/UX features.
