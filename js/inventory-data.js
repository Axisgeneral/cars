// Inventory Data Service

// Get vehicle primary image
function getVehiclePrimaryImage(vehicle) {
    // Check if vehicle has uploaded images
    if (vehicle.images && vehicle.images.length > 0) {
        // Find primary image or use first image
        const primaryImage = vehicle.images.find(img => img.isPrimary) || vehicle.images[0];
        return primaryImage.data;
    }
    
    // Fallback to default images based on vehicle ID or random
    const defaultImages = [
        'assets/vehicles/car1.jpg',
        'assets/vehicles/car2.jpg',
        'assets/vehicles/car3.jpg',
        'assets/vehicles/car4.jpg',
        'assets/vehicles/car5.jpg',
        'assets/vehicles/car6.jpg'
    ];
    
    // Use vehicle ID to consistently assign the same image to the same vehicle
    const imageIndex = vehicle.id ? parseInt(vehicle.id) % defaultImages.length : 0;
    return defaultImages[imageIndex];
}

// Initialize Inventory Data
async function initInventoryData() {
    try {
        // Initialize inventory data if it doesn't exist
        DataService.inventory.init();
        
        // Populate inventory table
        populateInventoryTable();
    } catch (error) {
        console.error('Error initializing inventory data:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error loading inventory data', 'error');
        }
    }
}

// Populate Inventory Table
function populateInventoryTable() {
    try {
        const inventory = DataService.inventory.getAll();
        
        // Try pagination-enabled function first, but with fallback to direct population
        if (typeof populateInventoryTableWithData === 'function') {
            populateInventoryTableWithData(inventory);
            
            // Verify that data was actually displayed after a short delay
            setTimeout(() => {
                const tableBody = document.querySelector('.inventory-table tbody');
                const rows = tableBody ? tableBody.querySelectorAll('tr') : [];
                
                // If no data rows are visible (only empty message or no rows), fall back to direct population
                if (rows.length === 0 || (rows.length === 1 && rows[0].textContent.includes('No vehicles found'))) {
                    populateInventoryTableDirect(inventory);
                }
            }, 200);
            return;
        }
        
        // Direct table population fallback
        populateInventoryTableDirect(inventory);
        
    } catch (error) {
        console.error('Error populating inventory table:', error);
        showNotification('Error loading inventory data', 'error');
    }
}

// Direct table population (guaranteed to work)
function populateInventoryTableDirect(inventory) {
    const tableBody = document.querySelector('.inventory-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (inventory.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="15" class="text-center" style="padding: 2rem; color: #6b7280;">
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
                    <img src="${getVehiclePrimaryImage(vehicle)}" alt="${vehicle.year} ${vehicle.make} ${vehicle.model}">
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
                    <button class="btn-icon" title="View Details" onclick="viewVehicleDetails('${vehicle.id}')">
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
    
    // Also populate mobile cards for responsive design
    if (typeof populateMobileCards === 'function') {
        populateMobileCards(inventory);
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
            const checkbox = row.querySelector('input[type="checkbox"]');
            const vehicleId = checkbox.id.replace('vehicle-', '');
            viewVehicleDetailsById(vehicleId);
        });
    });
    
    const editButtons = document.querySelectorAll('.action-buttons .btn-icon[title="Edit"]');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const checkbox = row.querySelector('input[type="checkbox"]');
            const vehicleId = checkbox.id.replace('vehicle-', '');
            editVehicleById(vehicleId);
        });
    });
    
    const moreButtons = document.querySelectorAll('.action-buttons .btn-icon[title="More Options"]');
    moreButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const checkbox = row.querySelector('input[type="checkbox"]');
            const vehicleId = checkbox.id.replace('vehicle-', '');
            showMoreOptionsById(vehicleId, this);
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
                    <img src="${getVehiclePrimaryImage(vehicle)}" alt="${vehicle.year} ${vehicle.make} ${vehicle.model}">
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
                    <button class="btn-icon" title="View Details" onclick="viewVehicleDetails('${vehicle.id}')">
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
        row.innerHTML = '<td colspan="15" style="text-align: center; padding: 2rem;">No vehicles found matching the selected filters</td>';
        tableBody.appendChild(row);
    }
    
    // Update mobile cards with filtered inventory
    if (typeof populateMobileCards === 'function') {
        console.log('🔍 Updating mobile cards with', filteredInventory.length, 'filtered vehicles');
        populateMobileCards(filteredInventory);
    } else {
        console.warn('⚠️ populateMobileCards function not available');
    }
    
    // Re-initialize event listeners for the new elements
    initInventoryEventListeners();
    
    // Re-initialize mobile card actions
    if (typeof initMobileCardActions === 'function') {
        console.log('🔄 Re-initializing mobile card actions');
        initMobileCardActions();
    }
    
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

