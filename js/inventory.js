// Inventory Management JavaScript

// Pagination state
let currentPage = 1;
let itemsPerPage = 6;
let totalItems = 0;
let currentInventory = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize DataService if available
    if (typeof DataService !== 'undefined') {
        DataService.utils.initializeAllData();
    }
    
    // Initialize Inventory Data
    initInventoryData();
    
    // Initialize Event Listeners
    initEventListeners();
    
    // Initialize Dynamic Model Dropdown
    initModelDropdown();
    
    // Initialize Mobile Card actions (sidebar handled by global mobile-nav.js)
    if (typeof initMobileCardActions === 'function') {
        initMobileCardActions();
    }
    
    // Add notification styles
    addInventoryNotificationStyles();
    
    // Initialize pagination dropdown
    initializePaginationDropdown();
});

// Initialize Event Listeners
function initEventListeners() {
    // Search Input
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            performSearch(this.value);
        });
        
        // Clear search on escape key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                performSearch('');
            }
        });
    }
    
    // Add Vehicle Button
    const addVehicleBtn = document.querySelector('.top-nav-actions .btn-primary');
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', openAddVehicleModal);
    }
    
    // Select All Checkbox
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.inventory-table tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    // Filter Button
    const filterBtn = document.querySelector('.filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            applyFilters();
        });
    }
    
    // Reset Button
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetFilters();
        });
    }
    
    // Pagination Buttons (using event delegation since buttons are dynamically created)
    const paginationControls = document.querySelector('.pagination-controls');
    if (paginationControls) {
        paginationControls.addEventListener('click', function(e) {
            const btn = e.target.closest('.pagination-btn');
            if (btn && !btn.classList.contains('active') && !btn.disabled) {
                const buttonText = btn.textContent.trim();
                
                // Handle navigation buttons
                if (btn.querySelector('.fa-chevron-left')) {
                    changePage('prev');
                } else if (btn.querySelector('.fa-chevron-right')) {
                    changePage('next');
                } else if (!isNaN(buttonText)) {
                    // Handle numbered page buttons
                    changePage(parseInt(buttonText));
                }
            }
        });
    }
    
    // Items Per Page Select
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function() {
            updateItemsPerPage(parseInt(this.value));
        });
    }
    
    // Action Buttons are handled by inventory-data.js in initInventoryEventListeners()
    // This is called after the table is populated with data
    
    // Add Vehicle Button (Quick Actions)
    const quickAddVehicleBtn = document.querySelector('.quick-actions .btn-primary');
    if (quickAddVehicleBtn) {
        quickAddVehicleBtn.addEventListener('click', function() {
            console.log('Add Vehicle button clicked');
            // openAddVehicleForm();
        });
    }
    
    // Import Button
    const importBtn = document.querySelector('.quick-actions .btn-secondary');
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            console.log('Import button clicked');
            openImportDialog();
        });
    }
}

// Initialize Dynamic Model Dropdown
function initModelDropdown() {
    const makeFilter = document.getElementById('make-filter');
    const modelFilter = document.getElementById('model-filter');
    
    if (makeFilter && modelFilter) {
        makeFilter.addEventListener('change', function() {
            // Clear current options except the first one
            while (modelFilter.options.length > 1) {
                modelFilter.remove(1);
            }
            
            // If "All Makes" is selected, don't add any models
            if (this.value === 'all') {
                return;
            }
            
            // Add models based on selected make
            const models = getModelsByMake(this.value);
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.toLowerCase().replace(/\s+/g, '-');
                option.textContent = model;
                modelFilter.appendChild(option);
            });
        });
    }
}

// Get Models by Make (would typically come from an API)
function getModelsByMake(make) {
    const modelsByMake = {
        'toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', '4Runner', 'Sienna'],
        'honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Ridgeline', 'Passport'],
        'ford': ['F-150', 'Escape', 'Explorer', 'Mustang', 'Edge', 'Bronco', 'Ranger', 'Expedition'],
        'chevrolet': ['Silverado', 'Equinox', 'Tahoe', 'Suburban', 'Traverse', 'Malibu', 'Camaro', 'Colorado'],
        'bmw': ['3 Series', '5 Series', 'X3', 'X5', '7 Series', 'X1', 'X7', 'i4'],
        'mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class', 'A-Class', 'GLA', 'GLS'],
        'audi': ['A4', 'Q5', 'A6', 'Q7', 'A3', 'Q3', 'e-tron', 'A8'],
        'lexus': ['RX', 'ES', 'NX', 'GX', 'IS', 'UX', 'LS', 'LX']
    };
    
    return modelsByMake[make] || [];
}

