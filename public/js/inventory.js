// Inventory Management JavaScript

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
});

// Initialize Event Listeners
function initEventListeners() {
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
    
    // Pagination Buttons
    const paginationBtns = document.querySelectorAll('.pagination-btn:not([disabled])');
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('active') && !this.disabled) {
                // This would typically trigger an API call to fetch the next page
                console.log('Pagination button clicked:', this.textContent.trim());
                // changePage(this.textContent.trim());
                
                // For demo purposes, update active state
                document.querySelector('.pagination-btn.active').classList.remove('active');
                this.classList.add('active');
            }
        });
    });
    
    // Items Per Page Select
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function() {
            // This would typically trigger an API call to update items per page
            console.log('Items per page changed to:', this.value);
            // updateItemsPerPage(this.value);
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
            // openImportDialog();
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

// Apply Filters
function applyFilters() {
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

// Function to open import dialog (would be implemented with actual UI)
function openImportDialog() {
    // This is a placeholder for the actual implementation
    console.log('Opening import dialog');
    
    // Example of what this might do:
    // 1. Show import modal
    // 2. Provide file upload or paste options
    // 3. Handle file validation
    // 4. Process import
    
    // For demo purposes, show a message
    alert('Opening import dialog');
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
            const stockNumber = card.querySelector('.mobile-card-title p').textContent.split('•')[0].replace('Stock #', '').trim();
            console.log('View details for stock #:', stockNumber);
            // viewVehicleDetails(stockNumber);
        });
    });
    
    const mobileEditButtons = document.querySelectorAll('.mobile-card-actions .btn-icon[title="Edit"]');
    mobileEditButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.mobile-vehicle-card');
            const stockNumber = card.querySelector('.mobile-card-title p').textContent.split('•')[0].replace('Stock #', '').trim();
            console.log('Edit vehicle with stock #:', stockNumber);
            // editVehicle(stockNumber);
        });
    });
    
    const mobileMoreButtons = document.querySelectorAll('.mobile-card-actions .btn-icon[title="More Options"]');
    mobileMoreButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.mobile-vehicle-card');
            const stockNumber = card.querySelector('.mobile-card-title p').textContent.split('•')[0].replace('Stock #', '').trim();
            console.log('More options for stock #:', stockNumber);
            // showMoreOptions(stockNumber, this);
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