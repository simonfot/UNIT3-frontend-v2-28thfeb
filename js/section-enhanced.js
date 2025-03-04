/**
 * UNIT3 Enhanced Section System
 * Advanced section management with adaptive templates and relationships
 */

// Section view modes
const SECTION_VIEW_MODES = {
    COMPACT: 'compact',
    DETAILED: 'detailed',
    EXPANDED: 'expanded'
};

// Current sections state
let activeSection = null;
let sectionStates = {};
let sectionRelationships = {};

/**
 * Initialize enhanced section system
 */
function initializeEnhancedSections() {
    // Set up section buttons
    document.querySelectorAll('.section-button').forEach(button => {
        const sectionId = button.getAttribute('data-section');
        if (sectionId) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                addEnhancedSection(sectionId);
            });
        }
    });
    
    // Set up add section button
    const addSectionBtn = document.getElementById('addSectionBtn');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', showSectionPicker);
    }
    
    // Load saved section states
    loadSectionStates();
    
    // Set up section tab container
    const sectionTabs = document.getElementById('sectionTabs');
    if (sectionTabs) {
        // Allow tabs to be reordered
        sectionTabs.addEventListener('dragover', handleTabDragOver);
        sectionTabs.addEventListener('drop', handleTabDrop);
    }
}

/**
 * Load saved section states
 */
function loadSectionStates() {
    try {
        const savedStates = localStorage.getItem('sectionStates');
        if (savedStates) {
            sectionStates = JSON.parse(savedStates);
            
            // Open saved sections
            const savedSections = localStorage.getItem('activeSections');
            if (savedSections) {
                const sections = JSON.parse(savedSections);
                
                // Clear content area
                const contentArea = document.getElementById('contentArea');
                if (contentArea) {
                    contentArea.innerHTML = '';
                }
                
                // Open sections in saved order
                sections.forEach(sectionId => {
                    addEnhancedSection(sectionId, false); // Don't animate initial load
                });
                
                // Focus active section
                const saved = localStorage.getItem('activeSection');
                if (saved && document.getElementById(`section-${saved}`)) {
                    focusSection(saved);
                } else if (sections.length > 0) {
                    focusSection(sections[0]);
                }
            }
        }
    } catch (e) {
        console.error('Error loading section states:', e);
        
        // Open default section
        addEnhancedSection('latest');
    }
}

/**
 * Add an enhanced section
 * @param {string} sectionId - ID of the section to add
 * @param {boolean} animate - Whether to animate the section appearance
 */
