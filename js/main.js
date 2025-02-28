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
    setupLogo();
    setupSidebar();
    setupDropdowns();
    setupColorPicker();
    setupSpatialMap();
    setupToggleBackground();
    loadSavedState();
    
    // Attach event listeners to section buttons
    document.querySelectorAll('.section-button').forEach(button => {
        const sectionName = button.getAttribute('data-section');
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addSection(sectionName);
        });
    });
    
    // Open default section if no sections are active
    if (activeSections.length === 0) {
        addSection('Latest');
    }
});

// Setup Logo with UNIT3/UNITE interaction
function setupLogo() {
    const logoNumber = document.querySelector('.logo-number');
    let isUnit3 = true;

    if (logoNumber) {
        logoNumber.addEventListener('click', () => {
            logoNumber.classList.add('rotating');
            
            setTimeout(() => {
                if (isUnit3) {
                    logoNumber.textContent = 'E';
                    isUnit3 = false;
                } else {
                    logoNumber.textContent = '3';
                    isUnit3 = true;
                }
            }, 300);

            setTimeout(() => {
                logoNumber.classList.remove('rotating');
            }, 600);
        });
    }
}

// Setup sidebar
function setupSidebar() {
    const cornerResize = document.getElementById('cornerResize');
    if (!cornerResize) return;
    
    let isResizing = false;
    let startX;
    
    cornerResize.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        document.body.classList.add('resizing');
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
    });
    
    function handleResize(e) {
        if (!isResizing) return;
        
        const newWidth = Math.max(200, Math.min(400, e.clientX));
        
        // Update CSS variables
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
        cornerResize.style.left = `${newWidth}px`;
    }
    
    function stopResize() {
        if (!isResizing) return;
        
        isResizing = false;
        document.body.classList.remove('resizing');
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
        
        // Save sidebar width
        localStorage.setItem('sidebarWidth', document.documentElement.style.getPropertyValue('--sidebar-width'));
    }
}

// Setup dropdowns
function setupDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (trigger && content) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close all other dropdowns
                document.querySelectorAll('.dropdown-content').forEach(dc => {
                    if (dc !== content) {
                        dc.classList.remove('active');
                    }
                });
                
                // Toggle this dropdown
                content.classList.toggle('active');
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
    
    // Setup calendar if needed
    setupCalendar();
}

// Setup calendar
function setupCalendar() {
    const calendarDropdown = document.querySelector('.calendar-dropdown');
    if (!calendarDropdown) return;
    
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
    
    // Set the HTML and add event listeners
    calendarDropdown.innerHTML = calendarHTML;
}

// Color picker for theme
function setupColorPicker() {
    const colorPicker = document.getElementById('themeColor');
    if (!colorPicker) return;
    
    // Load saved theme color
    const savedColor = localStorage.getItem('themeColor');
    if (savedColor) {
        document.documentElement.style.setProperty('--theme-color', savedColor);
        colorPicker.value = savedColor;
    }
    
    // Update color on change
    colorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--theme-color', color);
        localStorage.setItem('themeColor', color);
    });
    
    // Setup section color picker
    setupSectionColorPicker();
}

// Section-specific color picker
function setupSectionColorPicker() {
    const colorPicker = document.getElementById('colorPicker');
    if (!colorPicker) return;
    
    // Setup color option buttons
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            const color = option.getAttribute('data-color');
            setSectionColor(currentSectionForColorPicker, color);
            colorPicker.classList.remove('active');
        });
    });
    
    // Setup custom color picker
    const customColorInput = document.getElementById('customSectionColor');
    if (customColorInput) {
        customColorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            setSectionColor(currentSectionForColorPicker, color);
        });
    }
    
    // Close button
    const closeBtn = colorPicker.querySelector('.close-picker');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            colorPicker.classList.remove('active');
        });
    }
}

// Set section color
function setSectionColor(sectionId, color) {
    if (!sectionId) return;
    
    // Save to state
    sectionColors[sectionId] = color;
    localStorage.setItem('sectionColors', JSON.stringify(sectionColors));
    
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
}

// Show color picker for section
function showColorPickerForSection(sectionId) {
    currentSectionForColorPicker = sectionId;
    
    const colorPicker = document.getElementById('colorPicker');
    if (!colorPicker) return;
    
    // Set current color
    const currentColor = sectionColors[sectionId] || getDefaultColorForSection(sectionId);
    document.getElementById('customSectionColor').value = currentColor;
    
    // Remove previous selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-color') === currentColor) {
            option.classList.add('selected');
        }
    });
    
    // Show picker
    colorPicker.classList.add('active');
}