// Perform Search
function performSearch(searchTerm) {
    // Get all inventory
    const allInventory = DataService.inventory.getAll();
    
    // If search term is empty, show all vehicles
    if (!searchTerm || searchTerm.trim() === '') {
        populateInventoryTableWithData(allInventory);
        updateSearchResultsMessage('');
        return;
    }
    
    // Convert search term to lowercase for case-insensitive search
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Filter inventory based on search term
    const filteredInventory = allInventory.filter(vehicle => {
        // Search in multiple fields
        const searchableFields = [
            vehicle.vin,
            vehicle.stockNumber,
            vehicle.make,
            vehicle.model,
            vehicle.trim,
            vehicle.color,
            vehicle.year?.toString(),
            vehicle.type,
            vehicle.status
        ];
        
        // Check if any field contains the search term
        return searchableFields.some(field => {
            if (field) {
                return field.toString().toLowerCase().includes(searchLower);
            }
            return false;
        });
    });
    
    // Update table with search results
    populateInventoryTableWithData(filteredInventory);
    
    // Update search results message
    updateSearchResultsMessage(searchTerm, filteredInventory.length);
}

// Update Search Results Message
function updateSearchResultsMessage(searchTerm, resultCount) {
    // Find or create search results message element
    let messageElement = document.querySelector('.search-results-message');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = 'search-results-message';
        
        // Insert after page header
        const pageHeader = document.querySelector('.page-header');
        if (pageHeader) {
            pageHeader.insertAdjacentElement('afterend', messageElement);
        }
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
        messageElement.innerHTML = `
            <div class="search-results-info">
                <i class="fas fa-search"></i>
                <span>Search results for "<strong>${searchTerm}</strong>": ${resultCount} vehicle${resultCount !== 1 ? 's' : ''} found</span>
                <button class="clear-search-btn" onclick="clearSearch()">
                    <i class="fas fa-times"></i> Clear Search
                </button>
            </div>
        `;
        messageElement.style.display = 'block';
    } else {
        messageElement.style.display = 'none';
    }
}

// Clear Search
function clearSearch() {
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.value = '';
        performSearch('');
    }
}

// Change Page Function
function changePage(page) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (page === 'prev') {
        if (currentPage > 1) {
            currentPage--;
        }
    } else if (page === 'next') {
        if (currentPage < totalPages) {
            currentPage++;
        }
    } else if (typeof page === 'number') {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }
    
    // Update the display
    displayCurrentPage();
    updatePaginationControls();
}

// Update Items Per Page
function updateItemsPerPage(newItemsPerPage) {
    itemsPerPage = newItemsPerPage;
    currentPage = 1; // Reset to first page
    
    // Update the display
    displayCurrentPage();
    updatePaginationControls();
}

// Display Current Page
function displayCurrentPage() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = currentInventory.slice(startIndex, endIndex);
    
    // Update table with current page data
    populateInventoryTableWithPageData(pageData);
    
    // Update pagination info
    updatePaginationInfo();
}

// Update Pagination Controls
function updatePaginationControls() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationControls = document.querySelector('.pagination-controls');
    
    if (!paginationControls) return;
    
    // Clear existing controls
    paginationControls.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    paginationControls.appendChild(prevBtn);
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    // First page if not in range
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-btn';
        firstBtn.textContent = '1';
        paginationControls.appendChild(firstBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationControls.appendChild(ellipsis);
        }
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn';
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        paginationControls.appendChild(pageBtn);
    }
    
    // Last page if not in range
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationControls.appendChild(ellipsis);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-btn';
        lastBtn.textContent = totalPages;
        paginationControls.appendChild(lastBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    paginationControls.appendChild(nextBtn);
}

