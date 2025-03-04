/**
 * UNIT3 Enhanced Spatial Map
 * Interactive map with live activity indicators and improved navigation
 */

// Current map mode
let currentMapMode = 'default'; // 'default', 'activities', 'spaces'

// Activity statuses
const ACTIVITY_STATUS = {
    ACTIVE: 'active',
    MODERATE: 'moderate',
    QUIET: 'quiet',
    CLOSED: 'closed'
};

// Default schedule for the day
const defaultSchedule = {
    'cafe': {
        status: ACTIVITY_STATUS.ACTIVE,
        activities: [
            { name: 'Coffee Service', time: '9:00 AM - 5:00 PM', status: ACTIVITY_STATUS.ACTIVE },
            { name: 'Lunch Service', time: '12:00 PM - 2:30 PM', status: ACTIVITY_STATUS.ACTIVE }
        ],
        capacity: 75 // percent
    },
    'workroom': {
        status: ACTIVITY_STATUS.MODERATE,
        activities: [
            { name: 'Open Workspace', time: '9:00 AM - 7:00 PM', status: ACTIVITY_STATUS.MODERATE },
            { name: 'Digital Workshop', time: '2:00 PM - 4:00 PM', status: ACTIVITY_STATUS.ACTIVE }
        ],
        capacity: 50
    },
    'exhibition': {
        status: ACTIVITY_STATUS.QUIET,
        activities: [
            { name: 'Current Exhibition', time: '10:00 AM - 6:00 PM', status: ACTIVITY_STATUS.QUIET }
        ],
        capacity: 30
    },
    'fungi': {
        status: ACTIVITY_STATUS.MODERATE,
        activities: [
            { name: 'Guided Tours', time: '11:00 AM - 3:00 PM', status: ACTIVITY_STATUS.MODERATE }
        ],
        capacity: 40
    }
};

// Live schedule (would be updated from server)
let liveSchedule = {...defaultSchedule};
let liveActivityData = [];

/**
 * Initialize enhanced spatial map system
 */
function initializeEnhancedSpatialMap() {
    // Set up the map toggle button
    const mapToggle = document.getElementById('toggleSpatialMap');
    if (mapToggle) {
        mapToggle.addEventListener('click', showSpatialMap);
    }
    
    // Close button
    const closeButton = document.querySelector('.spatial-map-close');
    if (closeButton) {
        closeButton.addEventListener('click', hideSpatialMap);
    }
    
    // Close on click outside map container
    const spatialMap = document.getElementById('spatialMap');
    if (spatialMap) {
        spatialMap.addEventListener('click', (e) => {
            if (e.target === spatialMap) {
                hideSpatialMap();
            }
        });
    }
    
    // Add map mode toggles
    addMapModeControls();
    
    // Initialize map sections
    initializeMapSections();
    
    // Simulate live activity updates
    simulateLiveUpdates();
}

/**
 * Add controls for switching map modes
 */
function addMapModeControls() {
    const mapContainer = document.querySelector('.spatial-map-content');
    if (!mapContainer) return;
    
    // Create mode toggle container
    const modeToggle = document.createElement('div');
    modeToggle.className = 'map-mode-toggle';
    modeToggle.innerHTML = `
        <button data-mode="default" class="mode-button active">Default</button>
        <button data-mode="activities" class="mode-button">Activities</button>
        <button data-mode="spaces" class="mode-button">Spaces</button>
    `;
    
    // Insert after map title
    const mapTitle = mapContainer.querySelector('h2');
    if (mapTitle) {
        mapTitle.after(modeToggle);
    } else {
        mapContainer.prepend(modeToggle);
    }
    
    // Add event listeners
    modeToggle.querySelectorAll('.mode-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            setMapMode(mode);
        });
    });
}

/**
 * Initialize map sections with interactivity
 */
function initializeMapSections() {
    const mapSections = document.querySelectorAll('.map-section');
    
    mapSections.forEach(section => {
        // Get section data
        const sectionType = section.dataset.section;
        
        // Add mouse events
        section.addEventListener('mouseenter', () => highlightMapSection(section));
        section.addEventListener('mouseleave', () => resetMapHighlights());
        
        // Add click events
        section.addEventListener('click', (e) => {
            e.stopPropagation();
            showSectionDetails(sectionType);
        });
        
        // Add capacity indicator
        addCapacityIndicator(section, sectionType);
    });
}

/**
 * Add capacity indicator to map section
 * @param {Element} section - Map section element
 * @param {string} sectionType - Section type identifier
 */
