// State Management
let activeSections = [];
let draggedSection = null;
let isDragging = false;

// Theme colors for different sections
const sectionColors = {
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

// Store section positions for restoration
const sectionPositions = new Map();

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    setupDropdowns();
    setupCornerResize();
    setupNavCollisionDetection();
    setupColorPicker();
    setupCalendar();
    setupNavBoxDrag();
    setupSectionButtons();
    setupSpatialMap();
    
    // Restore last used color
    const savedColor = localStorage.getItem('lastThemeColor');
    if (savedColor) {
        document.documentElement.style.setProperty('--theme-color', savedColor);
    }
    
    // Open Latest section by default
    setTimeout(() => addSection('Latest'), 100);
});

// Color picker setup
function setupColorPicker() {
    const colorPicker = document.getElementById('themeColor');
    const currentColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim();
    colorPicker.value = currentColor;
    
    // Color picker events
    colorPicker.addEventListener('input', handleColorChange);
    colorPicker.addEventListener('change', handleColorChange);

    // Update color picker display
    const display = document.querySelector('.color-picker-label svg');
    if (display) {
        display.style.color = currentColor;
    }
}

function handleColorChange(e) {
    const color = e.target.value;
    document.documentElement.style.setProperty('--theme-color', color);
    localStorage.setItem('lastThemeColor', color);
    
    // Update display
    const display = document.querySelector('.color-picker-label svg');
    if (display) {
        display.style.color = color;
    }
}

// Theme color management
function updateThemeColor(sectionName) {
    const mainSection = sectionName.split(' ')[0];
    const color = sectionColors[mainSection] || '#000';
    document.documentElement.style.setProperty('--theme-color', color);
    localStorage.setItem('lastThemeColor', color);

    // Update color picker
    const colorPicker = document.getElementById('themeColor');
    if (colorPicker) {
        colorPicker.value = color;
    }
}

// Setup section buttons
function setupSectionButtons() {
    document.querySelectorAll('.section-button').forEach(button => {
        const sectionName = button.getAttribute('data-section');
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addSection(sectionName);
        });
    });

    // Add section button
    const addButton = document.getElementById('addSectionBtn');
    if (addButton) {
        addButton.addEventListener('click', () => {
            showSectionPicker();
        });
    }
}

// Show section picker dialog
function showSectionPicker() {
    const picker = document.getElementById('sectionPicker');
    const options = picker.querySelector('.picker-options');
    
    // Clear existing options
    options.innerHTML = '';
    
    // Add section options based on available sections
    const sections = [
        { id: 'day', name: 'By Day', icon: '☀️' },
        { id: 'night', name: 'By Night', icon: '🌙' },
        { id: 'menu', name: 'Menu', icon: '🍽️' },
        { id: 'latest', name: 'Latest', icon: '📰' },
        { id: 'workshops', name: 'Workshops', icon: '🛠️' },
        { id: 'marketplace', name: 'Marketplace', icon: '🛍️' },
        { id: 'fungi', name: 'The Fungi Room', icon: '🍄' },
        { id: 'events', name: 'Events', icon: '🎭' },
        { id: 'directory', name: 'Directory', icon: '📖' }
    ];
    
    sections.forEach(section => {
        const option = document.createElement('div');
        option.className = 'picker-option';
        option.innerHTML = `
            <span class="option-icon">${section.icon}</span>
            <span class="option-name">${section.name}</span>
        `;
        option.addEventListener('click', () => {
            addSection(section.id);
            picker.classList.remove('active');
        });
        options.appendChild(option);
    });
    
    // Show picker
    picker.classList.add('active');
    
    // Close button
    picker.querySelector('.close-picker').addEventListener('click', () => {
        picker.classList.remove('active');
    });
}

// Setup dropdowns
function setupDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (trigger && content) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const wasOpen = content.classList.contains('active');
                
                // Close all other dropdowns
                document.querySelectorAll('.dropdown-content').forEach(d => {
                    d.classList.remove('active');
                });

                if (!wasOpen) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
}

// Utility functions
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Toggle view mode (light/dark)
document.querySelector('.view-mode-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Initialize dark mode
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Toggle layout (sidebar visibility)
document.querySelector('.layout-toggle').addEventListener('click', function() {
    document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', document.body.classList.contains('sidebar-collapsed'));
});

// Initialize sidebar state
if (localStorage.getItem('sidebarCollapsed') === 'true') {
    document.body.classList.add('sidebar-collapsed');
}
