// Inventory Data Service

// Initialize Inventory Data
function initInventoryData() {
    try {
        // Initialize inventory data if it doesn't exist
        DataService.inventory.init();
        
        // Populate inventory table
        populateInventoryTable();
    } catch (error) {
        console.error('Error initializing inventory data:', error);
        showNotification('Error loading inventory data', 'error');
    }
}

// Populate Inventory Table
function populateInventoryTable() {
    try {
        const inventory = DataService.inventory.getAll();
        const tableBody = document.querySelector('.inventory-table tbody');
        
        if (!tableBody) return;
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        if (inventory.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center" style="padding: 2rem; color: #6b7280;">
                        No vehicles found. <a href="#" onclick="openAddVehicleModal()" style="color: #3b82f6;">Add your first vehicle</a>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Add vehicles to the table
        inventory.forEach(vehicle => {
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
            <td>${vehicle.stockNumber}</td>
            <td>${vehicle.year} ${vehicle.make} ${vehicle.model}</td>
            <td>${vehicle.trim}</td>
            <td>${vehicle.vin}</td>
            <td>${vehicle.color}</td>
            <td>${vehicle.mileage.toLocaleString()}</td>
            <td>$${vehicle.price.toLocaleString()}</td>
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
        
        // Update inventory stats
        updateInventoryStats();
        
        // Re-initialize event listeners for the new elements
        initInventoryEventListeners();
    } catch (error) {
        console.error('Error populating inventory table:', error);
        const tableBody = document.querySelector('.inventory-table tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center" style="padding: 2rem; color: #ef4444;">
                        Error loading inventory data. Please try refreshing the page.
                    </td>
                </tr>
            `;
        }
        throw error;
    }
}

// Update Inventory Stats
function updateInventoryStats() {
    const inventory = DataService.inventory.getAll();
    
    // Calculate stats
    const totalVehicles = inventory.length;
    const inStockVehicles = inventory.filter(item => item.status === 'in-stock').length;
    const inTransitVehicles = inventory.filter(item => item.status === 'in-transit').length;
    const onHoldVehicles = inventory.filter(item => item.status === 'on-hold').length;
    const soldVehicles = inventory.filter(item => item.status === 'sold').length;
    
    // Update DOM elements
    const statsContainer = document.querySelector('.inventory-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Vehicles:</span>
                <span class="stat-value">${totalVehicles}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">In Stock:</span>
                <span class="stat-value">${inStockVehicles}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">In Transit:</span>
                <span class="stat-value">${inTransitVehicles}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">On Hold:</span>
                <span class="stat-value">${onHoldVehicles}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Sold:</span>
                <span class="stat-value">${soldVehicles}</span>
            </div>
        `;
    }
}

// Initialize Inventory Event Listeners
function initInventoryEventListeners() {
    // Action Buttons
    const viewButtons = document.querySelectorAll('.action-buttons .btn-icon[title="View Details"]');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const stockNumber = row.cells[2].textContent;
            viewVehicleDetails(stockNumber);
        });
    });
    
    const editButtons = document.querySelectorAll('.action-buttons .btn-icon[title="Edit"]');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const stockNumber = row.cells[2].textContent;
            editVehicle(stockNumber);
        });
    });
    
    const moreButtons = document.querySelectorAll('.action-buttons .btn-icon[title="More Options"]');
    moreButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const stockNumber = row.cells[2].textContent;
            showMoreOptions(stockNumber, this);
        });
    });
}