// View Vehicle Details by ID
function viewVehicleDetailsById(vehicleId) {
    // Find the vehicle by ID
    const vehicle = DataService.inventory.get(vehicleId);
    
    if (!vehicle) {
        alert(`Vehicle with ID ${vehicleId} not found.`);
        return;
    }
    
    // For demo purposes, show an alert with vehicle details
    alert(`
        Vehicle Details:
        Stock #: ${vehicle.stockNumber || 'Not assigned'}
        VIN: ${vehicle.vin || 'Not available'}
        Year: ${vehicle.year || 'Not available'}
        Make: ${vehicle.make || 'Not available'}
        Model: ${vehicle.model || 'Not available'}
        Trim: ${vehicle.trim || 'Not available'}
        Color: ${vehicle.color || 'Not available'}
        Mileage: ${vehicle.mileage ? vehicle.mileage.toLocaleString() : 'Not available'}
        Price: ${vehicle.price ? '$' + vehicle.price.toLocaleString() : 'Not available'}
        Status: ${vehicle.status || 'Not available'}
        Location: ${vehicle.location || 'Not available'}
        Date Added: ${vehicle.dateAdded || 'Not available'}
        
        Features: ${vehicle.features ? vehicle.features.join(', ') : 'None listed'}
        
        Description: ${vehicle.description || 'No description available'}
    `);
}

