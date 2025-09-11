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
        
        // Force reinitialize with updated sample data
        forceInit: function() {
            const sampleDeals = [
                {
                    id: '1',
                    customerId: '1',
                    vehicleId: '1',
                    customer: {
                        id: '1',
                        name: 'John Smith',
                        email: 'john.smith@email.com',
                        phone: '(555) 123-4567',
                        creditScore: 720
                    },
                    vehicle: {
                        id: '1',
                        make: 'Toyota',
                        model: 'Camry',
                        year: 2023,
                        price: 28500,
                        stockNumber: 'TC2023001',
                        invoice: 26000
                    },
                    amount: 28500,
                    value: 28500,
                    status: 'Pending',
                    dealType: 'Purchase',
                    salesperson: 'Mike Johnson',
                    notes: 'Customer interested in extended warranty',
                    dateCreated: new Date().toISOString(),
                    dateAdded: new Date().toISOString(),
                    expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    customerId: '2',
                    vehicleId: '2',
                    customer: {
                        id: '2',
                        name: 'Sarah Johnson',
                        email: 'sarah.johnson@email.com',
                        phone: '(555) 987-6543',
                        creditScore: 680
                    },
                    vehicle: {
                        id: '2',
                        make: 'Honda',
                        model: 'Civic',
                        year: 2022,
                        price: 24000,
                        stockNumber: 'HC2022001',
                        invoice: 22500
                    },
                    amount: 24000,
                    value: 24000,
                    status: 'Negotiation',
                    dealType: 'Purchase',
                    salesperson: 'Sarah Wilson',
                    notes: 'Financing pre-approved',
                    dateCreated: new Date().toISOString(),
                    dateAdded: new Date().toISOString(),
                    expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    customerId: '1',
                    vehicleId: '1',
                    customer: {
                        id: '1',
                        name: 'Michael Brown',
                        email: 'michael.brown@email.com',
                        phone: '(555) 456-7890',
                        creditScore: 750
                    },
                    vehicle: {
                        id: '3',
                        make: 'Ford',
                        model: 'F-150',
                        year: 2023,
                        price: 35000,
                        stockNumber: 'FF2023001',
                        invoice: 32000
                    },
                    amount: 35000,
                    value: 35000,
                    status: 'Approved',
                    dealType: 'Purchase',
                    salesperson: 'Thomas Morales',
                    notes: 'Trade-in vehicle included',
                    dateCreated: new Date().toISOString(),
                    dateAdded: new Date().toISOString(),
                    expectedCloseDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    tradeIn: {
                        make: 'Toyota',
                        model: 'Corolla',
                        year: 2018,
                        value: 12000
                    }
                }
            ];
            this.save(sampleDeals);
        },

        // Initialize with sample data if empty
        init: function() {
            if (this.getAll().length === 0) {
                const sampleDeals = [
                    {
                        id: '1',
                        customerId: '1',
                        vehicleId: '1',
                        customer: {
                            id: '1',
                            name: 'John Smith',
                            email: 'john.smith@email.com',
                            phone: '(555) 123-4567',
                            creditScore: 720
                        },
                        vehicle: {
                            id: '1',
                            make: 'Toyota',
                            model: 'Camry',
                            year: 2023,
                            price: 28500,
                            stockNumber: 'TC2023001',
                            invoice: 26000
                        },
                        amount: 28500,
                        value: 28500,
                        status: 'Pending',
                        dealType: 'Purchase',
                        salesperson: 'Mike Johnson',
                        notes: 'Customer interested in extended warranty',
                        dateCreated: new Date().toISOString(),
                        dateAdded: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '2',
                        customerId: '2',
                        vehicleId: '2',
                        customer: {
                            id: '2',
                            name: 'Sarah Johnson',
                            email: 'sarah.johnson@email.com',
                            phone: '(555) 987-6543',
                            creditScore: 680
                        },
                        vehicle: {
                            id: '2',
                            make: 'Honda',
                            model: 'Civic',
                            year: 2022,
                            price: 24000,
                            stockNumber: 'HC2022001',
                            invoice: 22500
                        },
                        amount: 24000,
                        value: 24000,
                        status: 'Negotiation',
                        dealType: 'Purchase',
                        salesperson: 'Sarah Wilson',
                        notes: 'Financing pre-approved',
                        dateCreated: new Date().toISOString(),
                        dateAdded: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '3',
                        customerId: '1',
                        vehicleId: '1',
                        customer: {
                            id: '1',
                            name: 'Michael Brown',
                            email: 'michael.brown@email.com',
                            phone: '(555) 456-7890',
                            creditScore: 750
                        },
                        vehicle: {
                            id: '3',
                            make: 'Ford',
                            model: 'F-150',
                            year: 2023,
                            price: 35000,
                            stockNumber: 'FF2023001',
                            invoice: 32000
                        },
                        amount: 35000,
                        value: 35000,
                        status: 'Approved',
                        dealType: 'Purchase',
                        salesperson: 'Thomas Morales',
                        notes: 'Trade-in vehicle included',
                        dateCreated: new Date().toISOString(),
                        dateAdded: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                        tradeIn: {
                            make: 'Toyota',
                            model: 'Corolla',
                            year: 2018,
                            value: 12000
                        }
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
    
    // Reports Methods
    reports: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('autocrm_reports')) || [];
        },
        
        get: function(id) {
            const reports = this.getAll();
            return reports.find(report => report.id === id) || null;
        },
        
        add: function(report) {
            const reports = this.getAll();
            if (!report.id) {
                report.id = Date.now().toString();
            }
            report.dateCreated = new Date().toISOString();
            reports.push(report);
            this.save(reports);
            return report;
        },
        
        update: function(id, updatedReport) {
            const reports = this.getAll();
            const index = reports.findIndex(report => report.id === id);
            if (index !== -1) {
                reports[index] = { ...reports[index], ...updatedReport, updatedAt: new Date().toISOString() };
                this.save(reports);
                return reports[index];
            }
            return null;
        },
        
        delete: function(id) {
            const reports = this.getAll();
            const filteredReports = reports.filter(report => report.id !== id);
            this.save(filteredReports);
            return filteredReports.length < reports.length;
        },
        
        save: function(reportsData) {
            localStorage.setItem('autocrm_reports', JSON.stringify(reportsData));
        },
        
        getByCategory: function(category) {
            const reports = this.getAll();
            return reports.filter(report => report.category === category);
        },
        
        getCategories: function() {
            const reports = this.getAll();
            const categories = [...new Set(reports.map(report => report.category))].filter(Boolean);
            return categories.sort();
        },
        
        // Generate dynamic reports based on current data
        generateSalesReport: function(dateRange = 'thisMonth') {
            const deals = DataService.deals.getAll();
            const customers = DataService.customers.getAll();
            const inventory = DataService.inventory.getAll();
            
            // Filter deals based on date range
            const now = new Date();
            let startDate;
            
            switch(dateRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'thisWeek':
                    startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                    break;
                case 'thisMonth':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'thisYear':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = new Date(0); // All time
            }
            
            const filteredDeals = deals.filter(deal => new Date(deal.dateAdded) >= startDate);
            
            const totalRevenue = filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
            const totalDeals = filteredDeals.length;
            const avgDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0;
            
            return {
                id: 'dynamic_sales_' + Date.now(),
                title: `Sales Report - ${dateRange}`,
                category: 'Sales',
                type: 'dynamic',
                dateRange: dateRange,
                data: {
                    totalRevenue,
                    totalDeals,
                    avgDealSize,
                    deals: filteredDeals
                },
                generatedAt: new Date().toISOString()
            };
        },
        
        generateInventoryReport: function() {
            const inventory = DataService.inventory.getAll();
            
            const totalVehicles = inventory.length;
            const availableVehicles = inventory.filter(v => v.status === 'Available').length;
            const soldVehicles = inventory.filter(v => v.status === 'Sold').length;
            const avgPrice = inventory.length > 0 ? inventory.reduce((sum, v) => sum + (v.price || 0), 0) / inventory.length : 0;
            
            const makeBreakdown = inventory.reduce((acc, vehicle) => {
                acc[vehicle.make] = (acc[vehicle.make] || 0) + 1;
                return acc;
            }, {});
            
            return {
                id: 'dynamic_inventory_' + Date.now(),
                title: 'Current Inventory Report',
                category: 'Inventory',
                type: 'dynamic',
                data: {
                    totalVehicles,
                    availableVehicles,
                    soldVehicles,
                    avgPrice,
                    makeBreakdown,
                    vehicles: inventory
                },
                generatedAt: new Date().toISOString()
            };
        },
        
        // Initialize with sample reports if empty
        init: function() {
            if (this.getAll().length === 0) {
                const sampleReports = [
                    {
                        id: '1',
                        title: 'Monthly Sales Performance',
                        description: 'Comprehensive analysis of sales performance for the current month including revenue, units sold, and conversion rates.',
                        category: 'Sales',
                        type: 'scheduled',
                        frequency: 'Monthly',
                        lastGenerated: new Date().toISOString(),
                        nextScheduled: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'Active',
                        createdBy: 'Thomas Morales',
                        dateCreated: new Date().toISOString(),
                        parameters: {
                            includeCharts: true,
                            includeComparisons: true,
                            emailRecipients: ['manager@autoconnect.com']
                        }
                    },
                    {
                        id: '2',
                        title: 'Inventory Aging Report',
                        description: 'Analysis of vehicle inventory showing aging patterns, slow-moving stock, and recommendations for pricing adjustments.',
                        category: 'Inventory',
                        type: 'scheduled',
                        frequency: 'Weekly',
                        lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        nextScheduled: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'Active',
                        createdBy: 'Sarah Johnson',
                        dateCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        parameters: {
                            agingThreshold: 60,
                            includePhotos: false,
                            sortBy: 'daysOnLot'
                        }
                    },
                    {
                        id: '3',
                        title: 'Lead Conversion Analysis',
                        description: 'Detailed breakdown of lead sources, conversion rates, and sales funnel performance with actionable insights.',
                        category: 'Marketing',
                        type: 'on-demand',
                        frequency: 'As Needed',
                        lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        nextScheduled: null,
                        status: 'Active',
                        createdBy: 'Mike Rodriguez',
                        dateCreated: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                        parameters: {
                            timeframe: '90days',
                            includeSourceBreakdown: true,
                            includeROI: true
                        }
                    },
                    {
                        id: '4',
                        title: 'Customer Satisfaction Survey Results',
                        description: 'Compilation and analysis of customer feedback, satisfaction scores, and improvement recommendations.',
                        category: 'Customer Service',
                        type: 'scheduled',
                        frequency: 'Quarterly',
                        lastGenerated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                        nextScheduled: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'Active',
                        createdBy: 'Lisa Chen',
                        dateCreated: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                        parameters: {
                            includeComments: true,
                            minimumResponses: 10,
                            includeNPS: true
                        }
                    },
                    {
                        id: '5',
                        title: 'Financial Performance Dashboard',
                        description: 'Executive summary of key financial metrics including revenue, profit margins, expenses, and cash flow analysis.',
                        category: 'Financial',
                        type: 'scheduled',
                        frequency: 'Monthly',
                        lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        nextScheduled: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'Active',
                        createdBy: 'Thomas Morales',
                        dateCreated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                        parameters: {
                            includeProjections: true,
                            compareToLastYear: true,
                            includeExpenseBreakdown: true
                        }
                    },
                    {
                        id: '6',
                        title: 'Service Department Performance',
                        description: 'Analysis of service department metrics including job completion times, customer wait times, and revenue per service.',
                        category: 'Service',
                        type: 'scheduled',
                        frequency: 'Weekly',
                        lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        nextScheduled: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'Active',
                        createdBy: 'David Wilson',
                        dateCreated: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                        parameters: {
                            includeEfficiencyMetrics: true,
                            includeCustomerFeedback: true,
                            includePartsCost: true
                        }
                    },
                    {
                        id: '7',
                        title: 'Sales Team Performance Review',
                        description: 'Individual and team performance metrics for sales staff including deals closed, revenue generated, and customer satisfaction.',
                        category: 'HR',
                        type: 'scheduled',
                        frequency: 'Monthly',
                        lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        nextScheduled: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'Active',
                        createdBy: 'Jennifer Adams',
                        dateCreated: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
                        parameters: {
                            includeIndividualMetrics: true,
                            includeTeamComparisons: true,
                            includeGoalTracking: true
                        }
                    },
                    {
                        id: '8',
                        title: 'Market Trends and Competitive Analysis',
                        description: 'Analysis of local market conditions, competitor pricing, and industry trends affecting dealership performance.',
                        category: 'Market Research',
                        type: 'on-demand',
                        frequency: 'As Needed',
                        lastGenerated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        nextScheduled: null,
                        status: 'Active',
                        createdBy: 'Robert Kim',
                        dateCreated: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
                        parameters: {
                            includeCompetitorPricing: true,
                            includeMarketShare: true,
                            includeIndustryTrends: true
                        }
                    }
                ];
                this.save(sampleReports);
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
            DataService.reports.init();
        },
        
        // Clear all data (for testing purposes)
        clearAllData: function() {
            localStorage.removeItem('autocrm_inventory');
            localStorage.removeItem('autocrm_customers');
            localStorage.removeItem('autocrm_leads');
            localStorage.removeItem('autocrm_deals');
            localStorage.removeItem('autocrm_sales');
            localStorage.removeItem('autocrm_tasks');
            localStorage.removeItem('autocrm_reports');
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
                reports: DataService.reports.getAll(),
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
            if (data.reports) DataService.reports.save(data.reports);
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