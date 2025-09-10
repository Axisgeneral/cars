// Service & Parts Management JavaScript

// Data Service for Service & Parts
const ServicePartsData = {
    KEYS: {
        SERVICE_ORDERS: 'autocrm_service_orders',
        PARTS_INVENTORY: 'autocrm_parts_inventory',
        SERVICE_HISTORY: 'autocrm_service_history'
    },
    
    // Service Orders Methods
    serviceOrders: {
        getAll: function() {
            return JSON.parse(localStorage.getItem(ServicePartsData.KEYS.SERVICE_ORDERS)) || [];
        },
        save: function(orders) {
            localStorage.setItem(ServicePartsData.KEYS.SERVICE_ORDERS, JSON.stringify(orders));
        },
        add: function(order) {
            const orders = this.getAll();
            if (!order.id) {
                order.id = 'SO' + String(orders.length + 1).padStart(3, '0');
            }
            orders.push(order);
            this.save(orders);
            return order;
        },
        update: function(orderId, updates) {
            const orders = this.getAll();
            const index = orders.findIndex(order => order.id === orderId);
            if (index !== -1) {
                orders[index] = { ...orders[index], ...updates };
                this.save(orders);
                return true;
            }
            return false;
        },
        remove: function(orderId) {
            const orders = this.getAll();
            const filtered = orders.filter(order => order.id !== orderId);
            this.save(filtered);
            return filtered.length < orders.length;
        }
    },
    
    // Parts Inventory Methods
    partsInventory: {
        getAll: function() {
            return JSON.parse(localStorage.getItem(ServicePartsData.KEYS.PARTS_INVENTORY)) || [];
        },
        save: function(parts) {
            localStorage.setItem(ServicePartsData.KEYS.PARTS_INVENTORY, JSON.stringify(parts));
        },
        add: function(part) {
            const parts = this.getAll();
            if (!part.id) {
                part.id = 'P' + String(parts.length + 1).padStart(3, '0');
            }
            parts.push(part);
            this.save(parts);
            return part;
        },
        update: function(partId, updates) {
            const parts = this.getAll();
            const index = parts.findIndex(part => part.id === partId);
            if (index !== -1) {
                parts[index] = { ...parts[index], ...updates };
                this.save(parts);
                return true;
            }
            return false;
        },
        remove: function(partId) {
            const parts = this.getAll();
            const filtered = parts.filter(part => part.id !== partId);
            this.save(filtered);
            return filtered.length < parts.length;
        }
    },
    
    // Service History Methods
    serviceHistory: {
        getAll: function() {
            return JSON.parse(localStorage.getItem(ServicePartsData.KEYS.SERVICE_HISTORY)) || [];
        },
        save: function(history) {
            localStorage.setItem(ServicePartsData.KEYS.SERVICE_HISTORY, JSON.stringify(history));
        },
        add: function(record) {
            const history = this.getAll();
            if (!record.id) {
                record.id = 'SH' + String(history.length + 1).padStart(3, '0');
            }
            history.push(record);
            this.save(history);
            return record;
        }
    },
    
    // Initialize with sample data
    init: function() {
        if (this.serviceOrders.getAll().length === 0) {
            this.serviceOrders.save(sampleServiceOrders);
        }
        if (this.partsInventory.getAll().length === 0) {
            this.partsInventory.save(samplePartsInventory);
        }
        if (this.serviceHistory.getAll().length === 0) {
            this.serviceHistory.save(sampleServiceHistory);
        }
    }
};

// Sample data
const sampleServiceOrders = [
    {
        id: 'SO001',
        customer: 'John Smith',
        vin: '1HGBH41JXMN109186',
        serviceType: 'oil-change',
        description: 'Regular oil change and filter replacement',
        status: 'in-progress',
        estimatedCost: 89.99,
        scheduledDate: '2024-03-15T10:00',
        technician: 'Mike Johnson',
        createdDate: '2024-03-14'
    },
    {
        id: 'SO002',
        customer: 'Sarah Davis',
        vin: '2T1BURHE0JC123456',
        serviceType: 'brake-service',
        description: 'Brake pad replacement and rotor resurfacing',
        status: 'waiting-parts',
        estimatedCost: 450.00,
        scheduledDate: '2024-03-16T14:00',
        technician: 'John Smith',
        createdDate: '2024-03-13'
    },
    {
        id: 'SO003',
        customer: 'Michael Brown',
        vin: '3VW2K7AJ9EM123789',
        serviceType: 'engine-repair',
        description: 'Engine diagnostic and repair',
        status: 'pending',
        estimatedCost: 1200.00,
        scheduledDate: '2024-03-18T09:00',
        technician: 'Sarah Davis',
        createdDate: '2024-03-14'
    }
];

