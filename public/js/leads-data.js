// Leads Data Service

// Initialize Leads Data
function initLeadsData() {
    // Initialize leads data if it doesn't exist
    DataService.leads.init();
    
    // Populate leads table
    populateLeadsTable();
}

// Populate Leads Table
function populateLeadsTable() {
    const leads = DataService.leads.getAll();
    const tableBody = document.querySelector('.leads-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add leads to the table
    leads.forEach(lead => {
        const row = document.createElement('tr');
        
        // Create status badge HTML
        let statusBadgeHtml = '';
        switch(lead.status) {
            case 'New':
                statusBadgeHtml = '<span class="status-badge new">New</span>';
                break;
            case 'In Progress':
                statusBadgeHtml = '<span class="status-badge in-progress">In Progress</span>';
                break;
            case 'Hot':
                statusBadgeHtml = '<span class="status-badge hot">Hot</span>';
                break;
            case 'Cold':
                statusBadgeHtml = '<span class="status-badge cold">Cold</span>';
                break;
            case 'Converted':
                statusBadgeHtml = '<span class="status-badge converted">Converted</span>';
                break;
            default:
                statusBadgeHtml = '<span class="status-badge">' + lead.status + '</span>';
        }
        
        // Create row HTML
        row.innerHTML = `
            <td>
                <input type="checkbox" id="lead-${lead.id}" name="selected-leads">
                <label for="lead-${lead.id}"></label>
            </td>
            <td>${lead.firstName} ${lead.lastName}</td>
            <td>${lead.email}</td>
            <td>${lead.phone}</td>
            <td>${lead.source}</td>
            <td>${statusBadgeHtml}</td>
            <td>${lead.assignedTo}</td>
            <td>${formatDate(lead.dateCreated)}</td>
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
    
    // If no leads, show a message
    if (leads.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem;">No leads found</td>';
        tableBody.appendChild(row);
    }
    
    // Update leads stats
    updateLeadsStats();
    
    // Re-initialize event listeners for the new elements
    initLeadsEventListeners();
}

// Update Leads Stats
function updateLeadsStats() {
    const leads = DataService.leads.getAll();
    
    // Calculate stats
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'New').length;
    const inProgressLeads = leads.filter(lead => lead.status === 'In Progress').length;
    const hotLeads = leads.filter(lead => lead.status === 'Hot').length;
    const coldLeads = leads.filter(lead => lead.status === 'Cold').length;
    const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
    
    // Update DOM elements
    const statsContainer = document.querySelector('.leads-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Leads:</span>
                <span class="stat-value">${totalLeads}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">New:</span>
                <span class="stat-value">${newLeads}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">In Progress:</span>
                <span class="stat-value">${inProgressLeads}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Hot:</span>
                <span class="stat-value">${hotLeads}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Cold:</span>
                <span class="stat-value">${coldLeads}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Converted:</span>
                <span class="stat-value">${convertedLeads}</span>
            </div>
        `;
    }
}

// Initialize Leads Event Listeners
function initLeadsEventListeners() {
    // Action Buttons
    const viewButtons = document.querySelectorAll('.action-buttons .btn-icon[title="View Details"]');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const name = row.cells[1].textContent;
            viewLeadDetails(name);
        });
    });
    
    const editButtons = document.querySelectorAll('.action-buttons .btn-icon[title="Edit"]');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const name = row.cells[1].textContent;
            editLead(name);
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
function applyLeadsFilters() {
    // Get filter values
    const status = document.getElementById('status-filter').value;
    const source = document.getElementById('source-filter').value;
    const assignedTo = document.getElementById('assigned-filter').value;
    const dateRange = document.getElementById('date-filter').value;
    
    // Get all leads
    const allLeads = DataService.leads.getAll();
    
    // Filter leads
    let filteredLeads = allLeads;
    
    // Apply status filter
    if (status !== 'all') {
        filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }
    
    // Apply source filter
    if (source !== 'all') {
        filteredLeads = filteredLeads.filter(lead => lead.source === source);
    }
    
    // Apply assigned to filter
    if (assignedTo !== 'all') {
        filteredLeads = filteredLeads.filter(lead => lead.assignedTo === assignedTo);
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
            filteredLeads = filteredLeads.filter(lead => {
                const leadDate = new Date(lead.dateCreated);
                return leadDate >= startDate;
            });
        }
    }
    
    // Update table with filtered leads
    const tableBody = document.querySelector('.leads-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add filtered leads to the table
    filteredLeads.forEach(lead => {
        const row = document.createElement('tr');
        
        // Create status badge HTML
        let statusBadgeHtml = '';
        switch(lead.status) {
            case 'New':
                statusBadgeHtml = '<span class="status-badge new">New</span>';
                break;
            case 'In Progress':
                statusBadgeHtml = '<span class="status-badge in-progress">In Progress</span>';
                break;
            case 'Hot':
                statusBadgeHtml = '<span class="status-badge hot">Hot</span>';
                break;
            case 'Cold':
                statusBadgeHtml = '<span class="status-badge cold">Cold</span>';
                break;
            case 'Converted':
                statusBadgeHtml = '<span class="status-badge converted">Converted</span>';
                break;
            default:
                statusBadgeHtml = '<span class="status-badge">' + lead.status + '</span>';
        }
        
        // Create row HTML
        row.innerHTML = `
            <td>
                <input type="checkbox" id="lead-${lead.id}" name="selected-leads">
                <label for="lead-${lead.id}"></label>
            </td>
            <td>${lead.firstName} ${lead.lastName}</td>
            <td>${lead.email}</td>
            <td>${lead.phone}</td>
            <td>${lead.source}</td>
            <td>${statusBadgeHtml}</td>
            <td>${lead.assignedTo}</td>
            <td>${formatDate(lead.dateCreated)}</td>
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
    
    // If no leads, show a message
    if (filteredLeads.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem;">No leads found matching the selected filters</td>';
        tableBody.appendChild(row);
    }
    
    // Re-initialize event listeners for the new elements
    initLeadsEventListeners();
    
    return filteredLeads.length;
}

// Reset Filters
function resetLeadsFilters() {
    // Reset all filter dropdowns to first option
    document.getElementById('status-filter').selectedIndex = 0;
    document.getElementById('source-filter').selectedIndex = 0;
    document.getElementById('assigned-filter').selectedIndex = 0;
    document.getElementById('date-filter').selectedIndex = 0;
    
    // Repopulate the table with all leads
    populateLeadsTable();
}

// View Lead Details
function viewLeadDetails(name) {
    // Find the lead by name
    const leads = DataService.leads.getAll();
    const lead = leads.find(l => `${l.firstName} ${l.lastName}` === name);
    
    if (!lead) {
        alert(`Lead with name ${name} not found.`);
        return;
    }
    
    // For demo purposes, show an alert with lead details
    alert(`
        Lead Details:
        Name: ${lead.firstName} ${lead.lastName}
        Email: ${lead.email}
        Phone: ${lead.phone}
        Source: ${lead.source}
        Status: ${lead.status}
        Assigned To: ${lead.assignedTo}
        Date Created: ${lead.dateCreated}
        Last Contact: ${lead.lastContact}
        Next Follow Up: ${lead.nextFollowUp}
        
        Vehicle Interest:
        Make: ${lead.vehicleInterest.make}
        Model: ${lead.vehicleInterest.model}
        Year: ${lead.vehicleInterest.year}
        Budget: ${lead.vehicleInterest.budget}
        
        Notes: ${lead.notes}
    `);
}

// Edit Lead
function editLead(name) {
    // Find the lead by name
    const leads = DataService.leads.getAll();
    const lead = leads.find(l => `${l.firstName} ${l.lastName}` === name);
    
    if (!lead) {
        alert(`Lead with name ${name} not found.`);
        return;
    }
    
    // For demo purposes, show an alert
    alert(`Editing lead ${name}. This would open an edit form in a real application.`);
}

// Show More Options
function showMoreOptions(name, buttonElement) {
    // Find the lead by name
    const leads = DataService.leads.getAll();
    const lead = leads.find(l => `${l.firstName} ${l.lastName}` === name);
    
    if (!lead) {
        alert(`Lead with name ${name} not found.`);
        return;
    }
    
    // For demo purposes, show an alert with options
    const options = ['Delete', 'Convert to Customer', 'Send Email', 'Log Call', 'Schedule Follow-up'];
    alert(`Options for lead ${name}:\n\n${options.join('\n')}`);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}