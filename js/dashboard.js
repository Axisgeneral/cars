// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Show loading for dashboard cards
    const kpiCards = document.querySelectorAll('.kpi-card');
    const chartContainers = document.querySelectorAll('.chart-container');
    
    if (typeof LoadingManager !== 'undefined') {
        kpiCards.forEach(card => LoadingManager.showCardLoading(card));
        chartContainers.forEach(container => LoadingManager.showCardLoading(container));
    }
    
    try {
        // Initialize Data Services
        DataService.utils.initializeAllData();
        
        // Simulate data loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialize Dashboard Data
        initDashboardData();
        
        // Update KPIs with current data
        updateDashboardKPIs();
        
        // Initialize Charts
        initSalesChart();
        initLeadSourceChart();
        
        // Initialize Event Listeners
        initEventListeners();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    } finally {
        // Hide loading states
        if (typeof LoadingManager !== 'undefined') {
            kpiCards.forEach(card => LoadingManager.hideCardLoading(card));
            chartContainers.forEach(container => LoadingManager.hideCardLoading(container));
        }
    }
});

// Initialize Sales Performance Chart
function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Get real data from DataService
    const deals = DataService.deals.getAll();
    const inventory = DataService.inventory.getAll();
    
    // Process data by month
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
        monthlyData[month] = { new: 0, used: 0 };
    });
    
    // Process closed deals
    const closedDeals = deals.filter(deal => deal.status === 'Closed Won' || deal.status === 'Closed');
    
    closedDeals.forEach(deal => {
        const dealDate = new Date(deal.dateCreated);
        if (dealDate.getFullYear() === currentYear) {
            const monthName = months[dealDate.getMonth()];
            // Find the vehicle to determine if it's new or used
            const vehicle = inventory.find(v => v.id === deal.vehicleId);
            if (vehicle) {
                if (vehicle.type === 'New') {
                    monthlyData[monthName].new++;
                } else {
                    monthlyData[monthName].used++;
                }
            }
        }
    });
    
    const salesData = {
        labels: months,
        datasets: [
            {
                label: 'New Vehicles',
                data: months.map(month => monthlyData[month].new),
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Used Vehicles',
                data: months.map(month => monthlyData[month].used),
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                tension: 0.4
            }
        ]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: salesData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            },
            elements: {
                point: {
                    radius: 3,
                    hoverRadius: 6
                }
            }
        }
    });
}

// Initialize Lead Source Chart
function initLeadSourceChart() {
    const ctx = document.getElementById('leadSourceChart').getContext('2d');
    
    // Get real data from DataService
    const leads = DataService.leads.getAll();
    
    // Count leads by source
    const sourceCount = {};
    leads.forEach(lead => {
        const source = lead.source || 'Unknown';
        sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    
    // Prepare data for chart
    const labels = Object.keys(sourceCount);
    const data = Object.values(sourceCount);
    
    // If no data, show placeholder
    if (labels.length === 0) {
        labels.push('No Data');
        data.push(1);
    }
    
    const leadSourceData = {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: [
                'rgba(37, 99, 235, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(99, 102, 241, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(100, 116, 139, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(168, 85, 247, 0.8)'
            ],
            borderWidth: 0
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: leadSourceData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Initialize Event Listeners
function initEventListeners() {
    // Date Range Filter Change
    const dateRangeSelect = document.getElementById('date-range');
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', function() {
            console.log('Date range changed to:', this.value);
            refreshDashboardData(this.value);
        });
    }
    
    // Task Checkboxes
    const taskCheckboxes = document.querySelectorAll('.task-checkbox input[type="checkbox"]');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            if (this.checked) {
                taskItem.style.opacity = '0.6';
                // This would typically trigger an API call to update task status
                console.log('Task marked as complete:', this.id);
                // updateTaskStatus(this.id, 'completed');
            } else {
                taskItem.style.opacity = '1';
                console.log('Task marked as incomplete:', this.id);
                // updateTaskStatus(this.id, 'pending');
            }
        });
    });
    
    // Notification Bell
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            console.log('Notification bell clicked');
            // This would typically open a notification panel
            // toggleNotificationPanel();
        });
    }
    
    // Quick Action Buttons
    const newLeadBtn = document.querySelector('.quick-actions .btn-primary');
    if (newLeadBtn) {
        newLeadBtn.addEventListener('click', function() {
            openNewLeadForm();
        });
    }
    
    const logCallBtn = document.querySelector('.quick-actions .btn-secondary');
    if (logCallBtn) {
        logCallBtn.addEventListener('click', function() {
            console.log('Log Call button clicked');
            // This would typically open a call logging form
            // openCallLogForm();
        });
    }
}

// Function to refresh dashboard data
function refreshDashboardData(dateRange) {
    console.log('Refreshing dashboard data for date range:', dateRange);
    
    // Update KPIs with filtered data
    updateDashboardKPIs(dateRange);
    
    // Refresh charts with filtered data
    updateChartsWithFilteredData(dateRange);
}