const samplePartsInventory = [
    {
        id: 'P001',
        partNumber: 'OF-001',
        name: 'Oil Filter',
        category: 'filters',
        cost: 8.50,
        price: 15.99,
        quantity: 45,
        location: 'A1-B3',
        supplier: 'AutoParts Plus'
    },
    {
        id: 'P002',
        partNumber: 'BP-001',
        name: 'Brake Pads - Front',
        category: 'brakes',
        cost: 35.00,
        price: 89.99,
        quantity: 12,
        location: 'B2-C1',
        supplier: 'Brake Masters'
    },
    {
        id: 'P003',
        partNumber: 'SP-001',
        name: 'Spark Plugs Set',
        category: 'engine',
        cost: 25.00,
        price: 59.99,
        quantity: 8,
        location: 'C1-A2',
        supplier: 'Engine Pro'
    },
    {
        id: 'P004',
        partNumber: 'AF-001',
        name: 'Air Filter',
        category: 'filters',
        cost: 12.00,
        price: 24.99,
        quantity: 2,
        location: 'A1-B4',
        supplier: 'AutoParts Plus'
    }
];

const sampleServiceHistory = [
    {
        id: 'SH001',
        customer: 'Emily Johnson',
        vin: '1FTFW1ET5DFC12345',
        serviceType: 'oil-change',
        description: 'Oil change completed',
        completedDate: '2024-03-10',
        technician: 'Mike Johnson',
        totalCost: 89.99,
        status: 'completed'
    },
    {
        id: 'SH002',
        customer: 'David Wilson',
        vin: '5NPE34AF6FH123456',
        serviceType: 'transmission',
        description: 'Transmission fluid change',
        completedDate: '2024-03-08',
        technician: 'John Smith',
        totalCost: 189.99,
        status: 'completed'
    }
];

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load appropriate data
    switch(tabName) {
        case 'service-orders':
            loadServiceOrders();
            break;
        case 'parts-inventory':
            loadPartsInventory();
            break;
        case 'service-history':
            loadServiceHistory();
            break;
    }
}

