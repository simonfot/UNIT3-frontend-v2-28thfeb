// Spatial Map Functionality
function setupSpatialMap() {
    const mapToggle = document.getElementById('toggleSpatialMap');
    const spatialMap = document.getElementById('spatialMap');
    const closeBtn = spatialMap.querySelector('.spatial-map-close');
    
    // Map open/close functionality
    mapToggle.addEventListener('click', () => {
        spatialMap.classList.toggle('active');
        document.body.classList.toggle('map-open');
    });
    
    closeBtn.addEventListener('click', () => {
        spatialMap.classList.remove('active');
        document.body.classList.remove('map-open');
    });
    
    // Alternate entry point from map content section
    document.addEventListener('click', (e) => {
        if (e.target.id === 'openSpatialMap') {
            spatialMap.classList.add('active');
            document.body.classList.add('map-open');
        }
    });
    
    // Initialize map interactions
    initializeMapInteractions();
    
    // Populate activity list
    populateActivityList();
}

function initializeMapInteractions() {
    const mapSections = document.querySelectorAll('.map-section');
    const activityDots = document.querySelectorAll('.activity-dot');
    
    // Map section hover interactions
    mapSections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            const sectionType = section.getAttribute('data-section');
            highlightSection(sectionType);
        });
        
        section.addEventListener('mouseleave', () => {
            resetHighlights();
        });
        
        section.addEventListener('click', () => {
            const sectionType = section.getAttribute('data-section');
            focusMapSection(sectionType);
        });
    });
    
    // Activity dot interactions
    activityDots.forEach(dot => {
        dot.addEventListener('mouseenter', () => {
            const activity = dot.getAttribute('data-activity');
            showActivityTooltip(dot, activity);
        });
        
        dot.addEventListener('mouseleave', () => {
            hideActivityTooltip();
        });
        
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const activity = dot.getAttribute('data-activity');
            showActivityDetails(activity);
        });
    });
}

function highlightSection(sectionType) {
    // Dim all sections
    document.querySelectorAll('.map-section').forEach(section => {
        section.classList.add('dimmed');
    });
    
    // Highlight matching section
    document.querySelector(`.map-section[data-section="${sectionType}"]`).classList.remove('dimmed');
    document.querySelector(`.map-section[data-section="${sectionType}"]`).classList.add('highlighted');
    
    // Highlight matching legend item
    document.querySelector(`.legend-item .legend-color.${sectionType}`).classList.add('active');
}

function resetHighlights() {
    // Reset all sections
    document.querySelectorAll('.map-section').forEach(section => {
        section.classList.remove('dimmed', 'highlighted');
    });
    
    // Reset legend items
    document.querySelectorAll('.legend-item .legend-color').forEach(item => {
        item.classList.remove('active');
    });
}

function focusMapSection(sectionType) {
    // Show section details
    showSectionDetails(sectionType);
    
    // Add persistent highlight
    document.querySelectorAll('.map-section').forEach(section => {
        section.classList.remove('selected');
    });
    document.querySelector(`.map-section[data-section="${sectionType}"]`).classList.add('selected');
}

