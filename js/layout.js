/**
 * UNIT3 Layout System
 * Manages layout modes and section positioning
 */

// Layout mode constants
const LAYOUT_MODES = {
    GRID: 'grid',      // Organized grid layout
    FREEFORM: 'free'   // Freeform positioning
};

// Current layout mode
let currentLayoutMode = LAYOUT_MODES.GRID;

// Grid positions for organized layout
const gridPositions = {};

// Layout preferences
let layoutPreferences = {
    snapToGrid: true,
    autoArrange: true,
    preserveSize: true,
    animation: true
};

/**
 * Initialize layout system
 */
function initializeLayout() {
    // Load saved layout mode
    try {
        const savedMode = localStorage.getItem('layoutMode');
        if (savedMode && Object.values(LAYOUT_MODES).includes(savedMode)) {
            currentLayoutMode = savedMode;
        }
        
        // Load saved preferences
        const savedPreferences = localStorage.getItem('layoutPreferences');
        if (savedPreferences) {
            layoutPreferences = {...layoutPreferences, ...JSON.parse(savedPreferences)};
        }
    } catch (e) {
        console.error('Error loading layout preferences:', e);
    }
    
    // Apply initial layout mode
    document.body.setAttribute('data-layout-mode', currentLayoutMode);
    
    // Set up layout toggle button
    const layoutToggle = document.querySelector('.layout-toggle');
    if (layoutToggle) {
        layoutToggle.addEventListener('click', toggleLayoutMode);
        updateLayoutToggleIcon();
    }
}

/**
 * Toggle between layout modes
 */
function toggleLayoutMode() {
    currentLayoutMode = (currentLayoutMode === LAYOUT_MODES.GRID) ? 
        LAYOUT_MODES.FREEFORM : LAYOUT_MODES.GRID;
    
    // Apply to body attribute
    document.body.setAttribute('data-layout-mode', currentLayoutMode);
    
    // Update icon
    updateLayoutToggleIcon();
    
    // Apply layout to sections
    applyLayoutToSections();
    
    // Save preference
    try {
        localStorage.setItem('layoutMode', currentLayoutMode);
    } catch (e) {
        console.error('Error saving layout mode:', e);
    }
}

/**
 * Update layout toggle button icon
 */
function updateLayoutToggleIcon() {
    const layoutToggle = document.querySelector('.layout-toggle');
    if (!layoutToggle) return;
    
    if (currentLayoutMode === LAYOUT_MODES.GRID) {
        layoutToggle.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M3 9h18M9 21V9"></path>
            </svg>
        `;
        layoutToggle.setAttribute('title', 'Switch to Free Layout');
    } else {
        layoutToggle.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
            </svg>
        `;
        layoutToggle.setAttribute('title', 'Switch to Grid Layout');
    }
}

/**
 * Apply current layout mode to all sections
 */
function applyLayoutToSections() {
    const sections = document.querySelectorAll('.section');
    
    if (currentLayoutMode === LAYOUT_MODES.GRID) {
        // Grid layout - organize sections
        organizeGrid(sections);
    } else {
        // Free layout - enable dragging
        enableFreeDragging(sections);
    }
}

/**
 * Organize sections in a grid layout
 * @param {NodeList} sections - List of section elements
 */