// Update Pagination Info
function updatePaginationInfo() {
    const paginationInfo = document.querySelector('.pagination-info');
    if (!paginationInfo) return;
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} vehicles`;
}

// Initialize Pagination Dropdown
function initializePaginationDropdown() {
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.value = itemsPerPage.toString();
    }
}

// Populate Inventory Table with Page Data (for pagination)
function populateInventoryTableWithPageData(pageData) {
    const tableBody = document.querySelector('.inventory-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (pageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="15" class="text-center" style="padding: 2rem; color: #6b7280;">
                    No vehicles found matching your search criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    // Add vehicles to the table
    pageData.forEach(vehicle => {
        const row = document.createElement('tr');
        
        // Create status badge HTML
        let statusBadgeHtml = '';
        switch(vehicle.status) {
            case 'in-stock':
                statusBadgeHtml = '<span class="status-badge in-stock">In Stock</span>';
                break;
            case 'in-transit':
                statusBadgeHtml = '<span class="status-badge in-transit">In Transit</span>';
                break;
            case 'on-hold':
                statusBadgeHtml = '<span class="status-badge on-hold">On Hold</span>';
                break;
            case 'sold':
                statusBadgeHtml = '<span class="status-badge sold">Sold</span>';
                break;
            default:
                statusBadgeHtml = '<span class="status-badge">' + vehicle.status + '</span>';
        }
        
        // Calculate days in stock
        const daysInStock = vehicle.dateAdded ? Math.floor((new Date() - new Date(vehicle.dateAdded)) / (1000 * 60 * 60 * 24)) : 0;
        
        // Create row HTML
        row.innerHTML = `
            <td>
                <input type="checkbox" id="vehicle-${vehicle.id}" name="selected-vehicles">
                <label for="vehicle-${vehicle.id}"></label>
            </td>
            <td>
                <div class="vehicle-photo">
                    <img src="assets/vehicles/car1.jpg" alt="${vehicle.year} ${vehicle.make} ${vehicle.model}">
                </div>
            </td>
            <td>${vehicle.stockNumber || '-'}</td>
            <td>${vehicle.vin || '-'}</td>
            <td>${vehicle.year || '-'}</td>
            <td>${vehicle.make || '-'}</td>
            <td>${vehicle.model || '-'}</td>
            <td>${vehicle.trim || '-'}</td>
            <td>${vehicle.color || '-'}</td>
            <td>${vehicle.type || 'Used'}</td>
            <td>${vehicle.mileage ? vehicle.mileage.toLocaleString() : '-'}</td>
            <td>${vehicle.price ? '$' + vehicle.price.toLocaleString() : '-'}</td>
            <td>${daysInStock}</td>
            <td>${statusBadgeHtml}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="More Options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Also populate mobile cards
    populateMobileCards(pageData);
    
    // Re-initialize event listeners for the new elements
    if (typeof initInventoryEventListeners === 'function') {
        initInventoryEventListeners();
    }
}

// Populate Inventory Table with Data (helper function)
function populateInventoryTableWithData(inventory) {
    // Update pagination state
    currentInventory = inventory;
    totalItems = inventory.length;
    currentPage = 1; // Reset to first page
    
    // Update pagination controls and display first page
    updatePaginationControls();
    displayCurrentPage();
}

// Populate Mobile Cards (for responsive design)
function populateMobileCards(inventory) {
    const mobileContainer = document.querySelector('.mobile-inventory-cards');
    
    if (!mobileContainer) return;
    
    // Clear existing cards
    mobileContainer.innerHTML = '';
    
    if (inventory.length === 0) {
        mobileContainer.innerHTML = `
            <div class="mobile-no-results">
                <i class="fas fa-search"></i>
                <p>No vehicles found matching your search criteria.</p>
            </div>
        `;
        return;
    }
    
    // Add vehicles as mobile cards
    inventory.forEach(vehicle => {
        const card = document.createElement('div');
        card.className = 'mobile-vehicle-card';
        
        // Create status badge HTML
        let statusBadgeHtml = '';
        switch(vehicle.status) {
            case 'in-stock':
                statusBadgeHtml = '<span class="status-badge in-stock">In Stock</span>';
                break;
            case 'in-transit':
                statusBadgeHtml = '<span class="status-badge in-transit">In Transit</span>';
                break;
            case 'on-hold':
                statusBadgeHtml = '<span class="status-badge on-hold">On Hold</span>';
                break;
            case 'sold':
                statusBadgeHtml = '<span class="status-badge sold">Sold</span>';
                break;
            default:
                statusBadgeHtml = '<span class="status-badge">' + vehicle.status + '</span>';
        }
        
        // Calculate days in stock
        const daysInStock = vehicle.dateAdded ? Math.floor((new Date() - new Date(vehicle.dateAdded)) / (1000 * 60 * 60 * 24)) : 0;
        
        card.innerHTML = `
            <div class="mobile-card-header">
                <div class="mobile-card-checkbox">
                    <input type="checkbox" id="mobile-vehicle-${vehicle.id}" name="selected-vehicles">
                    <label for="mobile-vehicle-${vehicle.id}"></label>
                </div>
                <div class="mobile-card-image">
                    <img src="assets/vehicles/car1.jpg" alt="${vehicle.year} ${vehicle.make} ${vehicle.model}">
                </div>
            </div>
            <div class="mobile-card-content">
                <div class="mobile-card-title">
                    <h3>${vehicle.year} ${vehicle.make} ${vehicle.model}</h3>
                    <p>Stock #${vehicle.stockNumber || '-'} • VIN: ${vehicle.vin || '-'}</p>
                </div>
                <div class="mobile-card-details">
                    <div class="mobile-detail-row">
                        <span class="detail-label">Trim:</span>
                        <span class="detail-value">${vehicle.trim || '-'}</span>
                    </div>
                    <div class="mobile-detail-row">
                        <span class="detail-label">Color:</span>
                        <span class="detail-value">${vehicle.color || '-'}</span>
                    </div>
                    <div class="mobile-detail-row">
                        <span class="detail-label">Mileage:</span>
                        <span class="detail-value">${vehicle.mileage ? vehicle.mileage.toLocaleString() : '-'}</span>
                    </div>
                    <div class="mobile-detail-row">
                        <span class="detail-label">Price:</span>
                        <span class="detail-value price">${vehicle.price ? '$' + vehicle.price.toLocaleString() : '-'}</span>
                    </div>
                    <div class="mobile-detail-row">
                        <span class="detail-label">Days in Stock:</span>
                        <span class="detail-value">${daysInStock}</span>
                    </div>
                </div>
                <div class="mobile-card-status">
                    ${statusBadgeHtml}
                </div>
                <div class="mobile-card-actions">
                    <button class="btn-icon" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="More Options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        `;
        
        mobileContainer.appendChild(card);
    });
}

