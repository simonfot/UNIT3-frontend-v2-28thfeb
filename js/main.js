// Debug and compatibility handling
const DEBUG = window.UNIT3_DEBUG || false;
const COMPATIBILITY_MODE = window.UNIT3_COMPATIBILITY_MODE || false;

// Log helper
function log(...args) {
    if (DEBUG) {
        console.log('[UNIT3]', ...args);
        
        // Also show in debug console
        const debugConsole = document.getElementById('debugConsole');
        if (debugConsole) {
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            
            const msgElement = document.createElement('div');
            msgElement.className = 'debug-message';
            msgElement.textContent = message;
            debugConsole.appendChild(msgElement);
            
            // Auto-scroll
            debugConsole.scrollTop = debugConsole.scrollHeight;
        }
    }
}

// State Management
let activeSections = [];
let activeSection = null;
let draggedSection = null;
let sectionColors = {};
let isDragging = false;
let currentSectionForColorPicker = null;

// Default section colors
const defaultColors = {
    'Creates': '#ff6b6b',
    'Curates': '#4ecdc4',
    'Connects': '#95a5a6',
    'Latest': '#ffd93d',
    'Calendar': '#a8e6cf',
    'Menu': '#ff8b94',
    'By Day': '#6c5ce7',
    'By Night': '#fdcb6e',
    'Events': '#ff7675',
    'Exhibitions': '#74b9ff',
    'The Fungi Room': '#55efc4',
    'Creative Climate Collab': '#81ecec',
    'Directory': '#fab1a0',
    'Zine': '#ffeaa7',
    'Opportunities': '#dfe6e9',
    'News': '#a8e6cf',
    'Updates': '#81ecec'
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    log('DOMContentLoaded event fired');
    
    if (DEBUG) {
        document.body.classList.add('debug-mode');
    }
    
    try {
        // Initialize core components
        setupLogo();
        log('Logo setup complete');
        
        setupSidebar();
        log('Sidebar setup complete');
        
        setupDropdowns();
        log('Dropdowns setup complete');
        
        setupColorPicker();
        log('Color picker setup complete');
        
        setupSpatialMap();
        log('Spatial map setup complete');
        
        setupToggleBackground();
        log('Background toggle setup complete');
        
        // Initialize sections after core UI
        initializeSectionButtons();
        log('Section buttons initialized');
        
        loadSavedState();
        log('Saved state loaded');
        
        // Open default section if no sections are active
        if (activeSections.length === 0) {
            log('No active sections, opening default');
            addSection('Latest');
        }
        
        log('Initialization complete');
    } catch (err) {
        console.error('Error during initialization:', err);
        log('INITIALIZATION ERROR: ' + err.message);
        
        // Try to add fallback content
        try {
            if (typeof window.addDefaultSection === 'function') {
                window.addDefaultSection();
            }
        } catch (fallbackErr) {
            console.error('Error adding fallback section:', fallbackErr);
        }
    }
});

// Initialize section buttons with better error handling
function initializeSectionButtons() {
    log('Setting up section buttons');
    
    try {
        // Try multiple selector strategies to find all section buttons
        const buttons = document.querySelectorAll('.section-button, [data-section], .sidebar button');
        log(`Found ${buttons.length} potential section buttons`);
        
        // For each potential button
        buttons.forEach(button => {
            try {
                // Try to get a valid section name
                const sectionName = button.getAttribute('data-section') || 
                                  button.textContent.trim();
                
                if (!sectionName) {
                    return; // Skip buttons without a section name
                }
                
                log(`Adding click handler for section: ${sectionName}`);
                
                // Ensure clean event handling
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                
                // Add click event with full error handling
                newButton.addEventListener('click', function(e) {
                    log(`Section button clicked: ${sectionName}`);
                    
                    // Block normal event behavior
                    e.preventDefault();
                    e.stopPropagation();
                    
                    try {
                        // Try to add the section
                        addSection(sectionName);
                    } catch (err) {
                        console.error(`Error adding section ${sectionName}:`, err);
                        log(`ERROR adding section ${sectionName}: ${err.message}`);
                    }
                });
            } catch (buttonErr) {
                console.error('Error setting up section button:', buttonErr);
            }
        });
    } catch (err) {
        console.error('Error initializing section buttons:', err);
        log('ERROR initializing section buttons: ' + err.message);
    }
}