function organizeGrid(sections) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    
    // Add grid class to content area
    contentArea.classList.add('grid-layout');
    contentArea.classList.remove('free-layout');
    
    // Reset sections for grid layout
    sections.forEach(section => {
        // Store current position before resetting
        const id = section.id.replace('section-', '');
        if (!gridPositions[id]) {
            const rect = section.getBoundingClientRect();
            gridPositions[id] = {
                left: section.style.left,
                top: section.style.top,
                width: section.style.width,
                height: section.style.height
            };
        }
        
        // Clear position styles for grid layout
        section.style.position = '';
        section.style.left = '';
        section.style.top = '';
        section.style.transform = '';
        
        // Add transition for smooth layout change if animation is enabled
        if (layoutPreferences.animation) {
            section.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Remove transition after animation completes
            setTimeout(() => {
                section.style.transition = '';
            }, 500);
        }
        
        // Apply size from grid positions if available and preserve size preference is enabled
        if (layoutPreferences.preserveSize && gridPositions[id]) {
            // For grid layouts, we use grid-column-span for width
            if (gridPositions[id].width) {
                const width = parseInt(gridPositions[id].width);
                if (width > 600) {
                    // Wide section spans 2 columns
                    section.style.gridColumn = 'span 2';
                } else {
                    // Regular section spans 1 column
                    section.style.gridColumn = 'span 1';
                }
            }
            
            // Heights are directly applied
            if (gridPositions[id].height) {
                section.style.height = gridPositions[id].height;
            }
        }
    });
}

/**
 * Enable free-form dragging for sections
 * @param {NodeList} sections - List of section elements
 */
function enableFreeDragging(sections) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    
    // Add free layout class to content area
    contentArea.classList.add('free-layout');
    contentArea.classList.remove('grid-layout');
    
    // Configure sections for free dragging
    sections.forEach(section => {
        const id = section.id.replace('section-', '');
        
        // Position absolute for free dragging
        section.style.position = 'absolute';
        
        // Restore saved position if available
        if (gridPositions[id]) {
            if (gridPositions[id].left) section.style.left = gridPositions[id].left;
            if (gridPositions[id].top) section.style.top = gridPositions[id].top;
            if (gridPositions[id].width) section.style.width = gridPositions[id].width;
            if (gridPositions[id].height) section.style.height = gridPositions[id].height;
        } else {
            // Default positioning if no saved position
            setRandomPosition(section);
        }
        
        // Add transition for smooth layout change if animation is enabled
        if (layoutPreferences.animation) {
            section.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Remove transition after animation completes
            setTimeout(() => {
                section.style.transition = '';
            }, 500);
        }
    });
}

/**
 * Position a section randomly within the content area
 * @param {Element} section - Section element to position
 */
function setRandomPosition(section) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    
    const contentRect = contentArea.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    
    // Generate random position within content area
    const maxLeft = contentRect.width - sectionRect.width;
    const maxTop = contentRect.height - sectionRect.height;
    
    const left = Math.floor(Math.random() * maxLeft);
    const top = Math.floor(Math.random() * maxTop);
    
    section.style.left = `${left}px`;
    section.style.top = `${top}px`;
}

/**
 * Save position of a section during drag
 * @param {string} id - Section ID
 * @param {Object} position - Position data
 */
function saveGridPosition(id, position) {
    gridPositions[id] = position;
}

/**
 * Set layout preferences
 * @param {Object} preferences - New preference settings
 */
function setLayoutPreferences(preferences) {
    layoutPreferences = {...layoutPreferences, ...preferences};
    
    // Save preferences
    try {
        localStorage.setItem('layoutPreferences', JSON.stringify(layoutPreferences));
    } catch (e) {
        console.error('Error saving layout preferences:', e);
    }
    
    // Apply changes immediately
    applyLayoutToSections();
}

/**
 * Get current layout mode
 * @return {string} Current layout mode
 */
function getLayoutMode() {
    return currentLayoutMode;
}

/**
 * Get layout preferences
 * @return {Object} Current layout preferences
 */
function getLayoutPreferences() {
    return {...layoutPreferences};
}

// Export functions
window.initializeLayout = initializeLayout;
window.toggleLayoutMode = toggleLayoutMode;
window.applyLayoutToSections = applyLayoutToSections;
window.saveGridPosition = saveGridPosition;
window.setLayoutPreferences = setLayoutPreferences;
window.getLayoutMode = getLayoutMode;
window.getLayoutPreferences = getLayoutPreferences;
window.LAYOUT_MODES = LAYOUT_MODES;
