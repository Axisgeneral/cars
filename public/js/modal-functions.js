// Modal Functions for AutoConnect
// Contains functions for opening various modal dialogs

// New Lead Modal
window.openAddLeadModal = function openAddLeadModal() {
    console.log('Opening Add Lead Modal...');
    
    // Create modal content
    const modalContent = `
        <form id="add-lead-form">
            <div class="form-section">
                <h4 class="form-section-title">Lead Information</h4>
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
                <div class="form-row">
                    <div class="form-group">
                        <label for="source">Source *</label>
                        <select id="source" name="source" required>
                            <option value="">Select Source</option>
                            <option value="Website">Website</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Referral">Referral</option>
                            <option value="Phone">Phone</option>
                            <option value="Email">Email</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="status">Status *</label>
                        <select id="status" name="status" required>
                            <option value="">Select Status</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Hot">Hot</option>
                            <option value="Cold">Cold</option>
                            <option value="Converted">Converted</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Vehicle Interest</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="interestType">Interest</label>
                        <select id="interestType" name="interestType">
                            <option value="">Select Interest</option>
                            <option value="New">New Vehicle</option>
                            <option value="Used">Used Vehicle</option>
                            <option value="Lease">Lease</option>
                            <option value="Finance">Finance</option>
                            <option value="Service">Service</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="budget">Budget</label>
                        <input type="number" id="budget" name="budget" min="0" step="1000">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="preferredMake">Preferred Make</label>
                        <select id="preferredMake" name="preferredMake">
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
                        <label for="preferredModel">Preferred Model</label>
                        <input type="text" id="preferredModel" name="preferredModel">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Additional Information</h4>
                <div class="form-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" name="notes" rows="3"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="assignedTo">Assigned To</label>
                        <select id="assignedTo" name="assignedTo">
                            <option value="">Select Sales Rep</option>
                            <option value="Thomas Morales">Thomas Morales</option>
                            <option value="Sales Rep 1">Sales Rep 1</option>
                            <option value="Sales Rep 2">Sales Rep 2</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="followUpDate">Follow-up Date</label>
                        <input type="date" id="followUpDate" name="followUpDate">
                    </div>
                </div>
            </div>
        </form>
    `;
    
    // Create modal with ModalUtils
    const modal = ModalUtils.createModal('add-lead-modal', 'Add New Lead', modalContent, [
        { text: 'Cancel', class: 'btn-secondary', attributes: 'data-modal-close' },
        { text: 'Save Lead', class: 'btn-primary', attributes: 'id="save-lead-btn"' }
    ]);
    
    // Open the modal
    ModalUtils.openModal('add-lead-modal');
    
    // Add event listener for save button
    const saveBtn = document.getElementById('save-lead-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveNewLead);
    }
}

function saveNewLead() {
    const form = document.getElementById('add-lead-form');
    if (!form) return;
    
    // Validate form
    const errors = ModalUtils.validateForm(form);
    if (Object.keys(errors).length > 0) {
        ModalUtils.displayFormErrors(errors);
        return;
    }
    
    // Get form data
    const formData = ModalUtils.getFormData(form);
    
    // Create lead object
    const lead = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        source: formData.source,
        status: formData.status,
        dateCreated: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        vehicleInterest: {
            type: formData.interestType || '',
            make: formData.preferredMake || '',
            model: formData.preferredModel || '',
            budget: formData.budget || 0
        },
        notes: formData.notes || '',
        assignedTo: formData.assignedTo || 'Unassigned',
        nextFollowUp: formData.followUpDate || ''
    };
    
    // Add lead to data service
    DataService.leads.add(lead);
    
    // Close modal
    ModalUtils.closeModal('add-lead-modal');
    
    // Show success message
    ModalUtils.showSuccessMessage('Lead added successfully!');
    
    // Refresh leads table if on leads page
    if (window.location.pathname.includes('leads.html')) {
        loadLeads();
        updateStats();
    }
}

