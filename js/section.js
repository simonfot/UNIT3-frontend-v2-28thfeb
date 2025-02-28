// Section Management
function addSection(sectionId) {
    // Check if section already exists
    if (document.getElementById(`section-${sectionId}`)) {
        focusSection(sectionId);
        return;
    }

    // Add to active sections
    activeSections.push(sectionId);
    
    // Create section element
    const section = document.createElement('div');
    section.className = 'section hardware-accelerated';
    section.id = `section-${sectionId}`;
    section.draggable = true;
    
    // Capitalize section name for display
    const sectionName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    
    // Generate content based on section type
    const content = generateSectionContent(sectionId);
    
    section.innerHTML = `
        <div class="section-header">
            <div class="drag-handle">⋮⋮</div>
            <h2>${sectionName}</h2>
            <div class="section-controls">
                <button class="fullscreen-btn" title="Fullscreen">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                    </svg>
                </button>
                <button class="minimize-btn" title="Minimize">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                        <path d="M19 14l-7 7-7-7"></path>
                    </svg>
                </button>
                <button class="close-btn" title="Close">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="section-content">
            ${content}
        </div>
        <div class="section-resize"></div>
    `;

    // Add to content area
    document.getElementById('contentArea').appendChild(section);
    
    // Add to section tabs
    addSectionTab(sectionId, sectionName);

    // Setup event listeners
    setupSectionInteractions(section, sectionId);
    
    // Apply current theme
    updateThemeColor(sectionId);
    
    // Focus the new section
    focusSection(sectionId);
    
    // Save section state
    saveSectionState();
}

function setupSectionInteractions(section, sectionId) {
    // Drag functionality
    section.addEventListener('dragstart', handleDragStart);
    section.addEventListener('dragend', handleDragEnd);
    section.addEventListener('dragover', handleDragOver);
    section.addEventListener('drop', handleDrop);

    // Control buttons
    const fullscreenBtn = section.querySelector('.fullscreen-btn');
    const minimizeBtn = section.querySelector('.minimize-btn');
    const closeBtn = section.querySelector('.close-btn');
    
    fullscreenBtn.addEventListener('click', () => toggleFullscreen(sectionId));
    minimizeBtn.addEventListener('click', () => minimizeSection(sectionId));
    closeBtn.addEventListener('click', () => closeSection(sectionId));

    // Double click header to toggle fullscreen
    section.querySelector('.section-header').addEventListener('dblclick', () => {
        toggleFullscreen(sectionId);
    });
    
    // Section resize handler
    const resizeHandle = section.querySelector('.section-resize');
    if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startSectionResize(section, e);
        });
    }
}

function addSectionTab(sectionId, sectionName) {
    const tabsContainer = document.getElementById('sectionTabs');
    
    // Create tab element
    const tab = document.createElement('div');
    tab.className = 'section-tab';
    tab.setAttribute('data-section', sectionId);
    tab.innerHTML = `
        <span class="tab-name">${sectionName}</span>
        <button class="tab-close">×</button>
    `;
    
    // Add click event to focus section
    tab.addEventListener('click', () => focusSection(sectionId));
    
    // Add close button event
    tab.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeSection(sectionId);
    });
    
    tabsContainer.appendChild(tab);
    updateActiveTabs(sectionId);
}

function updateActiveTabs(activeSectionId) {
    document.querySelectorAll('.section-tab').forEach(tab => {
        const sectionId = tab.getAttribute('data-section');
        tab.classList.toggle('active', sectionId === activeSectionId);
    });
}

function focusSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (!section) return;
    
    // Update active tabs
    updateActiveTabs(sectionId);
    
    // Bring section to front
    document.querySelectorAll('.section').forEach(s => {
        s.style.zIndex = '1';
    });
    section.style.zIndex = '10';
    
    // Smooth scroll to section
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Apply theme color
    updateThemeColor(sectionId);
}

function toggleFullscreen(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (!section) return;
    
    const isFullscreen = section.classList.contains('is-fullscreen');

    if (!isFullscreen) {
        // Store current position and dimensions
        sectionPositions.set(sectionId, {
            rect: section.getBoundingClientRect(),
            transform: section.style.transform,
            width: section.style.width,
            height: section.style.height
        });

        // Enter fullscreen
        section.classList.add('is-fullscreen');
        document.body.classList.add('has-fullscreen');
        
        // Focus this section
        focusSection(sectionId);
        
    } else {
        // Exit fullscreen
        section.classList.remove('is-fullscreen');
        document.body.classList.remove('has-fullscreen');
        
        // Restore previous position
        const prevPos = sectionPositions.get(sectionId);
        if (prevPos) {
            section.style.transform = prevPos.transform;
            section.style.width = prevPos.width;
            section.style.height = prevPos.height;
        }
    }
    
    // Save section state
    saveSectionState();
}

function minimizeSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (!section) return;
    
    const content = section.querySelector('.section-content');
    const isMinimized = content.classList.contains('minimized');
    
    if (!isMinimized) {
        content.classList.add('minimized');
        section.classList.add('is-minimized');
    } else {
        content.classList.remove('minimized');
        section.classList.remove('is-minimized');
    }
    
    // Save section state
    saveSectionState();
}

function closeSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (!section) return;
    
    // Animate removal
    section.classList.add('removing');
    
    setTimeout(() => {
        // Remove the section
        section.remove();
        
        // Remove from active sections
        activeSections = activeSections.filter(id => id !== sectionId);
        
        // Remove the tab
        const tab = document.querySelector(`.section-tab[data-section="${sectionId}"]`);
        if (tab) tab.remove();
        
        // Save section state
        saveSectionState();
        
        // Focus another section if available
        if (activeSections.length > 0) {
            focusSection(activeSections[activeSections.length - 1]);
        }
    }, 300);
}

function startSectionResize(section, startEvent) {
    const startWidth = section.offsetWidth;
    const startHeight = section.offsetHeight;
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    
    function doResize(e) {
        const newWidth = startWidth + (e.clientX - startX);
        const newHeight = startHeight + (e.clientY - startY);
        
        section.style.width = `${Math.max(300, newWidth)}px`;
        section.style.height = `${Math.max(200, newHeight)}px`;
    }
    
    function stopResize() {
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
        
        // Save section state
        saveSectionState();
    }
    
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
}

// Section drag and drop functionality
function handleDragStart(e) {
    draggedSection = this;
    this.classList.add('is-dragging');
    
    // Set drag image (optional)
    const dragImage = this.cloneNode(true);
    dragImage.style.opacity = "0";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => dragImage.remove(), 0);
    
    // Get the section ID for later use
    const sectionId = this.id.replace('section-', '');
    
    // Update active tab
    updateActiveTabs(sectionId);
}

function handleDragEnd() {
    if (!draggedSection) return;
    
    draggedSection.classList.remove('is-dragging');
    draggedSection = null;
    
    // Save section state
    saveSectionState();
}

function handleDragOver(e) {
    e.preventDefault();
    if (!draggedSection) return;
    
    // Optional: Add visual indicators for drop zones
}

function handleDrop(e) {
    e.preventDefault();
    if (!draggedSection) return;
    
    // Get drop position
    const dropX = e.clientX;
    const dropY = e.clientY;
    
    // Position the dragged section at the drop location
    const sectionRect = draggedSection.getBoundingClientRect();
    const contentArea = document.getElementById('contentArea');
    const contentRect = contentArea.getBoundingClientRect();
    
    // Calculate position relative to content area
    const offsetX = dropX - contentRect.left - (sectionRect.width / 2);
    const offsetY = dropY - contentRect.top - (sectionRect.height / 2);
    
    // Ensure the section stays within bounds
    const maxX = contentRect.width - sectionRect.width;
    const maxY = contentRect.height - sectionRect.height;
    
    const boundedX = Math.max(0, Math.min(offsetX, maxX));
    const boundedY = Math.max(0, Math.min(offsetY, maxY));
    
    draggedSection.style.position = 'absolute';
    draggedSection.style.left = `${boundedX}px`;
    draggedSection.style.top = `${boundedY}px`;
    
    // Save section state
    saveSectionState();
}

// Save and restore section state
function saveSectionState() {
    const sections = Array.from(document.querySelectorAll('.section')).map(section => {
        const sectionId = section.id.replace('section-', '');
        return {
            id: sectionId,
            position: {
                left: section.style.left,
                top: section.style.top
            },
            size: {
                width: section.style.width,
                height: section.style.height
            },
            isMinimized: section.classList.contains('is-minimized'),
            isFullscreen: section.classList.contains('is-fullscreen')
        };
    });
    
    localStorage.setItem('sectionState', JSON.stringify(sections));
}

function restoreSectionState() {
    try {
        const savedSections = JSON.parse(localStorage.getItem('sectionState'));
        if (!savedSections || !Array.isArray(savedSections)) return;
        
        // Clear existing sections
        document.getElementById('contentArea').innerHTML = '';
        document.getElementById('sectionTabs').innerHTML = '';
        activeSections = [];
        
        // Restore sections
        savedSections.forEach(saved => {
            addSection(saved.id);
            const section = document.getElementById(`section-${saved.id}`);
            
            if (section) {
                // Restore position and size
                if (saved.position) {
                    section.style.position = 'absolute';
                    section.style.left = saved.position.left;
                    section.style.top = saved.position.top;
                }
                
                if (saved.size) {
                    section.style.width = saved.size.width;
                    section.style.height = saved.size.height;
                }
                
                // Restore state
                if (saved.isMinimized) {
                    minimizeSection(saved.id);
                }
                
                if (saved.isFullscreen) {
                    toggleFullscreen(saved.id);
                }
            }
        });
        
        // Focus the last section
        if (activeSections.length > 0) {
            focusSection(activeSections[activeSections.length - 1]);
        }
    } catch (error) {
        console.error('Error restoring section state:', error);
    }
}

// Initialize section state
document.addEventListener('DOMContentLoaded', () => {
    restoreSectionState();
    
    // If no sections were restored, open the default section
    if (activeSections.length === 0) {
        addSection('latest');
    }
});