function addCapacityIndicator(section, sectionType) {
    const rect = section.querySelector('rect');
    if (!rect) return;
    
    // Get capacities
    const capacity = liveSchedule[sectionType]?.capacity || 0;
    
    // Create capacity fill
    const capacityFill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    
    // Copy attributes from original rect
    const attributes = rect.attributes;
    for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.name !== 'class' && attr.name !== 'style') {
            capacityFill.setAttribute(attr.name, attr.value);
        }
    }
    
    // Set specific attributes for capacity fill
    capacityFill.setAttribute('class', 'capacity-indicator');
    capacityFill.setAttribute('data-capacity', capacity);
    
    // Calculate height based on capacity
    const originalHeight = parseInt(capacityFill.getAttribute('height'));
    const capacityHeight = originalHeight * (capacity / 100);
    
    // Position at bottom of section
    const y = parseInt(capacityFill.getAttribute('y'));
    capacityFill.setAttribute('y', y + (originalHeight - capacityHeight));
    capacityFill.setAttribute('height', capacityHeight);
    
    // Set different opacity based on status
    const status = liveSchedule[sectionType]?.status || ACTIVITY_STATUS.QUIET;
    capacityFill.setAttribute('data-status', status);
    
    // Insert after the original rect
    rect.parentNode.insertBefore(capacityFill, rect.nextSibling);
    
    // Add activity indicators
    addActivityIndicators(section, sectionType);
}

/**
 * Add activity indicators to map section
 * @param {Element} section - Map section element
 * @param {string} sectionType - Section type identifier
 */
function addActivityIndicators(section, sectionType) {
    const activities = liveSchedule[sectionType]?.activities || [];
    if (activities.length === 0) return;
    
    const rect = section.querySelector('rect');
    if (!rect) return;
    
    // Get rect dimensions
    const x = parseInt(rect.getAttribute('x'));
    const y = parseInt(rect.getAttribute('y'));
    const width = parseInt(rect.getAttribute('width'));
    const height = parseInt(rect.getAttribute('height'));
    
    // Create activity indicators group
    const activityGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    activityGroup.setAttribute('class', 'activity-indicators');
    
    // Add indicators for each activity
    activities.forEach((activity, index) => {
        // Calculate position - evenly spaced along top
        const dotX = x + (width / (activities.length + 1)) * (index + 1);
        const dotY = y + 15;
        
        // Create indicator dot
        const activityDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        activityDot.setAttribute('cx', dotX);
        activityDot.setAttribute('cy', dotY);
        activityDot.setAttribute('r', 6);
        activityDot.setAttribute('class', `activity-dot ${activity.status}`);
        activityDot.setAttribute('data-activity', activity.name);
        activityDot.setAttribute('data-time', activity.time);
        
        // Add events
        activityDot.addEventListener('mouseenter', () => {
            showActivityTooltip(activityDot, activity);
        });
        
        activityDot.addEventListener('mouseleave', () => {
            hideActivityTooltip();
        });
        
        activityDot.addEventListener('click', (e) => {
            e.stopPropagation();
            showActivityDetails(activity, sectionType);
        });
        
        // Add to group
        activityGroup.appendChild(activityDot);
    });
    
    // Add to section
    section.appendChild(activityGroup);
}

/**
 * Show tooltip for activity
 * @param {Element} element - Activity indicator element
 * @param {Object} activity - Activity data
 */
function showActivityTooltip(element, activity) {
    // Remove any existing tooltips
    hideActivityTooltip();
    
    // Create tooltip
    const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    tooltip.setAttribute('class', 'activity-tooltip');
    
    // Get element position
    const rect = element.getBoundingClientRect();
    const svgRect = document.getElementById('venueMap').getBoundingClientRect();
    
    // Calculate position relative to SVG
    const tooltipX = rect.left - svgRect.left + rect.width / 2;
    const tooltipY = rect.top - svgRect.top - 10;
    
    // Create tooltip background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', tooltipX - 60);
    bg.setAttribute('y', tooltipY - 40);
    bg.setAttribute('width', 120);
    bg.setAttribute('height', 36);
    bg.setAttribute('rx', 4);
    bg.setAttribute('class', 'tooltip-bg');
    
    // Create tooltip text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', tooltipX);
    text.setAttribute('y', tooltipY - 20);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'tooltip-text');
    text.textContent = activity.name;
    
    // Create tooltip time
    const timeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    timeText.setAttribute('x', tooltipX);
    timeText.setAttribute('y', tooltipY - 5);
    timeText.setAttribute('text-anchor', 'middle');
    timeText.setAttribute('class', 'tooltip-subtext');
    timeText.textContent = activity.time;
    
    // Add to tooltip
    tooltip.appendChild(bg);
    tooltip.appendChild(text);
    tooltip.appendChild(timeText);
    
    // Add to SVG
    document.getElementById('venueMap').appendChild(tooltip);
}