// New Customer Modal
window.openAddCustomerModal = function openAddCustomerModal() {
    console.log('Opening Add Customer Modal...');
    
    // Create modal content
    const modalContent = `
        <form id="add-customer-form">
            <div class="form-section">
                <h4 class="form-section-title">Customer Information</h4>
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
                <h4 class="form-section-title">Address</h4>
                <div class="form-group">
                    <label for="street">Street Address</label>
                    <input type="text" id="street" name="street">
                </div>
                <div class="form-row-3">
                    <div class="form-group">
                        <label for="city">City</label>
                        <input type="text" id="city" name="city">
                    </div>
                    <div class="form-group">
                        <label for="state">State</label>
                        <input type="text" id="state" name="state">
                    </div>
                    <div class="form-group">
                        <label for="zip">ZIP Code</label>
                        <input type="text" id="zip" name="zip">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Additional Information</h4>
                <div class="form-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" name="notes" rows="3"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="source">Source</label>
                        <select id="source" name="source">
                            <option value="">Select Source</option>
                            <option value="Website">Website</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Referral">Referral</option>
                            <option value="Lead Conversion">Lead Conversion</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="customerType">Customer Type</label>
                        <select id="customerType" name="customerType">
                            <option value="Individual">Individual</option>
                            <option value="Business">Business</option>
                        </select>
                    </div>
                </div>
            </div>
        </form>
    `;
    
    // Create modal with ModalUtils
    const modal = ModalUtils.createModal('add-customer-modal', 'Add New Customer', modalContent, [
        { text: 'Cancel', class: 'btn-secondary', attributes: 'data-modal-close' },
        { text: 'Save Customer', class: 'btn-primary', attributes: 'id="save-customer-btn"' }
    ]);
    
    // Open the modal
    ModalUtils.openModal('add-customer-modal');
    
    // Add event listener for save button
    const saveBtn = document.getElementById('save-customer-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveNewCustomer);
    }
}

function saveNewCustomer() {
    const form = document.getElementById('add-customer-form');
    if (!form) return;
    
    // Validate form
    const errors = ModalUtils.validateForm(form);
    if (Object.keys(errors).length > 0) {
        ModalUtils.displayFormErrors(errors);
        return;
    }
    
    // Get form data
    const formData = ModalUtils.getFormData(form);
    
    // Create customer object
    const customer = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: {
            street: formData.street || '',
            city: formData.city || '',
            state: formData.state || '',
            zip: formData.zip || ''
        },
        dateAdded: new Date().toISOString(),
        notes: formData.notes || '',
        source: formData.source || '',
        customerType: formData.customerType || 'Individual',
        purchaseHistory: []
    };
    
    // Add customer to data service
    DataService.customers.add(customer);
    
    // Close modal
    ModalUtils.closeModal('add-customer-modal');
    
    // Show success message
    ModalUtils.showSuccessMessage('Customer added successfully!');
    
    // Refresh customers table if on customers page
    if (window.location.pathname.includes('customers.html') && typeof loadCustomers === 'function') {
        loadCustomers();
    }
}