// Load service orders
function loadServiceOrders() {
    const container = document.getElementById('service-orders-list');
    const statusFilter = document.getElementById('status-filter').value;
    const searchTerm = document.getElementById('service-orders-search')?.value.toLowerCase() || '';
    const searchCriteria = document.getElementById('service-search-criteria')?.value || 'all';
    
    let serviceOrders = ServicePartsData.serviceOrders.getAll();
    let filteredOrders = serviceOrders;
    
    // Apply status filter
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => {
            switch (searchCriteria) {
                case 'customer':
                    return order.customer.toLowerCase().includes(searchTerm);
                case 'vin':
                    return order.vin.toLowerCase().includes(searchTerm);
                case 'serviceType':
                    return order.serviceType.toLowerCase().includes(searchTerm);
                case 'technician':
                    return order.technician.toLowerCase().includes(searchTerm);
                case 'description':
                    return order.description.toLowerCase().includes(searchTerm);
                case 'all':
                default:
                    return order.customer.toLowerCase().includes(searchTerm) ||
                           order.vin.toLowerCase().includes(searchTerm) ||
                           order.serviceType.toLowerCase().includes(searchTerm) ||
                           order.technician.toLowerCase().includes(searchTerm) ||
                           order.description.toLowerCase().includes(searchTerm) ||
                           order.id.toLowerCase().includes(searchTerm);
            }
        });
    }
    
    container.innerHTML = filteredOrders.map(order => `
        <div class="service-order-card">
            <div class="order-header">
                <div class="order-info">
                    <h4>${order.id}</h4>
                    <p class="customer-name">${order.customer}</p>
                    <p class="vin">VIN: ${order.vin}</p>
                </div>
                <div class="order-status">
                    <span class="status-badge ${order.status}">${formatStatus(order.status)}</span>
                </div>
            </div>
            <div class="order-details">
                <p><strong>Service:</strong> ${formatServiceType(order.serviceType)}</p>
                <p><strong>Description:</strong> ${order.description}</p>
                <p><strong>Technician:</strong> ${order.technician}</p>
                <p><strong>Scheduled:</strong> ${formatDateTime(order.scheduledDate)}</p>
                <p><strong>Estimated Cost:</strong> $${order.estimatedCost.toFixed(2)}</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-sm btn-primary" onclick="editServiceOrder('${order.id}')">Edit</button>
                <button class="btn btn-sm btn-secondary" onclick="updateOrderStatus('${order.id}')">Update Status</button>
                <button class="btn btn-sm btn-danger" onclick="deleteServiceOrder('${order.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Load parts inventory
function loadPartsInventory() {
    const container = document.getElementById('parts-inventory-list');
    const categoryFilter = document.getElementById('category-filter').value;
    const stockFilter = document.getElementById('stock-filter').value;
    const searchTerm = document.getElementById('parts-search')?.value.toLowerCase() || '';
    const searchCriteria = document.getElementById('parts-search-criteria')?.value || 'all';
    
    let partsInventory = ServicePartsData.partsInventory.getAll();
    let filteredParts = partsInventory;
    
    // Apply category filter
    if (categoryFilter) {
        filteredParts = filteredParts.filter(part => part.category === categoryFilter);
    }
    
    // Apply stock filter
    if (stockFilter) {
        filteredParts = filteredParts.filter(part => {
            switch(stockFilter) {
                case 'in-stock': return part.quantity > 10;
                case 'low-stock': return part.quantity > 0 && part.quantity <= 10;
                case 'out-of-stock': return part.quantity === 0;
                default: return true;
            }
        });
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredParts = filteredParts.filter(part => {
            switch (searchCriteria) {
                case 'name':
                    return part.name.toLowerCase().includes(searchTerm);
                case 'partNumber':
                    return part.partNumber.toLowerCase().includes(searchTerm);
                case 'category':
                    return part.category.toLowerCase().includes(searchTerm);
                case 'supplier':
                    return part.supplier.toLowerCase().includes(searchTerm);
                case 'location':
                    return part.location.toLowerCase().includes(searchTerm);
                case 'all':
                default:
                    return part.name.toLowerCase().includes(searchTerm) ||
                           part.partNumber.toLowerCase().includes(searchTerm) ||
                           part.category.toLowerCase().includes(searchTerm) ||
                           part.supplier.toLowerCase().includes(searchTerm) ||
                           part.location.toLowerCase().includes(searchTerm) ||
                           part.id.toLowerCase().includes(searchTerm);
            }
        });
    }
    
    container.innerHTML = filteredParts.map(part => `
        <div class="parts-card">
            <div class="part-header">
                <div class="part-info">
                    <h4>${part.name}</h4>
                    <p class="part-number">Part #: ${part.partNumber}</p>
                    <p class="category">${formatCategory(part.category)}</p>
                </div>
                <div class="stock-status">
                    <span class="stock-badge ${getStockStatus(part.quantity)}">${part.quantity} in stock</span>
                </div>
            </div>
            <div class="part-details">
                <div class="pricing">
                    <p><strong>Cost:</strong> $${part.cost.toFixed(2)}</p>
                    <p><strong>Price:</strong> $${part.price.toFixed(2)}</p>
                    <p><strong>Margin:</strong> ${(((part.price - part.cost) / part.cost) * 100).toFixed(1)}%</p>
                </div>
                <div class="location">
                    <p><strong>Location:</strong> ${part.location}</p>
                    <p><strong>Supplier:</strong> ${part.supplier}</p>
                </div>
            </div>
            <div class="part-actions">
                <button class="btn btn-sm btn-primary" onclick="editPart('${part.id}')">Edit</button>
                <button class="btn btn-sm btn-secondary" onclick="adjustStock('${part.id}')">Adjust Stock</button>
                <button class="btn btn-sm btn-danger" onclick="deletePart('${part.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Load service history
function loadServiceHistory() {
    const container = document.getElementById('service-history-list');
    const searchTerm = document.getElementById('history-search').value.toLowerCase();
    
    let serviceHistory = ServicePartsData.serviceHistory.getAll();
    let filteredHistory = serviceHistory;
    if (searchTerm) {
        filteredHistory = serviceHistory.filter(record => 
            record.customer.toLowerCase().includes(searchTerm) ||
            record.vin.toLowerCase().includes(searchTerm)
        );
    }
    
    container.innerHTML = filteredHistory.map(record => `
        <div class="history-card">
            <div class="history-header">
                <div class="history-info">
                    <h4>${record.customer}</h4>
                    <p class="vin">VIN: ${record.vin}</p>
                    <p class="service-type">${formatServiceType(record.serviceType)}</p>
                </div>
                <div class="completion-info">
                    <p class="completed-date">Completed: ${formatDate(record.completedDate)}</p>
                    <p class="total-cost">Total: $${record.totalCost.toFixed(2)}</p>
                </div>
            </div>
            <div class="history-details">
                <p><strong>Description:</strong> ${record.description}</p>
                <p><strong>Technician:</strong> ${record.technician}</p>
            </div>
        </div>
    `).join('');
}

// Modal functions
function openServiceModal() {
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.add('active');
        loadCustomersForSelect();
    }
}