// View Vehicle Details (legacy function for backward compatibility)
function viewVehicleDetails(stockNumber) {
    // Handle case where stockNumber is '-' (meaning undefined/empty)
    if (stockNumber === '-') {
        alert('This vehicle does not have a stock number assigned. Cannot view details by stock number.');
        return;
    }
    
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

// Edit Vehicle by ID
function editVehicleById(vehicleId) {
    console.log('editVehicleById called with vehicleId:', vehicleId);
    
    // Find the vehicle by ID
    const vehicle = DataService.inventory.get(vehicleId);
    console.log('Found vehicle:', vehicle);
    
    if (!vehicle) {
        alert(`Vehicle with ID ${vehicleId} not found.`);
        return;
    }
    
    // Open the edit modal with the vehicle ID
    console.log('Opening edit modal for vehicle ID:', vehicle.id);
    editVehicleModal(vehicle.id);
}

// Edit Vehicle (legacy function for backward compatibility)
function editVehicle(stockNumber) {
    console.log('editVehicle called with stockNumber:', stockNumber);
    
    // Handle case where stockNumber is '-' (meaning undefined/empty)
    if (stockNumber === '-') {
        alert('This vehicle does not have a stock number assigned. Cannot edit by stock number.');
        return;
    }
    
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

// Show More Options by ID
function showMoreOptionsById(vehicleId, buttonElement) {
    // Find the vehicle by ID
    const vehicle = DataService.inventory.get(vehicleId);
    
    if (!vehicle) {
        alert(`Vehicle with ID ${vehicleId} not found.`);
        return;
    }
    
    // Close any existing dropdown
    closeAllDropdowns();
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'vehicle-options-dropdown';
    dropdown.innerHTML = `
        <div class="dropdown-item" data-action="edit" data-vehicle-id="${vehicleId}">
            <i class="fas fa-edit"></i>
            <span>Edit Vehicle</span>
        </div>
        <div class="dropdown-item" data-action="duplicate" data-vehicle-id="${vehicleId}">
            <i class="fas fa-copy"></i>
            <span>Duplicate</span>
        </div>
        <div class="dropdown-item" data-action="print" data-vehicle-id="${vehicleId}">
            <i class="fas fa-print"></i>
            <span>Print Details</span>
        </div>
        <div class="dropdown-separator"></div>
        <div class="dropdown-item" data-action="mark-sold" data-vehicle-id="${vehicleId}">
            <i class="fas fa-check-circle"></i>
            <span>Mark as Sold</span>
        </div>
        <div class="dropdown-item" data-action="mark-hold" data-vehicle-id="${vehicleId}">
            <i class="fas fa-pause-circle"></i>
            <span>Put on Hold</span>
        </div>
        <div class="dropdown-separator"></div>
        <div class="dropdown-item danger" data-action="delete" data-vehicle-id="${vehicleId}">
            <i class="fas fa-trash"></i>
            <span>Delete Vehicle</span>
        </div>
    `;
    
    // Position dropdown relative to button
    const buttonRect = buttonElement.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${buttonRect.bottom + 5}px`;
    dropdown.style.left = `${buttonRect.left - 150}px`; // Offset to the left since it's the last column
    dropdown.style.zIndex = '1000';
    
    // Add dropdown to body
    document.body.appendChild(dropdown);
    
    // Add event listeners to dropdown items
    dropdown.addEventListener('click', function(e) {
        const item = e.target.closest('.dropdown-item');
        if (item) {
            const action = item.dataset.action;
            const vehicleId = item.dataset.vehicleId;
            console.log('Dropdown item clicked:', action, 'for vehicle ID:', vehicleId);
            handleVehicleAction(action, vehicleId);
            closeAllDropdowns();
        }
    });
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closeDropdownOnOutsideClick);
    }, 0);
}

// Close all dropdowns
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.vehicle-options-dropdown');
    dropdowns.forEach(dropdown => dropdown.remove());
    document.removeEventListener('click', closeDropdownOnOutsideClick);
}

// Close dropdown when clicking outside
function closeDropdownOnOutsideClick(e) {
    if (!e.target.closest('.vehicle-options-dropdown') && !e.target.closest('.btn-icon[title="More Options"]')) {
        closeAllDropdowns();
    }
}

// Handle vehicle actions
function handleVehicleAction(action, vehicleId) {
    const vehicle = DataService.inventory.get(vehicleId);
    if (!vehicle) {
        ModalUtils.showErrorMessage('Vehicle not found');
        return;
    }
    
    switch (action) {
        case 'edit':
            editVehicleById(vehicleId);
            break;
            
        case 'duplicate':
            duplicateVehicle(vehicleId);
            break;
            
        case 'print':
            printVehicleDetails(vehicleId);
            break;
            
        case 'mark-sold':
            updateVehicleStatus(vehicleId, 'sold');
            break;
            
        case 'mark-hold':
            updateVehicleStatus(vehicleId, 'on-hold');
            break;
            
        case 'delete':
            console.log('Delete action triggered for vehicle ID:', vehicleId);
            confirmDeleteVehicle(vehicleId);
            break;
            
        default:
            console.warn('Unknown action:', action);
    }
}

// Duplicate vehicle
function duplicateVehicle(vehicleId) {
    const vehicle = DataService.inventory.get(vehicleId);
    if (!vehicle) {
        ModalUtils.showErrorMessage('Vehicle not found');
        return;
    }
    
    // Create a copy of the vehicle with a new ID and stock number
    const duplicatedVehicle = {
        ...vehicle,
        id: Date.now().toString(), // Generate new ID
        stockNumber: vehicle.stockNumber ? `${vehicle.stockNumber}-COPY` : `COPY-${Date.now()}`,
        dateAdded: new Date().toISOString()
    };
    
    // Add the duplicated vehicle
    DataService.inventory.add(duplicatedVehicle);
    
    // Refresh the table
    populateInventoryTable();
    
    ModalUtils.showSuccessMessage('Vehicle duplicated successfully');
}

// Print vehicle details
function printVehicleDetails(vehicleId) {
    const vehicle = DataService.inventory.get(vehicleId);
    if (!vehicle) {
        ModalUtils.showErrorMessage('Vehicle not found');
        return;
    }
    
    // Create a printable version of vehicle details
    const printWindow = window.open('', '_blank');
    const vehicleImage = getVehiclePrimaryImage(vehicle);
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vehicle Details - ${vehicle.year} ${vehicle.make} ${vehicle.model}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .vehicle-image { max-width: 300px; height: auto; margin: 20px auto; display: block; }
                .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .detail-item { margin-bottom: 10px; }
                .label { font-weight: bold; }
                .value { margin-left: 10px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Vehicle Details</h1>
                <h2>${vehicle.year} ${vehicle.make} ${vehicle.model}</h2>
            </div>
            
            <img src="${vehicleImage}" alt="Vehicle Photo" class="vehicle-image" />
            
            <div class="details-grid">
                <div>
                    <div class="detail-item">
                        <span class="label">Stock Number:</span>
                        <span class="value">${vehicle.stockNumber || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">VIN:</span>
                        <span class="value">${vehicle.vin || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Year:</span>
                        <span class="value">${vehicle.year || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Make:</span>
                        <span class="value">${vehicle.make || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Model:</span>
                        <span class="value">${vehicle.model || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Trim:</span>
                        <span class="value">${vehicle.trim || 'N/A'}</span>
                    </div>
                </div>
                <div>
                    <div class="detail-item">
                        <span class="label">Color:</span>
                        <span class="value">${vehicle.color || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Type:</span>
                        <span class="value">${vehicle.type || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Mileage:</span>
                        <span class="value">${vehicle.mileage ? vehicle.mileage.toLocaleString() : 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Price:</span>
                        <span class="value">${vehicle.price ? '$' + vehicle.price.toLocaleString() : 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Status:</span>
                        <span class="value">${vehicle.status || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Date Added:</span>
                        <span class="value">${vehicle.dateAdded ? new Date(vehicle.dateAdded).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

// Update vehicle status
function updateVehicleStatus(vehicleId, newStatus) {
    const vehicle = DataService.inventory.get(vehicleId);
    if (!vehicle) {
        ModalUtils.showErrorMessage('Vehicle not found');
        return;
    }
    
    // Update the vehicle status
    vehicle.status = newStatus;
    DataService.inventory.update(vehicleId, vehicle);
    
    // Refresh the table
    populateInventoryTable();
    
    const statusText = newStatus === 'sold' ? 'sold' : 'put on hold';
    ModalUtils.showSuccessMessage(`Vehicle ${statusText} successfully`);
}

// Confirm delete vehicle (Simple approach)
function confirmDeleteVehicle(vehicleId) {
    console.log('confirmDeleteVehicle called with ID:', vehicleId);
    
    const vehicle = DataService.inventory.get(vehicleId);
    if (!vehicle) {
        console.error('Vehicle not found for confirmation:', vehicleId);
        ModalUtils.showErrorMessage('Vehicle not found');
        return;
    }
    
    console.log('Vehicle found for deletion confirmation:', vehicle);
    const vehicleIdentifier = vehicle.stockNumber || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    
    // Simple confirmation dialog
    const confirmMessage = `Are you sure you want to delete this vehicle?\n\n${vehicleIdentifier}${vehicle.vin ? `\nVIN: ${vehicle.vin}` : ''}\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
        console.log('User confirmed deletion, proceeding...');
        deleteVehicle(vehicleId);
    } else {
        console.log('User cancelled deletion');
    }
}

// Delete vehicle
function deleteVehicle(vehicleId) {
    console.log('Attempting to delete vehicle with ID:', vehicleId);
    
    try {
        // Check if vehicle exists before deletion
        const vehicle = DataService.inventory.get(vehicleId);
        if (!vehicle) {
            console.error('Vehicle not found for deletion:', vehicleId);
            ModalUtils.showErrorMessage('Vehicle not found');
            return;
        }
        
        console.log('Vehicle found, proceeding with deletion:', vehicle);
        
        // Perform deletion
        const deleteResult = DataService.inventory.delete(vehicleId);
        console.log('Delete result:', deleteResult);
        
        if (deleteResult) {
            // Refresh the table
            populateInventoryTable();
            console.log('Table refreshed after deletion');
            
            // Show success message
            ModalUtils.showSuccessMessage('Vehicle deleted successfully');
            console.log('Vehicle deleted successfully');
        } else {
            console.error('Delete operation returned false');
            ModalUtils.showErrorMessage('Failed to delete vehicle');
        }
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        ModalUtils.showErrorMessage('Error deleting vehicle: ' + error.message);
    }
}

// Show More Options (legacy function for backward compatibility)
function showMoreOptions(stockNumber, buttonElement) {
    // Handle case where stockNumber is '-' (meaning undefined/empty)
    if (stockNumber === '-') {
        alert('This vehicle does not have a stock number assigned. Cannot show options by stock number.');
        return;
    }
    
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
                <h4 class="form-section-title">Vehicle Images</h4>
                <div class="form-group">
                    <label for="vehicle-images">Upload Images</label>
                    <div class="image-upload-container">
                        <input type="file" id="vehicle-images" name="vehicle-images" multiple accept="image/*" style="display: none;">
                        <button type="button" class="btn btn-outline image-upload-btn" onclick="document.getElementById('vehicle-images').click()">
                            <i class="fas fa-camera"></i> Add Images
                        </button>
                        <div class="image-preview-container" id="image-preview-container">
                            <!-- Image previews will be displayed here -->
                        </div>
                    </div>
                    <small class="form-help">You can upload multiple images. The first image will be used as the primary photo.</small>
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
    
    // Initialize image upload functionality
    initImageUpload();
    
    // Add modal close cleanup
    const modal = document.getElementById('add-vehicle-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target.hasAttribute('data-modal-close') || e.target.classList.contains('modal-overlay')) {
                // Clear images when modal is closed
                window.vehicleImages = [];
            }
        });
    }
}