function addEnhancedSection(sectionId, animate = true) {
    // Check if section already exists
    if (document.getElementById(`section-${sectionId}`)) {
        focusSection(sectionId);
        return;
    }
    
    // Create section element
    const section = document.createElement('div');
    section.classList.add('section');
    section.id = `section-${sectionId}`;
    section.setAttribute('data-section-id', sectionId);
    
    // Apply saved state if available
    if (sectionStates[sectionId]) {
        section.style.width = sectionStates[sectionId].width || '';
        section.style.height = sectionStates[sectionId].height || '';
        section.setAttribute('data-view-mode', sectionStates[sectionId].viewMode || SECTION_VIEW_MODES.DETAILED);
    } else {
        // Default state
        section.setAttribute('data-view-mode', SECTION_VIEW_MODES.DETAILED);
    }
    
    // Set content based on layout mode
    if (window.getLayoutMode && window.getLayoutMode() === window.LAYOUT_MODES.FREEFORM) {
        section.style.position = 'absolute';
        
        // Position in saved location or random position
        if (sectionStates[sectionId] && sectionStates[sectionId].position) {
            section.style.left = sectionStates[sectionId].position.left || '10px';
            section.style.top = sectionStates[sectionId].position.top || '10px';
        } else {
            const contentArea = document.getElementById('contentArea');
            if (contentArea) {
                const rect = contentArea.getBoundingClientRect();
                section.style.left = `${Math.random() * (rect.width - 400)}px`;
                section.style.top = `${Math.random() * (rect.height - 300)}px`;
            }
        }
    }
    
    // Create section content
    const content = createSectionContent(sectionId, section.getAttribute('data-view-mode'));
    
    // Add header and content
    section.innerHTML = `
        <div class="section-header">
            <div class="drag-handle">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                    <circle cx="9" cy="12" r="1"></circle>
                    <circle cx="9" cy="5" r="1"></circle>
                    <circle cx="9" cy="19" r="1"></circle>
                    <circle cx="15" cy="12" r="1"></circle>
                    <circle cx="15" cy="5" r="1"></circle>
                    <circle cx="15" cy="19" r="1"></circle>
                </svg>
            </div>
            <h3 class="section-title">${getSectionTitle(sectionId)}</h3>
            <div class="section-controls">
                <button class="toggle-view-btn" title="Toggle view mode">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
                <button class="toggle-fullscreen-btn" title="Toggle fullscreen">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                </button>
                <button class="close-section-btn" title="Close section">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
        <div class="section-content">
            ${content}
        </div>
        <div class="section-resize-handle">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none">
                <polyline points="22 12 18 12 18 22"></polyline>
                <polyline points="12 18 12 22 22 22"></polyline>
            </svg>
        </div>
        <div class="section-relationship-hint"></div>
    `;
    
    // Set section to be draggable
    section.setAttribute('draggable', 'true');
    
    // Add to content area
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
        contentArea.appendChild(section);
    }
    
    // Animate entrance if requested
    if (animate) {
        section.classList.add('animate-in');
        setTimeout(() => {
            section.classList.remove('animate-in');
        }, 500);
    }
    
    // Set up event handlers
    setupSectionEventHandlers(section);
    
    // Create tab for section
    createSectionTab(sectionId);
    
    // Focus the new section
    focusSection(sectionId);
    
    // Update active sections list
    updateActiveSections();
    
    // Show related content suggestions
    if (window.showRelatedContentSuggestions) {
        window.showRelatedContentSuggestions(sectionId);
    }
    
    return section;
}

/**
 * Set up event handlers for a section
 * @param {Element} section - Section element
 */
function setupSectionEventHandlers(section) {
    const sectionId = section.getAttribute('data-section-id');
    
    // Drag handlers
    section.addEventListener('dragstart', handleSectionDragStart);
    section.addEventListener('dragend', handleSectionDragEnd);
    
    // Click to focus
    section.addEventListener('click', () => {
        focusSection(sectionId);
    });
    
    // Toggle fullscreen button
    const fullscreenBtn = section.querySelector('.toggle-fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSectionFullscreen(sectionId);
        });
    }
    
    // Toggle view mode button
    const viewModeBtn = section.querySelector('.toggle-view-btn');
    if (viewModeBtn) {
        viewModeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSectionViewMode(sectionId);
        });
    }
    
    // Close button
    const closeBtn = section.querySelector('.close-section-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSection(sectionId);
        });
    }
    
    // Resize handle
    const resizeHandle = section.querySelector('.section-resize-handle');
    if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            startSectionResize(section, e);
        });
    }
    
    // Double-click header to toggle fullscreen
    const header = section.querySelector('.section-header');
    if (header) {
        header.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            toggleSectionFullscreen(sectionId);
        });
    }
}

/**
 * Create a tab for a section
 * @param {string} sectionId - Section ID
 */