// Toggle background theme
function setupToggleBackground() {
    const toggleBtn = document.getElementById('toggleBackground');
    if (!toggleBtn) return;
    
    // Load saved theme
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('theme-dark');
    }
    
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('theme-dark');
        localStorage.setItem('darkMode', document.body.classList.contains('theme-dark'));
    });
}

// Section management - add section
function addSection(name) {
    // Check if section already exists
    const existingSection = document.getElementById(`section-${name}`);
    if (existingSection) {
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
    
    // Add event listeners
    setupSectionInteractions(section, name);
    
    // Add to content area
    document.getElementById('contentArea').appendChild(section);
    
    // Add tab
    addSectionTab(name);
    
    // Save state
    saveState();
}

// Section tab management
function addSectionTab(name) {
    const tabsContainer = document.getElementById('sectionTabs');
    if (!tabsContainer) return;
    
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
}

// Focus on a section
function focusSection(name) {
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
}

// Close a section
function closeSection(name) {
    // Remove from active sections
    activeSections = activeSections.filter(s => s !== name);
    
    // Remove section element
    const section = document.getElementById(`section-${name}`);
    if (section) {
        section.classList.add('closing');
        setTimeout(() => section.remove(), 300);
    }
    
    // Remove tab
    const tab = document.querySelector(`.section-tab[data-section="${name}"]`);
    if (tab) {
        tab.classList.add('closing');
        setTimeout(() => tab.remove(), 300);
    }
    
    // Focus another section if this was active
    if (name === activeSection && activeSections.length > 0) {
        focusSection(activeSections[activeSections.length - 1]);
    } else if (activeSections.length === 0) {
        activeSection = null;
    }
    
    // Save state
    saveState();
}

// Toggle fullscreen mode
function toggleFullscreen(name) {
    const section = document.getElementById(`section-${name}`);
    if (!section) return;
    
    // Toggle fullscreen class
    section.classList.toggle('is-fullscreen');
    
    // Focus the section
    focusSection(name);
    
    // Save state
    saveState();
}

// Minimize section
function minimizeSection(name) {
    const section = document.getElementById(`section-${name}`);
    if (!section) return;
    
    const content = section.querySelector('.section-content');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
    
    // Save state
    saveState();
}

// Setup section interactions
function setupSectionInteractions(section, name) {
    // Fullscreen button
    const fullscreenBtn = section.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => toggleFullscreen(name));
    }
    
    // Minimize button
    const minimizeBtn = section.querySelector('.minimize-btn');
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => minimizeSection(name));
    }
    
    // Close button
    const closeBtn = section.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeSection(name));
    }
    
    // Color toggle button
    const colorToggle = section.querySelector('.section-color-toggle');
    if (colorToggle) {
        colorToggle.addEventListener('click', () => showColorPickerForSection(name));
    }
    
    // Drag to reorder
    section.addEventListener('dragstart', handleDragStart);
    section.addEventListener('dragend', handleDragEnd);
    section.addEventListener('dragover', handleDragOver);
    section.addEventListener('drop', handleDrop);
    
    // Resize handle
    const resizeHandle = section.querySelector('.resize-handle');
    if (resizeHandle) {
        setupResizeHandle(resizeHandle, section);
    }
    
    // Double click header to toggle fullscreen
    const header = section.querySelector('.section-header');
    if (header) {
        header.addEventListener('dblclick', () => toggleFullscreen(name));
    }
    
    // Click to focus
    section.addEventListener('click', () => focusSection(name));
}

// Section resizing
function setupResizeHandle(handle, section) {
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
        isResizing = false;
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
        
        // Save section state
        saveState();
    }
}

