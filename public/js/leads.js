// Leads Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Leads Data
    initLeadsData();
    
    // Initialize Event Listeners
    initEventListeners();
    
    // Initialize Mobile Menu
    initMobileMenu();
});

// Initialize Event Listeners
function initEventListeners() {
    // Add Lead Button
    const addLeadBtn = document.querySelector('.quick-actions .btn-primary');
    if (addLeadBtn) {
        addLeadBtn.addEventListener('click', function() {
            openAddLeadForm();
        });
    }
    
    // Filter Button
    const filterBtn = document.querySelector('.quick-actions .btn-secondary');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            // Implement filter functionality
            console.log('Filter button clicked');
        });
    }
}

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
        switch(lead.status.toLowerCase()) {
            case 'new':
                statusBadgeHtml = '<span class="status-badge new">New</span>';
                break;
            case 'in progress':
                statusBadgeHtml = '<span class="status-badge in-progress">In Progress</span>';
                break;
            case 'hot':
                statusBadgeHtml = '<span class="status-badge hot">Hot</span>';
                break;
            case 'cold':
                statusBadgeHtml = '<span class="status-badge cold">Cold</span>';
                break;
            default:
                statusBadgeHtml = '<span class="status-badge">' + lead.status + '</span>';
        }
        
        // Format vehicle interest
        const vehicleInterest = lead.vehicleInterest ? 
            `${lead.vehicleInterest.year} ${lead.vehicleInterest.make} ${lead.vehicleInterest.model}` : 
            'Not specified';
        
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
            <td>${vehicleInterest}</td>
            <td>${statusBadgeHtml}</td>
            <td>${lead.assignedTo}</td>
            <td>${formatDate(lead.dateCreated)}</td>
            <td>${formatDate(lead.nextFollowUp)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="View Details" onclick="viewLeadDetails('${lead.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Edit" onclick="editLead('${lead.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Convert to Customer" onclick="convertToCustomer('${lead.id}')">
                        <i class="fas fa-user-plus"></i>
                    </button>
                    <button class="btn-icon" title="More Options" onclick="showMoreOptions('${lead.id}', this)">
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
        row.innerHTML = '<td colspan="11" style="text-align: center; padding: 2rem;">No leads found</td>';
        tableBody.appendChild(row);
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Open Add Lead Form
function openAddLeadForm() {
    const formContent = `
        <form id="addLeadForm">
            <div class="form-section">
                <h4 class="form-section-title">Contact Information</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstName">First Name *</label>
                        <input type="text" id="firstName" name="firstName" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Last Name *</label>
                        <input type="text" id="lastName" name="lastName" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone *</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Lead Details</h4>
                <div class="form-row-3">
                    <div class="form-group">
                        <label for="source">Source *</label>
                        <select id="source" name="source" required>
                            <option value="">Select Source</option>
                            <option value="Website">Website</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Phone Call">Phone Call</option>
                            <option value="Referral">Referral</option>
                            <option value="Online Ad">Online Ad</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Trade Show">Trade Show</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="status">Status</label>
                        <select id="status" name="status">
                            <option value="New" selected>New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Hot">Hot</option>
                            <option value="Cold">Cold</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="assignedTo">Assigned To</label>
                        <select id="assignedTo" name="assignedTo">
                            <option value="John Smith">John Smith</option>
                            <option value="Jane Doe">Jane Doe</option>
                            <option value="Mike Johnson">Mike Johnson</option>
                            <option value="Sarah Wilson">Sarah Wilson</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="nextFollowUp">Next Follow-up Date</label>
                    <input type="date" id="nextFollowUp" name="nextFollowUp">
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Vehicle Interest</h4>
                <div class="form-row-3">
                    <div class="form-group">
                        <label for="interestedMake">Make</label>
                        <input type="text" id="interestedMake" name="interestedMake" placeholder="e.g., Toyota, Honda">
                    </div>
                    <div class="form-group">
                        <label for="interestedModel">Model</label>
                        <input type="text" id="interestedModel" name="interestedModel" placeholder="e.g., Camry, Accord">
                    </div>
                    <div class="form-group">
                        <label for="interestedYear">Year</label>
                        <input type="text" id="interestedYear" name="interestedYear" placeholder="e.g., 2023, 2020-2023">
                    </div>
                </div>
                <div class="form-group">
                    <label for="budget">Budget Range</label>
                    <input type="text" id="budget" name="budget" placeholder="e.g., 25000-35000">
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Notes</h4>
                <div class="form-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" name="notes" placeholder="Enter any additional notes about this lead..."></textarea>
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
            text: 'Add Lead',
            class: 'btn-primary',
            icon: 'fas fa-plus',
            attributes: 'id="saveLeadBtn"'
        }
    ];
    
    ModalUtils.createModal('addLeadModal', 'Add New Lead', formContent, footerButtons);
    ModalUtils.openModal('addLeadModal');
    
    // Set default next follow-up date (3 days from now)
    const nextFollowUpField = document.getElementById('nextFollowUp');
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    nextFollowUpField.value = defaultDate.toISOString().split('T')[0];
    
    // Handle form submission
    const saveBtn = document.getElementById('saveLeadBtn');
    const form = document.getElementById('addLeadForm');
    
    saveBtn.addEventListener('click', function() {
        handleAddLeadSubmit(form, saveBtn);
    });
}

// Handle add lead form submission
function handleAddLeadSubmit(form, saveBtn) {
    // Clear previous errors
    ModalUtils.clearFormErrors();
    
    // Validate form
    const errors = ModalUtils.validateForm(form);
    
    if (Object.keys(errors).length > 0) {
        ModalUtils.displayFormErrors(errors);
        return;
    }
    
    // Show loading state
    ModalUtils.setButtonLoading(saveBtn, true);
    
    // Get form data
    const formData = ModalUtils.getFormData(form);
    
    // Create lead object
    const lead = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        source: formData.source,
        status: formData.status || 'New',
        assignedTo: formData.assignedTo || 'John Smith',
        nextFollowUp: formData.nextFollowUp,
        notes: formData.notes || '',
        vehicleInterest: {
            make: formData.interestedMake || '',
            model: formData.interestedModel || '',
            year: formData.interestedYear || '',
            budget: formData.budget || ''
        }
    };
    
    // Simulate API call delay
    setTimeout(() => {
        try {
            // Add lead to data service
            DataService.leads.add(lead);
            
            // Show success message
            ModalUtils.showSuccessMessage('Lead added successfully!');
            
            // Close modal
            ModalUtils.closeModal('addLeadModal');
            ModalUtils.removeModal('addLeadModal');
            
            // Refresh the leads table
            populateLeadsTable();
            
        } catch (error) {
            console.error('Error adding lead:', error);
            ModalUtils.showErrorMessage('Failed to add lead. Please try again.');
        } finally {
            ModalUtils.setButtonLoading(saveBtn, false);
        }
    }, 1000);
}

// View Lead Details
function viewLeadDetails(leadId) {
    const lead = DataService.leads.get(leadId);
    if (!lead) {
        ModalUtils.showErrorMessage('Lead not found.');
        return;
    }
    
    const vehicleInterest = lead.vehicleInterest ? 
        `${lead.vehicleInterest.year} ${lead.vehicleInterest.make} ${lead.vehicleInterest.model}` : 
        'Not specified';
    
    const detailsContent = `
        <div class="lead-details">
            <div class="form-section">
                <h4 class="form-section-title">Contact Information</h4>
                <div class="form-row">
                    <div class="detail-item">
                        <strong>Name:</strong> ${lead.firstName} ${lead.lastName}
                    </div>
                    <div class="detail-item">
                        <strong>Email:</strong> ${lead.email}
                    </div>
                </div>
                <div class="form-row">
                    <div class="detail-item">
                        <strong>Phone:</strong> ${lead.phone}
                    </div>
                    <div class="detail-item">
                        <strong>Source:</strong> ${lead.source}
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Lead Status</h4>
                <div class="form-row">
                    <div class="detail-item">
                        <strong>Status:</strong> <span class="status-badge ${lead.status.toLowerCase().replace(' ', '-')}">${lead.status}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Assigned To:</strong> ${lead.assignedTo}
                    </div>
                </div>
                <div class="form-row">
                    <div class="detail-item">
                        <strong>Date Created:</strong> ${formatDate(lead.dateCreated)}
                    </div>
                    <div class="detail-item">
                        <strong>Next Follow-up:</strong> ${formatDate(lead.nextFollowUp)}
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Vehicle Interest</h4>
                <div class="detail-item">
                    <strong>Vehicle:</strong> ${vehicleInterest}
                </div>
                <div class="detail-item">
                    <strong>Budget:</strong> ${lead.vehicleInterest?.budget || 'Not specified'}
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Notes</h4>
                <div class="detail-item">
                    ${lead.notes || 'No notes available'}
                </div>
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
            text: 'Edit Lead',
            class: 'btn-primary',
            icon: 'fas fa-edit',
            attributes: `onclick="editLead('${leadId}'); ModalUtils.closeModal('leadDetailsModal'); ModalUtils.removeModal('leadDetailsModal');"`
        }
    ];
    
    ModalUtils.createModal('leadDetailsModal', `Lead Details - ${lead.firstName} ${lead.lastName}`, detailsContent, footerButtons);
    ModalUtils.openModal('leadDetailsModal');
}

// Edit Lead (placeholder)
function editLead(leadId) {
    console.log('Edit lead:', leadId);
    ModalUtils.showErrorMessage('Edit functionality will be implemented in the next update.');
}

// Convert to Customer (placeholder)
function convertToCustomer(leadId) {
    console.log('Convert to customer:', leadId);
    ModalUtils.showErrorMessage('Convert to customer functionality will be implemented in the next update.');
}

// Show More Options (placeholder)
function showMoreOptions(leadId, button) {
    console.log('More options for lead:', leadId);
    ModalUtils.showErrorMessage('More options functionality will be implemented in the next update.');
}

// Initialize Mobile Menu (reuse from inventory.js)
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle && sidebar) {
        // Create overlay if it doesn't exist
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }
        
        // Toggle sidebar on menu button click
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        // Close sidebar when clicking overlay
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        // Close sidebar when clicking a menu item on mobile
        const menuItems = document.querySelectorAll('.sidebar-nav a');
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                if (window.innerWidth < 768) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    }
}