/**
 * Hide activity tooltip
 */
function hideActivityTooltip() {
    document.querySelectorAll('.activity-tooltip').forEach(tooltip => {
        tooltip.remove();
    });
}

/**
 * Highlight a map section
 * @param {Element} section - Section to highlight
 */
function highlightMapSection(section) {
    // Add highlight class
    section.classList.add('highlighted');
    
    // Dim other sections
    document.querySelectorAll('.map-section').forEach(s => {
        if (s !== section) {
            s.classList.add('dimmed');
        }
    });
    
    // Highlight corresponding legend item
    const sectionType = section.getAttribute('data-section');
    document.querySelectorAll('.legend-item').forEach(item => {
        if (item.querySelector(`.legend-color.${sectionType}`)) {
            item.classList.add('highlighted');
        }
    });
}

/**
 * Reset all map highlights
 */
function resetMapHighlights() {
    document.querySelectorAll('.map-section').forEach(section => {
        section.classList.remove('highlighted', 'dimmed');
    });
    
    document.querySelectorAll('.legend-item').forEach(item => {
        item.classList.remove('highlighted');
    });
}

/**
 * Show spatial map
 */
function showSpatialMap() {
    const spatialMap = document.getElementById('spatialMap');
    if (spatialMap) {
        spatialMap.classList.add('active');
        updateMapContent();
    }
}

/**
 * Hide spatial map
 */
function hideSpatialMap() {
    const spatialMap = document.getElementById('spatialMap');
    if (spatialMap) {
        spatialMap.classList.remove('active');
    }
}

/**
 * Set map mode
 * @param {string} mode - Map mode to set
 */
function setMapMode(mode) {
    if (!['default', 'activities', 'spaces'].includes(mode)) {
        return;
    }
    
    currentMapMode = mode;
    
    // Update mode buttons
    document.querySelectorAll('.mode-button').forEach(button => {
        button.classList.toggle('active', button.dataset.mode === mode);
    });
    
    // Apply mode styles to map
    const venueMap = document.getElementById('venueMap');
    if (venueMap) {
        venueMap.setAttribute('data-mode', mode);
    }
    
    // Update map content
    updateMapContent();
}

/**
 * Update map content based on current mode
 */
function updateMapContent() {
    switch (currentMapMode) {
        case 'activities':
            showActivityView();
            break;
        case 'spaces':
            showSpacesView();
            break;
        default:
            showDefaultView();
            break;
    }
    
    // Update activity feed
    updateActivityFeed();
}

/**
 * Show default map view
 */
function showDefaultView() {
    // Reset all visibility
    document.querySelectorAll('.map-section').forEach(section => {
        section.style.opacity = '1';
    });
    
    document.querySelectorAll('.capacity-indicator').forEach(indicator => {
        indicator.style.opacity = '0.5';
    });
    
    document.querySelectorAll('.activity-dot').forEach(dot => {
        dot.style.opacity = '1';
    });
}

/**
 * Show activity-focused view
 */
function showActivityView() {
    // Emphasize activity indicators
    document.querySelectorAll('.activity-dot').forEach(dot => {
        dot.style.opacity = '1';
        dot.setAttribute('r', '8'); // Larger dots
    });
    
    document.querySelectorAll('.map-section rect:not(.capacity-indicator)').forEach(rect => {
        rect.style.opacity = '0.3';
    });
    
    document.querySelectorAll('.capacity-indicator').forEach(indicator => {
        indicator.style.opacity = '0.7';
    });
}

/**
 * Show spaces-focused view
 */
function showSpacesView() {
    // Emphasize capacity indicators
    document.querySelectorAll('.capacity-indicator').forEach(indicator => {
        indicator.style.opacity = '0.8';
    });
    
    document.querySelectorAll('.activity-dot').forEach(dot => {
        dot.style.opacity = '0.4';
    });
    
    document.querySelectorAll('.map-section rect:not(.capacity-indicator)').forEach(rect => {
        rect.style.opacity = '0.6';
    });
}

/**
 * Update activity feed with current activities
 */
