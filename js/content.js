// Section Content Generation
function generateSectionContent(sectionId) {
    // Map of section IDs to their content generators
    const contentGenerators = {
        'latest': generateLatestContent,
        'menu': generateMenuContent,
        'day': generateDayContent,
        'night': generateNightContent,
        'workshops': generateWorkshopsContent,
        'marketplace': generateMarketplaceContent,
        'events': generateEventsContent,
        'fungi': generateFungiContent,
        'directory': generateDirectoryContent,
        'zine': generateZineContent,
        'opportunities': generateOpportunitiesContent,
        'map': generateMapContent,
        'now': generateNowContent,
        'upcoming': generateUpcomingContent,
        'community': generateCommunityContent,
        'exhibitions': generateExhibitionsContent,
        'climate': generateClimateContent,
        'skillshare': generateSkillShareContent,
        'workroom': generateWorkroomContent
    };
    
    // Call the appropriate generator or use a default one
    if (contentGenerators[sectionId]) {
        return contentGenerators[sectionId]();
    } else {
        return generateDefaultContent(sectionId);
    }
}

function generateDefaultContent(sectionId) {
    return `
        <div class="placeholder-content">
            <h3>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</h3>
            <p>Content for this section is being developed...</p>
            <div class="placeholder-grid">
                <div class="placeholder-item"></div>
                <div class="placeholder-item"></div>
                <div class="placeholder-item"></div>
            </div>
        </div>
    `;
}

