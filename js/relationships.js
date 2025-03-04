/**
 * UNIT3 Content Relationships System
 * This module handles the visual and data relationships between content sections
 */

// Content relationship definitions
const contentRelationships = {
    // Cafe relationships
    'menu': ['day', 'night', 'events'],
    'day': ['menu', 'workshops', 'workroom'],
    'night': ['menu', 'events', 'exhibitions'],
    
    // Creates relationships
    'workshops': ['skillshare', 'events', 'workroom'],
    'marketplace': ['opportunities', 'directory', 'workroom'],
    'skillshare': ['workshops', 'directory', 'opportunities'],
    'workroom': ['workshops', 'marketplace', 'day'],
    
    // Curates relationships
    'exhibitions': ['events', 'fungi', 'climate'],
    'events': ['night', 'exhibitions', 'workshops'],
    'fungi': ['climate', 'exhibitions', 'directory'],
    'climate': ['fungi', 'opportunities', 'zine'],
    
    // Connects relationships
    'directory': ['marketplace', 'skillshare', 'opportunities'],
    'zine': ['climate', 'opportunities', 'directory'],
    'opportunities': ['marketplace', 'zine', 'directory'],
    
    // Discovery relationships
    'map': ['day', 'night', 'workroom', 'fungi'],
    'now': ['events', 'day', 'workshops'],
    'upcoming': ['events', 'exhibitions', 'opportunities']
};

// Strength of relationships on scale 0-1
const relationshipStrengths = {
    'menu-day': 0.9,
    'menu-night': 0.9,
    'workshops-skillshare': 0.8,
    'workshops-events': 0.7,
    'fungi-climate': 0.8,
    'directory-marketplace': 0.7,
    'map-workroom': 0.7,
    'map-fungi': 0.6,
    'now-events': 0.9,
    'upcoming-events': 0.8,
    'zine-climate': 0.7
    // Other relationships default to 0.5
};

/**
 * Get related sections for a given section
 * @param {string} sectionId - The section to find relations for
 * @param {number} limit - Maximum number of related sections to return
 * @return {Object[]} Array of related sections with strength values
 */
function getRelatedSections(sectionId, limit = 3) {
    if (!contentRelationships[sectionId]) {
        return [];
    }
    
    const related = contentRelationships[sectionId].map(relatedId => {
        // Get relationship strength (default to 0.5 if not specified)
        const relationshipKey = [sectionId, relatedId].sort().join('-');
        const strength = relationshipStrengths[relationshipKey] || 0.5;
        
        return {
            id: relatedId,
            strength: strength
        };
    });
    
    // Sort by strength and limit the results
    return related.sort((a, b) => b.strength - a.strength).slice(0, limit);
}

/**
 * Draw visual connection lines between related sections
 * @param {string} sourceId - Source section ID
 * @param {string[]} targetIds - Array of target section IDs
 */
function drawRelationshipLines(sourceId, targetIds) {
    const relationshipLinesContainer = document.getElementById('relationshipLines');
    if (!relationshipLinesContainer) return;
    
    // Clear previous lines for this source
    const existingLines = relationshipLinesContainer.querySelectorAll(`.relationship-line[data-source="${sourceId}"]`);
    existingLines.forEach(line => line.remove());
    
    const sourceSection = document.getElementById(`section-${sourceId}`);
    if (!sourceSection) return;
    
    const sourceBounds = sourceSection.getBoundingClientRect();
    const sourceCenter = {
        x: sourceBounds.left + sourceBounds.width / 2,
        y: sourceBounds.top + sourceBounds.height / 2
    };
    
    // Draw new lines
    targetIds.forEach(targetId => {
        const targetSection = document.getElementById(`section-${targetId}`);
        if (!targetSection) return;
        
        const targetBounds = targetSection.getBoundingClientRect();
        const targetCenter = {
            x: targetBounds.left + targetBounds.width / 2,
            y: targetBounds.top + targetBounds.height / 2
        };
        
        // Create SVG line element
        const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Get relationship strength
        const relationshipKey = [sourceId, targetId].sort().join('-');
        const strength = relationshipStrengths[relationshipKey] || 0.5;
        
        // Calculate curve control point
        const midX = (sourceCenter.x + targetCenter.x) / 2;
        const midY = (sourceCenter.y + targetCenter.y) / 2;
        const distance = Math.sqrt(
            Math.pow(targetCenter.x - sourceCenter.x, 2) + 
            Math.pow(targetCenter.y - sourceCenter.y, 2)
        );
        const curveFactor = Math.min(0.2, 30 / distance);
        const curveOffset = 50 + (distance * curveFactor);
        
        // Perpendicular vector for control point
        const dx = targetCenter.x - sourceCenter.x;
        const dy = targetCenter.y - sourceCenter.y;
        const normLen = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / normLen;
        const ny = dx / normLen;
        
        const controlX = midX + nx * curveOffset;
        const controlY = midY + ny * curveOffset;
        
        // Create bezier curve path
        const path = `M ${sourceCenter.x} ${sourceCenter.y} Q ${controlX} ${controlY}, ${targetCenter.x} ${targetCenter.y}`;
        
        // Set line attributes
        lineElement.setAttribute('d', path);
        lineElement.setAttribute('fill', 'none');
        lineElement.setAttribute('stroke', `var(--theme-color)`);
        lineElement.setAttribute('stroke-width', `${Math.max(1, strength * 3)}px`);
        lineElement.setAttribute('stroke-opacity', `${Math.max(0.2, strength * 0.7)}`);
        lineElement.setAttribute('data-source', sourceId);
        lineElement.setAttribute('data-target', targetId);
        lineElement.classList.add('relationship-line');
        
        // Add animation
        lineElement.innerHTML = `
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" fill="freeze" />
        `;
        lineElement.setAttribute('stroke-dasharray', '5,5');
        
        // Add to container
        relationshipLinesContainer.appendChild(lineElement);
    });
}