function updateActivityFeed() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Clear current list
    activityList.innerHTML = '';
    
    // Gather all current activities
    let allActivities = [];
    
    Object.entries(liveSchedule).forEach(([spaceId, data]) => {
        data.activities.forEach(activity => {
            allActivities.push({
                ...activity,
                location: getSectionDisplayName(spaceId),
                spaceId: spaceId
            });
        });
    });
    
    // Sort by status (active first)
    allActivities.sort((a, b) => {
        const statusPriority = {
            [ACTIVITY_STATUS.ACTIVE]: 0,
            [ACTIVITY_STATUS.MODERATE]: 1,
            [ACTIVITY_STATUS.QUIET]: 2,
            [ACTIVITY_STATUS.CLOSED]: 3
        };
        
        return statusPriority[a.status] - statusPriority[b.status];
    });
    
    // Create list items
    allActivities.forEach(activity => {
        const listItem = document.createElement('li');
        listItem.className = `activity-item ${activity.status}`;
        
        listItem.innerHTML = `
            <div class="activity-status">
                <span class="status-dot"></span>
            </div>
            <div class="activity-info">
                <h4>${activity.name}</h4>
                <p>${activity.location} • ${activity.time}</p>
            </div>
        `;
        
        // Add click handler
        listItem.addEventListener('click', () => {
            showActivityDetails(activity, activity.spaceId);
        });
        
        activityList.appendChild(listItem);
    });
}

/**
 * Show details for an activity
 * @param {Object} activity - Activity data
 * @param {string} spaceId - Space ID
 */
function showActivityDetails(activity, spaceId) {
    // Create details panel
    const detailsPanel = document.createElement('div');
    detailsPanel.className = 'activity-details-panel';
    
    detailsPanel.innerHTML = `
        <div class="panel-header">
            <h3>${activity.name}</h3>
            <button class="close-panel">×</button>
        </div>
        <div class="panel-content">
            <div class="activity-meta">
                <div class="meta-item">
                    <span class="meta-icon">⏰</span>
                    <span>${activity.time}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">📍</span>
                    <span>${getSectionDisplayName(spaceId)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon status-${activity.status}">⚫</span>
                    <span>${getStatusText(activity.status)}</span>
                </div>
            </div>
            
            <div class="activity-actions">
                <button class="action-button primary">
                    <span class="action-icon">📅</span>
                    <span>Add to Calendar</span>
                </button>
                <button class="action-button">
                    <span class="action-icon">📋</span>
                    <span>View Details</span>
                </button>
                <button class="action-button" data-section="${spaceId}">
                    <span class="action-icon">👁️</span>
                    <span>Open Section</span>
                </button>
            </div>
        </div>
    `;
    
    // Add event handlers
    detailsPanel.querySelector('.close-panel').addEventListener('click', () => {
        detailsPanel.remove();
    });
    
    // Add open section handler
    const openSectionBtn = detailsPanel.querySelector('[data-section]');
    if (openSectionBtn) {
        openSectionBtn.addEventListener('click', () => {
            const sectionId = openSectionBtn.dataset.section;
            hideSpatialMap();
            
            // Open section if addSection function exists
            if (typeof addSection === 'function') {
                addSection(sectionId);
            }
            
            // Remove panel
            detailsPanel.remove();
        });
    }
    
    // Add to map container
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        // Remove any existing panels
        document.querySelectorAll('.activity-details-panel').forEach(panel => {
            panel.remove();
        });
        
        mapContainer.appendChild(detailsPanel);
    }
}

/**
 * Show details for a section
 * @param {string} sectionId - Section ID
 */
