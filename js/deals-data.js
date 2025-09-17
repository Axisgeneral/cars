// Deals Data Service

// Initialize Deals Data
function initDealsData() {
    // Initialize deals data if it doesn't exist
    DataService.deals.init();
    
    // Populate deals table
    populateDealsTable();
}

// Populate Deals Table
function populateDealsTable() {
    const deals = DataService.deals.getAll();
    const tableBody = document.querySelector('.deals-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add deals to the table
    deals.forEach(deal => {
        const row = document.createElement('tr');
        
        // Create status badge HTML
        let statusBadgeHtml = '';
        switch(deal.status) {
            case 'Pending':
                statusBadgeHtml = '<span class="status-badge pending">Pending</span>';
                break;
            case 'In Progress':
                statusBadgeHtml = '<span class="status-badge in-progress">In Progress</span>';
                break;
            case 'Closed Won':
                statusBadgeHtml = '<span class="status-badge closed-won">Closed Won</span>';
                break;
            case 'Closed Lost':
                statusBadgeHtml = '<span class="status-badge closed-lost">Closed Lost</span>';
                break;
            default:
                statusBadgeHtml = '<span class="status-badge">' + deal.status + '</span>';
        }
        
        // Create row HTML
        row.innerHTML = `
            <td>${deal.customerName}</td>
            <td>${deal.vehicleYear} ${deal.vehicleMake} ${deal.vehicleModel}</td>
            <td>${statusBadgeHtml}</td>
            <td>$${deal.value.toLocaleString()}</td>
            <td>${deal.salesperson}</td>
            <td>${formatDate(deal.dateCreated)}</td>
            <td>${formatDate(deal.expectedCloseDate)}</td>
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
    
    // If no deals, show a message
    if (deals.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem;">No deals found</td>';
        tableBody.appendChild(row);
    }
    
    // Update deals stats
    updateDealsStats();
    
    // Re-initialize event listeners for the new elements
    initDealsEventListeners();
}

// Update Deals Stats
function updateDealsStats() {
    const deals = DataService.deals.getAll();
    
    // Calculate stats
    const totalDeals = deals.length;
    const pendingDeals = deals.filter(deal => deal.status === 'Pending').length;
    const negotiationDeals = deals.filter(deal => deal.status === 'Negotiation').length;
    const approvedDeals = deals.filter(deal => deal.status === 'Approved').length;
    const closedDeals = deals.filter(deal => deal.status === 'Closed').length;
    const cancelledDeals = deals.filter(deal => deal.status === 'Cancelled').length;
    
    // Calculate total revenue
    const totalRevenue = deals.filter(deal => deal.status === 'Closed')
                             .reduce((sum, deal) => sum + deal.vehicle.price, 0);
    
    // Calculate total profit
    const totalProfit = deals.filter(deal => deal.status === 'Closed')
                            .reduce((sum, deal) => sum + (deal.profit || 0), 0);
    
    // Update DOM elements
    const statsContainer = document.querySelector('.deals-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Deals:</span>
                <span class="stat-value">${totalDeals}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pending:</span>
                <span class="stat-value">${pendingDeals}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Negotiation:</span>
                <span class="stat-value">${negotiationDeals}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Approved:</span>
                <span class="stat-value">${approvedDeals}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Closed:</span>
                <span class="stat-value">${closedDeals}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Revenue:</span>
                <span class="stat-value">$${totalRevenue.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Profit:</span>
                <span class="stat-value">$${totalProfit.toLocaleString()}</span>
            </div>
        `;
    }
}

// Initialize Deals Event Listeners
function initDealsEventListeners() {
    // Action Buttons
    const viewButtons = document.querySelectorAll('.action-buttons .btn-icon[title="View Details"]');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const customer = row.cells[1].textContent;
            const vehicle = row.cells[2].textContent;
            viewDealDetails(customer, vehicle);
        });
    });
    
    const editButtons = document.querySelectorAll('.action-buttons .btn-icon[title="Edit"]');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const customer = row.cells[1].textContent;
            const vehicle = row.cells[2].textContent;
            editDeal(customer, vehicle);
        });
    });
    
    const moreButtons = document.querySelectorAll('.action-buttons .btn-icon[title="More Options"]');
    moreButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const customer = row.cells[1].textContent;
            const vehicle = row.cells[2].textContent;
            showMoreOptions(customer, vehicle, this);
        });
    });
}