function generateLatestContent() {
    return `
        <div class="latest-container">
            <h3>Latest Updates</h3>
            <div class="updates-grid">
                <div class="update-card">
                    <div class="update-header">
                        <span class="update-icon">📰</span>
                        <h4>Recent News</h4>
                    </div>
                    <div class="update-content">
                        <p>Latest events, workshops, and community updates</p>
                        <ul class="update-list">
                            <li>New exhibition opening this weekend</li>
                            <li>Workshop series announcement</li>
                            <li>Spring membership updates</li>
                        </ul>
                    </div>
                    <div class="update-footer">
                        <button class="btn-text">View All News</button>
                    </div>
                </div>
                <div class="update-card">
                    <div class="update-header">
                        <span class="update-icon">📅</span>
                        <h4>Upcoming Events</h4>
                    </div>
                    <div class="update-content">
                        <ul class="event-list">
                            <li>
                                <div class="event-date">Mar 5</div>
                                <div class="event-details">
                                    <h5>Coffee Cupping Workshop</h5>
                                    <p>10:00 AM - 12:00 PM</p>
                                </div>
                            </li>
                            <li>
                                <div class="event-date">Mar 8</div>
                                <div class="event-details">
                                    <h5>DJ Night: Local Beats</h5>
                                    <p>8:00 PM - 12:00 AM</p>
                                </div>
                            </li>
                            <li>
                                <div class="event-date">Mar 12</div>
                                <div class="event-details">
                                    <h5>Fungi Cultivation Basics</h5>
                                    <p>2:00 PM - 4:00 PM</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="update-footer">
                        <button class="btn-text">Full Calendar</button>
                    </div>
                </div>
            </div>
            <div class="updates-grid">
                <div class="update-card featured">
                    <div class="update-header">
                        <span class="update-icon">✨</span>
                        <h4>Featured</h4>
                    </div>
                    <div class="update-content">
                        <h3>Spring Community Market</h3>
                        <p class="featured-date">March 20-21, 2025</p>
                        <p>Join us for our seasonal marketplace featuring local artisans, delicious food, live music, and community activities.</p>
                        <button class="btn-primary">Learn More</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateMenuContent() {
    return `
        <div class="menu-container">
            <div class="menu-header">
                <h3>Café Menu</h3>
                <div class="menu-tabs">
                    <button class="menu-tab active" data-tab="drinks">Drinks</button>
                    <button class="menu-tab" data-tab="food">Food</button>
                    <button class="menu-tab" data-tab="specials">Specials</button>
                </div>
            </div>
            
            <div class="menu-tab-content active" id="drinks-tab">
                <div class="menu-category">
                    <h4>Coffee</h4>
                    <div class="menu-items">
                        <div class="menu-item">
                            <div class="item-details">
                                <h5>Espresso</h5>
                                <p class="item-description">Single origin, rotating selection</p>
                            </div>
                            <div class="item-price">£2.80</div>
                        </div>
                        <div class="menu-item">
                            <div class="item-details">
                                <h5>Americano</h5>
                                <p class="item-description">Espresso with hot water</p>
                            </div>
                            <div class="item-price">£3.00</div>
                        </div>
                        <div class="menu-item">
                            <div class="item-details">
                                <h5>Flat White</h5>
                                <p class="item-description">Double espresso with steamed milk</p>
                            </div>
                            <div class="item-price">£3.50</div>
                        </div>
                        <div class="menu-item">
                            <div class="item-details">
                                <h5>Filter Coffee</h5>
                                <p class="item-description">Batch brew or pour-over</p>
                            </div>
                            <div class="item-price">£3.00</div>
                        </div>
                    </div>
                </div>
                
                <div class="menu-category">
                    <h4>Tea</h4>
                    <div class="menu-items">
                        <div class="menu-item">
                            <div class="item-details">
                                <h5>House Blend</h5>
                                <p class="item-description">English Breakfast blend</p>
                            </div>
                            <div class="item-price">£2.60</div>
                        </div>
                        <div class="menu-item">
                            <div class="item-details">
                                <h5>Herbal Selection</h5>
                                <p class="item-description">Peppermint, Chamomile, Rooibos</p>
                            </div>
                            <div class="item-price">£2.80</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="menu-tab-content" id="food-tab">
                <div class="menu-category">
                    <h4>Pastries</h4>
                    <div class="menu-items">
                        <div class="menu-item">
                            <div class="item-details">
                                <h5>Croissant</h5>
                                <p class="item-description">Freshly baked, locally sourced</p>
                            </div>
                            <div class="item-price">£2.50</div>
                        </div>
                        <div class="menu-item">
                            <div class="item-details">
                                <h5>Pain au Chocolat</h5>
                                <p class="item-description">With dark chocolate filling</p>
                            </div>
                            <div class="item-price">£2.80</div>
                        </div>
                    </div>
                </div>
                
                <div class="menu-category">
                    <h4>Lunch</h4>
                    <div class="menu-items">
                        <div class="menu-item">
                            <div class="item-details">
                                <h5>Seasonal Salad</h5>
                                <p class="item-description">Fresh local ingredients</p>
                            </div>
                            <div class="item-price">£6.50</div>
                        </div>
                        <div class="menu-item">
                            <div class="item-details">
                                <h5>Sandwich Selection</h5>
                                <p class="item-description">See counter for today's options</p>
                            </div>
                            <div class="item-price">£5.50</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="menu-tab-content" id="specials-tab">
                <div class="special-item">
                    <h4>Weekly Special</h4>
                    <div class="special-details">
                        <h5>Ethiopian Yirgacheffe</h5>
                        <p>Single-origin light roast with floral and citrus notes</p>
                        <div class="special-price">£3.80</div>
                    </div>
                </div>
                
                <div class="special-item">
                    <h4>Seasonal Drink</h4>
                    <div class="special-details">
                        <h5>Spring Lavender Latte</h5>
                        <p>Espresso with house-made lavender syrup and oat milk</p>
                        <div class="special-price">£4.20</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateDayContent() {
    return `
        <div class="day-container">
            <div class="day-header">
                <h3>UNIT3 by Day</h3>
                <p class="time-range">Open 9:00 AM - 5:00 PM</p>
            </div>
            
            <div class="day-features">
                <div class="feature-card">
                    <div class="feature-icon">☕</div>
                    <h4>Work & Coffee</h4>
                    <ul class="feature-list">
                        <li>Free high-speed Wi-Fi</li>
                        <li>Plenty of power outlets</li>
                        <li>Comfortable seating</li>
                        <li>Quiet work environment</li>
                    </ul>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🍽️</div>
                    <h4>Food & Drinks</h4>
                    <ul class="feature-list">
                        <li>Specialty coffee</li>
                        <li>Selection of teas</li>
                        <li>Fresh pastries</li>
                        <li>Light lunch options</li>
                    </ul>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">💼</div>
                    <h4>Meetings & Events</h4>
                    <ul class="feature-list">
                        <li>Small meeting space</li>
                        <li>Workshop sessions</li>
                        <li>Community gatherings</li>
                        <li>Creative collaborations</li>
                    </ul>
                </div>
            </div>
            
            <div class="day-info">
                <h4>About Our Daytime Space</h4>
                <p>During the day, UNIT3 transforms into a productive workspace and creative environment. Whether you're looking for a place to work, meet colleagues, or simply enjoy quality coffee in a welcoming atmosphere, our space is designed to accommodate various needs.</p>
                <p>We offer flexible seating options, reliable Wi-Fi, and a menu of drinks and light food to keep you fueled throughout the day.</p>
                
                <div class="cta-section">
                    <button class="btn-primary">Reserve a Table</button>
                    <button class="btn-secondary">View Menu</button>
                </div>
            </div>
        </div>
    `;
}

function generateNightContent() {
    return `
        <div class="night-container">
            <div class="night-header">
                <h3>UNIT3 by Night</h3>
                <p class="time-range">Events 6:00 PM - 11:00 PM</p>
            </div>
            
            <div class="event-types">
                <div class="event-type-card">
                    <div class="event-icon">🎵</div>
                    <h4>Music Events</h4>
                    <p>DJ sets, live performances, and acoustic sessions showcasing local talent.</p>
                    <div class="upcoming-preview">
                        <h5>Coming Up:</h5>
                        <div class="mini-event">
                            <span class="mini-date">Mar 8</span>
                            <span class="mini-title">DJ Night: Local Beats</span>
                        </div>
                        <div class="mini-event">
                            <span class="mini-date">Mar 15</span>
                            <span class="mini-title">Acoustic Open Mic</span>
                        </div>
                    </div>
                </div>
                
                <div class="event-type-card">
                    <div class="event-icon">🎨</div>
                    <h4>Art & Culture</h4>
                    <p>Exhibition openings, artist talks, and creative showcases.</p>
                    <div class="upcoming-preview">
                        <h5>Coming Up:</h5>
                        <div class="mini-event">
                            <span class="mini-date">Mar 10</span>
                            <span class="mini-title">Exhibition Opening: Urban Perspectives</span>
                        </div>
                        <div class="mini-event">
                            <span class="mini-date">Mar 22</span>
                            <span class="mini-title">Artist Talk: Sustainable Art</span>
                        </div>
                    </div>
                </div>
                
                <div class="event-type-card">
                    <div class="event-icon">🍴</div>
                    <h4>Food & Drink</h4>
                    <p>Special dinners, tasting events, and food pop-ups.</p>
                    <div class="upcoming-preview">
                        <h5>Coming Up:</h5>
                        <div class="mini-event">
                            <span class="mini-date">Mar 12</span>
                            <span class="mini-title">Wine Tasting Night</span>
                        </div>
                        <div class="mini-event">
                            <span class="mini-date">Mar 18</span>
                            <span class="mini-title">Vegan Pop-Up Dinner</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="night-info">
                <h4>Evenings at UNIT3</h4>
                <p>As the sun sets, UNIT3 transforms into a vibrant venue for cultural experiences, community gatherings, and entertainment. Our evening program features a diverse range of events designed to inspire, connect, and entertain.</p>
                <p>From music and art to food and workshops, our night events showcase the creativity and talent of our community.</p>
                
                <div class="cta-section">
                    <button class="btn-primary">View All Events</button>
                    <button class="btn-secondary">Submit Event Idea</button>
                </div>
            </div>
        </div>
    `;
}

function generateFungiContent() {
    return `
        <div class="fungi-container">
            <div class="fungi-header">
                <h3>The Fungi Room</h3>
                <p class="fungi-subtitle">Exploring the fascinating world of mushrooms</p>
            </div>
            
            <div class="fungi-content">
                <div class="fungi-section">
                    <h4>Current Grows</h4>
                    <div class="fungi-grid">
                        <div class="fungi-item">
                            <div class="fungi-image placeholder">
                                <span>Lions Mane</span>
                            </div>
                            <h5>Lions Mane</h5>
                            <p>Hericium erinaceus</p>
                        </div>
                        <div class="fungi-item">
                            <div class="fungi-image placeholder">
                                <span>Oyster</span>
                            </div>
                            <h5>Oyster</h5>
                            <p>Pleurotus ostreatus</p>
                        </div>
                        <div class="fungi-item">
                            <div class="fungi-image placeholder">
                                <span>Reishi</span>
                            </div>
                            <h5>Reishi</h5>
                            <p>Ganoderma lucidum</p>
                        </div>
                    </div>
                </div>
                
                <div class="fungi-section">
                    <h4>Upcoming Workshops</h4>
                    <div class="workshops-list">
                        <div class="workshop-item">
                            <div class="workshop-date">
                                <span class="month">MAR</span>
                                <span class="day">12</span>
                            </div>
                            <div class="workshop-details">
                                <h5>Fungi Cultivation Basics</h5>
                                <p>Learn the fundamentals of growing gourmet mushrooms at home</p>
                                <p class="workshop-time">2:00 PM - 4:00 PM</p>
                            </div>
                        </div>
                        <div class="workshop-item">
                            <div class="workshop-date">
                                <span class="month">MAR</span>
                                <span class="day">19</span>
                            </div>
                            <div class="workshop-details">
                                <h5>Medicinal Mushrooms</h5>
                                <p>Explore the health benefits and uses of medicinal fungi</p>
                                <p class="workshop-time">6:00 PM - 8:00 PM</p>
                            </div>
                        </div>
                        <div class="workshop-item">
                            <div class="workshop-date">
                                <span class="month">APR</span>
                                <span class="day">2</span>
                            </div>
                            <div class="workshop-details">
                                <h5>Advanced Cultivation Techniques</h5>
                                <p>Take your mushroom growing to the next level</p>
                                <p class="workshop-time">2:00 PM - 5:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="fungi-info">
                    <h4>About The Fungi Room</h4>
                    <p>The Fungi Room is a dedicated space for exploring the fascinating world of fungi. We grow various species of mushrooms, conduct research, and offer educational workshops to share knowledge about these incredible organisms.</p>
                    <p>Our mission is to promote understanding of fungi's role in ecosystems, their potential for sustainable solutions, and their culinary and medicinal applications.</p>
                    
                    <div class="cta-section">
                        <button class="btn-primary">Join a Workshop</button>
                        <button class="btn-secondary">Learn More</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add other content generators as needed

function generateDirectoryContent() {
    return `
        <div class="directory-container">
            <div class="directory-header">
                <h3>Community Directory</h3>
                <div class="directory-search">
                    <input type="text" placeholder="Search directory..." class="search-input">
                    <button class="search-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>
                <div class="directory-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="artists">Artists</button>
                    <button class="filter-btn" data-filter="makers">Makers</button>
                    <button class="filter-btn" data-filter="services">Services</button>
                    <button class="filter-btn" data-filter="organizations">Organizations</button>
                </div>
            </div>
            
            <div class="directory-content">
                <div class="directory-grid">
                    <!-- Sample directory entries -->
                    <div class="directory-card" data-type="artists">
                        <div class="card-header">
                            <div class="profile-placeholder"></div>
                            <div class="card-title">
                                <h4>Sarah Johnson</h4>
                                <p class="member-type">Visual Artist</p>
                            </div>
                        </div>
                        <div class="card-content">
                            <p>Specializing in sustainable art installations and mixed media works exploring environmental themes.</p>
                            <div class="tag-list">
                                <span class="tag">Painting</span>
                                <span class="tag">Sculpture</span>
                                <span class="tag">Installation</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn-text">View Profile</button>
                        </div>
                    </div>
                    
                    <div class="directory-card" data-type="makers">
                        <div class="card-header">
                            <div class="profile-placeholder"></div>
                            <div class="card-title">
                                <h4>Alex Rivera</h4>
                                <p class="member-type">Furniture Maker</p>
                            </div>
                        </div>
                        <div class="card-content">
                            <p>Creating handcrafted furniture from reclaimed wood with a focus on sustainable design and functionality.</p>
                            <div class="tag-list">
                                <span class="tag">Woodworking</span>
                                <span class="tag">Sustainable</span>
                                <span class="tag">Furniture</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn-text">View Profile</button>
                        </div>
                    </div>
                    
                    <div class="directory-card" data-type="services">
                        <div class="card-header">
                            <div class="profile-placeholder"></div>
                            <div class="card-title">
                                <h4>Green Growth</h4>
                                <p class="member-type">Urban Gardening Service</p>
                            </div>
                        </div>
                        <div class="card-content">
                            <p>Providing garden design, maintenance, and educational workshops for urban spaces and community projects.</p>
                            <div class="tag-list">
                                <span class="tag">Gardening</span>
                                <span class="tag">Education</span>
                                <span class="tag">Sustainability</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn-text">View Profile</button>
                        </div>
                    </div>
                    
                    <div class="directory-card" data-type="organizations">
                        <div class="card-header">
                            <div class="profile-placeholder"></div>
                            <div class="card-title">
                                <h4>Community Arts Collective</h4>
                                <p class="member-type">Non-profit Organization</p>
                            </div>
                        </div>
                        <div class="card-content">
                            <p>Supporting accessible arts programming for underserved communities through workshops, exhibitions, and events.</p>
                            <div class="tag-list">
                                <span class="tag">Arts</span>
                                <span class="tag">Education</span>
                                <span class="tag">Non-profit</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn-text">View Profile</button>
                        </div>
                    </div>
                </div>
                
                <div class="pagination">
                    <button class="page-btn active">1</button>
                    <button class="page-btn">2</button>
                    <button class="page-btn">3</button>
                    <button class="page-btn next">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="directory-footer">
                <div class="join-section">
                    <h4>Join Our Directory</h4>
                    <p>Are you a local artist, maker, or service provider? Join our community directory to connect with others and showcase your work.</p>
                    <button class="btn-primary">Apply to Join</button>
                </div>
            </div>
        </div>
    `;
}

// Initialize menu tabs
document.addEventListener('click', function(e) {
    if (e.target.matches('.menu-tab')) {
        const tabId = e.target.getAttribute('data-tab');
        const tabContainer = e.target.closest('.menu-container');
        
        if (tabContainer) {
            // Update active tab
            tabContainer.querySelectorAll('.menu-tab').forEach(tab => {
                tab.classList.toggle('active', tab === e.target);
            });
            
            // Update active content
            tabContainer.querySelectorAll('.menu-tab-content').forEach(content => {
                content.classList.toggle('active', content.id === `${tabId}-tab`);
            });
        }
    }
    
    // Handle directory filters
    if (e.target.matches('.filter-btn')) {
        const filter = e.target.getAttribute('data-filter');
        const container = e.target.closest('.directory-container');
        
        if (container) {
            // Update active filter
            container.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn === e.target);
            });
            
            // Filter directory cards
            container.querySelectorAll('.directory-card').forEach(card => {
                if (filter === 'all' || card.getAttribute('data-type') === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
});

// Add stubs for remaining content generators
function generateWorkshopsContent() {
    return generateDefaultContent('workshops');
}

function generateMarketplaceContent() {
    return generateDefaultContent('marketplace');
}

function generateEventsContent() {
    return generateDefaultContent('events');
}

function generateZineContent() {
    return generateDefaultContent('zine');
}

function generateOpportunitiesContent() {
    return generateDefaultContent('opportunities');
}

function generateMapContent() {
    return `
        <div class="map-content">
            <h3>UNIT3 Interactive Map</h3>
            <p>Explore our space and see what's happening now.</p>
            <button class="btn-primary" id="openSpatialMap">Open Full Map</button>
            <div class="map-preview">
                <img src="images/map-preview.png" alt="Map Preview" class="placeholder-image">
            </div>
        </div>
    `;
}

function generateNowContent() {
    return `
        <div class="now-container">
            <h3>Happening Now</h3>
            <div class="now-activity-list">
                <div class="now-item active">
                    <div class="activity-status">
                        <span class="status-dot"></span>
                        <span class="status-text">Active</span>
                    </div>
                    <div class="activity-details">
                        <h4>Coffee Workshop</h4>
                        <p>Café Area - Until 12:00 PM</p>
                    </div>
                </div>
                <div class="now-item moderate">
                    <div class="activity-status">
                        <span class="status-dot"></span>
                        <span class="status-text">Moderate</span>
                    </div>
                    <div class="activity-details">
                        <h4>Digital Workspaces</h4>
                        <p>Workroom - All Day</p>
                    </div>
                </div>
                <div class="now-item quiet">
                    <div class="activity-status">
                        <span class="status-dot"></span>
                        <span class="status-text">Quiet</span>
                    </div>
                    <div class="activity-details">
                        <h4>Art Installation</h4>
                        <p>Exhibition Space - All Day</p>
                    </div>
                </div>
                <div class="now-item active">
                    <div class="activity-status">
                        <span class="status-dot"></span>
                        <span class="status-text">Active</span>
                    </div>
                    <div class="activity-details">
                        <h4>Fungi Tour</h4>
                        <p>Fungi Room - Until 2:00 PM</p>
                    </div>
                </div>
            </div>
            <div class="capacity-info">
                <h4>Space Capacity</h4>
                <div class="capacity-meter">
                    <div class="capacity-bar" style="width: 65%;"></div>
                    <div class="capacity-label">65% Full</div>
                </div>
                <p class="capacity-message">Good time to visit! Plenty of space available.</p>
            </div>
        </div>
    `;
}

function generateUpcomingContent() {
    return generateDefaultContent('upcoming');
}

function generateCommunityContent() {
    return generateDefaultContent('community');
}

function generateExhibitionsContent() {
    return generateDefaultContent('exhibitions');
}

function generateClimateContent() {
    return generateDefaultContent('climate');
}

function generateSkillShareContent() {
    return generateDefaultContent('skillshare');
}

function generateWorkroomContent() {
    return generateDefaultContent('workroom');
}