// Initialize image upload functionality
function initImageUpload() {
    const imageInput = document.getElementById('vehicle-images');
    const previewContainer = document.getElementById('image-preview-container');
    
    if (!imageInput || !previewContainer) return;
    
    // Store uploaded images data
    window.vehicleImages = window.vehicleImages || [];
    
    imageInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageData = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        data: e.target.result,
                        isPrimary: window.vehicleImages.length === 0 // First image is primary
                    };
                    
                    window.vehicleImages.push(imageData);
                    displayImagePreview(imageData);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Clear the input so the same file can be selected again
        e.target.value = '';
    });
}

// Display image preview
function displayImagePreview(imageData) {
    const previewContainer = document.getElementById('image-preview-container');
    if (!previewContainer) return;
    
    const previewDiv = document.createElement('div');
    previewDiv.className = 'image-preview-item';
    previewDiv.dataset.imageId = imageData.id;
    
    previewDiv.innerHTML = `
        <div class="image-preview-wrapper">
            <img src="${imageData.data}" alt="${imageData.name}">
            <div class="image-preview-overlay">
                <button type="button" class="btn-icon btn-primary" onclick="setPrimaryImage('${imageData.id}')" title="Set as Primary">
                    <i class="fas fa-star${imageData.isPrimary ? '' : '-o'}"></i>
                </button>
                <button type="button" class="btn-icon btn-danger" onclick="removeImage('${imageData.id}')" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            ${imageData.isPrimary ? '<div class="primary-badge">Primary</div>' : ''}
        </div>
        <div class="image-preview-name">${imageData.name}</div>
    `;
    
    previewContainer.appendChild(previewDiv);
}

