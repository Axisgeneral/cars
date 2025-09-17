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
            case 'Contacted':
                statusBadgeHtml = '<span class="status-badge contacted">Contacted</span>';
                break;
            case 'Qualified':
                statusBadgeHtml = '<span class="status-badge qualified">Qualified</span>';
                break;
            case 'Proposal':
                statusBadgeHtml = '<span class="status-badge proposal">Proposal</span>';
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
            <td>${formatDate(lead.dateAdded)}</td>
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
    const contactedLeads = leads.filter(lead => lead.status === 'Contacted').length;
    const qualifiedLeads = leads.filter(lead => lead.status === 'Qualified').length;
    const proposalLeads = leads.filter(lead => lead.status === 'Proposal').length;
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
                <span class="stat-label">Contacted:</span>
                <span class="stat-value">${contactedLeads}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Qualified:</span>
                <span class="stat-value">${qualifiedLeads}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Proposal:</span>
                <span class="stat-value">${proposalLeads}</span>
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
            case 'Contacted':
                statusBadgeHtml = '<span class="status-badge contacted">Contacted</span>';
                break;
            case 'Qualified':
                statusBadgeHtml = '<span class="status-badge qualified">Qualified</span>';
                break;
            case 'Proposal':
                statusBadgeHtml = '<span class="status-badge proposal">Proposal</span>';
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
            <td>${formatDate(lead.dateAdded)}</td>
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

// Search and Filter Functionality
function applyLeadsSearch() {
    // Get search values
    const searchInput = document.getElementById('lead-search');
    const searchCriteriaSelect = document.getElementById('search-criteria');
    const leadFilter = document.getElementById('lead-filter');
    
    if (!searchInput || !searchCriteriaSelect) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    const criteria = searchCriteriaSelect.value;
    const filterStatus = leadFilter ? leadFilter.value : '';
    
    // Get all leads
    const allLeads = DataService.leads.getAll();
    
    // Filter leads
    let filteredLeads = allLeads;
    
    // Apply search filter based on selected criteria
    if (searchTerm) {
        filteredLeads = filteredLeads.filter(lead => {
            switch (criteria) {
                case 'name':
                    return lead.firstName.toLowerCase().includes(searchTerm) ||
                           lead.lastName.toLowerCase().includes(searchTerm);
                case 'phone':
                    // Normalize both phone and searchTerm to digits only for matching
                    const leadPhoneDigits = (lead.phone || '').replace(/\D/g, '');
                    const searchDigits = searchTerm.replace(/\D/g, '');
                    return leadPhoneDigits.includes(searchDigits);
                case 'email':
                    return lead.email.toLowerCase().includes(searchTerm);
                case 'company':
                    return (lead.company && lead.company.toLowerCase().includes(searchTerm)) || false;
                case 'interest':
                    return lead.interest && lead.interest.toLowerCase().includes(searchTerm);
                case 'source':
                    return lead.source && lead.source.toLowerCase().includes(searchTerm);
                case 'all':
                default:
                    // Search across all fields
                    const leadPhoneDigitsAll = (lead.phone || '').replace(/\D/g, '');
                    const searchDigitsAll = searchTerm.replace(/\D/g, '');
                    return lead.firstName.toLowerCase().includes(searchTerm) ||
                           lead.lastName.toLowerCase().includes(searchTerm) ||
                           lead.email.toLowerCase().includes(searchTerm) ||
                           leadPhoneDigitsAll.includes(searchDigitsAll) ||
                           (lead.company && lead.company.toLowerCase().includes(searchTerm)) ||
                           (lead.source && lead.source.toLowerCase().includes(searchTerm)) ||
                           (lead.interest && lead.interest.toLowerCase().includes(searchTerm));
            }
        });
    }
    
    // Apply status filter
    if (filterStatus && filterStatus !== '') {
        filteredLeads = filteredLeads.filter(lead => lead.status === filterStatus);
    }
    
    // Update table with filtered leads
    updateLeadsTable(filteredLeads);
    
    return filteredLeads.length;
}

