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
            return customer.firstName.toLowerCase().includes(searchTerm) ||
                   customer.lastName.toLowerCase().includes(searchTerm) ||
                   customer.email.toLowerCase().includes(searchTerm) ||
                   (customer.phone || '').toLowerCase().includes(searchTerm) ||
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

// Customer functions are now defined in customers.html to avoid conflicts