function createSectionTab(sectionId) {
    const tabsContainer = document.getElementById('sectionTabs');
    if (!tabsContainer) return;
    
    // Create tab element
    const tab = document.createElement('div');
    tab.classList.add('section-tab');
    tab.setAttribute('data-section-id', sectionId);
    tab.setAttribute('draggable', 'true');
    
    tab.innerHTML = `
        <span class="tab-icon"></span>
        <span class="tab-title">${getSectionTitle(sectionId)}</span>
        <button class="tab-close">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    
    // Add click handler
    tab.addEventListener('click', () => {
        focusSection(sectionId);
    });
    
    // Add close button handler
    const closeBtn = tab.querySelector('.tab-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSection(sectionId);
        });
    }
    
    // Add drag handlers
    tab.addEventListener('dragstart', handleTabDragStart);
    tab.addEventListener('dragend', handleTabDragEnd);
    
    // Add to container
    tabsContainer.appendChild(tab);
}

/**
 * Focus a section
 * @param {string} sectionId - ID of section to focus
 */
function focusSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (!section) return;
    
    // Update active section
    activeSection = sectionId;
    
    // Update active classes
    document.querySelectorAll('.section').forEach(s => {
        s.classList.toggle('active', s === section);
    });
    
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-section-id') === sectionId);
    });
    
    // Bring section into view if not fullscreen
    if (!section.classList.contains('fullscreen')) {
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Store active section
    localStorage.setItem('activeSection', sectionId);
    
    // Show related content if available
    if (window.showRelatedContentSuggestions) {
        window.showRelatedContentSuggestions(sectionId);
    }
}

/**
 * Toggle section fullscreen state
 * @param {string} sectionId - Section ID
 */
function toggleSectionFullscreen(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (!section) return;
    
    // Toggle fullscreen class
    section.classList.toggle('fullscreen');
    
    // Update body class for styling
    document.body.classList.toggle('has-fullscreen', section.classList.contains('fullscreen'));
    
    // Store state
    updateSectionState(sectionId, {
        fullscreen: section.classList.contains('fullscreen')
    });
    
    // Show related content if exiting fullscreen
    if (!section.classList.contains('fullscreen') && window.showRelatedContentSuggestions) {
        window.showRelatedContentSuggestions(sectionId);
    }
}

/**
 * Toggle section view mode
 * @param {string} sectionId - Section ID
 */
function toggleSectionViewMode(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (!section) return;
    
    // Get current view mode
    const currentMode = section.getAttribute('data-view-mode') || SECTION_VIEW_MODES.DETAILED;
    
    // Determine next mode
    let nextMode;
    switch (currentMode) {
        case SECTION_VIEW_MODES.COMPACT:
            nextMode = SECTION_VIEW_MODES.DETAILED;
            break;
        case SECTION_VIEW_MODES.DETAILED:
            nextMode = SECTION_VIEW_MODES.EXPANDED;
            break;
        case SECTION_VIEW_MODES.EXPANDED:
            nextMode = SECTION_VIEW_MODES.COMPACT;
            break;
        default:
            nextMode = SECTION_VIEW_MODES.DETAILED;
    }
    
    // Apply new mode
    section.setAttribute('data-view-mode', nextMode);
    
    // Update content for new view mode
    const content = createSectionContent(sectionId, nextMode);
    section.querySelector('.section-content').innerHTML = content;
    
    // Store state
    updateSectionState(sectionId, {
        viewMode: nextMode
    });
}

/**
 * Close a section
 * @param {string} sectionId - Section ID to close
 */
function closeSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (!section) return;
    
    // Animate removal
    section.classList.add('animate-out');
    
    // Remove after animation
    setTimeout(() => {
        section.remove();
        
        // Remove tab
        const tab = document.querySelector(`.section-tab[data-section-id="${sectionId}"]`);
        if (tab) {
            tab.remove();
        }
        
        // Update active sections
        updateActiveSections();
        
        // Focus another section if this was active
        if (activeSection === sectionId && document.querySelector('.section')) {
            const nextSection = document.querySelector('.section');
            const nextId = nextSection.getAttribute('data-section-id');
            focusSection(nextId);
        }
    }, 300);
}

/**
 * Start resizing a section
 * @param {Element} section - Section element
 * @param {MouseEvent} e - Mouse event
 */
function startSectionResize(section, e) {
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = section.offsetWidth;
    const startHeight = section.offsetHeight;
    
    const sectionId = section.getAttribute('data-section-id');
    
    function handleResize(e) {
        // Calculate new dimensions
        const width = startWidth + (e.clientX - startX);
        const height = startHeight + (e.clientY - startY);
        
        // Apply with minimum size
        section.style.width = `${Math.max(300, width)}px`;
        section.style.height = `${Math.max(200, height)}px`;
        
        // Update section state
        updateSectionState(sectionId, {
            width: section.style.width,
            height: section.style.height
        });
    }
    
    function stopResize() {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', stopResize);
        
        // Apply grid span based on width if in grid layout
        if (window.getLayoutMode && window.getLayoutMode() === window.LAYOUT_MODES.GRID) {
            const width = section.offsetWidth;
            if (width > 600) {
                section.style.gridColumn = 'span 2';
            } else {
                section.style.gridColumn = 'span 1';
            }
            
            // Update section state
            updateSectionState(sectionId, {
                gridSpan: section.style.gridColumn
            });
        }
    }
    
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResize);
}

/**
 * Handle section drag start
 * @param {DragEvent} e - Drag event
 */
function handleSectionDragStart(e) {
    const section = e.currentTarget;
    section.classList.add('dragging');
    
    // Set drag image to be a semi-transparent clone
    const clone = section.cloneNode(true);
    clone.style.opacity = '0.4';
    clone.style.position = 'absolute';
    clone.style.top = '-1000px';
    document.body.appendChild(clone);
    
    e.dataTransfer.setDragImage(clone, 20, 20);
    e.dataTransfer.setData('text/plain', section.id);
    
    // Remove clone after drag starts
    setTimeout(() => {
        document.body.removeChild(clone);
    }, 0);
}

/**
 * Handle section drag end
 * @param {DragEvent} e - Drag event
 */
function handleSectionDragEnd(e) {
    const section = e.currentTarget;
    section.classList.remove('dragging');
    
    // Store position for free layout
    if (window.getLayoutMode && window.getLayoutMode() === window.LAYOUT_MODES.FREEFORM) {
        const sectionId = section.getAttribute('data-section-id');
        
        updateSectionState(sectionId, {
            position: {
                left: section.style.left,
                top: section.style.top
            }
        });
    }
}

/**
 * Handle tab drag start
 * @param {DragEvent} e - Drag event
 */
function handleTabDragStart(e) {
    const tab = e.currentTarget;
    tab.classList.add('dragging');
    e.dataTransfer.setData('text/plain', tab.getAttribute('data-section-id'));
}

/**
 * Handle tab drag end
 * @param {DragEvent} e - Drag event
 */
function handleTabDragEnd(e) {
    const tab = e.currentTarget;
    tab.classList.remove('dragging');
    
    // Update section order
    updateActiveSections();
}

/**
 * Handle tab drag over
 * @param {DragEvent} e - Drag event
 */
function handleTabDragOver(e) {
    e.preventDefault();
    
    const tabContainer = e.currentTarget;
    const draggedTab = tabContainer.querySelector('.dragging');
    
    if (!draggedTab) return;
    
    // Find closest tab
    const tabs = [...tabContainer.querySelectorAll('.section-tab:not(.dragging)')];
    
    const closestTab = tabs.reduce((closest, tab) => {
        const box = tab.getBoundingClientRect();
        const offset = e.clientX - (box.left + box.width / 2);
        
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: tab };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
    
    if (closestTab) {
        tabContainer.insertBefore(draggedTab, closestTab);
    } else {
        tabContainer.appendChild(draggedTab);
    }
}

/**
 * Handle tab drop
 * @param {DragEvent} e - Drag event
 */
function handleTabDrop(e) {
    e.preventDefault();
    
    // Update section order based on tabs
    updateActiveSections();
}

/**
 * Update active sections list
 */
function updateActiveSections() {
    const tabs = document.querySelectorAll('.section-tab');
    const activeSections = Array.from(tabs).map(tab => tab.getAttribute('data-section-id'));
    
    // Store active sections
    localStorage.setItem('activeSections', JSON.stringify(activeSections));
}

/**
 * Update section state
 * @param {string} sectionId - Section ID
 * @param {object} stateUpdate - State properties to update
 */
function updateSectionState(sectionId, stateUpdate) {
    // Create state object if it doesn't exist
    if (!sectionStates[sectionId]) {
        sectionStates[sectionId] = {};
    }
    
    // Update state
    sectionStates[sectionId] = {
        ...sectionStates[sectionId],
        ...stateUpdate
    };
    
    // Store state
    try {
        localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
    } catch (e) {
        console.error('Error storing section states:', e);
    }
}

/**
 * Create section content based on section type and view mode
 * @param {string} sectionId - Section ID
 * @param {string} viewMode - View mode
 * @return {string} Section content HTML
 */
function createSectionContent(sectionId, viewMode) {
    // Get content template based on section type
    let contentTemplate;
    
    // First check if there's a specific template for this view mode
    const specificTemplate = window.sectionTemplates && 
                            window.sectionTemplates[sectionId] && 
                            window.sectionTemplates[sectionId][viewMode];
                            
    if (specificTemplate) {
        contentTemplate = specificTemplate;
    } else {
        // Fall back to default content from generateSectionContent function
        return window.generateSectionContent ? window.generateSectionContent(sectionId) : 
            `<div class="placeholder-content">Content for ${sectionId}</div>`;
    }
    
    // Process template if it's a function
    if (typeof contentTemplate === 'function') {
        return contentTemplate();
    }
    
    return contentTemplate;
}

/**
 * Get section title for display
 * @param {string} sectionId - Section ID
 * @return {string} Section title
 */
function getSectionTitle(sectionId) {
    // Map of section IDs to display names
    const titleMap = {
        'day': 'By Day',
        'night': 'By Night',
        'map': 'Interactive Map',
        'menu': 'Menu',
        'workshops': 'Workshops',
        'marketplace': 'Marketplace',
        'skillshare': 'Skill-Share',
        'workroom': 'The Workroom',
        'exhibitions': 'Exhibitions',
        'events': 'Events',
        'fungi': 'The Fungi Room',
        'climate': 'Creative Climate Collab',
        'directory': 'Directory',
        'zine': 'Zine',
        'opportunities': 'Opportunities',
        'now': 'Happening Now',
        'upcoming': 'Upcoming Events',
        'latest': 'Latest Updates',
        'community': 'Community'
    };
    
    return titleMap[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

/**
 * Show section picker dialog
 */
function showSectionPicker() {
    const sectionPicker = document.getElementById('sectionPicker');
    if (!sectionPicker) return;
    
    // Clear existing options
    const optionsContainer = sectionPicker.querySelector('.picker-options');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        
        // Add available sections
        const sectionTypes = [
            { id: 'latest', name: 'Latest Updates', icon: '📰' },
            { id: 'now', name: 'Happening Now', icon: '⏱️' },
            { id: 'upcoming', name: 'Upcoming Events', icon: '📅' },
            { id: 'menu', name: 'Menu', icon: '🍽️' },
            { id: 'day', name: 'By Day', icon: '☀️' },
            { id: 'night', name: 'By Night', icon: '🌙' },
            { id: 'events', name: 'Events', icon: '🎭' },
            { id: 'workshops', name: 'Workshops', icon: '🛠️' },
            { id: 'marketplace', name: 'Marketplace', icon: '🛍️' },
            { id: 'workroom', name: 'The Workroom', icon: '🏢' },
            { id: 'exhibitions', name: 'Exhibitions', icon: '🖼️' },
            { id: 'fungi', name: 'The Fungi Room', icon: '🍄' },
            { id: 'climate', name: 'Creative Climate', icon: '🌱' },
            { id: 'directory', name: 'Directory', icon: '📒' },
            { id: 'zine', name: 'Zine', icon: '📖' },
            { id: 'opportunities', name: 'Opportunities', icon: '🎯' },
            { id: 'community', name: 'Community', icon: '👥' },
            { id: 'map', name: 'Interactive Map', icon: '🗺️' }
        ];
        
        sectionTypes.forEach(section => {
            const option = document.createElement('div');
            option.className = 'picker-option';
            
            option.innerHTML = `
                <span class="option-icon">${section.icon}</span>
                <span class="option-name">${section.name}</span>
            `;
            
            // Add click handler
            option.addEventListener('click', () => {
                addEnhancedSection(section.id);
                
                // Hide picker
                sectionPicker.classList.remove('active');
            });
            
            optionsContainer.appendChild(option);
        });
    }
    
    // Show picker
    sectionPicker.classList.add('active');
    
    // Close button
    const closeButton = sectionPicker.querySelector('.close-picker');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            sectionPicker.classList.remove('active');
        });
    }
    
    // Close when clicking outside
    document.addEventListener('click', function closeOnOutside(e) {
        if (!sectionPicker.contains(e.target) && sectionPicker.classList.contains('active')) {
            sectionPicker.classList.remove('active');
            document.removeEventListener('click', closeOnOutside);
        }
    });
}

// Export functions to window
window.initializeEnhancedSections = initializeEnhancedSections;
window.addEnhancedSection = addEnhancedSection;
window.focusSection = focusSection;
window.toggleSectionFullscreen = toggleSectionFullscreen;
window.toggleSectionViewMode = toggleSectionViewMode;
window.closeSection = closeSection;
window.SECTION_VIEW_MODES = SECTION_VIEW_MODES;