function closeServiceModal() {
    const modal = document.getElementById('service-modal');
    const form = document.getElementById('service-form');
    
    modal.classList.remove('active');
    form.reset();
    
    // Reset form title and button text
    document.querySelector('#service-modal .modal-title').textContent = 'New Service Order';
    document.querySelector('button[form="service-form"]').textContent = 'Create Service Order';
    
    // Remove edit ID
    delete form.dataset.editId;
}

function openPartsModal() {
    const modal = document.getElementById('parts-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closePartsModal() {
    const modal = document.getElementById('parts-modal');
    const form = document.getElementById('parts-form');
    
    modal.classList.remove('active');
    form.reset();
    
    // Reset form title and button text
    document.querySelector('#parts-modal .modal-title').textContent = 'Add Parts to Inventory';
    document.querySelector('button[form="parts-form"]').textContent = 'Add Part';
    
    // Remove edit ID
    delete form.dataset.editId;
}

// Load customers for service order form
function loadCustomersForSelect() {
    const select = document.getElementById('customer-select');
    // This would typically load from the customers data
    const customers = ['John Smith', 'Sarah Davis', 'Michael Brown', 'Emily Johnson', 'David Wilson'];
    
    select.innerHTML = '<option value="">Select Customer</option>' + 
        customers.map(customer => `<option value="${customer}">${customer}</option>`).join('');
}

// Form submission handlers
function initFormHandlers() {
    const serviceForm = document.getElementById('service-form');
    const partsForm = document.getElementById('parts-form');
    
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const editId = this.dataset.editId;
            const orderData = {
                customer: document.getElementById('customer-select').value,
                vin: document.getElementById('vehicle-vin').value,
                serviceType: document.getElementById('service-type').value,
                description: document.getElementById('service-description').value,
                estimatedCost: parseFloat(document.getElementById('estimated-cost').value) || 0,
                scheduledDate: document.getElementById('scheduled-date').value,
                technician: document.getElementById('technician').value
            };
            
            if (editId) {
                // Update existing order
                ServicePartsData.serviceOrders.update(editId, orderData);
                showNotification('Service order updated successfully!', 'success');
                delete this.dataset.editId;
            } else {
                // Create new order
                orderData.status = 'pending';
                orderData.createdDate = new Date().toISOString().split('T')[0];
                ServicePartsData.serviceOrders.add(orderData);
                showNotification('Service order created successfully!', 'success');
            }
            
            closeServiceModal();
            loadServiceOrders();
        });
    }
    
    if (partsForm) {
        partsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const editId = this.dataset.editId;
            const partData = {
                partNumber: document.getElementById('part-number').value,
                name: document.getElementById('part-name').value,
                category: document.getElementById('part-category').value,
                cost: parseFloat(document.getElementById('part-cost').value),
                price: parseFloat(document.getElementById('part-price').value),
                quantity: parseInt(document.getElementById('part-quantity').value),
                location: document.getElementById('part-location').value,
                supplier: document.getElementById('supplier').value
            };
            
            if (editId) {
                // Update existing part
                ServicePartsData.partsInventory.update(editId, partData);
                showNotification('Part updated successfully!', 'success');
                delete this.dataset.editId;
            } else {
                // Create new part
                ServicePartsData.partsInventory.add(partData);
                showNotification('Part added to inventory successfully!', 'success');
            }
            
            closePartsModal();
            loadPartsInventory();
        });
    }
}