// Function to update dashboard KPIs
function updateDashboardKPIs(dateRange = 'This Month') {
    // Get data directly from DataService
    const inventory = DataService.inventory.getAll();
    const deals = DataService.deals.getAll();
    const leads = DataService.leads.getAll();
    const customers = DataService.customers.getAll();
    
    // Calculate stats
    const soldVehicles = deals.filter(deal => deal.status === 'Closed Won' || deal.status === 'Closed').length;
    const totalRevenue = deals.filter(deal => deal.status === 'Closed Won' || deal.status === 'Closed')
                             .reduce((sum, deal) => sum + (deal.value || 0), 0);
    const totalLeads = leads.length;
    const conversionRate = totalLeads > 0 ? Math.round((soldVehicles / totalLeads) * 100) : 0;
    
    // Update Vehicles Sold KPI
    const vehiclesSoldElement = document.getElementById('kpi-vehicles-sold');
    if (vehiclesSoldElement) {
        vehiclesSoldElement.textContent = soldVehicles;
    }

    // Update Revenue KPI
    const revenueElement = document.getElementById('kpi-revenue');
    if (revenueElement) {
        const formattedRevenue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(totalRevenue);
        revenueElement.textContent = formattedRevenue;
    }

    // Update New Leads KPI
    const newLeadsElement = document.getElementById('kpi-new-leads');
    if (newLeadsElement) {
        newLeadsElement.textContent = totalLeads;
    }

    // Update Conversion Rate KPI
    const conversionRateElement = document.getElementById('kpi-conversion-rate');
    if (conversionRateElement) {
        conversionRateElement.textContent = conversionRate + '%';
    }
}

// Function to update charts with filtered data
function updateChartsWithFilteredData(dateRange) {
    // Always re-initialize charts to ensure they display
    initSalesChart();
    initLeadSourceChart();
}

// Function to update task status (would be implemented with actual API calls)
function updateTaskStatus(taskId, status) {
    // This is a placeholder for the actual implementation
    console.log('Updating task status:', taskId, status);
    
    // Example of what this might do:
    // 1. Make API call to update task status
    // 2. Handle success/error responses
    // 3. Update UI accordingly
}

// Function to toggle notification panel (would be implemented with actual UI)
function toggleNotificationPanel() {
    // This is a placeholder for the actual implementation
    console.log('Toggling notification panel');
    
    // Example of what this might do:
    // 1. Create/show notification panel
    // 2. Fetch notifications from API
    // 3. Populate panel with notifications
    // 4. Handle notification interactions
}

// Function to open new lead form
function openNewLeadForm() {
    const modalContent = `
        <form id="add-lead-form">
            <div class="form-section">
                <h4 class="form-section-title">Personal Information</h4>
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
                <div class="form-group">
                    <label for="company">Company</label>
                    <input type="text" id="company" name="company">
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Lead Details</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="status">Lead Status</label>
                        <select id="status" name="status">
                            <option value="Cold">Cold</option>
                            <option value="Warm" selected>Warm</option>
                            <option value="Hot">Hot</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="source">Lead Source</label>
                        <select id="source" name="source">
                            <option value="Website">Website</option>
                            <option value="Referral">Referral</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Phone">Phone</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Advertisement">Advertisement</option>
                            <option value="Trade Show">Trade Show</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="interest">Vehicle Interest</label>
                        <input type="text" id="interest" name="interest" placeholder="e.g., SUV, Sedan, Truck">
                    </div>
                    <div class="form-group">
                        <label for="budget">Budget Range</label>
                        <select id="budget" name="budget">
                            <option value="">Select Budget</option>
                            <option value="Under $20k">Under $20k</option>
                            <option value="$20k - $30k">$20k - $30k</option>
                            <option value="$30k - $50k">$30k - $50k</option>
                            <option value="$50k - $75k">$50k - $75k</option>
                            <option value="Over $75k">Over $75k</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" name="notes" rows="3" placeholder="Additional notes about the lead..."></textarea>
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
            attributes: 'onclick="saveDashboardLead()"'
        }
    ];
    
    ModalUtils.createModal('add-lead-modal', 'Add New Lead', modalContent, footerButtons);
    ModalUtils.openModal('add-lead-modal');
}

// Function to save lead from dashboard
function saveDashboardLead() {
    const form = document.getElementById('add-lead-form');
    const errors = ModalUtils.validateForm(form);
    
    if (Object.keys(errors).length > 0) {
        ModalUtils.displayFormErrors(errors);
        return;
    }
    
    const formData = ModalUtils.getFormData(form);
    
    // Create lead object
    const lead = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || '',
        status: formData.status || 'Warm',
        source: formData.source || 'Website',
        interest: formData.interest || '',
        budget: formData.budget || '',
        notes: formData.notes || ''
    };
    
    // Save lead
    DataService.leads.add(lead);
    
    // Close modal and show success message
    ModalUtils.closeModal('add-lead-modal');
    ModalUtils.removeModal('add-lead-modal');
    ModalUtils.showSuccessMessage('Lead added successfully!');
    
    // Refresh dashboard data (update KPIs)
    refreshDashboardData();
}

// Function to open call log form (would be implemented with actual UI)
function openCallLogForm() {
    // This is a placeholder for the actual implementation
    console.log('Opening call log form');
    
    // Example of what this might do:
    // 1. Show modal for logging a call
    // 2. Initialize form fields
    // 3. Set up validation
    // 4. Handle form submission
}