// Setup Logo with UNIT3/UNITE interaction
function setupLogo() {
    try {
        const logoNumber = document.querySelector('.logo-number');
        if (!logoNumber) {
            log('Logo number element not found');
            return;
        }
        
        let isUnit3 = true;

        logoNumber.addEventListener('click', () => {
            log('Logo clicked');
            logoNumber.classList.add('rotating');
            
            setTimeout(() => {
                if (isUnit3) {
                    logoNumber.textContent = 'E';
                    isUnit3 = false;
                    log('Logo changed to UNITE');
                } else {
                    logoNumber.textContent = '3';
                    isUnit3 = true;
                    log('Logo changed to UNIT3');
                }
            }, 300);

            setTimeout(() => {
                logoNumber.classList.remove('rotating');
            }, 600);
        });
    } catch (err) {
        console.error('Error setting up logo:', err);
        log('ERROR setting up logo: ' + err.message);
    }
}

// Setup sidebar
function setupSidebar() {
    try {
        const cornerResize = document.getElementById('cornerResize');
        if (!cornerResize) {
            log('Corner resize element not found');
            return;
        }
        
        let isResizing = false;
        let startX;
        
        cornerResize.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            document.body.classList.add('resizing');
            
            // Use event capturing to ensure we get all mouse events
            document.addEventListener('mousemove', handleResize, true);
            document.addEventListener('mouseup', stopResize, true);
        });
        
        function handleResize(e) {
            if (!isResizing) return;
            
            const newWidth = Math.max(200, Math.min(400, e.clientX));
            
            // Update CSS variables
            document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
            cornerResize.style.left = `${newWidth}px`;
        }
        
        function stopResize(e) {
            if (!isResizing) return;
            
            isResizing = false;
            document.body.classList.remove('resizing');
            document.removeEventListener('mousemove', handleResize, true);
            document.removeEventListener('mouseup', stopResize, true);
            
            // Save sidebar width
            try {
                localStorage.setItem('sidebarWidth', document.documentElement.style.getPropertyValue('--sidebar-width') || '250px');
            } catch (err) {
                log('ERROR saving sidebar width: ' + err.message);
            }
        }
        
        // Restore saved width
        try {
            const savedWidth = localStorage.getItem('sidebarWidth');
            if (savedWidth) {
                document.documentElement.style.setProperty('--sidebar-width', savedWidth);
                cornerResize.style.left = savedWidth;
                log('Restored sidebar width: ' + savedWidth);
            }
        } catch (err) {
            log('ERROR restoring sidebar width: ' + err.message);
        }
    } catch (err) {
        console.error('Error setting up sidebar:', err);
        log('ERROR setting up sidebar: ' + err.message);
    }
}

// Setup dropdowns with better error handling
function setupDropdowns() {
    try {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            try {
                const trigger = dropdown.querySelector('.dropdown-trigger');
                const content = dropdown.querySelector('.dropdown-content');
                
                if (!trigger || !content) return;
                
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Toggle this dropdown
                    const isActive = content.classList.contains('active');
                    
                    // First close all dropdowns
                    document.querySelectorAll('.dropdown-content').forEach(d => {
                        d.classList.remove('active');
                    });
                    
                    // Then open this one if it was closed
                    if (!isActive) {
                        content.classList.add('active');
                        log(`Opened dropdown: ${trigger.textContent.trim()}`);
                    }
                });
            } catch (err) {
                console.error('Error setting up dropdown:', err);
            }
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-content.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        });
        
        // Setup calendar if needed
        setupCalendar();
    } catch (err) {
        console.error('Error setting up dropdowns:', err);
        log('ERROR setting up dropdowns: ' + err.message);
    }
}