// Utility functions
function formatStatus(status) {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatServiceType(type) {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatDateTime(dateTime) {
    return new Date(dateTime).toLocaleString();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function getStockStatus(quantity) {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= 10) return 'low-stock';
    return 'in-stock';
}

// Action functions
function editServiceOrder(id) {
    const order = ServicePartsData.serviceOrders.getAll().find(o => o.id === id);
    if (order) {
        // Populate form with existing data
        document.getElementById('customer-select').value = order.customer;
        document.getElementById('vehicle-vin').value = order.vin;
        document.getElementById('service-type').value = order.serviceType;
        document.getElementById('service-description').value = order.description;
        document.getElementById('estimated-cost').value = order.estimatedCost;
        document.getElementById('scheduled-date').value = order.scheduledDate;
        document.getElementById('technician').value = order.technician;
        
        // Change form title and button text
        document.querySelector('#service-modal .modal-title').textContent = 'Edit Service Order';
        document.querySelector('button[form="service-form"]').textContent = 'Update Service Order';
        
        // Store the ID for updating
        document.getElementById('service-form').dataset.editId = id;
        
        openServiceModal();
    }
}

function updateOrderStatus(id) {
    const newStatus = prompt('Enter new status (pending, in-progress, completed, waiting-parts):');
    if (newStatus && ['pending', 'in-progress', 'completed', 'waiting-parts'].includes(newStatus)) {
        ServicePartsData.serviceOrders.update(id, { status: newStatus });
        loadServiceOrders();
        showNotification('Order status updated successfully!', 'success');
    } else if (newStatus) {
        showNotification('Invalid status. Please use: pending, in-progress, completed, or waiting-parts', 'error');
    }
}

function deleteServiceOrder(id) {
    if (confirm('Are you sure you want to delete this service order?')) {
        ServicePartsData.serviceOrders.remove(id);
        loadServiceOrders();
        showNotification('Service order deleted successfully!', 'success');
    }
}

function editPart(id) {
    const part = ServicePartsData.partsInventory.getAll().find(p => p.id === id);
    if (part) {
        // Populate form with existing data
        document.getElementById('part-number').value = part.partNumber;
        document.getElementById('part-name').value = part.name;
        document.getElementById('part-category').value = part.category;
        document.getElementById('part-cost').value = part.cost;
        document.getElementById('part-price').value = part.price;
        document.getElementById('part-quantity').value = part.quantity;
        document.getElementById('part-location').value = part.location;
        document.getElementById('supplier').value = part.supplier;
        
        // Change form title and button text
        document.querySelector('#parts-modal .modal-title').textContent = 'Edit Part';
        document.querySelector('button[form="parts-form"]').textContent = 'Update Part';
        
        // Store the ID for updating
        document.getElementById('parts-form').dataset.editId = id;
        
        openPartsModal();
    }
}

function adjustStock(id) {
    const part = ServicePartsData.partsInventory.getAll().find(p => p.id === id);
    if (part) {
        const newQuantity = prompt(`Current stock: ${part.quantity}\nEnter new quantity:`, part.quantity);
        if (newQuantity !== null && !isNaN(newQuantity) && parseInt(newQuantity) >= 0) {
            ServicePartsData.partsInventory.update(id, { quantity: parseInt(newQuantity) });
            loadPartsInventory();
            showNotification('Stock quantity updated successfully!', 'success');
        } else if (newQuantity !== null) {
            showNotification('Please enter a valid quantity (0 or greater)', 'error');
        }
    }
}

function deletePart(id) {
    if (confirm('Are you sure you want to delete this part?')) {
        ServicePartsData.partsInventory.remove(id);
        loadPartsInventory();
        showNotification('Part deleted successfully!', 'success');
    }
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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    ServicePartsData.init();
    
    // Initialize form handlers
    initFormHandlers();
    
    // Initialize modal click-outside-to-close functionality
    initModalHandlers();
    
    // Initialize event listeners for filters and search
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');
    const stockFilter = document.getElementById('stock-filter');
    const historySearch = document.getElementById('history-search');
    
    // Service Orders search elements
    const serviceOrdersSearch = document.getElementById('service-orders-search');
    const serviceSearchCriteria = document.getElementById('service-search-criteria');
    
    // Parts search elements
    const partsSearch = document.getElementById('parts-search');
    const partsSearchCriteria = document.getElementById('parts-search-criteria');
    
    // Add event listeners for existing filters
    if (statusFilter) statusFilter.addEventListener('change', loadServiceOrders);
    if (categoryFilter) categoryFilter.addEventListener('change', loadPartsInventory);
    if (stockFilter) stockFilter.addEventListener('change', loadPartsInventory);
    if (historySearch) historySearch.addEventListener('input', loadServiceHistory);
    
    // Add event listeners for service orders search
    if (serviceOrdersSearch) {
        serviceOrdersSearch.addEventListener('input', loadServiceOrders);
    }
    if (serviceSearchCriteria) {
        serviceSearchCriteria.addEventListener('change', function() {
            // Update placeholder text based on selected criteria
            const searchInput = document.getElementById('service-orders-search');
            const selectedCriteria = this.value;
            
            switch (selectedCriteria) {
                case 'customer':
                    searchInput.placeholder = 'Search by customer...';
                    break;
                case 'vin':
                    searchInput.placeholder = 'Search by VIN...';
                    break;
                case 'serviceType':
                    searchInput.placeholder = 'Search by service type...';
                    break;
                case 'technician':
                    searchInput.placeholder = 'Search by technician...';
                    break;
                case 'description':
                    searchInput.placeholder = 'Search by description...';
                    break;
                case 'all':
                default:
                    searchInput.placeholder = 'Search service orders...';
                    break;
            }
            
            // Re-run filter if there's already a search term
            if (searchInput.value.trim()) {
                loadServiceOrders();
            }
        });
    }
    
    // Add event listeners for parts search
    if (partsSearch) {
        partsSearch.addEventListener('input', loadPartsInventory);
    }
    if (partsSearchCriteria) {
        partsSearchCriteria.addEventListener('change', function() {
            // Update placeholder text based on selected criteria
            const searchInput = document.getElementById('parts-search');
            const selectedCriteria = this.value;
            
            switch (selectedCriteria) {
                case 'name':
                    searchInput.placeholder = 'Search by part name...';
                    break;
                case 'partNumber':
                    searchInput.placeholder = 'Search by part number...';
                    break;
                case 'category':
                    searchInput.placeholder = 'Search by category...';
                    break;
                case 'supplier':
                    searchInput.placeholder = 'Search by supplier...';
                    break;
                case 'location':
                    searchInput.placeholder = 'Search by location...';
                    break;
                case 'all':
                default:
                    searchInput.placeholder = 'Search parts...';
                    break;
            }
            
            // Re-run filter if there's already a search term
            if (searchInput.value.trim()) {
                loadPartsInventory();
            }
        });
    }
    
    // Load initial data
    loadServiceOrders();
    
    // Add notification styles if not present
    addNotificationStyles();
});

// Initialize modal handlers for click-outside-to-close
function initModalHandlers() {
    const serviceModal = document.getElementById('service-modal');
    const partsModal = document.getElementById('parts-modal');
    
    if (serviceModal) {
        serviceModal.addEventListener('click', function(e) {
            if (e.target === serviceModal) {
                closeServiceModal();
            }
        });
    }
    
    if (partsModal) {
        partsModal.addEventListener('click', function(e) {
            if (e.target === partsModal) {
                closePartsModal();
            }
        });
    }
}

// Add notification styles
function addNotificationStyles() {
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
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