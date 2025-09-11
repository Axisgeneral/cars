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
                    <button class="btn-icon" title="More Options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
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
    
    const newCustomers = customers.filter(customer => 
        new Date(customer.dateAdded) >= thirtyDaysAgo).length;
    
    // Update DOM elements
    const statsContainer = document.querySelector('.customers-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Customers:</span>
                <span class="stat-value">${totalCustomers}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">New Customers (30d):</span>
                <span class="stat-value">${newCustomers}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Revenue:</span>
                <span class="stat-value">$${totalRevenue.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Avg. Purchase:</span>
                <span class="stat-value">$${Math.round(avgPurchaseValue).toLocaleString()}</span>
            </div>
        `;
    }
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
            const name = row.cells[1].textContent;
            editCustomer(name);
        });
    });
    
    const moreButtons = document.querySelectorAll('.action-buttons .btn-icon[title="More Options"]');
    moreButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const name = row.cells[1].textContent;
            showMoreOptions(name, this);
        });
    });
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
                    <button class="btn-icon" title="More Options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
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
function editCustomer(name) {
    // Find the customer by name
    const customers = DataService.customers.getAll();
    const customer = customers.find(c => `${c.firstName} ${c.lastName}` === name);
    
    if (!customer) {
        alert(`Customer with name ${name} not found.`);
        return;
    }
    
    // For demo purposes, show an alert
    alert(`Editing customer ${name}. This would open an edit form in a real application.`);
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
        modal.classList.add('active');
        resetCustomersImportModal();
    }
}

// Close Import Modal
function closeCustomersImportModal() {
    const modal = document.getElementById('import-customers-modal');
    if (modal) {
        modal.classList.remove('active');
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
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    // Create header row
    const headerRow = document.createElement('tr');
    const sampleRow = data[0];
    Object.keys(sampleRow).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    
    // Create preview rows (first 5)
    const previewData = data.slice(0, 5);
    previewData.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value || '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    preview.style.display = 'block';
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