// Setup calendar
function setupCalendar() {
    try {
        const calendarDropdown = document.querySelector('.calendar-dropdown');
        if (!calendarDropdown) {
            log('Calendar dropdown not found');
            return;
        }
        
        const events = [
            { date: '2025-02-20', title: 'DJ Night', time: '20:00', type: 'event' },
            { date: '2025-02-22', title: 'Coffee Workshop', time: '14:00', type: 'workshop' },
            { date: '2025-02-25', title: 'Art Exhibition', time: '18:00', type: 'exhibition' }
        ];
        
        const currentDate = new Date();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        
        let calendarHTML = `
            <div class="calendar-header">
                <span>${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}</span>
            </div>
            <div class="calendar-grid">
                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                    `<div class="calendar-day day-name">${day}</div>`
                ).join('')}
        `;
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEvent = events.some(event => event.date === date);
            const isToday = day === currentDate.getDate();
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" data-date="${date}">
                    ${day}
                </div>
            `;
        }
        
        // Close the calendar grid
        calendarHTML += `</div>
            <div class="calendar-events">
                <h3>Upcoming Events</h3>
                ${events.map(event => `
                    <div class="calendar-event">
                        <div class="event-title">${event.title}</div>
                        <div class="event-time">${event.date} at ${event.time}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Set the HTML
        calendarDropdown.innerHTML = calendarHTML;
        
        // Add event listeners for days with events
        document.querySelectorAll('.calendar-day.has-event').forEach(day => {
            day.addEventListener('click', () => {
                const date = day.getAttribute('data-date');
                const event = events.find(e => e.date === date);
                if (event) {
                    addSection(event.title);
                    
                    // Close dropdown
                    calendarDropdown.classList.remove('active');
                }
            });
        });
        
        log('Calendar setup complete');
    } catch (err) {
        console.error('Error setting up calendar:', err);
        log('ERROR setting up calendar: ' + err.message);
    }
}

// Color picker for theme
function setupColorPicker() {
    try {
        const colorPicker = document.getElementById('themeColor');
        if (!colorPicker) {
            log('Theme color picker not found');
            return;
        }
        
        // Load saved theme color
        let savedColor = '#4ecdc4'; // Default color
        try {
            const storedColor = localStorage.getItem('themeColor');
            if (storedColor) {
                savedColor = storedColor;
                log('Restored theme color: ' + savedColor);
            }
        } catch (err) {
            log('ERROR loading saved theme color: ' + err.message);
        }
        
        // Set initial color
        document.documentElement.style.setProperty('--theme-color', savedColor);
        colorPicker.value = savedColor;
        
        // Update color on input and change events
        colorPicker.addEventListener('input', updateThemeColor);
        colorPicker.addEventListener('change', updateThemeColor);
        
        function updateThemeColor(e) {
            const color = e.target.value;
            document.documentElement.style.setProperty('--theme-color', color);
            
            try {
                localStorage.setItem('themeColor', color);
            } catch (err) {
                log('ERROR saving theme color: ' + err.message);
            }
            
            log('Theme color updated: ' + color);
        }
        
        // Setup section color picker
        setupSectionColorPicker();
    } catch (err) {
        console.error('Error setting up color picker:', err);
        log('ERROR setting up color picker: ' + err.message);
    }
}

// Section-specific color picker
function setupSectionColorPicker() {
    try {
        const colorPicker = document.getElementById('colorPicker');
        if (!colorPicker) {
            log('Section color picker not found');
            return;
        }
        
        // Setup color option buttons
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                const color = option.getAttribute('data-color');
                if (color && currentSectionForColorPicker) {
                    setSectionColor(currentSectionForColorPicker, color);
                    colorPicker.classList.remove('active');
                    log(`Section color set: ${currentSectionForColorPicker} -> ${color}`);
                }
            });
        });
        
        // Setup custom color picker
        const customColorInput = document.getElementById('customSectionColor');
        if (customColorInput) {
            customColorInput.addEventListener('input', (e) => {
                const color = e.target.value;
                if (color && currentSectionForColorPicker) {
                    setSectionColor(currentSectionForColorPicker, color);
                    log(`Custom section color set: ${currentSectionForColorPicker} -> ${color}`);
                }
            });
        }
        
        // Close button
        const closeBtn = colorPicker.querySelector('.close-picker');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                colorPicker.classList.remove('active');
            });
        }
    } catch (err) {
        console.error('Error setting up section color picker:', err);
        log('ERROR setting up section color picker: ' + err.message);
    }
}

// Set section color
function setSectionColor(sectionId, color) {
    try {
        if (!sectionId || !color) return;
        
        // Save to state
        sectionColors[sectionId] = color;
        
        try {
            localStorage.setItem('sectionColors', JSON.stringify(sectionColors));
        } catch (err) {
            log('ERROR saving section colors: ' + err.message);
        }
        
        // Update section
        const section = document.getElementById(`section-${sectionId}`);
        if (section) {
            section.style.setProperty('--section-color', color);
        }
        
        // Update tab
        const tab = document.querySelector(`.section-tab[data-section="${sectionId}"]`);
        if (tab) {
            tab.style.setProperty('--section-color', color);
        }
        
        log(`Section color applied: ${sectionId} -> ${color}`);
    } catch (err) {
        console.error('Error setting section color:', err);
        log('ERROR setting section color: ' + err.message);
    }
}

// Show color picker for section
function showColorPickerForSection(sectionId) {
    try {
        currentSectionForColorPicker = sectionId;
        
        const colorPicker = document.getElementById('colorPicker');
        if (!colorPicker) return;
        
        // Set current color
        const currentColor = sectionColors[sectionId] || getDefaultColorForSection(sectionId);
        const customColorInput = document.getElementById('customSectionColor');
        if (customColorInput) {
            customColorInput.value = currentColor;
        }
        
        // Remove previous selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-color') === currentColor) {
                option.classList.add('selected');
            }
        });
        
        // Show picker
        colorPicker.classList.add('active');
        log(`Color picker shown for section: ${sectionId}`);
    } catch (err) {
        console.error('Error showing color picker:', err);
        log('ERROR showing color picker: ' + err.message);
    }
}

// Toggle background theme
function setupToggleBackground() {
    try {
        const toggleBtn = document.getElementById('toggleBackground');
        if (!toggleBtn) {
            log('Background toggle button not found');
            return;
        }
        
        // Load saved theme
        try {
            if (localStorage.getItem('darkMode') === 'true') {
                document.body.classList.add('theme-dark');
                log('Dark mode activated from saved state');
            }
        } catch (err) {
            log('ERROR loading theme preference: ' + err.message);
        }
        
        toggleBtn.addEventListener('click', () => {
            const isDarkMode = document.body.classList.toggle('theme-dark');
            log('Theme toggled: ' + (isDarkMode ? 'dark' : 'light'));
            
            try {
                localStorage.setItem('darkMode', isDarkMode.toString());
            } catch (err) {
                log('ERROR saving theme preference: ' + err.message);
            }
        });
    } catch (err) {
        console.error('Error setting up background toggle:', err);
        log('ERROR setting up background toggle: ' + err.message);
    }
}

// Section management - add section
function addSection(name) {
    log(`Adding section: ${name}`);
    
    try {
        // Check if section already exists
        const existingSection = document.getElementById(`section-${name}`);
        if (existingSection) {
            log(`Section already exists: ${name}`);
            focusSection(name);
            return;
        }
        
        // Add to active sections
        activeSections.push(name);
        activeSection = name;
        
        // Create section element
        const section = document.createElement('div');
        section.className = 'section active';
        section.id = `section-${name}`;
        section.setAttribute('draggable', 'true');
        
        // Get section color
        const sectionColor = sectionColors[name] || getDefaultColorForSection(name);
        section.style.setProperty('--section-color', sectionColor);
        
        // Generate content
        const content = generateSectionContent(name);
        
        // Create section HTML
        section.innerHTML = `
            <div class="section-header">
                <button class="section-color-toggle" title="Change section color"></button>
                <div class="section-title">${name}</div>
                <div class="section-controls">
                    <button class="section-control-btn fullscreen-btn" title="Toggle fullscreen">⛶</button>
                    <button class="section-control-btn minimize-btn" title="Minimize">-</button>
                    <button class="section-control-btn close-btn" title="Close">×</button>
                </div>
            </div>
            <div class="section-content">
                ${content}
            </div>
            <div class="resize-handle" title="Resize section"></div>
        `;
        
        // Add to content area
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) {
            throw new Error('Content area not found');
        }
        
        contentArea.appendChild(section);
        
        // Setup interactions
        setupSectionInteractions(section, name);
        
        // Add tab
        addSectionTab(name);
        
        // Save state
        saveState();
        
        log(`Section added: ${name}`);
    } catch (err) {
        console.error(`Error adding section ${name}:`, err);
        log(`ERROR adding section ${name}: ${err.message}`);
        
        // Try to add a fallback section in case of critical error
        if (name === 'Latest' && typeof window.addDefaultSection === 'function') {
            window.addDefaultSection();
        }
    }
}

// Section tab management
function addSectionTab(name) {
    log(`Adding tab for section: ${name}`);
    
    try {
        const tabsContainer = document.getElementById('sectionTabs');
        if (!tabsContainer) {
            log('Section tabs container not found');
            return;
        }
        
        // Check if tab already exists
        const existingTab = tabsContainer.querySelector(`.section-tab[data-section="${name}"]`);
        if (existingTab) {
            log(`Tab already exists: ${name}`);
            return;
        }
        
        // Create tab
        const tab = document.createElement('div');
        tab.className = 'section-tab';
        tab.classList.toggle('active', name === activeSection);
        tab.setAttribute('data-section', name);
        tab.style.setProperty('--section-color', sectionColors[name] || getDefaultColorForSection(name));
        
        tab.innerHTML = `
            <span class="tab-text">${name}</span>
            <button class="section-tab-close" title="Close ${name}">×</button>
        `;
        
        // Click to focus section
        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('section-tab-close')) {
                focusSection(name);
            }
        });
        
        // Close button
        const closeBtn = tab.querySelector('.section-tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSection(name);
        });
        
        // Add to container
        tabsContainer.appendChild(tab);
        log(`Tab added: ${name}`);
    } catch (err) {
        console.error(`Error adding tab for ${name}:`, err);
        log(`ERROR adding tab for ${name}: ${err.message}`);
    }
}

// Focus on a section
function focusSection(name) {
    log(`Focusing section: ${name}`);
    
    try {
        // Update active section
        activeSection = name;
        
        // Update active tabs
        document.querySelectorAll('.section-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-section') === name);
        });
        
        // Update active sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', section.id === `section-${name}`);
        });
        
        // Scroll section into view if it's not in fullscreen
        const section = document.getElementById(`section-${name}`);
        if (section && !section.classList.contains('is-fullscreen')) {
            section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Save state
        saveState();
        
        log(`Section focused: ${name}`);
    } catch (err) {
        console.error(`Error focusing section ${name}:`, err);
        log(`ERROR focusing section ${name}: ${err.message}`);
    }
}

// Close a section
function closeSection(name) {
    log(`Closing section: ${name}`);
    
    try {
        // Remove from active sections
        activeSections = activeSections.filter(s => s !== name);
        
        // Remove section element
        const section = document.getElementById(`section-${name}`);
        if (section) {
            section.classList.add('closing');
            setTimeout(() => {
                try {
                    if (section.parentNode) {
                        section.parentNode.removeChild(section);
                    }
                } catch (err) {
                    log(`ERROR removing section element: ${err.message}`);
                }
            }, 300);
        }
        
        // Remove tab
        const tab = document.querySelector(`.section-tab[data-section="${name}"]`);
        if (tab) {
            tab.classList.add('closing');
            setTimeout(() => {
                try {
                    if (tab.parentNode) {
                        tab.parentNode.removeChild(tab);
                    }
                } catch (err) {
                    log(`ERROR removing tab element: ${err.message}`);
                }
            }, 300);
        }
        
        // Focus another section if this was active
        if (name === activeSection && activeSections.length > 0) {
            focusSection(activeSections[activeSections.length - 1]);
        } else if (activeSections.length === 0) {
            activeSection = null;
        }
        
        // Save state
        saveState();
        
        log(`Section closed: ${name}`);
    } catch (err) {
        console.error(`Error closing section ${name}:`, err);
        log(`ERROR closing section ${name}: ${err.message}`);
    }
}

// Toggle fullscreen mode
function toggleFullscreen(name) {
    log(`Toggling fullscreen for section: ${name}`);
    
    try {
        const section = document.getElementById(`section-${name}`);
        if (!section) return;
        
        // Toggle fullscreen class
        section.classList.toggle('is-fullscreen');
        
        // Focus the section
        focusSection(name);
        
        // Save state
        saveState();
        
        log(`Fullscreen toggled for ${name}: ${section.classList.contains('is-fullscreen')}`);
    } catch (err) {
        console.error(`Error toggling fullscreen for ${name}:`, err);
        log(`ERROR toggling fullscreen for ${name}: ${err.message}`);
    }
}

// Minimize section
function minimizeSection(name) {
    log(`Toggling minimize for section: ${name}`);
    
    try {
        const section = document.getElementById(`section-${name}`);
        if (!section) return;
        
        const content = section.querySelector('.section-content');
        const isMinimized = content.style.display === 'none';
        
        content.style.display = isMinimized ? 'block' : 'none';
        
        // Save state
        saveState();
        
        log(`Section ${name} ${isMinimized ? 'expanded' : 'minimized'}`);
    } catch (err) {
        console.error(`Error minimizing section ${name}:`, err);
        log(`ERROR minimizing section ${name}: ${err.message}`);
    }
}

// Setup section interactions
function setupSectionInteractions(section, name) {
    log(`Setting up interactions for section: ${name}`);
    
    try {
        // Fullscreen button
        const fullscreenBtn = section.querySelector('.fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                log(`Fullscreen button clicked for: ${name}`);
                toggleFullscreen(name);
            });
        }
        
        // Minimize button
        const minimizeBtn = section.querySelector('.minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                log(`Minimize button clicked for: ${name}`);
                minimizeSection(name);
            });
        }
        
        // Close button
        const closeBtn = section.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                log(`Close button clicked for: ${name}`);
                closeSection(name);
            });
        }
        
        // Color toggle button
        const colorToggle = section.querySelector('.section-color-toggle');
        if (colorToggle) {
            colorToggle.addEventListener('click', () => {
                log(`Color toggle clicked for: ${name}`);
                showColorPickerForSection(name);
            });
        }
        
        // Drag to reorder only if browser supports it
        if (!COMPATIBILITY_MODE) {
            section.addEventListener('dragstart', handleDragStart);
            section.addEventListener('dragend', handleDragEnd);
            section.addEventListener('dragover', handleDragOver);
            section.addEventListener('drop', handleDrop);
        }
        
        // Resize handle
        const resizeHandle = section.querySelector('.resize-handle');
        if (resizeHandle) {
            setupResizeHandle(resizeHandle, section);
        }
        
        // Double click header to toggle fullscreen
        const header = section.querySelector('.section-header');
        if (header) {
            header.addEventListener('dblclick', () => {
                log(`Header double-clicked for: ${name}`);
                toggleFullscreen(name);
            });
        }
        
        // Click to focus
        section.addEventListener('click', () => {
            focusSection(name);
        });
        
        log(`Interactions setup complete for section: ${name}`);
    } catch (err) {
        console.error(`Error setting up interactions for section ${name}:`, err);
        log(`ERROR setting up interactions for section ${name}: ${err.message}`);
    }
}

// Section resizing
function setupResizeHandle(handle, section) {
    try {
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = section.offsetWidth;
            startHeight = section.offsetHeight;
            
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
            e.preventDefault();
            
            log('Section resize started');
        });
        
        function handleResize(e) {
            if (!isResizing) return;
            
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);
            
            // Implement different behaviors based on section size
            if (newWidth >= 700) {
                // Large section - span 2 columns
                section.style.gridColumn = 'span 2';
            } else {
                // Normal section - span 1 column
                section.style.gridColumn = 'span 1';
            }
            
            section.style.width = `${Math.max(300, newWidth)}px`;
            section.style.height = `${Math.max(200, newHeight)}px`;
        }
        
        function stopResize() {
            if (!isResizing) return;
            
            isResizing = false;
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
            
            // Save section state
            saveState();
            
            log('Section resize ended');
        }
    } catch (err) {
        console.error('Error setting up resize handle:', err);
        log('ERROR setting up resize handle: ' + err.message);
    }
}

// Drag sections handlers - simplified for compatibility
function handleDragStart(e) {
    try {
        draggedSection = this;
        this.classList.add('dragging');
        
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            
            // Create a transparent drag image if supported
            try {
                const dragImage = document.createElement('div');
                dragImage.style.position = 'absolute';
                dragImage.style.top = '-9999px';
                document.body.appendChild(dragImage);
                e.dataTransfer.setDragImage(dragImage, 0, 0);
                setTimeout(() => {
                    if (dragImage.parentNode) {
                        dragImage.parentNode.removeChild(dragImage);
                    }
                }, 0);
            } catch (imageErr) {
                log('Drag image not supported');
            }
        }
        
        log('Section drag started');
    } catch (err) {
        console.error('Error starting drag:', err);
        log('ERROR starting drag: ' + err.message);
    }
}

function handleDragEnd(e) {
    try {
        if (this) {
            this.classList.remove('dragging');
        }
        draggedSection = null;
        
        // Update sections order
        saveState();
        
        log('Section drag ended');
    } catch (err) {
        console.error('Error ending drag:', err);
        log('ERROR ending drag: ' + err.message);
    }
}

function handleDragOver(e) {
    try {
        e.preventDefault();
        
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
        
        if (!draggedSection || draggedSection === this) return;
        
        // Get positions - simplified for better compatibility
        const contentArea = document.getElementById('contentArea');
        const allSections = Array.from(contentArea.querySelectorAll('.section'));
        const draggedIndex = allSections.indexOf(draggedSection);
        const targetIndex = allSections.indexOf(this);
        
        // Simple before/after logic
        if (draggedIndex < targetIndex) {
            // Insert after
            if (this.nextSibling) {
                contentArea.insertBefore(draggedSection, this.nextSibling);
            } else {
                contentArea.appendChild(draggedSection);
            }
        } else {
            // Insert before
            contentArea.insertBefore(draggedSection, this);
        }
    } catch (err) {
        console.error('Error during drag over:', err);
        log('ERROR during drag over: ' + err.message);
    }
}

function handleDrop(e) {
    try {
        e.preventDefault();
        saveState();
    } catch (err) {
        console.error('Error handling drop:', err);
        log('ERROR handling drop: ' + err.message);
    }
}

// Section content generator - simplified version with error handling
function generateSectionContent(name) {
    try {
        const placeholders = {
            'Menu': `
                <h3>Daily Menu</h3>
                <div class="menu-section">
                    <h4>Coffee</h4>
                    <p>Espresso • Americano • Latte • Cappuccino</p>
                    <p>Batch Brew • V60 • Aeropress</p>
                    <h4>Tea Selection</h4>
                    <p>English Breakfast • Earl Grey • Green • Herbal</p>
                </div>
                <div class="menu-section">
                    <h4>Food</h4>
                    <p>Fresh Sandwiches • Daily Specials • Local Pastries</p>
                    <p>Seasonal Salads • Homemade Soups</p>
                </div>
            `,
            'By Day': `
                <h3>Daytime at UNIT3</h3>
                <p>A creative space for work, meetings, and community (9am - 4pm)</p>
                <div class="day-section">
                    <h4>Workspace</h4>
                    <p>Free WiFi • Power Outlets • Natural Light</p>
                    <h4>Coffee Service</h4>
                    <p>Specialty Coffee • Loose Leaf Teas • Fresh Pastries</p>
                    <h4>Community</h4>
                    <p>Regular Events • Workshops • Creative Meetups</p>
                </div>
            `,
            'By Night': `
                <h3>Evening at UNIT3</h3>
                <p>Events, exhibitions, and entertainment (6pm - 10pm)</p>
                <div class="night-section">
                    <h4>Regular Events</h4>
                    <p>DJ Nights • Art Shows • Pop-up Dinners</p>
                    <h4>Community Gatherings</h4>
                    <p>Creative Workshops • Music Events • Art Classes</p>
                    <h4>Special Features</h4>
                    <p>Local Artist Showcases • Live Music • Community Events</p>
                </div>
            `,
            'The Fungi Room': `
                <h3>The Fungi Room</h3>
                <p>Exploring the fascinating world of mushrooms</p>
                <div class="fungi-content">
                    <h4>Current Grows</h4>
                    <p>Lions Mane • Oyster • Reishi</p>
                    <h4>Upcoming Workshops</h4>
                    <p>Growing Basics • Medicinal Mushrooms • Cultivation Techniques</p>
                    <h4>Research Projects</h4>
                    <p>Mycelium Materials • Soil Health • Urban Farming</p>
                </div>
            `,
            'Latest': `
                <h3>Latest Updates</h3>
                <div class="updates-section">
                    <h4>Recent News</h4>
                    <p>Latest events, workshops, and community updates</p>
                    <h4>Upcoming</h4>
                    <p>New exhibitions • Pop-up events • Special collaborations</p>
                </div>
            `
        };

        return placeholders[name] || `
            <div class="placeholder-content">
                <h3>${name}</h3>
                <p>Content for ${name} section is being developed...</p>
            </div>
        `;
    } catch (err) {
        console.error(`Error generating content for ${name}:`, err);
        log(`ERROR generating content for ${name}: ${err.message}`);
        
        // Return simple fallback content
        return `<p>Content for ${name}</p>`;
    }
}

// Utility function to get default color for section
function getDefaultColorForSection(name) {
    try {
        if (!name) return '#4ecdc4';
        
        // Try direct match first
        if (defaultColors[name]) {
            return defaultColors[name];
        }
        
        // Try matching by first word
        const mainCategory = name.split(' ')[0];
        if (defaultColors[mainCategory]) {
            return defaultColors[mainCategory];
        }
        
        // Default fallback
        return '#4ecdc4';
    } catch (err) {
        log(`ERROR getting default color: ${err.message}`);
        return '#4ecdc4';
    }
}

// Setup spatial map with improved error handling
function setupSpatialMap() {
    try {
        const mapToggle = document.getElementById('toggleSpatialMap');
        const spatialMap = document.getElementById('spatialMap');
        if (!mapToggle || !spatialMap) {
            log('Spatial map elements not found');
            return;
        }
        
        // Toggle map view
        mapToggle.addEventListener('click', () => {
            spatialMap.classList.add('active');
            log('Spatial map opened');
        });
        
        // Close button
        const closeBtn = spatialMap.querySelector('.map-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                spatialMap.classList.remove('active');
                log('Spatial map closed');
            });
        }
        
        // Click on map rooms
        document.querySelectorAll('.map-section').forEach(section => {
            try {
                const sectionName = section.getAttribute('data-section');
                if (!sectionName) return;
                
                section.addEventListener('click', () => {
                    log(`Map section clicked: ${sectionName}`);
                    addSection(sectionName);
                    spatialMap.classList.remove('active');
                });
            } catch (err) {
                console.error('Error setting up map section:', err);
            }
        });
        
        // Click outside to close
        spatialMap.addEventListener('click', (e) => {
            if (e.target === spatialMap) {
                spatialMap.classList.remove('active');
                log('Spatial map closed (clicked outside)');
            }
        });
    } catch (err) {
        console.error('Error setting up spatial map:', err);
        log('ERROR setting up spatial map: ' + err.message);
    }
}

// Save application state with careful error handling
function saveState() {
    try {
        // Don't save state in compatibility mode
        if (COMPATIBILITY_MODE) {
            log('Not saving state in compatibility mode');
            return;
        }
        
        // Save active sections with their state
        const sectionsState = activeSections.map(name => {
            try {
                const section = document.getElementById(`section-${name}`);
                return {
                    name,
                    fullscreen: section ? section.classList.contains('is-fullscreen') : false,
                    minimized: section && section.querySelector('.section-content') 
                        ? section.querySelector('.section-content').style.display === 'none' 
                        : false,
                    color: sectionColors[name] || getDefaultColorForSection(name),
                    width: section ? section.style.width : null,
                    height: section ? section.style.height : null,
                    gridColumn: section ? section.style.gridColumn : null
                };
            } catch (err) {
                log(`Error saving section state for ${name}: ${err.message}`);
                return { name }; // Minimal fallback
            }
        });
        
        try {
            localStorage.setItem('sectionsState', JSON.stringify(sectionsState));
            localStorage.setItem('activeSection', activeSection || '');
            localStorage.setItem('sectionColors', JSON.stringify(sectionColors));
            
            log('State saved successfully');
        } catch (storageErr) {
            log(`ERROR saving to localStorage: ${storageErr.message}`);
        }
    } catch (err) {
        console.error('Error saving application state:', err);
        log('ERROR saving application state: ' + err.message);
    }
}

// Load saved state with careful error handling
function loadSavedState() {
    log('Loading saved state');
    
    try {
        // Skip in compatibility mode
        if (COMPATIBILITY_MODE) {
            log('Skipping state loading in compatibility mode');
            return;
        }
        
        // Load section colors
        try {
            const savedColors = localStorage.getItem('sectionColors');
            if (savedColors) {
                sectionColors = JSON.parse(savedColors);
                log(`Loaded ${Object.keys(sectionColors).length} section colors`);
            }
        } catch (err) {
            console.error('Error loading section colors:', err);
            log('ERROR loading section colors: ' + err.message);
        }
        
        // Load sections state
        try {
            const sectionsState = localStorage.getItem('sectionsState');
            const activeSection = localStorage.getItem('activeSection');
            
            if (sectionsState) {
                const sections = JSON.parse(sectionsState);
                log(`Found ${sections.length} saved sections`);
                
                // Clear content area and tabs
                const contentArea = document.getElementById('contentArea');
                const sectionTabs = document.getElementById('sectionTabs');
                
                if (contentArea) contentArea.innerHTML = '';
                if (sectionTabs) sectionTabs.innerHTML = '';
                activeSections = [];
                
                // Add each section
                sections.forEach(section => {
                    if (!section || !section.name) return;
                    
                    try {
                        addSection(section.name);
                        
                        // Apply saved state
                        const sectionEl = document.getElementById(`section-${section.name}`);
                        if (sectionEl) {
                            // Apply size
                            if (section.width) sectionEl.style.width = section.width;
                            if (section.height) sectionEl.style.height = section.height;
                            if (section.gridColumn) sectionEl.style.gridColumn = section.gridColumn;
                            
                            // Apply states
                            if (section.fullscreen) {
                                toggleFullscreen(section.name);
                            }
                            
                            if (section.minimized) {
                                minimizeSection(section.name);
                            }
                        }
                    } catch (sectionErr) {
                        log(`Error restoring section ${section.name}: ${sectionErr.message}`);
                    }
                });
                
                // Focus the active section
                if (activeSection && activeSections.includes(activeSection)) {
                    focusSection(activeSection);
                }
                
                log('Section state restored successfully');
            }
        } catch (err) {
            console.error('Error loading sections state:', err);
            log('ERROR loading sections state: ' + err.message);
        }
    } catch (err) {
        console.error('Error loading saved state:', err);
        log('ERROR loading saved state: ' + err.message);
    }
}

// Initialize the debug mode
if (DEBUG) {
    log('Debug mode initialized');
    
    // Show the debug console and activate debug mode
    const debugConsole = document.getElementById('debugConsole');
    if (debugConsole) {
        debugConsole.style.display = 'block';
    }
    
    // Make debug console toggle-able with a key combination
    document.addEventListener('keydown', (e) => {
        // Alt+D
        if (e.altKey && e.key === 'd') {
            debugConsole.style.display = debugConsole.style.display === 'none' ? 'block' : 'none';
            log('Debug console toggled');
        }
    });
}

// Expose key functions globally for debugging and fallback
window.addSection = addSection;
window.focusSection = focusSection;
window.closeSection = closeSection;
window.toggleFullscreen = toggleFullscreen;
window.minimizeSection = minimizeSection;
window.showColorPickerForSection = showColorPickerForSection;
window.UNIT3_log = log;