// Update leads table with filtered data
function updateLeadsTable(leads) {
    const tableBody = document.querySelector('.leads-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add filtered leads to the table
    leads.forEach(lead => {
        const row = document.createElement('tr');
        
        // Create status badge HTML
        let statusBadgeHtml = '';
        switch(lead.status) {
            case 'New':
                statusBadgeHtml = '<span class="status-badge new">New</span>';
                break;
            case 'Contacted':
                statusBadgeHtml = '<span class="status-badge contacted">Contacted</span>';
                break;
            case 'Qualified':
                statusBadgeHtml = '<span class="status-badge qualified">Qualified</span>';
                break;
            case 'Proposal':
                statusBadgeHtml = '<span class="status-badge proposal">Proposal</span>';
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
            <td>${formatDate(lead.dateAdded)}</td>
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
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem;">No leads found matching the search criteria</td>';
        tableBody.appendChild(row);
    }
    
    // Re-initialize event listeners for the new elements
    initLeadsEventListeners();
}

// Wrapper function for HTML event listeners
function filterLeads() {
    applyLeadsSearch();
}

// Import/Export Functions
let selectedLeadsFile = null;
let parsedLeadsData = null;

// Initialize Import/Export Event Listeners
function initImportExportListeners() {
    // Import button
    const importBtn = document.getElementById('import-leads-btn');
    if (importBtn) {
        importBtn.addEventListener('click', openImportModal);
    }

    // Export button
    const exportBtn = document.getElementById('export-leads-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportLeads);
    }

    // File input
    const fileInput = document.getElementById('leads-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Upload zone
    const uploadZone = document.getElementById('leads-upload-zone');
    if (uploadZone) {
        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', handleDragOver);
        uploadZone.addEventListener('drop', handleFileDrop);
    }

    // Modal controls
    const closeModal = document.getElementById('close-import-leads-modal');
    const cancelImport = document.getElementById('cancel-import-leads');
    const confirmImport = document.getElementById('confirm-import-leads');
    const removeFile = document.getElementById('leads-remove-file');

    if (closeModal) closeModal.addEventListener('click', closeImportModal);
    if (cancelImport) cancelImport.addEventListener('click', closeImportModal);
    if (confirmImport) confirmImport.addEventListener('click', confirmImportLeads);
    if (removeFile) removeFile.addEventListener('click', removeSelectedFile);
}

// Open Import Modal
function openImportModal() {
    const modal = document.getElementById('import-leads-modal');
    if (modal) {
        modal.classList.add('active');
        resetImportModal();
    }
}

// Close Import Modal
function closeImportModal() {
    const modal = document.getElementById('import-leads-modal');
    if (modal) {
        modal.classList.remove('active');
        resetImportModal();
    }
}

// Reset Import Modal
function resetImportModal() {
    selectedLeadsFile = null;
    parsedLeadsData = null;
    
    const fileInfo = document.getElementById('leads-file-info');
    const uploadZone = document.getElementById('leads-upload-zone');
    const preview = document.getElementById('leads-import-preview');
    const confirmBtn = document.getElementById('confirm-import-leads');
    
    if (fileInfo) fileInfo.style.display = 'none';
    if (uploadZone) uploadZone.style.display = 'block';
    if (preview) preview.style.display = 'none';
    if (confirmBtn) confirmBtn.disabled = true;
}

// Handle File Selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processSelectedFile(file);
    }
}

// Handle Drag Over
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

// Handle File Drop
function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processSelectedFile(files[0]);
    }
}

// Process Selected File
function processSelectedFile(file) {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['text/csv', 'application/json', '.csv', '.json'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) && !validTypes.includes(fileExtension)) {
        alert('Please select a CSV or JSON file.');
        return;
    }
    
    selectedLeadsFile = file;
    
    // Show file info
    const fileInfo = document.getElementById('leads-file-info');
    const fileName = document.getElementById('leads-file-name');
    const uploadZone = document.getElementById('leads-upload-zone');
    
    if (fileInfo && fileName && uploadZone) {
        fileName.textContent = file.name;
        fileInfo.style.display = 'flex';
        uploadZone.style.display = 'none';
    }
    
    // Parse and preview file
    parseFile(file);
}

