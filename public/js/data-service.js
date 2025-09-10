// Data Service for AutoCRM
// Handles localStorage operations for data persistence

const DataService = {
    
    // User Methods (keeping localStorage for session management)
    user: {
        get: function() {
            return JSON.parse(localStorage.getItem('autocrm_user')) || null;
        },
        save: function(userData) {
            localStorage.setItem('autocrm_user', JSON.stringify(userData));
        },
        clear: function() {
            localStorage.removeItem('autocrm_user');
        },
        isLoggedIn: function() {
            const user = this.get();
            return user && user.isLoggedIn;
        }
    },
    
    // Dashboard Methods
    dashboard: {
        getStats: function() {
            const customers = DataService.customers.getAll();
            const inventory = DataService.inventory.getAll();
            const leads = DataService.leads.getAll();
            const deals = DataService.deals.getAll();
            
            // Calculate stats from localStorage data
            const totalCustomers = customers.length;
            const totalVehicles = inventory.length;
            const totalLeads = leads.length;
            const totalDeals = deals.length;
            
            // Calculate revenue from deals
            const totalRevenue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
            
            // Calculate conversion rate
            const conversionRate = totalLeads > 0 ? (totalDeals / totalLeads * 100).toFixed(1) : 0;
            
            return {
                totalCustomers,
                totalVehicles,
                totalLeads,
                totalDeals,
                totalRevenue,
                conversionRate
            };
        }
    },
    
    // Inventory Methods
    inventory: {
        getAll: function(filters = {}) {
            let vehicles = JSON.parse(localStorage.getItem('autocrm_inventory')) || [];
            
            // Apply filters if provided
            if (Object.keys(filters).length > 0) {
                vehicles = vehicles.filter(vehicle => {
                    for (const [key, value] of Object.entries(filters)) {
                        if (value && vehicle[key] && vehicle[key].toString().toLowerCase() !== value.toLowerCase()) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            
            return vehicles;
        },
        
        get: function(id) {
            const vehicles = this.getAll();
            return vehicles.find(vehicle => vehicle.id === id) || null;
        },
        
        add: function(vehicle) {
            const vehicles = this.getAll();
            if (!vehicle.id) {
                vehicle.id = Date.now().toString();
            }
            vehicle.dateAdded = new Date().toISOString();
            vehicles.push(vehicle);
            this.save(vehicles);
            return vehicle;
        },
        
        update: function(id, updatedVehicle) {
            const vehicles = this.getAll();
            const index = vehicles.findIndex(vehicle => vehicle.id === id);
            if (index !== -1) {
                vehicles[index] = { ...vehicles[index], ...updatedVehicle, updatedAt: new Date().toISOString() };
                this.save(vehicles);
                return vehicles[index];
            }
            return null;
        },
        
        delete: function(id) {
            const vehicles = this.getAll();
            const filteredVehicles = vehicles.filter(vehicle => vehicle.id !== id);
            this.save(filteredVehicles);
            return filteredVehicles.length < vehicles.length;
        },
        
        save: function(inventoryData) {
            localStorage.setItem('autocrm_inventory', JSON.stringify(inventoryData));
        },
        
        getMakes: function() {
            const vehicles = this.getAll();
            const makes = [...new Set(vehicles.map(vehicle => vehicle.make))].filter(Boolean);
            return makes.sort();
        },
        
        // Initialize with sample data if empty
        init: function() {
            if (this.getAll().length === 0) {
                const sampleVehicles = [
                    {
                        id: '1',
                        make: 'Toyota',
                        model: 'Camry',
                        year: 2023,
                        price: 28500,
                        mileage: 15000,
                        color: 'Silver',
                        vin: '1HGBH41JXMN109186',
                        status: 'Available',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '2',
                        make: 'Honda',
                        model: 'Civic',
                        year: 2022,
                        price: 24000,
                        mileage: 22000,
                        color: 'Blue',
                        vin: '2HGFC2F59NH123456',
                        status: 'Available',
                        dateAdded: new Date().toISOString()
                    }
                ];
                this.save(sampleVehicles);
            }
        }
    },
    
    // Customers Methods
    customers: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('autocrm_customers')) || [];
        },
        
        get: function(id) {
            const customers = this.getAll();
            return customers.find(customer => customer.id === id) || null;
        },
        
        add: function(customer) {
            const customers = this.getAll();
            if (!customer.id) {
                customer.id = Date.now().toString();
            }
            customer.dateAdded = new Date().toISOString();
            customers.push(customer);
            this.save(customers);
            return customer;
        },
        
        update: function(id, updatedCustomer) {
            const customers = this.getAll();
            const index = customers.findIndex(customer => customer.id === id);
            if (index !== -1) {
                customers[index] = { ...customers[index], ...updatedCustomer, updatedAt: new Date().toISOString() };
                this.save(customers);
                return customers[index];
            }
            return null;
        },
        
        delete: function(id) {
            const customers = this.getAll();
            const filteredCustomers = customers.filter(customer => customer.id !== id);
            this.save(filteredCustomers);
            return filteredCustomers.length < customers.length;
        },
        
        save: function(customersData) {
            localStorage.setItem('autocrm_customers', JSON.stringify(customersData));
        },
        
        // Initialize with sample data if empty
        init: function() {
            if (this.getAll().length === 0) {
                const sampleCustomers = [
                    {
                        id: '1',
                        firstName: 'John',
                        lastName: 'Smith',
                        email: 'john.smith@email.com',
                        phone: '(555) 123-4567',
                        address: {
                            street: '123 Main St',
                            city: 'Anytown',
                            state: 'CA',
                            zip: '12345'
                        },
                        dateAdded: new Date().toISOString(),
                        notes: 'Interested in SUVs',
                        purchaseHistory: []
                    },
                    {
                        id: '2',
                        firstName: 'Sarah',
                        lastName: 'Johnson',
                        email: 'sarah.johnson@email.com',
                        phone: '(555) 987-6543',
                        address: {
                            street: '456 Oak Ave',
                            city: 'Springfield',
                            state: 'TX',
                            zip: '67890'
                        },
                        dateAdded: new Date().toISOString(),
                        notes: 'Looking for fuel-efficient car',
                        purchaseHistory: []
                    }
                ];
                this.save(sampleCustomers);
            }
        }
    },
    
    // Sales Methods
    sales: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('autocrm_sales')) || [];
        },
        
        get: function(id) {
            const sales = this.getAll();
            return sales.find(sale => sale.id === id) || null;
        },
        
        add: function(sale) {
            const sales = this.getAll();
            if (!sale.id) {
                sale.id = Date.now().toString();
            }
            sale.dateAdded = new Date().toISOString();
            sales.push(sale);
            this.save(sales);
            return sale;
        },
        
        update: function(id, updatedSale) {
            const sales = this.getAll();
            const index = sales.findIndex(sale => sale.id === id);
            if (index !== -1) {
                sales[index] = { ...sales[index], ...updatedSale, updatedAt: new Date().toISOString() };
                this.save(sales);
                return sales[index];
            }
            return null;
        },
        
        delete: function(id) {
            const sales = this.getAll();
            const filteredSales = sales.filter(sale => sale.id !== id);
            this.save(filteredSales);
            return filteredSales.length < sales.length;
        },
        
        save: function(salesData) {
            localStorage.setItem('autocrm_sales', JSON.stringify(salesData));
        },
        
        // Initialize with sample data if empty
        init: function() {
            if (this.getAll().length === 0) {
                const sampleSales = [
                    {
                        id: '1',
                        customerId: '1',
                        vehicleId: '1',
                        amount: 28500,
                        date: new Date().toISOString(),
                        status: 'Completed',
                        salesperson: 'Mike Johnson',
                        dateAdded: new Date().toISOString()
                    }
                ];
                this.save(sampleSales);
            }
        }
    },
    
    // Leads Methods
    leads: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('autocrm_leads')) || [];
        },
        
        get: function(id) {
            const leads = this.getAll();
            return leads.find(lead => lead.id === id) || null;
        },
        
        add: function(lead) {
            const leads = this.getAll();
            if (!lead.id) {
                lead.id = Date.now().toString();
            }
            lead.dateAdded = new Date().toISOString();
            leads.push(lead);
            this.save(leads);
            return lead;
        },
        
        update: function(id, updatedLead) {
            const leads = this.getAll();
            const index = leads.findIndex(lead => lead.id === id);
            if (index !== -1) {
                leads[index] = { ...leads[index], ...updatedLead, updatedAt: new Date().toISOString() };
                this.save(leads);
                return leads[index];
            }
            return null;
        },
        
        delete: function(id) {
            const leads = this.getAll();
            const filteredLeads = leads.filter(lead => lead.id !== id);
            this.save(filteredLeads);
            return filteredLeads.length < leads.length;
        },
        
        save: function(leadsData) {
            localStorage.setItem('autocrm_leads', JSON.stringify(leadsData));
        },
        
        // Initialize with sample data if empty
        init: function() {
            if (this.getAll().length === 0) {
                const sampleLeads = [
                    {
                        id: '1',
                        firstName: 'Michael',
                        lastName: 'Brown',
                        email: 'michael.brown@email.com',
                        phone: '(555) 456-7890',
                        source: 'Website',
                        status: 'New',
                        interest: 'SUV',
                        notes: 'Interested in family-friendly vehicles',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 1'
                    },
                    {
                        id: '2',
                        firstName: 'Lisa',
                        lastName: 'Davis',
                        email: 'lisa.davis@email.com',
                        phone: '(555) 321-0987',
                        source: 'Referral',
                        status: 'Contacted',
                        interest: 'Sedan',
                        notes: 'Looking for fuel-efficient car under $25k',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 2'
                    }
                ];
                this.save(sampleLeads);
            }
        }
    },
    
    // Deals Methods
    deals: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('autocrm_deals')) || [];
        },
        
        get: function(id) {
            const deals = this.getAll();
            return deals.find(deal => deal.id === id) || null;
        },
        
        add: function(deal) {
            const deals = this.getAll();
            if (!deal.id) {
                deal.id = Date.now().toString();
            }
            deal.dateAdded = new Date().toISOString();
            deals.push(deal);
            this.save(deals);
            return deal;
        },
        
        update: function(id, updatedDeal) {
            const deals = this.getAll();
            const index = deals.findIndex(deal => deal.id === id);
            if (index !== -1) {
                deals[index] = { ...deals[index], ...updatedDeal, updatedAt: new Date().toISOString() };
                this.save(deals);
                return deals[index];
            }
            return null;
        },
        
        delete: function(id) {
            const deals = this.getAll();
            const filteredDeals = deals.filter(deal => deal.id !== id);
            this.save(filteredDeals);
            return filteredDeals.length < deals.length;
        },
        
        save: function(dealsData) {
            localStorage.setItem('autocrm_deals', JSON.stringify(dealsData));
        },
        
        // Initialize with sample data if empty
        init: function() {
            if (this.getAll().length === 0) {
                const sampleDeals = [
                    {
                        id: '1',
                        customerId: '1',
                        vehicleId: '1',
                        amount: 28500,
                        status: 'In Progress',
                        stage: 'Negotiation',
                        salesperson: 'Mike Johnson',
                        notes: 'Customer interested in extended warranty',
                        dateAdded: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '2',
                        customerId: '2',
                        vehicleId: '2',
                        amount: 24000,
                        status: 'Qualified',
                        stage: 'Proposal',
                        salesperson: 'Sarah Wilson',
                        notes: 'Financing pre-approved',
                        dateAdded: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ];
                this.save(sampleDeals);
            }
        }
    },
    
    // Tasks Methods (keeping localStorage for now)
    tasks: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('autocrm_tasks')) || [];
        },
        
        get: function(id) {
            const tasks = this.getAll();
            return tasks.find(task => task.id === id) || null;
        },
        
        save: function(tasksData) {
            localStorage.setItem('autocrm_tasks', JSON.stringify(tasksData));
        },
        
        add: function(task) {
            const tasks = this.getAll();
            if (!task.id) {
                task.id = Date.now().toString();
            }
            task.createdAt = new Date().toISOString();
            tasks.push(task);
            this.save(tasks);
            return task;
        },
        
        update: function(id, updatedTask) {
            const tasks = this.getAll();
            const index = tasks.findIndex(task => task.id === id);
            if (index !== -1) {
                tasks[index] = { ...tasks[index], ...updatedTask, updatedAt: new Date().toISOString() };
                this.save(tasks);
                return tasks[index];
            }
            return null;
        },
        
        delete: function(id) {
            const tasks = this.getAll();
            const filteredTasks = tasks.filter(task => task.id !== id);
            this.save(filteredTasks);
            return filteredTasks.length < tasks.length;
        },
        
        // Initialize with sample data if empty
        init: function() {
            if (this.getAll().length === 0) {
                const sampleTasks = [
                    {
                        id: '1',
                        title: 'Follow up with Michael Brown',
                        description: 'Call to discuss SUV options',
                        priority: 'High',
                        status: 'New',
                        assignedTo: 'Sales Rep 1',
                        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Follow-up',
                        relatedTo: 'Lead',
                        relatedId: '1',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Thomas Morales'
                    },
                    {
                        id: '2',
                        title: 'Prepare financing options for Lisa Davis',
                        description: 'Research best financing options under $25k',
                        priority: 'Medium',
                        status: 'In Progress',
                        assignedTo: 'Sales Rep 2',
                        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Paperwork',
                        relatedTo: 'Lead',
                        relatedId: '2',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Thomas Morales'
                    }
                ];
                this.save(sampleTasks);
            }
        }
    },
    
    // Settings Methods (keeping localStorage for now)
    settings: {
        get: function() {
            return JSON.parse(localStorage.getItem('autocrm_settings')) || {
                theme: 'light',
                notifications: true,
                autoSave: true,
                currency: 'USD',
                dateFormat: 'MM/DD/YYYY'
            };
        },
        
        save: function(settings) {
            localStorage.setItem('autocrm_settings', JSON.stringify(settings));
        },
        
        update: function(key, value) {
            const settings = this.get();
            settings[key] = value;
            this.save(settings);
            return settings;
        }
    },
    
    // Utility Methods
    utils: {
        // Initialize all data stores with sample data if empty
        initializeAllData: function() {
            DataService.inventory.init();
            DataService.customers.init();
            DataService.leads.init();
            DataService.deals.init();
            DataService.sales.init();
            DataService.tasks.init();
        },
        
        // Clear all data (for testing purposes)
        clearAllData: function() {
            localStorage.removeItem('autocrm_inventory');
            localStorage.removeItem('autocrm_customers');
            localStorage.removeItem('autocrm_leads');
            localStorage.removeItem('autocrm_deals');
            localStorage.removeItem('autocrm_sales');
            localStorage.removeItem('autocrm_tasks');
            localStorage.removeItem('autocrm_settings');
        },
        
        // Export all data
        exportAllData: function() {
            return {
                inventory: DataService.inventory.getAll(),
                customers: DataService.customers.getAll(),
                leads: DataService.leads.getAll(),
                deals: DataService.deals.getAll(),
                sales: DataService.sales.getAll(),
                tasks: DataService.tasks.getAll(),
                settings: DataService.settings.get(),
                exportDate: new Date().toISOString()
            };
        },
        
        // Import all data
        importAllData: function(data) {
            if (data.inventory) DataService.inventory.save(data.inventory);
            if (data.customers) DataService.customers.save(data.customers);
            if (data.leads) DataService.leads.save(data.leads);
            if (data.deals) DataService.deals.save(data.deals);
            if (data.sales) DataService.sales.save(data.sales);
            if (data.tasks) DataService.tasks.save(data.tasks);
            if (data.settings) DataService.settings.save(data.settings);
        }
    }
};

// Add a convenience method for initializing all data
DataService.initAll = function() {
    this.utils.initializeAllData();
};

// Make DataService globally available
window.DataService = DataService;