// Drag sections handlers
function handleDragStart(e) {
    draggedSection = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a transparent drag image
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-9999px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedSection = null;
    
    // Update sections order
    saveState();
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedSection || draggedSection === this) return;
    
    // Get positions
    const contentArea = document.getElementById('contentArea');
    const positions = Array.from(contentArea.querySelectorAll('.section')).map(el => {
        const rect = el.getBoundingClientRect();
        return {
            id: el.id,
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
    });
    
    // Calculate closest position
    let closestDistance = Infinity;
    let closestElement = null;
    let closestPosition = null;
    
    positions.forEach(pos => {
        if (pos.id === draggedSection.id) return;
        
        // Check distance to each corner
        const corners = [
            { x: pos.left, y: pos.top }, // Top-left
            { x: pos.left + pos.width, y: pos.top }, // Top-right
            { x: pos.left, y: pos.top + pos.height }, // Bottom-left
            { x: pos.left + pos.width, y: pos.top + pos.height } // Bottom-right
        ];
        
        corners.forEach(corner => {
            const distance = Math.sqrt(
                Math.pow(e.clientX - corner.x, 2) + 
                Math.pow(e.clientY - corner.y, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestElement = document.getElementById(pos.id);
                closestPosition = corner;
            }
        });
    });
    
    if (closestElement && closestDistance < 150) {
        // Determine if we should insert before or after
        const rect = closestElement.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const midY = rect.top + rect.height / 2;
        
        if (e.clientX < midX && e.clientY < midY) {
            contentArea.insertBefore(draggedSection, closestElement);
        } else {
            contentArea.insertBefore(draggedSection, closestElement.nextSibling);
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    saveState();
}

// Section content generator
function generateSectionContent(name) {
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
}

// Utility function to get default color for section
function getDefaultColorForSection(name) {
    const mainCategory = name.split(' ')[0];
    return defaultColors[name] || defaultColors[mainCategory] || '#4ecdc4';
}

// Setup spatial map
function setupSpatialMap() {
    const mapToggle = document.getElementById('toggleSpatialMap');
    const spatialMap = document.getElementById('spatialMap');
    if (!mapToggle || !spatialMap) return;
    
    // Toggle map view
    mapToggle.addEventListener('click', () => {
        spatialMap.classList.add('active');
    });
    
    // Close button
    const closeBtn = spatialMap.querySelector('.map-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            spatialMap.classList.remove('active');
        });
    }
    
    // Click on map rooms
    document.querySelectorAll('.map-section').forEach(section => {
        section.addEventListener('click', () => {
            const sectionName = section.getAttribute('data-section');
            if (sectionName) {
                addSection(sectionName);
                spatialMap.classList.remove('active');
            }
        });
    });
    
    // Click outside to close
    spatialMap.addEventListener('click', (e) => {
        if (e.target === spatialMap) {
            spatialMap.classList.remove('active');
        }
    });
}

// Save application state
function saveState() {
    // Save active sections with their state
    const sectionsState = activeSections.map(name => {
        const section = document.getElementById(`section-${name}`);
        return {
            name,
            fullscreen: section && section.classList.contains('is-fullscreen'),
            minimized: section && section.querySelector('.section-content').style.display === 'none',
            color: sectionColors[name] || getDefaultColorForSection(name),
            width: section ? section.style.width : null,
            height: section ? section.style.height : null,
            gridColumn: section ? section.style.gridColumn : null
        };
    });
    
    localStorage.setItem('sectionsState', JSON.stringify(sectionsState));
    localStorage.setItem('activeSection', activeSection);
    localStorage.setItem('sectionColors', JSON.stringify(sectionColors));
}

// Load saved state
function loadSavedState() {
    // Load section colors
    try {
        const savedColors = localStorage.getItem('sectionColors');
        if (savedColors) {
            sectionColors = JSON.parse(savedColors);
        }
    } catch (e) {
        console.error('Error loading section colors:', e);
    }
    
    // Load sections state
    try {
        const sectionsState = localStorage.getItem('sectionsState');
        const activeSection = localStorage.getItem('activeSection');
        
        if (sectionsState) {
            const sections = JSON.parse(sectionsState);
            
            // Clear content area first
            document.getElementById('contentArea').innerHTML = '';
            document.getElementById('sectionTabs').innerHTML = '';
            activeSections = [];
            
            // Add each section
            sections.forEach(section => {
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
            });
            
            // Focus the active section
            if (activeSection && activeSections.includes(activeSection)) {
                focusSection(activeSection);
            }
        }
    } catch (e) {
        console.error('Error loading sections state:', e);
    }
    
    // Load sidebar width
    try {
        const sidebarWidth = localStorage.getItem('sidebarWidth');
        if (sidebarWidth) {
            document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
            document.getElementById('cornerResize').style.left = sidebarWidth;
        }
    } catch (e) {
        console.error('Error loading sidebar width:', e);
    }
}