// Set primary image
function setPrimaryImage(imageId) {
    if (!window.vehicleImages) return;
    
    // Remove primary status from all images
    window.vehicleImages.forEach(img => img.isPrimary = false);
    
    // Set the selected image as primary
    const selectedImage = window.vehicleImages.find(img => img.id == imageId);
    if (selectedImage) {
        selectedImage.isPrimary = true;
    }
    
    // Update the preview display
    refreshImagePreviews();
}

// Remove image
function removeImage(imageId) {
    if (!window.vehicleImages) return;
    
    window.vehicleImages = window.vehicleImages.filter(img => img.id != imageId);
    
    // If we removed the primary image, make the first remaining image primary
    if (window.vehicleImages.length > 0 && !window.vehicleImages.some(img => img.isPrimary)) {
        window.vehicleImages[0].isPrimary = true;
    }
    
    // Update the preview display
    refreshImagePreviews();
}

// Refresh image previews
function refreshImagePreviews() {
    const previewContainer = document.getElementById('image-preview-container');
    if (!previewContainer) {
        console.log('Image preview container not found, skipping refresh');
        return;
    }
    
    previewContainer.innerHTML = '';
    
    if (window.vehicleImages && Array.isArray(window.vehicleImages)) {
        window.vehicleImages.forEach(imageData => {
            try {
                displayImagePreview(imageData);
            } catch (error) {
                console.error('Error displaying image preview:', error);
            }
        });
    }
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
        images: window.vehicleImages || []
    };
    
    // Save vehicle
    DataService.inventory.add(vehicle);
    
    // Close modal and refresh
    ModalUtils.closeModal('add-vehicle-modal');
    ModalUtils.removeModal('add-vehicle-modal');
    ModalUtils.showSuccessMessage('Vehicle added successfully!');
    
    // Clear images data
    window.vehicleImages = [];
    
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
                features: vehicle.features && Array.isArray(vehicle.features) ? vehicle.features.join(', ') : ''
            };
            console.log('Populating form with vehicle data:', vehicleData);
            ModalUtils.populateForm(form, vehicleData);
        }
        
        // Populate existing images
        if (vehicle.images && vehicle.images.length > 0) {
            window.vehicleImages = [...vehicle.images];
            // Wait a bit more for the modal to be fully rendered
            setTimeout(() => {
                refreshImagePreviews();
            }, 200);
        } else {
            window.vehicleImages = [];
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
        description: formData.description || '',
        images: window.vehicleImages || []
    });
    
    // Save updated vehicle
    DataService.inventory.update(vehicleId, vehicle);
    
    // Close modal and refresh
    ModalUtils.closeModal('add-vehicle-modal');
    ModalUtils.removeModal('add-vehicle-modal');
    ModalUtils.showSuccessMessage('Vehicle updated successfully!');
    
    // Clear images data
    window.vehicleImages = [];
    
    // Refresh the page data
    populateInventoryTable();
}