function showSectionDetails(sectionType) {
    // Map of section types to their details
    const sectionDetails = {
        'cafe': {
            title: 'Café Space',
            description: 'Our vibrant café area serving specialty coffee, teas, and light food during the day. Transforms into an event space in the evenings.',
            capacity: '30 seated, 45 standing',
            currentActivity: 'Coffee Workshop',
            popularity: 'high'
        },
        'workroom': {
            title: 'The Workroom',
            description: 'Dedicated workspace with desks, power outlets, and high-speed internet. Perfect for individuals and small teams.',
            capacity: '25 workstations',
            currentActivity: 'Digital Workspaces',
            popularity: 'medium'
        },
        'exhibition': {
            title: 'Exhibition Space',
            description: 'Flexible gallery space for rotating exhibitions, installations, and community art displays.',
            capacity: '60 people',
            currentActivity: 'Art Installation',
            popularity: 'low'
        },
        'fungi': {
            title: 'The Fungi Room',
            description: 'Dedicated to mushroom cultivation, research, and education. Features growing stations and educational displays.',
            capacity: '15 people',
            currentActivity: 'Fungi Tour',
            popularity: 'high'
        }
    };
    
    // Get details for the selected section
    const details = sectionDetails[sectionType] || {
        title: 'Unknown Section',
        description: 'Information not available',
        capacity: '-',
        currentActivity: 'None',
        popularity: 'unknown'
    };
    
    // Create details panel
    const detailsPanel = document.createElement('div');
    detailsPanel.className = 'section-details-panel';
    detailsPanel.innerHTML = `
        <div class="details-header">
            <h3>${details.title}</h3>
            <button class="close-details">×</button>
        </div>
        <div class="details-content">
            <p>${details.description}</p>
            <div class="details-stats">
                <div class="stat-item">
                    <span class="stat-label">Capacity:</span>
                    <span class="stat-value">${details.capacity}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Current Activity:</span>
                    <span class="stat-value ${details.popularity}">${details.currentActivity}</span>
                </div>
            </div>
            <button class="btn-primary explore-section" data-section="${sectionType}">Explore</button>
        </div>
    `;
    
    // Remove any existing panels
    const existingPanel = document.querySelector('.section-details-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    // Add panel to map
    document.querySelector('.map-container').appendChild(detailsPanel);
    
    // Add close button event
    detailsPanel.querySelector('.close-details').addEventListener('click', () => {
        detailsPanel.remove();
        resetHighlights();
    });
    
    // Add explore button event
    detailsPanel.querySelector('.explore-section').addEventListener('click', () => {
        // Close map
        document.getElementById('spatialMap').classList.remove('active');
        document.body.classList.remove('map-open');
        
        // Open corresponding section
        const sectionMapping = {
            'cafe': 'menu',
            'workroom': 'workroom',
            'exhibition': 'exhibitions',
            'fungi': 'fungi'
        };
        
        const sectionToOpen = sectionMapping[sectionType] || sectionType;
        addSection(sectionToOpen);
    });
}

function showActivityTooltip(dot, activity) {
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'activity-tooltip';
    tooltip.textContent = activity;
    
    // Position tooltip near dot
    const dotRect = dot.getBoundingClientRect();
    tooltip.style.left = `${dotRect.right + 10}px`;
    tooltip.style.top = `${dotRect.top}px`;
    
    // Add to map
    document.querySelector('.map-area').appendChild(tooltip);
}

function hideActivityTooltip() {
    // Remove any existing tooltips
    document.querySelectorAll('.activity-tooltip').forEach(tooltip => {
        tooltip.remove();
    });
}

function showActivityDetails(activity) {
    // Map of activities to their details
    const activityDetails = {
        'Coffee Workshop': {
            title: 'Coffee Workshop',
            time: '10:00 AM - 12:00 PM',
            location: 'Café Space',
            description: 'Learn the art of coffee brewing with our expert baristas. Includes tasting session and hands-on practice with various brewing methods.',
            type: 'Workshop',
            availability: 'Few spots left'
        },
        'Digital Workspaces': {
            title: 'Digital Workspaces',
            time: '9:00 AM - 5:00 PM',
            location: 'Workroom',
            description: 'Open workspace for digital work, remote work, and creative projects. High-speed WiFi and power outlets available.',
            type: 'Daily Service',
            availability: 'Open to all'
        },
        'Art Installation': {
            title: 'Urban Perspectives',
            time: '9:00 AM - 8:00 PM',
            location: 'Exhibition Space',
            description: 'A collection of works exploring urban life and environmental themes through photography, painting, and mixed media.',
            type: 'Exhibition',
            availability: 'Open to all'
        },
        'Fungi Tour': {
            title: 'Fungi Room Guided Tour',
            time: '11:00 AM - 2:00 PM',
            location: 'Fungi Room',
            description: 'Guided tour of our mushroom cultivation space with explanations of growing techniques, species information, and sustainable applications.',
            type: 'Tour',
            availability: 'Walk-ins welcome'
        }
    };
    
    // Get details for the selected activity
    const details = activityDetails[activity] || {
        title: activity,
        time: 'Time not specified',
        location: 'Location not specified',
        description: 'Information not available',
        type: 'Event',
        availability: 'Unknown'
    };
    
    // Create activity details panel
    const activityPanel = document.createElement('div');
    activityPanel.className = 'activity-details-panel';
    activityPanel.innerHTML = `
        <div class="details-header">
            <h3>${details.title}</h3>
            <button class="close-details">×</button>
        </div>
        <div class="details-content">
            <div class="activity-meta">
                <div class="meta-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${details.time}</span>
                </div>
                <div class="meta-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>${details.location}</span>
                </div>
            </div>
            <p>${details.description}</p>
            <div class="details-stats">
                <div class="stat-item">
                    <span class="stat-label">Type:</span>
                    <span class="stat-value">${details.type}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Availability:</span>
                    <span class="stat-value">${details.availability}</span>
                </div>
            </div>
            <button class="btn-primary">Join / Register</button>
        </div>
    `;
    
    // Remove any existing panels
    const existingPanel = document.querySelector('.activity-details-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    // Add panel to map
    document.querySelector('.map-container').appendChild(activityPanel);
    
    // Add close button event
    activityPanel.querySelector('.close-details').addEventListener('click', () => {
        activityPanel.remove();
    });
}

function populateActivityList() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Current activities
    const activities = [
        {
            name: 'Coffee Workshop',
            location: 'Café Space',
            time: '10:00 AM - 12:00 PM',
            status: 'active'
        },
        {
            name: 'Digital Workspaces',
            location: 'Workroom',
            time: 'All Day',
            status: 'moderate'
        },
        {
            name: 'Urban Perspectives Exhibition',
            location: 'Exhibition Space',
            time: 'All Day',
            status: 'quiet'
        },
        {
            name: 'Fungi Room Guided Tour',
            location: 'Fungi Room',
            time: '11:00 AM - 2:00 PM',
            status: 'active'
        }
    ];
    
    // Clear existing items
    activityList.innerHTML = '';
    
    // Add activities to list
    activities.forEach(activity => {
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
        
        activityList.appendChild(listItem);
        
        // Add click event to show details
        listItem.addEventListener('click', () => {
            showActivityDetails(activity.name);
        });
    });
}