// New Deal Modal
window.openAddDealModal = function openAddDealModal() {
    console.log('Opening Add Deal Modal...');
    
    // Get customers and vehicles for dropdowns
    const customers = DataService.customers.getAll();
    const vehicles = DataService.inventory.getAll();
    
    // Create customer options
    const customerOptions = customers.map(customer => 
        `<option value="${customer.id}">${customer.firstName} ${customer.lastName}</option>`
    ).join('');
    
    // Create vehicle options
    const vehicleOptions = vehicles.map(vehicle => 
        `<option value="${vehicle.id}">${vehicle.year} ${vehicle.make} ${vehicle.model} - $${vehicle.price}</option>`
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
                            <option value="New">New</option>
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
                    <textarea id="notes" name="notes" rows="3"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="salesperson">Salesperson *</label>
                        <select id="salesperson" name="salesperson" required>
                            <option value="">Select Salesperson</option>
                            <option value="Thomas Morales">Thomas Morales</option>
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
    const modal = ModalUtils.createModal('add-deal-modal', 'Add New Deal', modalContent, [
        { text: 'Cancel', class: 'btn-secondary', attributes: 'data-modal-close' },
        { text: 'Save Deal', class: 'btn-primary', attributes: 'id="save-deal-btn"' }
    ]);
    
    // Open the modal
    ModalUtils.openModal('add-deal-modal');
    
    // Add event listener for save button
    const saveBtn = document.getElementById('save-deal-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveNewDeal);
    }
    
    // Set today's date as default for deal date
    const dealDateInput = document.getElementById('dealDate');
    if (dealDateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        dealDateInput.value = formattedDate;
    }
}

function saveNewDeal() {
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
    
    // Create deal object
    const deal = {
        customerId: formData.customerId,
        vehicleId: formData.vehicleId,
        dealType: formData.dealType,
        status: formData.status,
        salePrice: parseFloat(formData.salePrice) || 0,
        downPayment: parseFloat(formData.downPayment) || 0,
        tradeInValue: parseFloat(formData.tradeInValue) || 0,
        financingTerm: formData.financingTerm || '',
        interestRate: parseFloat(formData.interestRate) || 0,
        notes: formData.notes || '',
        salesperson: formData.salesperson,
        dealDate: formData.dealDate,
        dateCreated: new Date().toISOString()
    };
    
    // Add deal to data service
    DataService.deals.add(deal);
    
    // Close modal
    ModalUtils.closeModal('add-deal-modal');
    
    // Show success message
    ModalUtils.showSuccessMessage('Deal added successfully!');
    
    // Refresh deals table if on deals page
    if (window.location.pathname.includes('deals.html') && typeof loadDeals === 'function') {
        loadDeals();
    }
}

// New Task Modal
window.openAddTaskModal = function openAddTaskModal() {
    console.log('Opening Add Task Modal...');
    
    // Create modal content
    const modalContent = `
        <form id="add-task-form">
            <div class="form-section">
                <h4 class="form-section-title">Task Information</h4>
                <div class="form-group">
                    <label for="title">Task Title *</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="priority">Priority *</label>
                        <select id="priority" name="priority" required>
                            <option value="">Select Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="status">Status *</label>
                        <select id="status" name="status" required>
                            <option value="">Select Status</option>
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Deferred">Deferred</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Assignment & Dates</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="assignedTo">Assigned To *</label>
                        <select id="assignedTo" name="assignedTo" required>
                            <option value="">Select Assignee</option>
                            <option value="Thomas Morales">Thomas Morales</option>
                            <option value="Sales Rep 1">Sales Rep 1</option>
                            <option value="Sales Rep 2">Sales Rep 2</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="dueDate">Due Date *</label>
                        <input type="date" id="dueDate" name="dueDate" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="taskType">Task Type</label>
                        <select id="taskType" name="taskType">
                            <option value="">Select Type</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Call">Call</option>
                            <option value="Email">Email</option>
                            <option value="Paperwork">Paperwork</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="reminderDate">Reminder Date</label>
                        <input type="date" id="reminderDate" name="reminderDate">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section-title">Related Items</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="relatedTo">Related To</label>
                        <select id="relatedTo" name="relatedTo">
                            <option value="">Select Related Item</option>
                            <option value="Customer">Customer</option>
                            <option value="Lead">Lead</option>
                            <option value="Deal">Deal</option>
                            <option value="Vehicle">Vehicle</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="relatedId">Related ID</label>
                        <input type="text" id="relatedId" name="relatedId" placeholder="ID of related item">
                    </div>
                </div>
            </div>
        </form>
    `;
    
    // Create modal with ModalUtils
    const modal = ModalUtils.createModal('add-task-modal', 'Add New Task', modalContent, [
        { text: 'Cancel', class: 'btn-secondary', attributes: 'data-modal-close' },
        { text: 'Save Task', class: 'btn-primary', attributes: 'id="save-task-btn"' }
    ]);
    
    // Open the modal
    ModalUtils.openModal('add-task-modal');
    
    // Add event listener for save button
    const saveBtn = document.getElementById('save-task-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveNewTask);
    }
    
    // Set today's date as default for due date
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];
        dueDateInput.value = formattedDate;
    }
}

function saveNewTask() {
    const form = document.getElementById('add-task-form');
    if (!form) return;
    
    // Validate form
    const errors = ModalUtils.validateForm(form);
    if (Object.keys(errors).length > 0) {
        ModalUtils.displayFormErrors(errors);
        return;
    }
    
    // Get form data
    const formData = ModalUtils.getFormData(form);
    
    // Create task object
    const task = {
        title: formData.title,
        description: formData.description || '',
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        taskType: formData.taskType || '',
        reminderDate: formData.reminderDate || '',
        relatedTo: formData.relatedTo || '',
        relatedId: formData.relatedId || '',
        dateCreated: new Date().toISOString(),
        createdBy: 'Thomas Morales' // Current user
    };
    
    // Add task to data service
    DataService.tasks.add(task);
    
    // Close modal
    ModalUtils.closeModal('add-task-modal');
    
    // Show success message
    ModalUtils.showSuccessMessage('Task added successfully!');
    
    // Refresh tasks table if on tasks page
    if (window.location.pathname.includes('tasks.html') && typeof loadTasks === 'function') {
        loadTasks();
    }
}

// Helper function to generate year options for dropdowns
function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    let options = '';
    
    for (let year = currentYear + 1; year >= currentYear - 20; year--) {
        options += `<option value="${year}">${year}</option>`;
    }
    
    return options;
}