// View vehicle details with image gallery
function viewVehicleDetails(vehicleId) {
    const vehicle = DataService.inventory.get(vehicleId);
    if (!vehicle) {
        console.error('Vehicle not found for ID:', vehicleId);
        return;
    }
    
    // Create image gallery HTML
    let imageGalleryHtml = '';
    if (vehicle.images && vehicle.images.length > 0) {
        imageGalleryHtml = `
            <div class="vehicle-image-gallery">
                <div class="main-image-container">
                    <img id="main-vehicle-image" src="${vehicle.images[0].data}" alt="Vehicle Image">
                </div>
                <div class="thumbnail-container">
                    ${vehicle.images.map((img, index) => `
                        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="selectMainImage('${img.data}', this)">
                            <img src="${img.data}" alt="Thumbnail ${index + 1}">
                            ${img.isPrimary ? '<div class="primary-indicator">Primary</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        imageGalleryHtml = `
            <div class="vehicle-image-gallery">
                <div class="main-image-container">
                    <img src="${getVehiclePrimaryImage(vehicle)}" alt="Vehicle Image">
                </div>
                <p class="no-images-message">No additional images uploaded for this vehicle.</p>
            </div>
        `;
    }
    
    const modalContent = `
        <div class="vehicle-details-content">
            <div class="vehicle-details-header">
                <h3>${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}</h3>
                <div class="vehicle-basic-info">
                    <span class="info-item"><strong>Stock #:</strong> ${vehicle.stockNumber || '-'}</span>
                    <span class="info-item"><strong>VIN:</strong> ${vehicle.vin || '-'}</span>
                    <span class="info-item"><strong>Price:</strong> ${vehicle.price ? '$' + vehicle.price.toLocaleString() : '-'}</span>
                </div>
            </div>
            
            ${imageGalleryHtml}
            
            <div class="vehicle-details-info">
                <div class="detail-section">
                    <h4>Vehicle Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Color:</span>
                            <span class="detail-value">${vehicle.color || '-'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Mileage:</span>
                            <span class="detail-value">${vehicle.mileage ? vehicle.mileage.toLocaleString() + ' miles' : '-'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${vehicle.status || '-'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value">${vehicle.location || '-'}</span>
                        </div>
                    </div>
                </div>
                
                ${vehicle.features && vehicle.features.length > 0 ? `
                <div class="detail-section">
                    <h4>Features</h4>
                    <div class="features-list">
                        ${vehicle.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${vehicle.description ? `
                <div class="detail-section">
                    <h4>Description</h4>
                    <p class="vehicle-description">${vehicle.description}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    const footerButtons = [
        {
            text: 'Close',
            class: 'btn-outline',
            attributes: 'data-modal-close'
        },
        {
            text: 'Edit Vehicle',
            class: 'btn-primary',
            icon: 'fas fa-edit',
            attributes: `onclick="ModalUtils.closeModal('vehicle-details-modal'); editVehicleModal('${vehicleId}')"`
        }
    ];
    
    ModalUtils.createModal('vehicle-details-modal', 'Vehicle Details', modalContent, footerButtons);
    ModalUtils.openModal('vehicle-details-modal');
}

// Select main image in gallery
function selectMainImage(imageSrc, thumbnailElement) {
    const mainImage = document.getElementById('main-vehicle-image');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnailElement.classList.add('active');
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