// Apply Filters
function applyFilters() {
    // Clear search when applying filters
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Hide search results message
    updateSearchResultsMessage('');
    
    // Get filter values
    const status = document.getElementById('status-filter').value;
    const type = document.getElementById('type-filter').value;
    const make = document.getElementById('make-filter').value;
    const model = document.getElementById('model-filter').value;
    const year = document.getElementById('year-filter').value;
    const price = document.getElementById('price-filter').value;
    
    // Log filter values
    console.log('Applying filters:', {
        status,
        type,
        make,
        model,
        year,
        price
    });
    
    // Apply filters and get count of results
    const resultCount = applyInventoryFilters();
    
    // Show message with result count
    alert(`Filters applied! Found ${resultCount} vehicles matching your criteria.`);
}

// Reset Filters
function resetFilters() {
    // Clear search input
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Hide search results message
    updateSearchResultsMessage('');
    
    // Reset filters and repopulate table
    resetInventoryFilters();
    
    console.log('Filters reset');
    
    // Show message
    alert('Filters reset! Showing all vehicles.');
}

// Modal functions
function openAddVehicleModal() {
    console.log('Opening Add Vehicle Modal...');
    
    // Remove existing modal if it exists
    const existingModal = document.getElementById('add-vehicle-modal');
    if (existingModal) {
        existingModal.remove();
        console.log('Removed existing modal');
    }
    
    // Always create a fresh modal
    createAddVehicleModal();
}

function closeAddVehicleModal() {
    console.log('Closing Add Vehicle Modal...');
    const modal = document.getElementById('add-vehicle-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Modal class removed, hiding...');
        
        // Remove modal after animation
        setTimeout(() => {
            modal.remove();
            console.log('Modal removed from DOM');
        }, 300);
    } else {
        console.log('No modal found to close');
    }
}