// Apply Filters
function applyDealsFilters() {
    // Get filter values
    const status = document.getElementById('status-filter').value;
    const dealType = document.getElementById('type-filter').value;
    const salesperson = document.getElementById('salesperson-filter').value;
    const dateRange = document.getElementById('date-filter').value;
    
    // Get all deals
    const allDeals = DataService.deals.getAll();
    
    // Filter deals
    let filteredDeals = allDeals;
    
    // Apply status filter
    if (status !== 'all') {
        filteredDeals = filteredDeals.filter(deal => deal.status === status);
    }
    
    // Apply deal type filter
    if (dealType !== 'all') {
        filteredDeals = filteredDeals.filter(deal => deal.dealType === dealType);
    }
    
    // Apply salesperson filter
    if (salesperson !== 'all') {
        filteredDeals = filteredDeals.filter(deal => deal.salesperson === salesperson);
    }
    
    // Apply date range filter
    if (dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch(dateRange) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'yesterday':
                startDate = new Date(now.setDate(now.getDate() - 1));
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            default:
                startDate = null;
        }
        
        if (startDate) {
            filteredDeals = filteredDeals.filter(deal => {
                const dealDate = new Date(deal.dateCreated);
                return dealDate >= startDate;
            });
        }
    }
    
    // Update table with filtered deals
    const tableBody = document.querySelector('.deals-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add filtered deals to the table
    filteredDeals.forEach(deal => {
        const row = document.createElement('tr');
        
        // Create status badge HTML
        let statusBadgeHtml = '';
        switch(deal.status) {
            case 'Pending':
                statusBadgeHtml = '<span class="status-badge pending">Pending</span>';
                break;
            case 'In Progress':
                statusBadgeHtml = '<span class="status-badge in-progress">In Progress</span>';
                break;
            case 'Closed Won':
                statusBadgeHtml = '<span class="status-badge closed-won">Closed Won</span>';
                break;
            case 'Closed Lost':
                statusBadgeHtml = '<span class="status-badge closed-lost">Closed Lost</span>';
                break;
            default:
                statusBadgeHtml = '<span class="status-badge">' + deal.status + '</span>';
        }
        
        // Create row HTML
        row.innerHTML = `
            <td>${deal.customerName}</td>
            <td>${deal.vehicleYear} ${deal.vehicleMake} ${deal.vehicleModel}</td>
            <td>${statusBadgeHtml}</td>
            <td>$${deal.value.toLocaleString()}</td>
            <td>${deal.salesperson}</td>
            <td>${formatDate(deal.dateCreated)}</td>
            <td>${formatDate(deal.expectedCloseDate)}</td>
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
    
    // If no deals, show a message
    if (filteredDeals.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem;">No deals found matching the selected filters</td>';
        tableBody.appendChild(row);
    }
    
    // Re-initialize event listeners for the new elements
    initDealsEventListeners();
    
    return filteredDeals.length;
}

// Reset Filters
function resetDealsFilters() {
    // Reset all filter dropdowns to first option
    document.getElementById('status-filter').selectedIndex = 0;
    document.getElementById('type-filter').selectedIndex = 0;
    document.getElementById('salesperson-filter').selectedIndex = 0;
    document.getElementById('date-filter').selectedIndex = 0;
    
    // Repopulate the table with all deals
    populateDealsTable();
}

// View Deal Details
function viewDealDetails(customer, vehicle) {
    // Find the deal by customer and vehicle
    const deals = DataService.deals.getAll();
    const deal = deals.find(d => 
        d.customer.name === customer && 
        `${d.vehicle.year} ${d.vehicle.make} ${d.vehicle.model}` === vehicle);
    
    if (!deal) {
        alert(`Deal for ${customer} on ${vehicle} not found.`);
        return;
    }
    
    // Format finance details if available
    let financeDetailsText = '';
    if (deal.financeDetails) {
        financeDetailsText = `
            Amount: $${deal.financeDetails.amount.toLocaleString()}
            Term: ${deal.financeDetails.term} months
            Rate: ${deal.financeDetails.rate}%
            Monthly Payment: $${deal.financeDetails.monthly.toLocaleString()}
            Down Payment: $${deal.financeDetails.downPayment.toLocaleString()}
        `;
    }
    
    // Format lease details if available
    let leaseDetailsText = '';
    if (deal.leaseDetails) {
        leaseDetailsText = `
            Term: ${deal.leaseDetails.term} months
            Monthly Payment: $${deal.leaseDetails.monthly.toLocaleString()}
            Down Payment: $${deal.leaseDetails.downPayment.toLocaleString()}
            Mileage Allowance: ${deal.leaseDetails.mileageAllowance.toLocaleString()} miles/year
        `;
    }
    
    // Format trade-in details if available
    let tradeInText = '';
    if (deal.tradeIn) {
        tradeInText = `
            Make: ${deal.tradeIn.make}
            Model: ${deal.tradeIn.model}
            Year: ${deal.tradeIn.year}
            Value: $${deal.tradeIn.value.toLocaleString()}
        `;
    }
    
    // For demo purposes, show an alert with deal details
    alert(`
        Deal Details:
        Customer: ${deal.customer.name}
        Vehicle: ${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model}
        Stock #: ${deal.vehicle.stockNumber}
        Price: $${deal.vehicle.price.toLocaleString()}
        Deal Type: ${deal.dealType}
        Status: ${deal.status}
        Salesperson: ${deal.salesperson}
        Date Created: ${formatDate(deal.dateCreated)}
        ${deal.dateClosed ? 'Date Closed: ' + formatDate(deal.dateClosed) : ''}
        
        ${deal.financeDetails ? 'Finance Details:\n' + financeDetailsText : ''}
        
        ${deal.leaseDetails ? 'Lease Details:\n' + leaseDetailsText : ''}
        
        ${deal.tradeIn ? 'Trade-In:\n' + tradeInText : ''}
        
        ${deal.profit ? 'Profit: $' + deal.profit.toLocaleString() : ''}
        
        Notes: ${deal.notes || 'No notes'}
    `);
}

// Edit Deal
function editDeal(customer, vehicle) {
    // Find the deal by customer and vehicle
    const deals = DataService.deals.getAll();
    const deal = deals.find(d => 
        d.customer.name === customer && 
        `${d.vehicle.year} ${d.vehicle.make} ${d.vehicle.model}` === vehicle);
    
    if (!deal) {
        alert(`Deal for ${customer} on ${vehicle} not found.`);
        return;
    }
    
    // For demo purposes, show an alert
    alert(`Editing deal for ${customer} on ${vehicle}. This would open an edit form in a real application.`);
}

// Show More Options
function showMoreOptions(customer, vehicle, buttonElement) {
    // Find the deal by customer and vehicle
    const deals = DataService.deals.getAll();
    const deal = deals.find(d => 
        d.customer.name === customer && 
        `${d.vehicle.year} ${d.vehicle.make} ${d.vehicle.model}` === vehicle);
    
    if (!deal) {
        alert(`Deal for ${customer} on ${vehicle} not found.`);
        return;
    }
    
    // For demo purposes, show an alert with options
    const options = ['Delete', 'Mark as Closed', 'Print Details', 'Send to Finance', 'Add Note'];
    alert(`Options for deal with ${customer} on ${vehicle}:\n\n${options.join('\n')}`);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Search and Filter Functionality
function applyDealsSearch() {
    // Get search values
    const searchInput = document.getElementById('deal-search');
    const searchCriteriaSelect = document.getElementById('search-criteria');
    const dealFilter = document.getElementById('deal-filter');
    
    if (!searchInput || !searchCriteriaSelect) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    const criteria = searchCriteriaSelect.value;
    const filterStatus = dealFilter ? dealFilter.value : '';
    
    // Get all deals
    const allDeals = DataService.deals.getAll();
    
    // Filter deals
    let filteredDeals = allDeals;
    
    // Apply search filter based on selected criteria
    if (searchTerm) {
        filteredDeals = filteredDeals.filter(deal => {
            switch (criteria) {
                case 'customer':
                    return deal.customerName.toLowerCase().includes(searchTerm) ||
                           (deal.customerEmail && deal.customerEmail.toLowerCase().includes(searchTerm));
                case 'phone':
                    // Look up customer phone by customerId
                    if (deal.customerId) {
                        const customer = DataService.customers.get(deal.customerId);
                        if (customer && customer.phone) {
                            const customerPhoneDigits = customer.phone.replace(/\D/g, '');
                            const searchDigits = searchTerm.replace(/\D/g, '');
                            return customerPhoneDigits.includes(searchDigits);
                        }
                    }
                    return false;
                case 'vehicle':
                    return deal.vehicleMake.toLowerCase().includes(searchTerm) ||
                           deal.vehicleModel.toLowerCase().includes(searchTerm) ||
                           deal.vehicleYear.toString().includes(searchTerm);
                case 'salesperson':
                    return deal.salesperson.toLowerCase().includes(searchTerm);
                case 'value':
                    // Remove currency symbols and commas for value search
                    const dealValue = deal.value.toString().replace(/[$,]/g, '');
                    const searchValue = searchTerm.replace(/[$,]/g, '');
                    return dealValue.includes(searchValue);
                case 'all':
                default:
                    // Search across all fields including phone
                    const dealValue = deal.value.toString().replace(/[$,]/g, '');
                    const searchValue = searchTerm.replace(/[$,]/g, '');
                    
                    // Check phone number if customerId exists
                    let phoneMatch = false;
                    if (deal.customerId) {
                        const customer = DataService.customers.get(deal.customerId);
                        if (customer && customer.phone) {
                            const customerPhoneDigits = customer.phone.replace(/\D/g, '');
                            const searchDigits = searchTerm.replace(/\D/g, '');
                            phoneMatch = customerPhoneDigits.includes(searchDigits);
                        }
                    }
                    
                    return deal.customerName.toLowerCase().includes(searchTerm) ||
                           (deal.customerEmail && deal.customerEmail.toLowerCase().includes(searchTerm)) ||
                           deal.vehicleMake.toLowerCase().includes(searchTerm) ||
                           deal.vehicleModel.toLowerCase().includes(searchTerm) ||
                           deal.vehicleYear.toString().includes(searchTerm) ||
                           deal.salesperson.toLowerCase().includes(searchTerm) ||
                           dealValue.includes(searchValue) ||
                           deal.status.toLowerCase().includes(searchTerm) ||
                           phoneMatch;
            }
        });
    }
    
    // Apply status filter
    if (filterStatus && filterStatus !== '') {
        filteredDeals = filteredDeals.filter(deal => deal.status === filterStatus);
    }
    
    // Update table with filtered deals
    updateDealsTable(filteredDeals);
    
    return filteredDeals.length;
}

// Update deals table with filtered data
function updateDealsTable(deals) {
    const tableBody = document.querySelector('.deals-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add filtered deals to the table
    deals.forEach(deal => {
        const row = document.createElement('tr');
        
        // Create status badge HTML
        let statusBadgeHtml = '';
        switch(deal.status) {
            case 'Pending':
                statusBadgeHtml = '<span class="status-badge pending">Pending</span>';
                break;
            case 'In Progress':
                statusBadgeHtml = '<span class="status-badge in-progress">In Progress</span>';
                break;
            case 'Closed Won':
                statusBadgeHtml = '<span class="status-badge closed-won">Closed Won</span>';
                break;
            case 'Closed Lost':
                statusBadgeHtml = '<span class="status-badge closed-lost">Closed Lost</span>';
                break;
            default:
                statusBadgeHtml = '<span class="status-badge">' + deal.status + '</span>';
        }
        
        // Create row HTML
        row.innerHTML = `
            <td>${deal.customerName}</td>
            <td>${deal.vehicleYear} ${deal.vehicleMake} ${deal.vehicleModel}</td>
            <td>${statusBadgeHtml}</td>
            <td>$${deal.value.toLocaleString()}</td>
            <td>${deal.salesperson}</td>
            <td>${formatDate(deal.dateCreated)}</td>
            <td>${formatDate(deal.expectedCloseDate)}</td>
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
    
    // If no deals, show a message
    if (deals.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" style="text-align: center; padding: 2rem;">No deals found matching the search criteria</td>';
        tableBody.appendChild(row);
    }
    
    // Re-initialize event listeners for the new elements
    initDealsEventListeners();
}

// Wrapper function for HTML event listeners
function filterDeals() {
    applyDealsSearch();
}