// Apply Filters
function applyInventoryFilters() {
    // Get filter values
    const status = document.getElementById('status-filter').value;
    const type = document.getElementById('type-filter').value;
    const make = document.getElementById('make-filter').value;
    const model = document.getElementById('model-filter').value;
    const year = document.getElementById('year-filter').value;
    const price = document.getElementById('price-filter').value;
    
    // Get all inventory
    const allInventory = DataService.inventory.getAll();
    
    // Filter inventory
    let filteredInventory = allInventory;
    
    // Apply status filter
    if (status !== 'all') {
        filteredInventory = filteredInventory.filter(vehicle => vehicle.status === status);
    }
    
    // Apply make filter
    if (make !== 'all') {
        filteredInventory = filteredInventory.filter(vehicle => vehicle.make.toLowerCase() === make);
    }
    
    // Apply model filter
    if (model !== 'all') {
        filteredInventory = filteredInventory.filter(vehicle => {
            const vehicleModel = vehicle.model.toLowerCase().replace(/\s+/g, '-');
            return vehicleModel === model;
        });
    }
    
    // Apply year filter
    if (year !== 'all') {
        const yearRange = year.split('-');
        if (yearRange.length === 2) {
            const minYear = parseInt(yearRange[0]);
            const maxYear = parseInt(yearRange[1]);
            filteredInventory = filteredInventory.filter(vehicle => 
                vehicle.year >= minYear && vehicle.year <= maxYear
            );
        } else {
            const exactYear = parseInt(year);
            filteredInventory = filteredInventory.filter(vehicle => vehicle.year === exactYear);
        }
    }
    
    // Apply price filter
    if (price !== 'all') {
        const priceRange = price.split('-');
        if (priceRange.length === 2) {
            const minPrice = parseInt(priceRange[0]);
            const maxPrice = parseInt(priceRange[1]);
            filteredInventory = filteredInventory.filter(vehicle => 
                vehicle.price >= minPrice && vehicle.price <= maxPrice
            );
        }
    }
    
    // Update table with filtered inventory
    const tableBody = document.querySelector('.inventory-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add filtered vehicles to the table
    filteredInventory.forEach(vehicle => {
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
            <td>${vehicle.stockNumber}</td>
            <td>${vehicle.year} ${vehicle.make} ${vehicle.model}</td>
            <td>${vehicle.trim}</td>
            <td>${vehicle.vin}</td>
            <td>${vehicle.color}</td>
            <td>${vehicle.mileage.toLocaleString()}</td>
            <td>$${vehicle.price.toLocaleString()}</td>
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
    
    // If no vehicles, show a message
    if (filteredInventory.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="11" style="text-align: center; padding: 2rem;">No vehicles found matching the selected filters</td>';
        tableBody.appendChild(row);
    }
    
    // Re-initialize event listeners for the new elements
    initInventoryEventListeners();
    
    return filteredInventory.length;
}

// Reset Filters
function resetInventoryFilters() {
    // Reset all filter dropdowns to first option
    document.getElementById('status-filter').selectedIndex = 0;
    document.getElementById('type-filter').selectedIndex = 0;
    document.getElementById('make-filter').selectedIndex = 0;
    document.getElementById('model-filter').selectedIndex = 0;
    document.getElementById('year-filter').selectedIndex = 0;
    document.getElementById('price-filter').selectedIndex = 0;
    
    // Clear model dropdown except first option
    const modelFilter = document.getElementById('model-filter');
    while (modelFilter.options.length > 1) {
        modelFilter.remove(1);
    }
    
    // Repopulate the table with all inventory
    populateInventoryTable();
}

// View Vehicle Details
function viewVehicleDetails(stockNumber) {
    // Find the vehicle by stock number
    const inventory = DataService.inventory.getAll();
    const vehicle = inventory.find(v => v.stockNumber === stockNumber);
    
    if (!vehicle) {
        alert(`Vehicle with stock number ${stockNumber} not found.`);
        return;
    }
    
    // For demo purposes, show an alert with vehicle details
    alert(`
        Vehicle Details:
        Stock #: ${vehicle.stockNumber}
        VIN: ${vehicle.vin}
        Year: ${vehicle.year}
        Make: ${vehicle.make}
        Model: ${vehicle.model}
        Trim: ${vehicle.trim}
        Color: ${vehicle.color}
        Mileage: ${vehicle.mileage.toLocaleString()}
        Price: $${vehicle.price.toLocaleString()}
        Status: ${vehicle.status}
        Location: ${vehicle.location}
        Date Added: ${vehicle.dateAdded}
        
        Features: ${vehicle.features.join(', ')}
        
        Description: ${vehicle.description}
    `);
}

// Edit Vehicle
function editVehicle(stockNumber) {
    console.log('editVehicle called with stockNumber:', stockNumber);
    
    // Find the vehicle by stock number
    const inventory = DataService.inventory.getAll();
    console.log('Available inventory:', inventory);
    
    const vehicle = inventory.find(v => v.stockNumber === stockNumber);
    console.log('Found vehicle:', vehicle);
    
    if (!vehicle) {
        alert(`Vehicle with stock number ${stockNumber} not found.`);
        return;
    }
    
    // Open the edit modal with the vehicle ID
    console.log('Opening edit modal for vehicle ID:', vehicle.id);
    editVehicleModal(vehicle.id);
}

// Show More Options
function showMoreOptions(stockNumber, buttonElement) {
    // Find the vehicle by stock number
    const inventory = DataService.inventory.getAll();
    const vehicle = inventory.find(v => v.stockNumber === stockNumber);
    
    if (!vehicle) {
        alert(`Vehicle with stock number ${stockNumber} not found.`);
        return;
    }
    
    // For demo purposes, show an alert with options
    const options = ['Delete', 'Duplicate', 'Print Details', 'Mark as Sold', 'Move to Different Lot'];
    alert(`Options for vehicle with stock number ${stockNumber}:\n\n${options.join('\n')}`);
}

// Add Vehicle Modal Functions
function openAddVehicleModal() {
    const modalContent = `
        <form id="add-vehicle-form">
            <div class="form-section">
                <h4 class="form-section-title">Vehicle Information</h4>
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
                <div class="form-row">
                    <div class="form-group">
                        <label for="year">Year *</label>
                        <input type="number" id="year" name="year" required min="1900" max="2030">
                    </div>
                    <div class="form-group">
                        <label for="make">Make *</label>
                        <input type="text" id="make" name="make" required>
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
                <div class="form-row">
                    <div class="form-group">
                        <label for="price">Price *</label>
                        <input type="number" id="price" name="price" required min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="cost">Cost</label>
                        <input type="number" id="cost" name="cost" min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="mileage">Mileage *</label>
                        <input type="number" id="mileage" name="mileage" required min="0">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="status">Status</label>
                        <select id="status" name="status">
                            <option value="in-stock">In Stock</option>
                            <option value="in-transit">In Transit</option>
                            <option value="on-hold">On Hold</option>
                            <option value="sold">Sold</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="location">Location</label>
                        <input type="text" id="location" name="location" placeholder="e.g., Main Lot, Truck Lot">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Additional Information</h4>
                <div class="form-group">
                    <label for="features">Features (comma-separated)</label>
                    <textarea id="features" name="features" rows="2" placeholder="e.g., Leather Seats, Navigation, Sunroof"></textarea>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3" placeholder="Vehicle description..."></textarea>
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
            attributes: 'onclick="saveVehicle()"'
        }
    ];
    
    ModalUtils.createModal('add-vehicle-modal', 'Add New Vehicle', modalContent, footerButtons);
    ModalUtils.openModal('add-vehicle-modal');
}

function saveVehicle() {
    const form = document.getElementById('add-vehicle-form');
    const errors = ModalUtils.validateForm(form);
    
    if (Object.keys(errors).length > 0) {
        ModalUtils.displayFormErrors(errors);
        return;
    }
    
    const formData = ModalUtils.getFormData(form);
    
    // Create vehicle object
    const vehicle = {
        stockNumber: formData.stockNumber,
        vin: formData.vin.toUpperCase(),
        year: parseInt(formData.year),
        make: formData.make,
        model: formData.model,
        trim: formData.trim || '',
        color: formData.color,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        mileage: parseInt(formData.mileage),
        status: formData.status || 'in-stock',
        location: formData.location || 'Main Lot',
        dateAdded: new Date().toISOString().split('T')[0],
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
        description: formData.description || '',
        images: []
    };
    
    // Save vehicle
    DataService.inventory.add(vehicle);
    
    // Close modal and refresh
    ModalUtils.closeModal('add-vehicle-modal');
    ModalUtils.removeModal('add-vehicle-modal');
    ModalUtils.showSuccessMessage('Vehicle added successfully!');
    
    // Refresh the page data
    populateInventoryTable();
}

function editVehicleModal(vehicleId) {
    console.log('editVehicleModal called with vehicleId:', vehicleId);
    
    const vehicle = DataService.inventory.get(vehicleId);
    console.log('Retrieved vehicle for editing:', vehicle);
    
    if (!vehicle) {
        console.error('Vehicle not found for ID:', vehicleId);
        return;
    }
    
    // Open the add modal but populate with vehicle data
    console.log('Opening add vehicle modal...');
    openAddVehicleModal();
    
    // Use setTimeout to ensure modal is fully created before modifying it
    setTimeout(() => {
        console.log('Modifying modal for edit mode...');
        
        // Change modal title and button
        const modalTitle = document.querySelector('#add-vehicle-modal .modal-title');
        const submitButton = document.querySelector('#add-vehicle-modal .btn-primary');
        
        console.log('Modal title element:', modalTitle);
        console.log('Submit button element:', submitButton);
        
        if (modalTitle) {
            modalTitle.textContent = 'Edit Vehicle';
            console.log('Modal title updated to: Edit Vehicle');
        }
        
        if (submitButton) {
            submitButton.textContent = 'Update Vehicle';
            submitButton.setAttribute('onclick', `updateVehicle('${vehicleId}')`);
            console.log('Submit button updated for edit mode');
        }
        
        // Populate form with vehicle data
        const form = document.getElementById('add-vehicle-form');
        console.log('Form element:', form);
        
        if (form) {
            const vehicleData = {
                ...vehicle,
                features: vehicle.features.join(', ')
            };
            console.log('Populating form with vehicle data:', vehicleData);
            ModalUtils.populateForm(form, vehicleData);
        }
    }, 100);
}

function updateVehicle(vehicleId) {
    const form = document.getElementById('add-vehicle-form');
    const errors = ModalUtils.validateForm(form);
    
    if (Object.keys(errors).length > 0) {
        ModalUtils.displayFormErrors(errors);
        return;
    }
    
    const formData = ModalUtils.getFormData(form);
    const vehicle = DataService.inventory.get(vehicleId);
    
    // Update vehicle object
    Object.assign(vehicle, {
        stockNumber: formData.stockNumber,
        vin: formData.vin.toUpperCase(),
        year: parseInt(formData.year),
        make: formData.make,
        model: formData.model,
        trim: formData.trim || '',
        color: formData.color,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        mileage: parseInt(formData.mileage),
        status: formData.status || 'in-stock',
        location: formData.location || 'Main Lot',
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
        description: formData.description || ''
    });
    
    // Save updated vehicle
    DataService.inventory.update(vehicleId, vehicle);
    
    // Close modal and refresh
    ModalUtils.closeModal('add-vehicle-modal');
    ModalUtils.removeModal('add-vehicle-modal');
    ModalUtils.showSuccessMessage('Vehicle updated successfully!');
    
    // Refresh the page data
    populateInventoryTable();
}

function deleteVehicle(vehicleId) {
    const vehicle = DataService.inventory.get(vehicleId);
    if (!vehicle) return;
    
    if (confirm(`Are you sure you want to delete ${vehicle.year} ${vehicle.make} ${vehicle.model} (Stock #${vehicle.stockNumber})? This action cannot be undone.`)) {
        DataService.inventory.delete(vehicleId);
        ModalUtils.showSuccessMessage('Vehicle deleted successfully!');
        populateInventoryTable();
    }
}