// Remove Selected File
function removeSelectedFile() {
    selectedLeadsFile = null;
    parsedLeadsData = null;
    
    const fileInput = document.getElementById('leads-file-input');
    if (fileInput) fileInput.value = '';
    
    resetImportModal();
}

// Parse File
function parseFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let data;
            
            if (file.name.toLowerCase().endsWith('.csv')) {
                data = parseCSV(e.target.result);
            } else if (file.name.toLowerCase().endsWith('.json')) {
                data = JSON.parse(e.target.result);
            }
            
            if (data && data.length > 0) {
                parsedLeadsData = data;
                showPreview(data);
                
                const confirmBtn = document.getElementById('confirm-import-leads');
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
function parseCSV(csvText) {
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
function showPreview(data) {
    const preview = document.getElementById('leads-import-preview');
    const table = document.getElementById('leads-preview-table');
    
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
function confirmImportLeads() {
    if (!parsedLeadsData || !parsedLeadsData.length) {
        alert('No data to import.');
        return;
    }
    
    const skipDuplicates = document.getElementById('leads-skip-duplicates').checked;
    const existingLeads = DataService.leads.getAll();
    const existingEmails = new Set(existingLeads.map(lead => lead.email.toLowerCase()));
    
    let importedCount = 0;
    let skippedCount = 0;
    
    parsedLeadsData.forEach(rowData => {
        // Skip if duplicate and option is enabled
        if (skipDuplicates && rowData.email && existingEmails.has(rowData.email.toLowerCase())) {
            skippedCount++;
            return;
        }
        
        // Create lead object with default values
        const lead = {
            id: Date.now() + Math.random(),
            firstName: rowData.firstName || '',
            lastName: rowData.lastName || '',
            email: rowData.email || '',
            phone: rowData.phone || '',
            source: rowData.source || 'Import',
            status: rowData.status || 'New',
            interest: rowData.interest || '',
            notes: rowData.notes || '',
            dateCreated: new Date().toISOString(),
            lastContact: rowData.lastContact || '',
            nextFollowUp: rowData.nextFollowUp || '',
            assignedTo: rowData.assignedTo || 'Unassigned',
            vehicleInterest: {
                make: rowData.vehicleMake || '',
                model: rowData.vehicleModel || '',
                year: rowData.vehicleYear || '',
                budget: rowData.vehicleBudget || ''
            }
        };
        
        // Add to data service
        DataService.leads.add(lead);
        importedCount++;
    });
    
    // Show results
    let message = `Import completed!\n\nImported: ${importedCount} leads`;
    if (skippedCount > 0) {
        message += `\nSkipped duplicates: ${skippedCount} leads`;
    }
    
    alert(message);
    
    // Refresh the table and close modal
    loadLeads();
    updateStats();
    closeImportModal();
}

// Export Leads
function exportLeads() {
    const leads = DataService.leads.getAll();
    
    if (leads.length === 0) {
        alert('No leads to export.');
        return;
    }
    
    // Create CSV content
    const headers = [
        'firstName', 'lastName', 'email', 'phone', 'source', 'status', 
        'interest', 'notes', 'dateCreated', 'lastContact', 'nextFollowUp', 
        'assignedTo', 'vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleBudget'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    leads.forEach(lead => {
        const row = [
            lead.firstName || '',
            lead.lastName || '',
            lead.email || '',
            lead.phone || '',
            lead.source || '',
            lead.status || '',
            lead.interest || '',
            (lead.notes || '').replace(/,/g, ';'),
            lead.dateCreated || '',
            lead.lastContact || '',
            lead.nextFollowUp || '',
            lead.assignedTo || '',
            (lead.vehicleInterest && lead.vehicleInterest.make) || '',
            (lead.vehicleInterest && lead.vehicleInterest.model) || '',
            (lead.vehicleInterest && lead.vehicleInterest.year) || '',
            (lead.vehicleInterest && lead.vehicleInterest.budget) || ''
        ];
        
        csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}