function createAddVehicleModal() {
    console.log('Creating Add Vehicle Modal...');
    const modalHTML = `
        <div id="add-vehicle-modal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Add New Vehicle</h3>
                    <button type="button" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="add-vehicle-form">
                        <div class="form-section">
                            <h4 class="form-section-title">Basic Information</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="stockNumber">Stock Number *</label>
                                    <input type="text" id="stockNumber" name="stockNumber" required>
                                </div>
                                <div class="form-group">
                                    <label for="vin">VIN *</label>
                                    <input type="text" id="vin" name="vin" required maxlength="17">
                                </div>
                            </div>
                            <div class="form-row-3">
                                <div class="form-group">
                                    <label for="year">Year *</label>
                                    <select id="year" name="year" required>
                                        <option value="">Select Year</option>
                                        ${generateYearOptions()}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="make">Make *</label>
                                    <select id="make" name="make" required>
                                        <option value="">Select Make</option>
                                        <option value="Toyota">Toyota</option>
                                        <option value="Honda">Honda</option>
                                        <option value="Ford">Ford</option>
                                        <option value="Chevrolet">Chevrolet</option>
                                        <option value="BMW">BMW</option>
                                        <option value="Mercedes-Benz">Mercedes-Benz</option>
                                        <option value="Audi">Audi</option>
                                        <option value="Lexus">Lexus</option>
                                        <option value="Nissan">Nissan</option>
                                        <option value="Hyundai">Hyundai</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="model">Model *</label>
                                    <input type="text" id="model" name="model" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="trim">Trim</label>
                                    <input type="text" id="trim" name="trim">
                                </div>
                                <div class="form-group">
                                    <label for="color">Color *</label>
                                    <input type="text" id="color" name="color" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4 class="form-section-title">Pricing & Details</h4>
                        <div class="form-row-3">
                            <div class="form-group">
                                <label for="price">Price *</label>
                                <input type="number" id="price" name="price" required min="0" step="1">
                            </div>
                            <div class="form-group">
                                <label for="cost">Cost</label>
                                <input type="number" id="cost" name="cost" min="0" step="1">
                            </div>
                            <div class="form-group">
                                <label for="mileage">Mileage *</label>
                                <input type="number" id="mileage" name="mileage" required min="0">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="status">Status *</label>
                                <select id="status" name="status" required>
                                    <option value="in-stock">In Stock</option>
                                    <option value="in-transit">In Transit</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="sold">Sold</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="location">Location</label>
                                <select id="location" name="location">
                                    <option value="Main Lot">Main Lot</option>
                                    <option value="Truck Lot">Truck Lot</option>
                                    <option value="Luxury Lot">Luxury Lot</option>
                                    <option value="Service Area">Service Area</option>
                                    <option value="In Transit">In Transit</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4 class="form-section-title">Additional Information</h4>
                        <div class="form-group">
                            <label for="features">Features (comma-separated)</label>
                            <textarea id="features" name="features" placeholder="e.g., Leather Seats, Navigation, Sunroof, Bluetooth"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" placeholder="Enter vehicle description..."></textarea>
                        </div>
                    </div>
                    
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline" onclick="closeAddVehicleModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Vehicle</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal HTML inserted into DOM');
    
    // Add event handlers
    const modal = document.getElementById('add-vehicle-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    if (!modal) {
        console.error('ERROR: Modal not found after insertion!');
        return;
    }
    
    console.log('Modal found, setting up events...');
    
    // Close button handler
    closeBtn.addEventListener('click', closeAddVehicleModal);
    
    // Click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAddVehicleModal();
        }
    });
    
    // Escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeAddVehicleModal();
        }
    });
    
    // Show the modal
    console.log('Showing modal...');
    setTimeout(() => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Modal should now be visible with class:', modal.className);
    }, 10);
    
    // Add form submission handler
    document.getElementById('add-vehicle-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const vehicleData = {
            stockNumber: formData.get('stockNumber'),
            vin: formData.get('vin'),
            year: parseInt(formData.get('year')),
            make: formData.get('make'),
            model: formData.get('model'),
            trim: formData.get('trim') || '',
            color: formData.get('color'),
            price: parseFloat(formData.get('price')),
            cost: parseFloat(formData.get('cost')) || 0,
            mileage: parseInt(formData.get('mileage')),
            status: formData.get('status'),
            location: formData.get('location') || 'Main Lot',
            features: formData.get('features') ? formData.get('features').split(',').map(f => f.trim()) : [],
            description: formData.get('description') || ''
        };
        
        try {
            // Add vehicle using DataService
            if (typeof DataService !== 'undefined') {
                DataService.inventory.add(vehicleData);
                showNotification('Vehicle added successfully!', 'success');
            } else {
                console.log('Vehicle data:', vehicleData);
                showNotification('Vehicle would be added (DataService not available)', 'info');
            }
            
            closeAddVehicleModal();
            
            // Refresh inventory if function exists
            if (typeof initInventoryData === 'function') {
                initInventoryData();
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
            showNotification('Error adding vehicle: ' + error.message, 'error');
        }
    });
}

function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const startYear = 1990;
    let options = '';
    
    for (let year = currentYear + 1; year >= startYear; year--) {
        options += `<option value="${year}">${year}</option>`;
    }
    
    return options;
}

// Notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add notification styles
function addInventoryNotificationStyles() {
    if (!document.getElementById('inventory-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'inventory-notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .notification.success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }
            
            .notification.error {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }
            
            .notification.info {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            }
            
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .modal.active {
                display: flex;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 0;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            .modal-header {
                padding: 20px 30px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #1e40af;
                font-size: 1.5rem;
                font-weight: 600;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                color: #6b7280;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-btn:hover {
                color: #374151;
            }
            
            .form-section {
                padding: 20px 30px;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .form-section:last-of-type {
                border-bottom: none;
            }
            
            .form-section-title {
                margin: 0 0 15px 0;
                color: #374151;
                font-size: 1.1rem;
                font-weight: 600;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .form-row-3 {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                color: #374151;
                font-weight: 600;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 10px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-group textarea {
                resize: vertical;
                min-height: 80px;
            }
            
            .form-actions {
                padding: 20px 30px;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .btn {
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
            }
            
            .btn-primary:hover {
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                transform: translateY(-1px);
            }
            
            .btn-outline {
                background: transparent;
                color: #6b7280;
                border: 2px solid #e5e7eb;
            }
            
            .btn-outline:hover {
                background: #f9fafb;
                border-color: #d1d5db;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// These functions are now implemented in inventory-data.js

// Function to open add vehicle form
function openAddVehicleForm() {
    const formContent = `
        <form id="addVehicleForm">
            <div class="form-section">
                <h4 class="form-section-title">Basic Information</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="stockNumber">Stock Number *</label>
                        <input type="text" id="stockNumber" name="stockNumber" required>
                    </div>
                    <div class="form-group">
                        <label for="vin">VIN *</label>
                        <input type="text" id="vin" name="vin" required maxlength="17">
                    </div>
                </div>
                <div class="form-row-3">
                    <div class="form-group">
                        <label for="year">Year *</label>
                        <select id="year" name="year" required>
                            <option value="">Select Year</option>
                            ${generateYearOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="make">Make *</label>
                        <select id="make" name="make" required>
                            <option value="">Select Make</option>
                            <option value="Toyota">Toyota</option>
                            <option value="Honda">Honda</option>
                            <option value="Ford">Ford</option>
                            <option value="Chevrolet">Chevrolet</option>
                            <option value="BMW">BMW</option>
                            <option value="Mercedes-Benz">Mercedes-Benz</option>
                            <option value="Audi">Audi</option>
                            <option value="Lexus">Lexus</option>
                            <option value="Nissan">Nissan</option>
                            <option value="Hyundai">Hyundai</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="model">Model *</label>
                        <input type="text" id="model" name="model" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="trim">Trim</label>
                        <input type="text" id="trim" name="trim">
                    </div>
                    <div class="form-group">
                        <label for="color">Color *</label>
                        <input type="text" id="color" name="color" required>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Pricing & Details</h4>
                <div class="form-row-3">
                    <div class="form-group">
                        <label for="price">Price *</label>
                        <input type="number" id="price" name="price" required min="0" step="1">
                    </div>
                    <div class="form-group">
                        <label for="cost">Cost</label>
                        <input type="number" id="cost" name="cost" min="0" step="1">
                    </div>
                    <div class="form-group">
                        <label for="mileage">Mileage *</label>
                        <input type="number" id="mileage" name="mileage" required min="0">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="status">Status *</label>
                        <select id="status" name="status" required>
                            <option value="in-stock">In Stock</option>
                            <option value="in-transit">In Transit</option>
                            <option value="on-hold">On Hold</option>
                            <option value="sold">Sold</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="location">Location</label>
                        <select id="location" name="location">
                            <option value="Main Lot">Main Lot</option>
                            <option value="Truck Lot">Truck Lot</option>
                            <option value="Luxury Lot">Luxury Lot</option>
                            <option value="Service Area">Service Area</option>
                            <option value="In Transit">In Transit</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Additional Information</h4>
                <div class="form-group">
                    <label for="features">Features (comma-separated)</label>
                    <textarea id="features" name="features" placeholder="e.g., Leather Seats, Navigation, Sunroof, Bluetooth"></textarea>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" placeholder="Enter vehicle description..."></textarea>
                </div>
            </div>
        </form>
    `;
    
    const footerButtons = [
        {
            text: 'Cancel',
            class: 'btn-outline',
            attributes: 'data-modal-close'
        },
        {
            text: 'Add Vehicle',
            class: 'btn-primary',
            icon: 'fas fa-plus',
            attributes: 'id="saveVehicleBtn"'
        }
    ];
    
    ModalUtils.createModal('addVehicleModal', 'Add New Vehicle', formContent, footerButtons);
    ModalUtils.openModal('addVehicleModal');
    
    // Handle form submission
    const saveBtn = document.getElementById('saveVehicleBtn');
    const form = document.getElementById('addVehicleForm');
    
    saveBtn.addEventListener('click', function() {
        handleAddVehicleSubmit(form, saveBtn);
    });
}

// Generate year options for dropdown
function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const startYear = 1990;
    let options = '';
    
    for (let year = currentYear + 1; year >= startYear; year--) {
        options += `<option value="${year}">${year}</option>`;
    }
    
    return options;
}

// Handle add vehicle form submission
function handleAddVehicleSubmit(form, saveBtn) {
    // Clear previous errors
    ModalUtils.clearFormErrors();
    
    // Validate form
    const errors = ModalUtils.validateForm(form);
    
    // Additional custom validations
    const stockNumber = form.stockNumber.value.trim();
    const vin = form.vin.value.trim();
    
    // Check if stock number already exists
    const existingVehicles = DataService.inventory.getAll();
    if (existingVehicles.some(v => v.stockNumber === stockNumber)) {
        errors.stockNumber = 'Stock number already exists';
    }
    
    // Check if VIN already exists
    if (existingVehicles.some(v => v.vin === vin)) {
        errors.vin = 'VIN already exists';
    }
    
    // VIN length validation
    if (vin && vin.length !== 17) {
        errors.vin = 'VIN must be exactly 17 characters';
    }
    
    if (Object.keys(errors).length > 0) {
        ModalUtils.displayFormErrors(errors);
        return;
    }
    
    // Show loading state
    ModalUtils.setButtonLoading(saveBtn, true);
    
    // Get form data
    const formData = ModalUtils.getFormData(form);
    
    // Process features
    const features = formData.features ? 
        formData.features.split(',').map(f => f.trim()).filter(f => f) : [];
    
    // Create vehicle object
    const vehicle = {
        stockNumber: formData.stockNumber,
        vin: formData.vin,
        year: parseInt(formData.year),
        make: formData.make,
        model: formData.model,
        trim: formData.trim || '',
        color: formData.color,
        price: parseInt(formData.price),
        cost: formData.cost ? parseInt(formData.cost) : 0,
        mileage: parseInt(formData.mileage),
        status: formData.status,
        location: formData.location || 'Main Lot',
        features: features,
        description: formData.description || '',
        images: [], // Will be populated later when image upload is implemented
        dateAdded: new Date().toISOString().split('T')[0]
    };
    
    // Simulate API call delay
    setTimeout(() => {
        try {
            // Add vehicle to data service
            DataService.inventory.add(vehicle);
            
            // Show success message
            ModalUtils.showSuccessMessage('Vehicle added successfully!');
            
            // Close modal
            ModalUtils.closeModal('addVehicleModal');
            ModalUtils.removeModal('addVehicleModal');
            
            // Refresh the inventory table
            populateInventoryTable();
            
        } catch (error) {
            console.error('Error adding vehicle:', error);
            ModalUtils.showErrorMessage('Failed to add vehicle. Please try again.');
        } finally {
            ModalUtils.setButtonLoading(saveBtn, false);
        }
    }, 1000);
}

// Function to open import dialog
function openImportDialog() {
    console.log('Opening import dialog');
    
    const modalContent = `
        <div class="import-container">
            <div class="import-instructions">
                <h4><i class="fas fa-info-circle"></i> CSV Import Instructions</h4>
                <p>Upload a CSV file with the following columns (in any order):</p>
                <div class="csv-columns">
                    <span class="csv-column">make</span>
                    <span class="csv-column">model</span>
                    <span class="csv-column">year</span>
                    <span class="csv-column">price</span>
                    <span class="csv-column">mileage</span>
                    <span class="csv-column">color</span>
                    <span class="csv-column">vin</span>
                    <span class="csv-column">status</span>
                </div>
                <p class="note"><strong>Note:</strong> The first row should contain column headers. Missing columns will be left empty.</p>
                <div class="template-download">
                    <button type="button" class="btn btn-outline" id="downloadTemplateBtn">
                        <i class="fas fa-download"></i> Download CSV Template
                    </button>
                </div>
            </div>
            
            <div class="file-upload-area">
                <input type="file" id="csvFileInput" accept=".csv" style="display: none;">
                <div class="file-drop-zone" id="fileDropZone">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Click to select CSV file or drag and drop</p>
                    <small>Supported format: .csv</small>
                </div>
            </div>
            
            <div class="import-preview" id="importPreview" style="display: none;">
                <h4>Preview (First 5 rows)</h4>
                <div class="preview-table-container">
                    <table class="preview-table" id="previewTable">
                        <thead id="previewHeader"></thead>
                        <tbody id="previewBody"></tbody>
                    </table>
                </div>
                <div class="import-summary">
                    <span id="importSummary"></span>
                </div>
            </div>
        </div>
    `;
    
    const footerButtons = [
        {
            text: 'Cancel',
            class: 'btn-secondary',
            attributes: 'data-modal-close'
        },
        {
            text: 'Import Vehicles',
            class: 'btn-primary',
            attributes: 'id="importVehiclesBtn" disabled',
            icon: 'fas fa-file-import'
        }
    ];
    
    // Create and show modal
    ModalUtils.createModal('importModal', 'Import Vehicles from CSV', modalContent, footerButtons);
    ModalUtils.openModal('importModal');
    
    // Initialize file upload functionality
    initFileUpload();
    
    // Initialize template download
    initTemplateDownload();
}

// Initialize file upload functionality
function initFileUpload() {
    const fileInput = document.getElementById('csvFileInput');
    const dropZone = document.getElementById('fileDropZone');
    const importBtn = document.getElementById('importVehiclesBtn');
    
    let csvData = null;
    
    // Click to select file
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File selection handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });
    
    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/csv') {
            handleFileUpload(file);
        } else {
            ModalUtils.showErrorMessage('Please upload a valid CSV file.');
        }
    });
    
    // Import button handler
    importBtn.addEventListener('click', () => {
        if (csvData) {
            importVehiclesFromCSV(csvData);
        }
    });
    
    // Handle file upload and parsing
    function handleFileUpload(file) {
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            ModalUtils.showErrorMessage('Please upload a valid CSV file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                csvData = parseCSV(csvText);
                
                if (csvData && csvData.length > 0) {
                    showPreview(csvData);
                    importBtn.disabled = false;
                } else {
                    ModalUtils.showErrorMessage('No valid data found in CSV file.');
                }
            } catch (error) {
                console.error('Error parsing CSV:', error);
                ModalUtils.showErrorMessage('Error parsing CSV file. Please check the format.');
            }
        };
        
        reader.readAsText(file);
    }
}

// Initialize template download functionality
function initTemplateDownload() {
    const downloadBtn = document.getElementById('downloadTemplateBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadCSVTemplate();
        });
    }
}

// Download CSV template
function downloadCSVTemplate() {
    const csvContent = `make,model,year,price,mileage,color,vin,status
Toyota,Camry,2023,28500,15000,Silver,1HGBH41JXMN109186,Available
Honda,Civic,2022,24000,22000,Blue,2HGFC2F59NH123456,Available
Ford,F-150,2023,35000,8000,Red,1FTFW1ET5NFC12345,Available`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'inventory-template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Parse CSV text into array of objects
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
    }
    
    // Parse header row
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header.toLowerCase()] = values[index].trim().replace(/"/g, '');
            });
            
            // Validate and convert data types
            if (row.make && row.model) { // At minimum, require make and model
                // Convert numeric fields
                if (row.year) row.year = parseInt(row.year) || '';
                if (row.price) row.price = parseFloat(row.price) || '';
                if (row.mileage) row.mileage = parseInt(row.mileage) || '';
                
                // Set default status if not provided
                if (!row.status) row.status = 'Available';
                
                data.push(row);
            }
        }
    }
    
    return data;
}

// Parse a single CSV line (handles commas within quotes)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Show preview of CSV data
function showPreview(data) {
    const previewContainer = document.getElementById('importPreview');
    const previewHeader = document.getElementById('previewHeader');
    const previewBody = document.getElementById('previewBody');
    const importSummary = document.getElementById('importSummary');
    
    // Show preview container
    previewContainer.style.display = 'block';
    
    // Create header
    const headers = Object.keys(data[0]);
    previewHeader.innerHTML = `<tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>`;
    
    // Create preview rows (first 5)
    const previewRows = data.slice(0, 5);
    previewBody.innerHTML = previewRows.map(row => 
        `<tr>${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}</tr>`
    ).join('');
    
    // Update summary
    importSummary.innerHTML = `<i class="fas fa-check-circle text-success"></i> Ready to import ${data.length} vehicle(s)`;
}

// Import vehicles from parsed CSV data
function importVehiclesFromCSV(data) {
    const importBtn = document.getElementById('importVehiclesBtn');
    ModalUtils.setButtonLoading(importBtn, true);
    
    try {
        let successCount = 0;
        let errorCount = 0;
        
        data.forEach(vehicleData => {
            try {
                // Add the vehicle using DataService
                DataService.inventory.add(vehicleData);
                successCount++;
            } catch (error) {
                console.error('Error importing vehicle:', vehicleData, error);
                errorCount++;
            }
        });
        
        // Show success message
        const message = errorCount > 0 
            ? `Import completed: ${successCount} vehicles imported successfully, ${errorCount} failed.`
            : `Successfully imported ${successCount} vehicle(s)!`;
            
        ModalUtils.showSuccessMessage(message);
        
        // Close modal and refresh table
        setTimeout(() => {
            ModalUtils.closeModal('importModal');
            ModalUtils.removeModal('importModal');
            populateInventoryTable(); // Refresh the inventory table
        }, 2000);
        
    } catch (error) {
        console.error('Error during import:', error);
        ModalUtils.showErrorMessage('An error occurred during import. Please try again.');
    } finally {
        ModalUtils.setButtonLoading(importBtn, false);
    }
}

// Initialize Mobile Menu (disabled - handled globally in mobile-nav.js)
function initMobileMenu() {
    // Sidebar toggle handled by global mobile-nav.js
    if (typeof initMobileCardActions === 'function') {
        initMobileCardActions();
    }
}

// Initialize Mobile Card Actions
function initMobileCardActions() {
    // Mobile card action buttons
    const mobileViewButtons = document.querySelectorAll('.mobile-card-actions .btn-icon[title="View Details"]');
    mobileViewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.mobile-vehicle-card');
            const checkbox = card.querySelector('input[type="checkbox"]');
            const vehicleId = checkbox.id.replace('mobile-vehicle-', '');
            console.log('View details for vehicle ID:', vehicleId);
            viewVehicleDetailsById(vehicleId);
        });
    });
    
    const mobileEditButtons = document.querySelectorAll('.mobile-card-actions .btn-icon[title="Edit"]');
    mobileEditButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.mobile-vehicle-card');
            const checkbox = card.querySelector('input[type="checkbox"]');
            const vehicleId = checkbox.id.replace('mobile-vehicle-', '');
            console.log('Edit vehicle with ID:', vehicleId);
            editVehicleById(vehicleId);
        });
    });
    
    const mobileMoreButtons = document.querySelectorAll('.mobile-card-actions .btn-icon[title="More Options"]');
    mobileMoreButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.mobile-vehicle-card');
            const checkbox = card.querySelector('input[type="checkbox"]');
            const vehicleId = checkbox.id.replace('mobile-vehicle-', '');
            console.log('More options for vehicle ID:', vehicleId);
            showMoreOptionsById(vehicleId, this);
        });
    });
    
    // Mobile card checkboxes
    const mobileCheckboxes = document.querySelectorAll('.mobile-card-checkbox input[type="checkbox"]');
    mobileCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Sync with desktop table if needed
            console.log('Mobile checkbox changed:', this.id, this.checked);
        });
    });
}