/**
 * Show related content suggestions for a section
 * @param {string} sectionId - The active section ID
 */
function showRelatedContentSuggestions(sectionId) {
    const relatedSections = getRelatedSections(sectionId);
    if (relatedSections.length === 0) return;
    
    // Get IDs of related sections
    const relatedIds = relatedSections.map(item => item.id);
    
    // Draw relationship lines
    drawRelationshipLines(sectionId, relatedIds);
    
    // Create or update the suggestions panel
    let suggestionsPanel = document.querySelector('.related-content-panel');
    if (!suggestionsPanel) {
        suggestionsPanel = document.createElement('div');
        suggestionsPanel.className = 'related-content-panel';
        document.body.appendChild(suggestionsPanel);
    }
    
    // Generate suggestion content
    const suggestionContent = `
        <div class="panel-header">
            <h3>Related Content</h3>
            <button class="close-panel">×</button>
        </div>
        <div class="panel-content">
            ${relatedSections.map(item => `
                <div class="suggestion-item" data-section="${item.id}" style="--strength: ${item.strength}">
                    <div class="strength-indicator"></div>
                    <span class="suggestion-name">${getSectionDisplayName(item.id)}</span>
                    <button class="open-section-btn">Open</button>
                </div>
            `).join('')}
        </div>
    `;
    
    suggestionsPanel.innerHTML = suggestionContent;
    suggestionsPanel.classList.add('active');
    
    // Add event handlers
    suggestionsPanel.querySelector('.close-panel').addEventListener('click', () => {
        suggestionsPanel.classList.remove('active');
        
        // Remove relationship lines
        const relationshipLinesContainer = document.getElementById('relationshipLines');
        if (relationshipLinesContainer) {
            relationshipLinesContainer.innerHTML = '';
        }
    });
    
    // Add click handlers for suggestion items
    suggestionsPanel.querySelectorAll('.open-section-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemElement = e.target.closest('.suggestion-item');
            const sectionId = itemElement.dataset.section;
            
            if (typeof addSection === 'function') {
                addSection(sectionId);
                
                // Hide panel after adding section
                suggestionsPanel.classList.remove('active');
            }
        });
    });
}

/**
 * Convert section ID to display name
 * @param {string} sectionId - Section ID to convert
 * @return {string} Display name
 */
function getSectionDisplayName(sectionId) {
    // Map of section IDs to display names
    const displayNameMap = {
        'day': 'By Day',
        'night': 'By Night',
        'map': 'Interactive Map',
        'menu': 'Menu',
        'workshops': 'Workshops',
        'marketplace': 'Marketplace',
        'skillshare': 'Skill-Share',
        'workroom': 'Workroom',
        'exhibitions': 'Exhibitions',
        'events': 'Events',
        'fungi': 'The Fungi Room',
        'climate': 'Creative Climate Collab',
        'directory': 'Directory',
        'zine': 'Zine',
        'opportunities': 'Opportunities',
        'now': 'Happening Now',
        'upcoming': 'Upcoming Events'
    };
    
    return displayNameMap[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
}

// Export functions
window.getRelatedSections = getRelatedSections;
window.drawRelationshipLines = drawRelationshipLines;
window.showRelatedContentSuggestions = showRelatedContentSuggestions;
window.getSectionDisplayName = getSectionDisplayName;