function showSectionDetails(sectionId) {
    const sectionData = liveSchedule[sectionId];
    if (!sectionData) return;
    
    // Create details panel
    const detailsPanel = document.createElement('div');
    detailsPanel.className = 'section-details-panel';
    
    detailsPanel.innerHTML = `
        <div class="panel-header">
            <h3>${getSectionDisplayName(sectionId)}</h3>
            <button class="close-panel">×</button>
        </div>
        <div class="panel-content">
            <div class="capacity-wrapper ${sectionData.status}">
                <div class="capacity-bar">
                    <div class="capacity-fill" style="width: ${sectionData.capacity}%"></div>
                </div>
                <div class="capacity-text">
                    <span class="capacity-label">Current capacity</span>
                    <span class="capacity-value">${sectionData.capacity}%</span>
                </div>
            </div>
            
            <div class="activities-list">
                <h4>Current Activities</h4>
                ${sectionData.activities.map(activity => `
                    <div class="activity-row ${activity.status}">
                        <span class="activity-status-dot"></span>
                        <div class="activity-row-details">
                            <span class="activity-name">${activity.name}</span>
                            <span class="activity-time">${activity.time}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="section-actions">
                <button class="action-button primary" data-section="${sectionId}">
                    <span class="action-icon">👁️</span>
                    <span>Open Section</span>
                </button>
                <button class="action-button">
                    <span class="action-icon">📱</span>
                    <span>Live Updates</span>
                </button>
            </div>
        </div>
    `;
    
    // Add event handlers
    detailsPanel.querySelector('.close-panel').addEventListener('click', () => {
        detailsPanel.remove();
    });
    
    // Add open section handler
    const openSectionBtn = detailsPanel.querySelector('[data-section]');
    if (openSectionBtn) {
        openSectionBtn.addEventListener('click', () => {
            const sectionId = openSectionBtn.dataset.section;
            hideSpatialMap();
            
            // Open section if addSection function exists
            if (typeof addSection === 'function') {
                addSection(sectionId);
            }
            
            // Remove panel
            detailsPanel.remove();
        });
    }
    
    // Add to map container
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        // Remove any existing panels
        document.querySelectorAll('.section-details-panel, .activity-details-panel').forEach(panel => {
            panel.remove();
        });
        
        mapContainer.appendChild(detailsPanel);
    }
}

/**
 * Simulate live updates to the map
 */
function simulateLiveUpdates() {
    // Run periodic updates
    setInterval(() => {
        // Randomly update a section's capacity
        const sectionIds = Object.keys(liveSchedule);
        const randomSectionId = sectionIds[Math.floor(Math.random() * sectionIds.length)];
        
        // Random capacity change (-5 to +5 percent)
        const capacityChange = Math.floor(Math.random() * 11) - 5;
        const newCapacity = Math.max(0, Math.min(100, liveSchedule[randomSectionId].capacity + capacityChange));
        
        // Update capacity
        liveSchedule[randomSectionId].capacity = newCapacity;
        
        // Update status based on new capacity
        if (newCapacity > 75) {
            liveSchedule[randomSectionId].status = ACTIVITY_STATUS.ACTIVE;
        } else if (newCapacity > 40) {
            liveSchedule[randomSectionId].status = ACTIVITY_STATUS.MODERATE;
        } else if (newCapacity > 10) {
            liveSchedule[randomSectionId].status = ACTIVITY_STATUS.QUIET;
        } else {
            liveSchedule[randomSectionId].status = ACTIVITY_STATUS.CLOSED;
        }
        
        // Update map if it's currently open
        const spatialMap = document.getElementById('spatialMap');
        if (spatialMap && spatialMap.classList.contains('active')) {
            updateMapContent();
            
            // Update capacity indicators
            updateCapacityIndicators();
        }
    }, 30000); // Update every 30 seconds
}

/**
 * Update capacity indicators on the map
 */
function updateCapacityIndicators() {
    document.querySelectorAll('.capacity-indicator').forEach(indicator => {
        // Get section ID
        const section = indicator.closest('.map-section');
        if (!section) return;
        
        const sectionId = section.getAttribute('data-section');
        if (!liveSchedule[sectionId]) return;
        
        // Update capacity height
        const rect = section.querySelector('rect:not(.capacity-indicator)');
        if (!rect) return;
        
        const capacity = liveSchedule[sectionId].capacity;
        indicator.setAttribute('data-capacity', capacity);
        
        // Calculate height based on capacity
        const originalHeight = parseInt(rect.getAttribute('height'));
        const capacityHeight = originalHeight * (capacity / 100);
        
        // Position at bottom of section
        const y = parseInt(rect.getAttribute('y'));
        indicator.setAttribute('y', y + (originalHeight - capacityHeight));
        indicator.setAttribute('height', capacityHeight);
        
        // Update status
        const status = liveSchedule[sectionId].status;
        indicator.setAttribute('data-status', status);
    });
}

/**
 * Get display name for a section
 * @param {string} sectionId - Section ID
 * @return {string} Display name
 */
function getSectionDisplayName(sectionId) {
    // Map of section IDs to display names
    const displayNameMap = {
        'cafe': 'Café Space',
        'workroom': 'Workroom',
        'exhibition': 'Exhibition Space',
        'fungi': 'The Fungi Room'
    };
    
    return displayNameMap[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

/**
 * Get text representation of status
 * @param {string} status - Status code
 * @return {string} Status text
 */
function getStatusText(status) {
    const statusMap = {
        [ACTIVITY_STATUS.ACTIVE]: 'Very Active',
        [ACTIVITY_STATUS.MODERATE]: 'Moderately Busy',
        [ACTIVITY_STATUS.QUIET]: 'Quiet',
        [ACTIVITY_STATUS.CLOSED]: 'Closed'
    };
    
    return statusMap[status] || 'Unknown';
}

// Export functions
window.initializeEnhancedSpatialMap = initializeEnhancedSpatialMap;
window.showSpatialMap = showSpatialMap;
window.hideSpatialMap = hideSpatialMap;
window.setMapMode = setMapMode;
