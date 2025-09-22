// Ensure formatDate is globally available
if (typeof window.formatDate !== 'function') {
    window.formatDate = function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };
}
// Customers Data Service

// Initialize Customers Data
function initCustomersData() {
    // Initialize customers data if it doesn't exist
    DataService.customers.init();
    
    // Populate customers table
    populateCustomersTable();
}

// Populate Customers Table
function populateCustomersTable() {
    const customers = DataService.customers.getAll();
    const tableBody = document.querySelector('.customers-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add customers to the table
    customers.forEach(customer => {
        const row = document.createElement('tr');
        
        // Calculate total purchases
        const totalPurchases = customer.purchaseHistory ? customer.purchaseHistory.length : 0;
        
        // Calculate total spent
        const totalSpent = customer.purchaseHistory ? 
            customer.purchaseHistory.reduce((sum, purchase) => sum + purchase.vehicle.price, 0) : 0;
        
        // Create row HTML
        row.innerHTML = `
            <td>
                <input type="checkbox" id="customer-${customer.id}" name="selected-customers">
                <label for="customer-${customer.id}"></label>
            </td>
            <td>${customer.firstName} ${customer.lastName}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.address.city}, ${customer.address.state}</td>
            <td>${totalPurchases}</td>
            <td>$${totalSpent.toLocaleString()}</td>
            <td>${formatDate(customer.dateAdded)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <div class="dropdown-menu-wrapper">
                        <button class="btn-icon" title="More Options">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu" style="display:none;position:absolute;right:0;z-index:10;min-width:120px;background:#fff;border:1px solid #ddd;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                            <button class="dropdown-item delete-action" style="color:#e53e3e;width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Delete</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Create New Deal</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Send Email</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Log Call</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Add Note</button>
                        </div>
                    </div>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // If no customers, show a message
    if (customers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem;">No customers found</td>';
        tableBody.appendChild(row);
    }
    
    // Update customers stats
    updateCustomersStats();
    
    // Re-initialize event listeners for the new elements
    initCustomersEventListeners();
}

// Update Customers Stats
function updateCustomersStats() {
    const customers = DataService.customers.getAll();

    // Calculate stats
    const totalCustomers = customers.length;

    // Calculate total revenue
    const totalRevenue = customers.reduce((sum, customer) => {
        if (customer.purchaseHistory) {
            return sum + customer.purchaseHistory.reduce((purchaseSum, purchase) => 
                purchaseSum + purchase.vehicle.price, 0);
        }
        return sum;
    }, 0);

    // Calculate average purchase value
    const totalPurchases = customers.reduce((sum, customer) => 
        sum + (customer.purchaseHistory ? customer.purchaseHistory.length : 0), 0);

    const avgPurchaseValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;

    // Calculate new customers (added in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = customers.filter(c => new Date(c.dateAdded) >= thirtyDaysAgo).length;

    // Update stats in DOM (assumes stat-value elements exist)
    const totalCustomersEl = document.getElementById('total-customers');
    if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;
    const newCustomersEl = document.getElementById('new-customers');
    if (newCustomersEl) newCustomersEl.textContent = newCustomers;
    const totalRevenueEl = document.getElementById('total-revenue');
    if (totalRevenueEl) totalRevenueEl.textContent = `$${totalRevenue.toLocaleString()}`;
    const avgPurchaseValueEl = document.getElementById('avg-purchase-value');
    if (avgPurchaseValueEl) avgPurchaseValueEl.textContent = `$${Math.round(avgPurchaseValue).toLocaleString()}`;
}

// Initialize Customers Event Listeners
function initCustomersEventListeners() {
    // Action Buttons
    const viewButtons = document.querySelectorAll('.action-buttons .btn-icon[title="View Details"]');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const name = row.cells[1].textContent;
            viewCustomerDetails(name);
        });
    });
    
    const editButtons = document.querySelectorAll('.action-buttons .btn-icon[title="Edit"]');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            // Get customer ID from checkbox id (format: customer-<id>)
            const checkbox = row.querySelector('input[type="checkbox"]');
            let customerId = null;
            if (checkbox && checkbox.id.startsWith('customer-')) {
                customerId = checkbox.id.replace('customer-', '');
            }
            if (customerId) {
                if (window.editCustomer) {
                    window.editCustomer(customerId);
                }
            } else {
                alert('Customer ID not found for editing.');
            }
        });
    });
    
    const moreButtons = document.querySelectorAll('.action-buttons .dropdown-menu-wrapper .btn-icon[title="More Options"]');
    moreButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const wrapper = this.parentElement;
            const menu = wrapper.querySelector('.dropdown-menu');
            // Hide any other open menus
            document.querySelectorAll('.dropdown-menu').forEach(m => { if (m !== menu) m.style.display = 'none'; });
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
    });

    // Hide menu when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
    });

    // Handle delete action in dropdown
    const deleteActions = document.querySelectorAll('.dropdown-menu .delete-action');
    deleteActions.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('tr');
            const name = row.cells[1].textContent;
            // Call deleteCustomer by name
            deleteCustomerByName(name);
        });
    });

    // Handle "Create New Deal" action in dropdown
    const createDealActions = document.querySelectorAll('.dropdown-menu .dropdown-item');
    createDealActions.forEach(btn => {
        if (btn.textContent.trim() === 'Create New Deal') {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const row = this.closest('tr');
                // Get customer ID from checkbox id (format: customer-<id>)
                const checkbox = row.querySelector('input[type="checkbox"]');
                let customerId = null;
                if (checkbox && checkbox.id.startsWith('customer-')) {
                    customerId = checkbox.id.replace('customer-', '');
                }
                if (customerId) {
                    createNewDealForCustomer(customerId);
                } else {
                    alert('Customer ID not found for creating deal.');
                }
            });
        }
    });
}

// Delete customer by name (used for dropdown menu)
function deleteCustomerByName(name) {
    const customers = DataService.customers.getAll();
    const customer = customers.find(c => `${c.firstName} ${c.lastName}` === name);
    if (!customer) {
        alert(`Customer with name ${name} not found.`);
        return;
    }
    if (confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}? This action cannot be undone.`)) {
        DataService.customers.remove(customer.id);
        ModalUtils.showSuccessMessage('Customer deleted successfully!');
        populateCustomersTable();
    }
}

// Apply Filters
function applyCustomersFilters() {
    // Get filter values
    const purchaseCount = document.getElementById('purchase-filter').value;
    const location = document.getElementById('location-filter').value;
    const dateRange = document.getElementById('date-filter').value;
    
    // Get all customers
    const allCustomers = DataService.customers.getAll();
    
    // Filter customers
    let filteredCustomers = allCustomers;

    // Phone search support
    const searchInput = document.getElementById('customer-search');
    const searchCriteriaSelect = document.getElementById('search-criteria');
    if (searchInput && searchCriteriaSelect && searchInput.value.trim()) {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const criteria = searchCriteriaSelect.value;
        filteredCustomers = filteredCustomers.filter(customer => {
            if (criteria === 'phone') {
                const customerPhoneDigits = (customer.phone || '').replace(/\D/g, '');
                const searchDigits = searchTerm.replace(/\D/g, '');
                return customerPhoneDigits.includes(searchDigits);
            }
            if (criteria === 'name') {
                return customer.firstName.toLowerCase().includes(searchTerm) || customer.lastName.toLowerCase().includes(searchTerm);
            }
            if (criteria === 'email') {
                return customer.email.toLowerCase().includes(searchTerm);
            }
            if (criteria === 'company') {
                return customer.company && customer.company.toLowerCase().includes(searchTerm);
            }
            // 'all' or default
            // Normalize phone search for 'all' criteria as well
            const customerPhoneDigitsAll = (customer.phone || '').replace(/\D/g, '');
            const searchDigitsAll = searchTerm.replace(/\D/g, '');
            return customer.firstName.toLowerCase().includes(searchTerm) ||
                   customer.lastName.toLowerCase().includes(searchTerm) ||
                   customer.email.toLowerCase().includes(searchTerm) ||
                   customerPhoneDigitsAll.includes(searchDigitsAll) ||
                   (customer.company && customer.company.toLowerCase().includes(searchTerm));
        });
    }

    // Apply purchase count filter
    if (purchaseCount !== 'all') {
        const [min, max] = purchaseCount.split('-').map(Number);
        filteredCustomers = filteredCustomers.filter(customer => {
            const count = customer.purchaseHistory ? customer.purchaseHistory.length : 0;
            if (isNaN(max)) {
                // Handle "5+" case
                return count >= min;
            } else {
                return count >= min && count <= max;
            }
        });
    }

    // Apply location filter
    if (location !== 'all') {
        filteredCustomers = filteredCustomers.filter(customer => customer.address.state === location);
    }

    // Apply date range filter
    if (dateRange !== 'all') {
        const now = new Date();
        let startDate;
        switch(dateRange) {
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'quarter':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = null;
        }
        if (startDate) {
            filteredCustomers = filteredCustomers.filter(customer => {
                const customerDate = new Date(customer.dateAdded);
                return customerDate >= startDate;
            });
        }
    }
    
    // Update table with filtered customers
    const tableBody = document.querySelector('.customers-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add filtered customers to the table
    filteredCustomers.forEach(customer => {
        const row = document.createElement('tr');
        
        // Calculate total purchases
        const totalPurchases = customer.purchaseHistory ? customer.purchaseHistory.length : 0;
        
        // Calculate total spent
        const totalSpent = customer.purchaseHistory ? 
            customer.purchaseHistory.reduce((sum, purchase) => sum + purchase.vehicle.price, 0) : 0;
        
        // Create row HTML
        row.innerHTML = `
            <td>
                <input type="checkbox" id="customer-${customer.id}" name="selected-customers">
                <label for="customer-${customer.id}"></label>
            </td>
            <td>${customer.firstName} ${customer.lastName}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.address.city}, ${customer.address.state}</td>
            <td>${totalPurchases}</td>
            <td>$${totalSpent.toLocaleString()}</td>
            <td>${formatDate(customer.dateAdded)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <div class="dropdown-menu-wrapper">
                        <button class="btn-icon" title="More Options">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu" style="display:none;position:absolute;right:0;z-index:10;min-width:120px;background:#fff;border:1px solid #ddd;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                            <button class="dropdown-item delete-action" style="color:#e53e3e;width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Delete</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Create New Deal</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Send Email</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Log Call</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Add Note</button>
                        </div>
                    </div>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // If no customers, show a message
    if (filteredCustomers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem;">No customers found matching the selected filters</td>';
        tableBody.appendChild(row);
    }
    
    // Re-initialize event listeners for the new elements
    initCustomersEventListeners();
    
    return filteredCustomers.length;
}

// Reset Filters
function resetCustomersFilters() {
    // Reset all filter dropdowns to first option
    document.getElementById('purchase-filter').selectedIndex = 0;
    document.getElementById('location-filter').selectedIndex = 0;
    document.getElementById('date-filter').selectedIndex = 0;
    
    // Repopulate the table with all customers
    populateCustomersTable();
}

// View Customer Details
function viewCustomerDetails(name) {
    // Find the customer by name
    const customers = DataService.customers.getAll();
    const customer = customers.find(c => `${c.firstName} ${c.lastName}` === name);
    
    if (!customer) {
        alert(`Customer with name ${name} not found.`);
        return;
    }
    
    // Format purchase history
    let purchaseHistoryText = '';
    if (customer.purchaseHistory && customer.purchaseHistory.length > 0) {
        purchaseHistoryText = customer.purchaseHistory.map(purchase => 
            `${formatDate(purchase.date)}: ${purchase.vehicle.year} ${purchase.vehicle.make} ${purchase.vehicle.model} - $${purchase.vehicle.price.toLocaleString()}`
        ).join('\n');
    } else {
        purchaseHistoryText = 'No purchase history';
    }
    
    // For demo purposes, show an alert with customer details
    alert(`
        Customer Details:
        Name: ${customer.firstName} ${customer.lastName}
        Email: ${customer.email}
        Phone: ${customer.phone}
        Address: ${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}
        Date Added: ${formatDate(customer.dateAdded)}
        
        Purchase History:
        ${purchaseHistoryText}
        
        Notes: ${customer.notes}
    `);
}

// Edit Customer
function editCustomer(customerId) {
    const customer = DataService.customers.get(customerId);
    if (!customer) {
        alert(`Customer with ID ${customerId} not found.`);
        return;
    }
    // Flatten address fields for form population
    const customerForForm = {
        ...customer,
        street: customer.address && customer.address.street ? customer.address.street : '',
        city: customer.address && customer.address.city ? customer.address.city : '',
        state: customer.address && customer.address.state ? customer.address.state : '',
        zip: customer.address && (customer.address.zip || customer.address.zipCode) ? (customer.address.zip || customer.address.zipCode) : '',
        company: customer.company || ''
    };
    if (typeof openAddCustomerModal === 'function') {
        openAddCustomerModal();
        document.querySelector('#add-customer-modal .modal-title').textContent = 'Edit Customer';
        document.querySelector('#add-customer-modal .btn-primary').textContent = 'Update Customer';
        document.querySelector('#add-customer-modal .btn-primary').setAttribute('onclick', `updateCustomer('${customerId}')`);
        const form = document.getElementById('add-customer-form');
        if (form && typeof ModalUtils !== 'undefined' && ModalUtils.populateForm) {
            ModalUtils.populateForm(form, customerForForm);
        }
        // Trigger change events if needed (for dependent fields)
        if (form) {
            const cityEl = form.querySelector('[name="city"]');
            if (cityEl) cityEl.dispatchEvent(new Event('change'));
            const stateEl = form.querySelector('[name="state"]');
            if (stateEl) stateEl.dispatchEvent(new Event('change'));
        }
    } else if (window.editCustomer) {
        window.editCustomer(customerId);
    } else {
        alert('Edit form/modal function not found.');
    }
}

// Show More Options
function showMoreOptions(name, buttonElement) {
    // Find the customer by name
    const customers = DataService.customers.getAll();
    const customer = customers.find(c => `${c.firstName} ${c.lastName}` === name);
    
    if (!customer) {
        alert(`Customer with name ${name} not found.`);
        return;
    }
    
    // For demo purposes, show an alert with options
    const options = ['Delete', 'Create New Deal', 'Send Email', 'Log Call', 'Add Note'];
    alert(`Options for customer ${name}:\n\n${options.join('\n')}`);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Import/Export Functions
let selectedCustomersFile = null;
let parsedCustomersData = null;

// Initialize Import/Export Event Listeners
function initCustomersImportExportListeners() {
    // Import button
    const importBtn = document.getElementById('import-customers-btn');
    if (importBtn) {
        importBtn.addEventListener('click', openCustomersImportModal);
    }

    // Export button
    const exportBtn = document.getElementById('export-customers-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCustomers);
    }

    // File input
    const fileInput = document.getElementById('customers-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleCustomersFileSelect);
    }

    // Upload zone
    const uploadZone = document.getElementById('customers-upload-zone');
    if (uploadZone) {
        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', handleCustomersDragOver);
        uploadZone.addEventListener('drop', handleCustomersFileDrop);
    }

    // Modal controls
    const closeModal = document.getElementById('close-import-customers-modal');
    const cancelImport = document.getElementById('cancel-import-customers');
    const confirmImport = document.getElementById('confirm-import-customers');
    const removeFile = document.getElementById('customers-remove-file');

    if (closeModal) closeModal.addEventListener('click', closeCustomersImportModal);
    if (cancelImport) cancelImport.addEventListener('click', closeCustomersImportModal);
    if (confirmImport) confirmImport.addEventListener('click', confirmImportCustomers);
    if (removeFile) removeFile.addEventListener('click', removeCustomersSelectedFile);
}

// Open Import Modal
function openCustomersImportModal() {
    const modal = document.getElementById('import-customers-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        resetCustomersImportModal();
    }
}

// Close Import Modal
function closeCustomersImportModal() {
    const modal = document.getElementById('import-customers-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        resetCustomersImportModal();
    }
}

// Reset Import Modal
function resetCustomersImportModal() {
    selectedCustomersFile = null;
    parsedCustomersData = null;
    
    const fileInfo = document.getElementById('customers-file-info');
    const uploadZone = document.getElementById('customers-upload-zone');
    const preview = document.getElementById('customers-import-preview');
    const confirmBtn = document.getElementById('confirm-import-customers');
    
    if (fileInfo) fileInfo.style.display = 'none';
    if (uploadZone) uploadZone.style.display = 'block';
    if (preview) preview.style.display = 'none';
    if (confirmBtn) confirmBtn.disabled = true;
}

// Handle File Selection
function handleCustomersFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processCustomersSelectedFile(file);
    }
}

// Handle Drag Over
function handleCustomersDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

// Handle File Drop
function handleCustomersFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processCustomersSelectedFile(files[0]);
    }
}

// Process Selected File
function processCustomersSelectedFile(file) {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['text/csv', 'application/json', '.csv', '.json'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) && !validTypes.includes(fileExtension)) {
        alert('Please select a CSV or JSON file.');
        return;
    }
    
    selectedCustomersFile = file;
    
    // Show file info
    const fileInfo = document.getElementById('customers-file-info');
    const fileName = document.getElementById('customers-file-name');
    const uploadZone = document.getElementById('customers-upload-zone');
    
    if (fileInfo && fileName && uploadZone) {
        fileName.textContent = file.name;
        fileInfo.style.display = 'flex';
        uploadZone.style.display = 'none';
    }
    
    // Parse and preview file
    parseCustomersFile(file);
}

// Remove Selected File
function removeCustomersSelectedFile() {
    selectedCustomersFile = null;
    parsedCustomersData = null;
    
    const fileInput = document.getElementById('customers-file-input');
    if (fileInput) fileInput.value = '';
    
    resetCustomersImportModal();
}

// Parse File
function parseCustomersFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let data;
            
            if (file.name.toLowerCase().endsWith('.csv')) {
                data = parseCustomersCSV(e.target.result);
            } else if (file.name.toLowerCase().endsWith('.json')) {
                data = JSON.parse(e.target.result);
            }
            
            if (data && data.length > 0) {
                parsedCustomersData = data;
                showCustomersPreview(data);
                
                const confirmBtn = document.getElementById('confirm-import-customers');
                if (confirmBtn) confirmBtn.disabled = false;
            } else {
                alert('No valid data found in the file.');
            }
        } catch (error) {
            alert('Error parsing file: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Parse CSV
function parseCustomersCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        
        data.push(row);
    }
    
    return data;
}

// Show Preview
function showCustomersPreview(data) {
    const preview = document.getElementById('customers-import-preview');
    const table = document.getElementById('customers-preview-table');
    
    if (!preview || !table || !data.length) return;
    
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    // Clear existing content
        row.innerHTML = `
            <td>
                <input type="checkbox" id="customer-${customer.id}" name="selected-customers">
                <label for="customer-${customer.id}"></label>
            </td>
            <td>${customer.firstName} ${customer.lastName}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.address.city}, ${customer.address.state}</td>
            <td>${totalPurchases}</td>
            <td>$${totalSpent.toLocaleString()}</td>
            <td>${formatDate(customer.dateAdded)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <div class="dropdown-menu-wrapper">
                        <button class="btn-icon" title="More Options">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu" style="display:none;position:absolute;right:0;z-index:10;min-width:120px;background:#fff;border:1px solid #ddd;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                            <button class="dropdown-item delete-action" style="color:#e53e3e;width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Delete</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Create New Deal</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Send Email</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Log Call</button>
                            <button class="dropdown-item" style="width:100%;text-align:left;padding:8px 16px;border:none;background:none;cursor:pointer;">Add Note</button>
                        </div>
                    </div>
                </div>
            </td>
        `;
}

// Confirm Import
function confirmImportCustomers() {
    if (!parsedCustomersData || !parsedCustomersData.length) {
        alert('No data to import.');
        return;
    }
    
    const skipDuplicates = document.getElementById('customers-skip-duplicates').checked;
    const existingCustomers = DataService.customers.getAll();
    const existingEmails = new Set(existingCustomers.map(customer => customer.email.toLowerCase()));
    
    let importedCount = 0;
    let skippedCount = 0;
    
    parsedCustomersData.forEach(rowData => {
        // Skip if duplicate and option is enabled
        if (skipDuplicates && rowData.email && existingEmails.has(rowData.email.toLowerCase())) {
            skippedCount++;
            return;
        }
        
        // Create customer object with default values
        const customer = {
            id: Date.now() + Math.random(),
            firstName: rowData.firstName || '',
            lastName: rowData.lastName || '',
            email: rowData.email || '',
            phone: rowData.phone || '',
            company: rowData.company || '',
            type: rowData.type || 'Regular',
            notes: rowData.notes || '',
            dateAdded: new Date().toISOString(),
            lastContact: rowData.lastContact || '',
            address: {
                street: rowData.street || rowData.address || '',
                city: rowData.city || '',
                state: rowData.state || '',
                zip: rowData.zip || ''
            },
            purchaseHistory: []
        };
        
        // Add to data service
        DataService.customers.add(customer);
        importedCount++;
    });
    
    // Show results
    let message = `Import completed!\n\nImported: ${importedCount} customers`;
    if (skippedCount > 0) {
        message += `\nSkipped duplicates: ${skippedCount} customers`;
    }
    
    alert(message);
    
    // Refresh the table and close modal
    loadCustomers();
    updateStats();
    closeCustomersImportModal();
}

// Export Customers
function exportCustomers() {
    const customers = DataService.customers.getAll();
    
    if (customers.length === 0) {
        alert('No customers to export.');
        return;
    }
    
    // Create CSV content
    const headers = [
        'firstName', 'lastName', 'email', 'phone', 'company', 'type', 
        'notes', 'dateAdded', 'lastContact', 'street', 'city', 'state', 'zip'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    customers.forEach(customer => {
        const row = [
            customer.firstName || '',
            customer.lastName || '',
            customer.email || '',
            customer.phone || '',
            customer.company || '',
            customer.type || '',
            (customer.notes || '').replace(/,/g, ';'),
            customer.dateAdded || '',
            customer.lastContact || '',
            (customer.address && customer.address.street) || '',
            (customer.address && customer.address.city) || '',
            (customer.address && customer.address.state) || '',
            (customer.address && customer.address.zip) || ''
        ];
        
        csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Create New Deal for Customer
function createNewDealForCustomer(customerId) {
    // Get customer data
    const customer = DataService.customers.get(customerId);
    if (!customer) {
        alert('Customer not found.');
        return;
    }
    
    // Open the deal modal with pre-populated customer information
    openAddDealModalWithCustomer(customer);
}

// Open Add Deal Modal with Customer Pre-populated
function openAddDealModalWithCustomer(customer) {
    console.log('Opening Add Deal Modal with customer:', customer);
    
    // Get customers and vehicles for dropdowns
    const customers = DataService.customers.getAll();
    const vehicles = DataService.inventory.getAll();
    
    // Create customer options
    const customerOptions = customers.map(c => 
        `<option value="${c.id}" ${c.id === customer.id ? 'selected' : ''}>${c.firstName} ${c.lastName}</option>`
    ).join('');
    
    // Create vehicle options
    const vehicleOptions = vehicles.map(vehicle => 
        `<option value="${vehicle.id}">${vehicle.year} ${vehicle.make} ${vehicle.model} - $${vehicle.price.toLocaleString()}</option>`
    ).join('');
    
    // Create modal content
    const modalContent = `
        <form id="add-deal-form">
            <div class="form-section">
                <h4 class="form-section-title">Deal Information</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="customerId">Customer *</label>
                        <select id="customerId" name="customerId" required>
                            <option value="">Select Customer</option>
                            ${customerOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="vehicleId">Vehicle *</label>
                        <select id="vehicleId" name="vehicleId" required>
                            <option value="">Select Vehicle</option>
                            ${vehicleOptions}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="dealType">Deal Type *</label>
                        <select id="dealType" name="dealType" required>
                            <option value="">Select Type</option>
                            <option value="Cash">Cash</option>
                            <option value="Finance">Finance</option>
                            <option value="Lease">Lease</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="status">Status *</label>
                        <select id="status" name="status" required>
                            <option value="">Select Status</option>
                            <option value="New" selected>New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Approved">Approved</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Financial Details</h4>
                <div class="form-row-3">
                    <div class="form-group">
                        <label for="salePrice">Sale Price *</label>
                        <input type="number" id="salePrice" name="salePrice" required min="0" step="1">
                    </div>
                    <div class="form-group">
                        <label for="downPayment">Down Payment</label>
                        <input type="number" id="downPayment" name="downPayment" min="0" step="1">
                    </div>
                    <div class="form-group">
                        <label for="tradeInValue">Trade-In Value</label>
                        <input type="number" id="tradeInValue" name="tradeInValue" min="0" step="1">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="financingTerm">Financing Term (months)</label>
                        <select id="financingTerm" name="financingTerm">
                            <option value="">Select Term</option>
                            <option value="12">12 months</option>
                            <option value="24">24 months</option>
                            <option value="36">36 months</option>
                            <option value="48">48 months</option>
                            <option value="60">60 months</option>
                            <option value="72">72 months</option>
                            <option value="84">84 months</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="interestRate">Interest Rate (%)</label>
                        <input type="number" id="interestRate" name="interestRate" min="0" max="30" step="0.01">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Additional Information</h4>
                <div class="form-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" name="notes" rows="3" placeholder="Deal created from customer: ${customer.firstName} ${customer.lastName}"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="salesperson">Salesperson *</label>
                        <select id="salesperson" name="salesperson" required>
                            <option value="">Select Salesperson</option>
                            <option value="Thomas Morales" selected>Thomas Morales</option>
                            <option value="Sales Rep 1">Sales Rep 1</option>
                            <option value="Sales Rep 2">Sales Rep 2</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="dealDate">Deal Date *</label>
                        <input type="date" id="dealDate" name="dealDate" required>
                    </div>
                </div>
            </div>
        </form>
    `;
    
    // Create modal with ModalUtils
    const modal = ModalUtils.createModal('add-deal-modal', 'New Deal - ' + customer.firstName + ' ' + customer.lastName, modalContent, [
        { text: 'Cancel', class: 'btn-secondary', attributes: 'data-modal-close' },
        { text: 'Save Deal', class: 'btn-primary', attributes: 'id="save-deal-btn"' }
    ]);
    
    // Open the modal
    ModalUtils.openModal('add-deal-modal');
    
    // Add event listener for save button
    const saveBtn = document.getElementById('save-deal-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveDealFromCustomer(customer);
        });
    }
    
    // Set today's date as default for deal date
    const dealDateInput = document.getElementById('dealDate');
    if (dealDateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        dealDateInput.value = formattedDate;
    }
    
    // Auto-populate vehicle price when vehicle is selected
    const vehicleSelect = document.getElementById('vehicleId');
    if (vehicleSelect) {
        vehicleSelect.addEventListener('change', function() {
            const selectedVehicleId = this.value;
            if (selectedVehicleId) {
                const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
                if (selectedVehicle) {
                    const salePriceInput = document.getElementById('salePrice');
                    if (salePriceInput) {
                        salePriceInput.value = selectedVehicle.price;
                    }
                }
            }
        });
    }
}

// Save Deal from Customer
function saveDealFromCustomer(customer) {
    const form = document.getElementById('add-deal-form');
    if (!form) return;
    
    // Validate form
    const errors = ModalUtils.validateForm(form);
    if (Object.keys(errors).length > 0) {
        ModalUtils.displayFormErrors(errors);
        return;
    }
    
    // Get form data
    const formData = ModalUtils.getFormData(form);
    
    // Get selected vehicle details
    const selectedVehicle = DataService.inventory.get(formData.vehicleId);
    if (!selectedVehicle) {
        ModalUtils.showErrorMessage('Selected vehicle not found.');
        return;
    }
    
    // Create deal object
    const deal = {
        customerId: customer.id,
        vehicleId: formData.vehicleId,
        customerName: customer.firstName + ' ' + customer.lastName,
        customerEmail: customer.email,
        vehicleYear: selectedVehicle.year,
        vehicleMake: selectedVehicle.make,
        vehicleModel: selectedVehicle.model,
        value: parseInt(formData.salePrice),
        status: formData.status,
        salesperson: formData.salesperson,
        notes: formData.notes || `Deal created from customer: ${customer.firstName} ${customer.lastName}`,
        dateCreated: new Date().toISOString(),
        expectedCloseDate: new Date(formData.dealDate).toISOString(),
        dealType: formData.dealType,
        downPayment: formData.downPayment ? parseInt(formData.downPayment) : 0,
        tradeInValue: formData.tradeInValue ? parseInt(formData.tradeInValue) : 0,
        financingTerm: formData.financingTerm || null,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : null
    };
    
    // Save deal
    try {
        DataService.deals.add(deal);
        ModalUtils.showSuccessMessage('Deal created successfully!');
        ModalUtils.closeModal('add-deal-modal');
        
        // Optionally redirect to deals page or refresh current page
        setTimeout(() => {
            if (confirm('Deal created successfully! Would you like to go to the Deals page to view it?')) {
                window.location.href = 'deals.html';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error saving deal:', error);
        ModalUtils.showErrorMessage('Error creating deal. Please try again.');
    }
}