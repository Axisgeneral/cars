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
            // Ensure images array is always present and parsed
            vehicles = vehicles.map(vehicle => {
                if (!Array.isArray(vehicle.images)) {
                    vehicle.images = [];
                }
                return vehicle;
            });
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
            // Ensure images array is present and is an array
            if (!Array.isArray(vehicle.images)) {
                vehicle.images = [];
            }
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
                        stockNumber: 'T12345',
                        make: 'Toyota',
                        model: 'Camry',
                        year: 2023,
                        trim: 'XSE',
                        type: 'New',
                        price: 28500,
                        mileage: 15000,
                        color: 'Silver',
                        vin: '1HGBH41JXMN109186',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '2',
                        stockNumber: 'H54321',
                        make: 'Honda',
                        model: 'Civic',
                        year: 2022,
                        trim: 'Touring',
                        type: 'Used',
                        price: 24000,
                        mileage: 22000,
                        color: 'Blue',
                        vin: '2HGFC2F59NH123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '3',
                        // No stockNumber property - this will test the fix
                        make: 'Ford',
                        model: 'Focus',
                        year: 2021,
                        trim: 'SE',
                        type: 'Used',
                        price: 19500,
                        mileage: 35000,
                        color: 'Red',
                        vin: '1FADP3F20FL123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString(),
                        features: ['Bluetooth', 'Backup Camera'],
                        description: 'Great fuel economy, perfect for commuting'
                    },
                    // Additional 25 vehicles
                    {
                        id: '4',
                        stockNumber: 'N67890',
                        make: 'Nissan',
                        model: 'Altima',
                        year: 2023,
                        trim: 'SV',
                        type: 'New',
                        price: 26800,
                        mileage: 8,
                        color: 'White',
                        vin: '1N4AL3AP5NC123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '5',
                        stockNumber: 'C98765',
                        make: 'Chevrolet',
                        model: 'Malibu',
                        year: 2022,
                        trim: 'LT',
                        type: 'Used',
                        price: 23500,
                        mileage: 18500,
                        color: 'Black',
                        vin: '1G1ZD5ST5NF123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '6',
                        stockNumber: 'H11223',
                        make: 'Hyundai',
                        model: 'Elantra',
                        year: 2023,
                        trim: 'SEL',
                        type: 'New',
                        price: 22900,
                        mileage: 12,
                        color: 'Gray',
                        vin: 'KMHL14JA5PA123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '7',
                        stockNumber: 'M44556',
                        make: 'Mazda',
                        model: 'CX-5',
                        year: 2022,
                        trim: 'Touring',
                        type: 'Used',
                        price: 29800,
                        mileage: 24000,
                        color: 'Red',
                        vin: 'JM3KFBCM5N0123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '8',
                        stockNumber: 'S77889',
                        make: 'Subaru',
                        model: 'Outback',
                        year: 2023,
                        trim: 'Premium',
                        type: 'New',
                        price: 32500,
                        mileage: 5,
                        color: 'Green',
                        vin: '4S4BTAFC5P3123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '9',
                        stockNumber: 'K99001',
                        make: 'Kia',
                        model: 'Forte',
                        year: 2021,
                        trim: 'S',
                        type: 'Used',
                        price: 18900,
                        mileage: 32000,
                        color: 'Blue',
                        vin: '3KPF24AD5ME123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '10',
                        stockNumber: 'V22334',
                        make: 'Volkswagen',
                        model: 'Jetta',
                        year: 2023,
                        trim: 'S',
                        type: 'New',
                        price: 21800,
                        mileage: 15,
                        color: 'Silver',
                        vin: '3VWC57BU5PM123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '11',
                        stockNumber: 'A55667',
                        make: 'Acura',
                        model: 'TLX',
                        year: 2022,
                        trim: 'Technology',
                        type: 'Used',
                        price: 34500,
                        mileage: 19000,
                        color: 'White',
                        vin: '19UUB3F50NA123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '12',
                        stockNumber: 'I88990',
                        make: 'Infiniti',
                        model: 'Q50',
                        year: 2023,
                        trim: 'Pure',
                        type: 'New',
                        price: 38900,
                        mileage: 25,
                        color: 'Black',
                        vin: 'JN1EV7AR5PM123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '13',
                        stockNumber: 'L12345',
                        make: 'Lexus',
                        model: 'ES',
                        year: 2022,
                        trim: '350',
                        type: 'Used',
                        price: 42000,
                        mileage: 16500,
                        color: 'Pearl White',
                        vin: '58ABK1GG5NU123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '14',
                        stockNumber: 'B67890',
                        make: 'BMW',
                        model: '3 Series',
                        year: 2023,
                        trim: '330i',
                        type: 'New',
                        price: 45800,
                        mileage: 8,
                        color: 'Blue',
                        vin: 'WBA5R1C05P7123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '15',
                        stockNumber: 'MB98765',
                        make: 'Mercedes-Benz',
                        model: 'C-Class',
                        year: 2022,
                        trim: 'C300',
                        type: 'Used',
                        price: 48500,
                        mileage: 21000,
                        color: 'Silver',
                        vin: '55SWF8DB5NU123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '16',
                        stockNumber: 'AU11223',
                        make: 'Audi',
                        model: 'A4',
                        year: 2023,
                        trim: 'Premium',
                        type: 'New',
                        price: 41200,
                        mileage: 12,
                        color: 'Gray',
                        vin: 'WAUENAF40PA123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '17',
                        stockNumber: 'J44556',
                        make: 'Jeep',
                        model: 'Grand Cherokee',
                        year: 2022,
                        trim: 'Laredo',
                        type: 'Used',
                        price: 36800,
                        mileage: 28000,
                        color: 'Red',
                        vin: '1C4RJFAG5NC123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '18',
                        stockNumber: 'D77889',
                        make: 'Dodge',
                        model: 'Charger',
                        year: 2023,
                        trim: 'SXT',
                        type: 'New',
                        price: 33900,
                        mileage: 18,
                        color: 'Black',
                        vin: '2C3CDXBG5PH123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '19',
                        stockNumber: 'R99001',
                        make: 'Ram',
                        model: '1500',
                        year: 2022,
                        trim: 'Big Horn',
                        type: 'Used',
                        price: 41500,
                        mileage: 25000,
                        color: 'White',
                        vin: '1C6SRFFT4NN123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '20',
                        stockNumber: 'G22334',
                        make: 'GMC',
                        model: 'Sierra',
                        year: 2023,
                        trim: 'Elevation',
                        type: 'New',
                        price: 44200,
                        mileage: 22,
                        color: 'Gray',
                        vin: '1GTU9EED5PF123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '21',
                        stockNumber: 'C55667',
                        make: 'Cadillac',
                        model: 'XT5',
                        year: 2022,
                        trim: 'Luxury',
                        type: 'Used',
                        price: 46800,
                        mileage: 17500,
                        color: 'Black',
                        vin: '1GYKNCRS5NZ123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '22',
                        stockNumber: 'L88990',
                        make: 'Lincoln',
                        model: 'Corsair',
                        year: 2023,
                        trim: 'Standard',
                        type: 'New',
                        price: 39800,
                        mileage: 9,
                        color: 'Blue',
                        vin: '5LM5J7WC5PGL123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '23',
                        stockNumber: 'BU12345',
                        make: 'Buick',
                        model: 'Encore GX',
                        year: 2022,
                        trim: 'Preferred',
                        type: 'Used',
                        price: 27500,
                        mileage: 23000,
                        color: 'Silver',
                        vin: 'KL4MMCS26NB123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '24',
                        stockNumber: 'CR67890',
                        make: 'Chrysler',
                        model: 'Pacifica',
                        year: 2023,
                        trim: 'Touring',
                        type: 'New',
                        price: 37900,
                        mileage: 14,
                        color: 'White',
                        vin: '2C4RC1BG5PR123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '25',
                        stockNumber: 'MI98765',
                        make: 'Mitsubishi',
                        model: 'Outlander',
                        year: 2022,
                        trim: 'ES',
                        type: 'Used',
                        price: 26800,
                        mileage: 29000,
                        color: 'Red',
                        vin: 'JA4J3TA89NZ123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '26',
                        stockNumber: 'VO11223',
                        make: 'Volvo',
                        model: 'XC60',
                        year: 2023,
                        trim: 'Momentum',
                        type: 'New',
                        price: 52800,
                        mileage: 7,
                        color: 'Gray',
                        vin: 'YV4A22RK5P2123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '27',
                        stockNumber: 'GE44556',
                        make: 'Genesis',
                        model: 'G90',
                        year: 2022,
                        trim: '3.3T Premium',
                        type: 'Used',
                        price: 58500,
                        mileage: 15000,
                        color: 'Black',
                        vin: 'KMHG14LA5NA123789',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: '28',
                        stockNumber: 'TE77889',
                        make: 'Tesla',
                        model: 'Model 3',
                        year: 2023,
                        trim: 'Standard Range Plus',
                        type: 'New',
                        price: 42900,
                        mileage: 3,
                        color: 'White',
                        vin: '5YJ3E1EA5PF123456',
                        status: 'in-stock',
                        dateAdded: new Date().toISOString()
                    }
                ];
                this.save(sampleVehicles);
            }
        }
    },
    
    // Customers Methods
    customers: {
        // Remove method for backward compatibility
        remove: function(id) {
            return this.delete(id);
        },
        getAll: function() {
            try {
                const data = localStorage.getItem('autocrm_customers');
                if (!data) return [];
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.error('Error parsing customers data from localStorage:', error);
                // Clear corrupted data
                localStorage.removeItem('autocrm_customers');
                return [];
            }
        },
        
        get: function(id) {
            try {
                const customers = this.getAll();
                if (!Array.isArray(customers)) {
                    console.error('Customers data is not an array:', customers);
                    return null;
                }
                return customers.find(customer => customer && customer.id === id) || null;
            } catch (error) {
                console.error('Error in customers.get:', error);
                return null;
            }
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
            try {
                // Remove any circular references by creating clean objects
                const cleanData = customersData.map(customer => ({
                    id: customer.id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
                    company: customer.company || '',
                    address: customer.address || {},
                    type: customer.type || 'Regular',
                    source: customer.source || '',
                    notes: customer.notes || '',
                    dateAdded: customer.dateAdded,
                    lastContact: customer.lastContact,
                    purchaseHistory: customer.purchaseHistory || [],
                    updatedAt: customer.updatedAt
                }));
                localStorage.setItem('autocrm_customers', JSON.stringify(cleanData));
            } catch (error) {
                console.error('Error saving customers data:', error);
            }
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
                        type: 'VIP',
                        company: 'Smith Industries',
                        dateAdded: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
                        lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                        notes: 'Interested in SUVs, VIP customer with multiple purchases',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2022, make: 'Toyota', model: 'Highlander', price: 42000 }
                            }
                        ]
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
                        type: 'Regular',
                        company: '',
                        dateAdded: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
                        lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                        notes: 'Looking for fuel-efficient car',
                        purchaseHistory: []
                    },
                    {
                        id: '3',
                        firstName: 'Michael',
                        lastName: 'Davis',
                        email: 'michael.davis@email.com',
                        phone: '(555) 234-5678',
                        address: {
                            street: '789 Pine Rd',
                            city: 'Austin',
                            state: 'TX',
                            zip: '73301'
                        },
                        type: 'VIP',
                        company: 'Davis Construction',
                        dateAdded: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Fleet buyer, interested in trucks and commercial vehicles',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2023, make: 'Ford', model: 'F-150', price: 48000 }
                            },
                            {
                                date: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2023, make: 'Chevrolet', model: 'Silverado', price: 52000 }
                            }
                        ]
                    },
                    {
                        id: '4',
                        firstName: 'Emily',
                        lastName: 'Wilson',
                        email: 'emily.wilson@email.com',
                        phone: '(555) 345-6789',
                        address: {
                            street: '321 Elm St',
                            city: 'Dallas',
                            state: 'TX',
                            zip: '75201'
                        },
                        type: 'New',
                        company: '',
                        dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'First-time buyer, looking for reliable sedan',
                        purchaseHistory: []
                    },
                    {
                        id: '5',
                        firstName: 'Robert',
                        lastName: 'Brown',
                        email: 'robert.brown@email.com',
                        phone: '(555) 456-7890',
                        address: {
                            street: '654 Maple Ave',
                            city: 'Houston',
                            state: 'TX',
                            zip: '77001'
                        },
                        type: 'Regular',
                        company: 'Brown & Associates',
                        dateAdded: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Prefers luxury vehicles, good credit history',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2022, make: 'BMW', model: '3 Series', price: 45000 }
                            }
                        ]
                    },
                    {
                        id: '6',
                        firstName: 'Jessica',
                        lastName: 'Martinez',
                        email: 'jessica.martinez@email.com',
                        phone: '(555) 567-8901',
                        address: {
                            street: '987 Cedar Ln',
                            city: 'San Antonio',
                            state: 'TX',
                            zip: '78201'
                        },
                        type: 'Regular',
                        company: '',
                        dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Young professional, interested in hybrid vehicles',
                        purchaseHistory: []
                    },
                    {
                        id: '7',
                        firstName: 'David',
                        lastName: 'Anderson',
                        email: 'david.anderson@email.com',
                        phone: '(555) 678-9012',
                        address: {
                            street: '147 Birch St',
                            city: 'Fort Worth',
                            state: 'TX',
                            zip: '76101'
                        },
                        type: 'VIP',
                        company: 'Anderson Enterprises',
                        dateAdded: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Long-term customer, family fleet buyer',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2021, make: 'Mercedes-Benz', model: 'C-Class', price: 48000 }
                            },
                            {
                                date: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2022, make: 'Audi', model: 'A4', price: 42000 }
                            },
                            {
                                date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2022, make: 'Lexus', model: 'RX', price: 55000 }
                            }
                        ]
                    },
                    {
                        id: '8',
                        firstName: 'Lisa',
                        lastName: 'Taylor',
                        email: 'lisa.taylor@email.com',
                        phone: '(555) 789-0123',
                        address: {
                            street: '258 Willow Dr',
                            city: 'Plano',
                            state: 'TX',
                            zip: '75023'
                        },
                        type: 'Regular',
                        company: 'Taylor Marketing',
                        dateAdded: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Interested in electric vehicles, environmentally conscious',
                        purchaseHistory: []
                    },
                    {
                        id: '9',
                        firstName: 'Christopher',
                        lastName: 'Thomas',
                        email: 'christopher.thomas@email.com',
                        phone: '(555) 890-1234',
                        address: {
                            street: '369 Poplar Ave',
                            city: 'Arlington',
                            state: 'TX',
                            zip: '76001'
                        },
                        type: 'New',
                        company: '',
                        dateAdded: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'College graduate, first car purchase, budget-conscious',
                        purchaseHistory: []
                    },
                    {
                        id: '10',
                        firstName: 'Amanda',
                        lastName: 'White',
                        email: 'amanda.white@email.com',
                        phone: '(555) 901-2345',
                        address: {
                            street: '741 Spruce St',
                            city: 'Garland',
                            state: 'TX',
                            zip: '75040'
                        },
                        type: 'Regular',
                        company: 'White Consulting',
                        dateAdded: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Family of 4, needs spacious SUV or minivan',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2023, make: 'Honda', model: 'Pilot', price: 38000 }
                            }
                        ]
                    },
                    {
                        id: '11',
                        firstName: 'James',
                        lastName: 'Harris',
                        email: 'james.harris@email.com',
                        phone: '(555) 012-3456',
                        address: {
                            street: '852 Ash Rd',
                            city: 'Irving',
                            state: 'TX',
                            zip: '75061'
                        },
                        type: 'VIP',
                        company: 'Harris Holdings',
                        dateAdded: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Executive customer, prefers luxury and performance vehicles',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2021, make: 'Porsche', model: '911', price: 95000 }
                            },
                            {
                                date: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2022, make: 'Tesla', model: 'Model S', price: 85000 }
                            }
                        ]
                    },
                    {
                        id: '12',
                        firstName: 'Michelle',
                        lastName: 'Clark',
                        email: 'michelle.clark@email.com',
                        phone: '(555) 123-4567',
                        address: {
                            street: '963 Hickory Ln',
                            city: 'Mesquite',
                            state: 'TX',
                            zip: '75149'
                        },
                        type: 'Regular',
                        company: '',
                        dateAdded: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Single mother, needs reliable and safe vehicle',
                        purchaseHistory: []
                    },
                    {
                        id: '13',
                        firstName: 'Kevin',
                        lastName: 'Lewis',
                        email: 'kevin.lewis@email.com',
                        phone: '(555) 234-5678',
                        address: {
                            street: '159 Walnut St',
                            city: 'Richardson',
                            state: 'TX',
                            zip: '75080'
                        },
                        type: 'New',
                        company: 'Lewis Tech',
                        dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Tech entrepreneur, interested in latest automotive technology',
                        purchaseHistory: []
                    },
                    {
                        id: '14',
                        firstName: 'Nicole',
                        lastName: 'Walker',
                        email: 'nicole.walker@email.com',
                        phone: '(555) 345-6789',
                        address: {
                            street: '357 Cherry Ave',
                            city: 'Grand Prairie',
                            state: 'TX',
                            zip: '75050'
                        },
                        type: 'Regular',
                        company: 'Walker Design',
                        dateAdded: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Creative professional, values style and aesthetics',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2023, make: 'Mini', model: 'Cooper', price: 32000 }
                            }
                        ]
                    },
                    {
                        id: '15',
                        firstName: 'Ryan',
                        lastName: 'Hall',
                        email: 'ryan.hall@email.com',
                        phone: '(555) 456-7890',
                        address: {
                            street: '468 Peach St',
                            city: 'Carrollton',
                            state: 'TX',
                            zip: '75006'
                        },
                        type: 'VIP',
                        company: 'Hall Industries',
                        dateAdded: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Business owner, fleet purchases for company vehicles',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 160 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2022, make: 'Toyota', model: 'Camry', price: 28000 }
                            },
                            {
                                date: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2022, make: 'Honda', model: 'Accord', price: 30000 }
                            },
                            {
                                date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2023, make: 'Nissan', model: 'Altima', price: 27000 }
                            }
                        ]
                    },
                    {
                        id: '16',
                        firstName: 'Stephanie',
                        lastName: 'Young',
                        email: 'stephanie.young@email.com',
                        phone: '(555) 567-8901',
                        address: {
                            street: '579 Apple Dr',
                            city: 'Lewisville',
                            state: 'TX',
                            zip: '75057'
                        },
                        type: 'Regular',
                        company: '',
                        dateAdded: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Healthcare worker, needs reliable transportation for work',
                        purchaseHistory: []
                    },
                    {
                        id: '17',
                        firstName: 'Brian',
                        lastName: 'King',
                        email: 'brian.king@email.com',
                        phone: '(555) 678-9012',
                        address: {
                            street: '680 Orange Ln',
                            city: 'Flower Mound',
                            state: 'TX',
                            zip: '75022'
                        },
                        type: 'New',
                        company: 'King Consulting',
                        dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Recent college graduate, looking for first professional vehicle',
                        purchaseHistory: []
                    },
                    {
                        id: '18',
                        firstName: 'Rachel',
                        lastName: 'Wright',
                        email: 'rachel.wright@email.com',
                        phone: '(555) 789-0123',
                        address: {
                            street: '791 Grape Ave',
                            city: 'Coppell',
                            state: 'TX',
                            zip: '75019'
                        },
                        type: 'Regular',
                        company: 'Wright Solutions',
                        dateAdded: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Small business owner, interested in fuel-efficient vehicles',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2023, make: 'Toyota', model: 'Prius', price: 28000 }
                            }
                        ]
                    },
                    {
                        id: '19',
                        firstName: 'Daniel',
                        lastName: 'Lopez',
                        email: 'daniel.lopez@email.com',
                        phone: '(555) 890-1234',
                        address: {
                            street: '802 Lemon St',
                            city: 'Frisco',
                            state: 'TX',
                            zip: '75033'
                        },
                        type: 'VIP',
                        company: 'Lopez Construction',
                        dateAdded: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Construction company owner, needs work trucks and crew vehicles',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 230 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2021, make: 'Ford', model: 'F-250', price: 55000 }
                            },
                            {
                                date: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2022, make: 'Chevrolet', model: 'Silverado 2500', price: 58000 }
                            },
                            {
                                date: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2022, make: 'Ram', model: '2500', price: 56000 }
                            }
                        ]
                    },
                    {
                        id: '20',
                        firstName: 'Ashley',
                        lastName: 'Hill',
                        email: 'ashley.hill@email.com',
                        phone: '(555) 901-2345',
                        address: {
                            street: '913 Lime Dr',
                            city: 'McKinney',
                            state: 'TX',
                            zip: '75070'
                        },
                        type: 'Regular',
                        company: '',
                        dateAdded: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Teacher, looking for reliable and affordable vehicle',
                        purchaseHistory: []
                    },
                    {
                        id: '21',
                        firstName: 'Matthew',
                        lastName: 'Green',
                        email: 'matthew.green@email.com',
                        phone: '(555) 012-3456',
                        address: {
                            street: '124 Coconut Ave',
                            city: 'Allen',
                            state: 'TX',
                            zip: '75013'
                        },
                        type: 'New',
                        company: 'Green Energy Solutions',
                        dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Environmental consultant, very interested in electric and hybrid vehicles',
                        purchaseHistory: []
                    },
                    {
                        id: '22',
                        firstName: 'Jennifer',
                        lastName: 'Adams',
                        email: 'jennifer.adams@email.com',
                        phone: '(555) 123-4567',
                        address: {
                            street: '235 Pineapple St',
                            city: 'Wylie',
                            state: 'TX',
                            zip: '75098'
                        },
                        type: 'Regular',
                        company: 'Adams Real Estate',
                        dateAdded: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Real estate agent, needs professional-looking vehicle for client meetings',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2023, make: 'Lexus', model: 'ES', price: 42000 }
                            }
                        ]
                    },
                    {
                        id: '23',
                        firstName: 'Andrew',
                        lastName: 'Baker',
                        email: 'andrew.baker@email.com',
                        phone: '(555) 234-5678',
                        address: {
                            street: '346 Mango Ln',
                            city: 'Rockwall',
                            state: 'TX',
                            zip: '75087'
                        },
                        type: 'VIP',
                        company: 'Baker Financial',
                        dateAdded: new Date(Date.now() - 320 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Financial advisor, high-net-worth individual, prefers luxury vehicles',
                        purchaseHistory: [
                            {
                                date: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2021, make: 'Mercedes-Benz', model: 'S-Class', price: 95000 }
                            },
                            {
                                date: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
                                vehicle: { year: 2022, make: 'BMW', model: 'X7', price: 85000 }
                            }
                        ]
                    },
                    {
                        id: '24',
                        firstName: 'Samantha',
                        lastName: 'Nelson',
                        email: 'samantha.nelson@email.com',
                        phone: '(555) 345-6789',
                        address: {
                            street: '457 Kiwi Dr',
                            city: 'Sachse',
                            state: 'TX',
                            zip: '75048'
                        },
                        type: 'Regular',
                        company: '',
                        dateAdded: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Nurse, works night shifts, needs reliable and safe vehicle',
                        purchaseHistory: []
                    },
                    {
                        id: '25',
                        firstName: 'Joshua',
                        lastName: 'Carter',
                        email: 'joshua.carter@email.com',
                        phone: '(555) 456-7890',
                        address: {
                            street: '568 Papaya Ave',
                            city: 'Murphy',
                            state: 'TX',
                            zip: '75094'
                        },
                        type: 'New',
                        company: 'Carter IT Services',
                        dateAdded: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                        lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'IT professional, interested in tech-forward vehicles with connectivity features',
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
        // Remove method for backward compatibility
        remove: function(id) {
            return this.delete(id);
        },
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
                    },
                    // Additional 25 leads
                    {
                        id: '3',
                        firstName: 'Robert',
                        lastName: 'Wilson',
                        email: 'robert.wilson@email.com',
                        phone: '(555) 789-0123',
                        source: 'Facebook',
                        status: 'New',
                        interest: 'Truck',
                        notes: 'Looking for work truck with towing capacity',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 1'
                    },
                    {
                        id: '4',
                        firstName: 'Jennifer',
                        lastName: 'Martinez',
                        email: 'jennifer.martinez@email.com',
                        phone: '(555) 234-5678',
                        source: 'Google Ads',
                        status: 'Qualified',
                        interest: 'Luxury',
                        notes: 'Interested in premium features and warranty',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 3'
                    },
                    {
                        id: '5',
                        firstName: 'David',
                        lastName: 'Anderson',
                        email: 'david.anderson@email.com',
                        phone: '(555) 345-6789',
                        source: 'Walk-in',
                        status: 'Contacted',
                        interest: 'Electric',
                        notes: 'First-time electric vehicle buyer',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 2'
                    },
                    {
                        id: '6',
                        firstName: 'Amanda',
                        lastName: 'Taylor',
                        email: 'amanda.taylor@email.com',
                        phone: '(555) 456-7890',
                        source: 'Referral',
                        status: 'New',
                        interest: 'Compact',
                        notes: 'College student looking for reliable transportation',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 1'
                    },
                    {
                        id: '7',
                        firstName: 'Christopher',
                        lastName: 'Thomas',
                        email: 'christopher.thomas@email.com',
                        phone: '(555) 567-8901',
                        source: 'Website',
                        status: 'Proposal',
                        interest: 'Sports Car',
                        notes: 'Looking for weekend sports car',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 3'
                    },
                    {
                        id: '8',
                        firstName: 'Michelle',
                        lastName: 'Jackson',
                        email: 'michelle.jackson@email.com',
                        phone: '(555) 678-9012',
                        source: 'Instagram',
                        status: 'Contacted',
                        interest: 'Minivan',
                        notes: 'Family of 6, needs spacious vehicle',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 2'
                    },
                    {
                        id: '9',
                        firstName: 'Kevin',
                        lastName: 'White',
                        email: 'kevin.white@email.com',
                        phone: '(555) 789-0123',
                        source: 'Trade Show',
                        status: 'Qualified',
                        interest: 'Hybrid',
                        notes: 'Environmentally conscious buyer',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 1'
                    },
                    {
                        id: '10',
                        firstName: 'Stephanie',
                        lastName: 'Harris',
                        email: 'stephanie.harris@email.com',
                        phone: '(555) 890-1234',
                        source: 'Website',
                        status: 'New',
                        interest: 'Crossover',
                        notes: 'Upgrading from sedan to crossover',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 3'
                    },
                    {
                        id: '11',
                        firstName: 'Brian',
                        lastName: 'Clark',
                        email: 'brian.clark@email.com',
                        phone: '(555) 901-2345',
                        source: 'Radio Ad',
                        status: 'Contacted',
                        interest: 'Pickup',
                        notes: 'Contractor needing reliable work vehicle',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 2'
                    },
                    {
                        id: '12',
                        firstName: 'Nicole',
                        lastName: 'Lewis',
                        email: 'nicole.lewis@email.com',
                        phone: '(555) 012-3456',
                        source: 'Referral',
                        status: 'Proposal',
                        interest: 'Convertible',
                        notes: 'Looking for summer convertible',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 1'
                    },
                    {
                        id: '13',
                        firstName: 'Gregory',
                        lastName: 'Robinson',
                        email: 'gregory.robinson@email.com',
                        phone: '(555) 123-4567',
                        source: 'Website',
                        status: 'New',
                        interest: 'Diesel',
                        notes: 'Long-distance commuter needs fuel efficiency',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 3'
                    },
                    {
                        id: '14',
                        firstName: 'Rachel',
                        lastName: 'Walker',
                        email: 'rachel.walker@email.com',
                        phone: '(555) 234-5678',
                        source: 'Google Ads',
                        status: 'Qualified',
                        interest: 'Wagon',
                        notes: 'Dog owner needs cargo space',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 2'
                    },
                    {
                        id: '15',
                        firstName: 'Patrick',
                        lastName: 'Hall',
                        email: 'patrick.hall@email.com',
                        phone: '(555) 345-6789',
                        source: 'Walk-in',
                        status: 'Contacted',
                        interest: 'Coupe',
                        notes: 'Young professional, style-focused',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 1'
                    },
                    {
                        id: '16',
                        firstName: 'Kimberly',
                        lastName: 'Allen',
                        email: 'kimberly.allen@email.com',
                        phone: '(555) 456-7890',
                        source: 'Facebook',
                        status: 'New',
                        interest: 'Hatchback',
                        notes: 'City driver, needs compact parking',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 3'
                    },
                    {
                        id: '17',
                        firstName: 'Timothy',
                        lastName: 'Young',
                        email: 'timothy.young@email.com',
                        phone: '(555) 567-8901',
                        source: 'Referral',
                        status: 'Proposal',
                        interest: 'Performance',
                        notes: 'Track day enthusiast',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 2'
                    },
                    {
                        id: '18',
                        firstName: 'Angela',
                        lastName: 'Hernandez',
                        email: 'angela.hernandez@email.com',
                        phone: '(555) 678-9012',
                        source: 'Website',
                        status: 'Contacted',
                        interest: 'Family',
                        notes: 'Safety is top priority for family vehicle',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 1'
                    },
                    {
                        id: '19',
                        firstName: 'Jason',
                        lastName: 'King',
                        email: 'jason.king@email.com',
                        phone: '(555) 789-0123',
                        source: 'Instagram',
                        status: 'Qualified',
                        interest: 'Off-road',
                        notes: 'Weekend adventurer needs 4WD capability',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 3'
                    },
                    {
                        id: '20',
                        firstName: 'Melissa',
                        lastName: 'Wright',
                        email: 'melissa.wright@email.com',
                        phone: '(555) 890-1234',
                        source: 'Trade Show',
                        status: 'New',
                        interest: 'Luxury SUV',
                        notes: 'Executive looking for premium SUV',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 2'
                    },
                    {
                        id: '21',
                        firstName: 'Scott',
                        lastName: 'Lopez',
                        email: 'scott.lopez@email.com',
                        phone: '(555) 901-2345',
                        source: 'Radio Ad',
                        status: 'Contacted',
                        interest: 'Commercial',
                        notes: 'Small business owner needs fleet vehicles',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 1'
                    },
                    {
                        id: '22',
                        firstName: 'Laura',
                        lastName: 'Hill',
                        email: 'laura.hill@email.com',
                        phone: '(555) 012-3456',
                        source: 'Website',
                        status: 'Proposal',
                        interest: 'Certified Pre-owned',
                        notes: 'Wants warranty coverage on used vehicle',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 3'
                    },
                    {
                        id: '23',
                        firstName: 'Daniel',
                        lastName: 'Green',
                        email: 'daniel.green@email.com',
                        phone: '(555) 123-4567',
                        source: 'Referral',
                        status: 'New',
                        interest: 'Vintage',
                        notes: 'Classic car collector',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 2'
                    },
                    {
                        id: '24',
                        firstName: 'Heather',
                        lastName: 'Adams',
                        email: 'heather.adams@email.com',
                        phone: '(555) 234-5678',
                        source: 'Google Ads',
                        status: 'Qualified',
                        interest: 'Fuel Efficient',
                        notes: 'Long commute, needs excellent MPG',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 1'
                    },
                    {
                        id: '25',
                        firstName: 'Ryan',
                        lastName: 'Baker',
                        email: 'ryan.baker@email.com',
                        phone: '(555) 345-6789',
                        source: 'Walk-in',
                        status: 'Contacted',
                        interest: 'First Car',
                        notes: 'Recent graduate, first car purchase',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 3'
                    },
                    {
                        id: '26',
                        firstName: 'Crystal',
                        lastName: 'Gonzalez',
                        email: 'crystal.gonzalez@email.com',
                        phone: '(555) 456-7890',
                        source: 'Facebook',
                        status: 'New',
                        interest: 'Lease',
                        notes: 'Prefers leasing over purchasing',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 2'
                    },
                    {
                        id: '27',
                        firstName: 'Eric',
                        lastName: 'Nelson',
                        email: 'eric.nelson@email.com',
                        phone: '(555) 567-8901',
                        source: 'Website',
                        status: 'Proposal',
                        interest: 'Technology',
                        notes: 'Wants latest tech features and connectivity',
                        dateAdded: new Date().toISOString(),
                        assignedTo: 'Sales Rep 1'
                    }
                ];
                this.save(sampleLeads);
            }
        }
    },
    
    // Deals Methods
    deals: {
        // Remove method for backward compatibility
        remove: function(id) {
            return this.delete(id);
        },
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
                    customerName: 'John Smith',
                    customerEmail: 'john.smith@email.com',
                    vehicleYear: 2023,
                    vehicleMake: 'Toyota',
                    vehicleModel: 'Camry',
                    value: 28500,
                    status: 'Pending',
                    salesperson: 'Mike Johnson',
                    notes: 'Customer interested in extended warranty',
                    dateCreated: new Date().toISOString(),
                    expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    customerId: '2',
                    vehicleId: '2',
                    customerName: 'Sarah Johnson',
                    customerEmail: 'sarah.johnson@email.com',
                    vehicleYear: 2022,
                    vehicleMake: 'Honda',
                    vehicleModel: 'Civic',
                    value: 24000,
                    status: 'In Progress',
                    salesperson: 'Sarah Wilson',
                    notes: 'Financing pre-approved',
                    dateCreated: new Date().toISOString(),
                    expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    customerId: '3',
                    vehicleId: '3',
                    customerName: 'Michael Brown',
                    customerEmail: 'michael.brown@email.com',
                    vehicleYear: 2023,
                    vehicleMake: 'Ford',
                    vehicleModel: 'F-150',
                    value: 35000,
                    status: 'Closed Won',
                    salesperson: 'Thomas Morales',
                    notes: 'Trade-in vehicle included',
                    dateCreated: new Date().toISOString(),
                    expectedCloseDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
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
                        customerName: 'John Smith',
                        customerEmail: 'john.smith@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Toyota',
                        vehicleModel: 'Camry',
                        value: 28500,
                        status: 'Pending',
                        salesperson: 'Mike Johnson',
                        notes: 'Customer interested in extended warranty',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '2',
                        customerId: '2',
                        vehicleId: '2',
                        customerName: 'Sarah Johnson',
                        customerEmail: 'sarah.johnson@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Honda',
                        vehicleModel: 'Civic',
                        value: 24000,
                        status: 'In Progress',
                        salesperson: 'Sarah Wilson',
                        notes: 'Financing pre-approved',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '3',
                        customerId: '3',
                        vehicleId: '3',
                        customerName: 'Michael Brown',
                        customerEmail: 'michael.brown@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Ford',
                        vehicleModel: 'F-150',
                        value: 35000,
                        status: 'Closed Won',
                        salesperson: 'Thomas Morales',
                        notes: 'Trade-in vehicle included',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    // Additional 25 deals
                    {
                        id: '4',
                        customerId: '4',
                        vehicleId: '4',
                        customerName: 'Robert Wilson',
                        customerEmail: 'robert.wilson@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Nissan',
                        vehicleModel: 'Altima',
                        value: 26800,
                        status: 'Pending',
                        salesperson: 'Mike Johnson',
                        notes: 'Waiting for credit approval',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '5',
                        customerId: '5',
                        vehicleId: '5',
                        customerName: 'Jennifer Martinez',
                        customerEmail: 'jennifer.martinez@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Chevrolet',
                        vehicleModel: 'Malibu',
                        value: 23500,
                        status: 'In Progress',
                        salesperson: 'Sarah Wilson',
                        notes: 'Negotiating trade-in value',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '6',
                        customerId: '6',
                        vehicleId: '6',
                        customerName: 'David Anderson',
                        customerEmail: 'david.anderson@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Hyundai',
                        vehicleModel: 'Elantra',
                        value: 22900,
                        status: 'Closed Won',
                        salesperson: 'Thomas Morales',
                        notes: 'Cash purchase, quick close',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '7',
                        customerId: '7',
                        vehicleId: '7',
                        customerName: 'Amanda Taylor',
                        customerEmail: 'amanda.taylor@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Mazda',
                        vehicleModel: 'CX-5',
                        value: 29800,
                        status: 'Proposal',
                        salesperson: 'Mike Johnson',
                        notes: 'Considering financing options',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '8',
                        customerId: '8',
                        vehicleId: '8',
                        customerName: 'Christopher Thomas',
                        customerEmail: 'christopher.thomas@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Subaru',
                        vehicleModel: 'Outback',
                        value: 32500,
                        status: 'In Progress',
                        salesperson: 'Sarah Wilson',
                        notes: 'Waiting for insurance approval',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '9',
                        customerId: '9',
                        vehicleId: '9',
                        customerName: 'Michelle Jackson',
                        customerEmail: 'michelle.jackson@email.com',
                        vehicleYear: 2021,
                        vehicleMake: 'Kia',
                        vehicleModel: 'Forte',
                        value: 18900,
                        status: 'Closed Won',
                        salesperson: 'Thomas Morales',
                        notes: 'First-time buyer program applied',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '10',
                        customerId: '10',
                        vehicleId: '10',
                        customerName: 'Kevin White',
                        customerEmail: 'kevin.white@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Volkswagen',
                        vehicleModel: 'Jetta',
                        value: 21800,
                        status: 'Pending',
                        salesperson: 'Mike Johnson',
                        notes: 'Lease vs buy decision pending',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '11',
                        customerId: '11',
                        vehicleId: '11',
                        customerName: 'Stephanie Harris',
                        customerEmail: 'stephanie.harris@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Acura',
                        vehicleModel: 'TLX',
                        value: 34500,
                        status: 'In Progress',
                        salesperson: 'Sarah Wilson',
                        notes: 'Luxury package add-ons discussed',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '12',
                        customerId: '12',
                        vehicleId: '12',
                        customerName: 'Brian Clark',
                        customerEmail: 'brian.clark@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Infiniti',
                        vehicleModel: 'Q50',
                        value: 38900,
                        status: 'Proposal',
                        salesperson: 'Thomas Morales',
                        notes: 'Commercial fleet discount applied',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '13',
                        customerId: '13',
                        vehicleId: '13',
                        customerName: 'Nicole Lewis',
                        customerEmail: 'nicole.lewis@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Lexus',
                        vehicleModel: 'ES',
                        value: 42000,
                        status: 'Closed Won',
                        salesperson: 'Mike Johnson',
                        notes: 'Loyalty customer, repeat buyer',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '14',
                        customerId: '14',
                        vehicleId: '14',
                        customerName: 'Gregory Robinson',
                        customerEmail: 'gregory.robinson@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'BMW',
                        vehicleModel: '3 Series',
                        value: 45800,
                        status: 'In Progress',
                        salesperson: 'Sarah Wilson',
                        notes: 'Performance package upgrade requested',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '15',
                        customerId: '15',
                        vehicleId: '15',
                        customerName: 'Rachel Walker',
                        customerEmail: 'rachel.walker@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Mercedes-Benz',
                        vehicleModel: 'C-Class',
                        value: 48500,
                        status: 'Pending',
                        salesperson: 'Thomas Morales',
                        notes: 'Waiting for special order color',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '16',
                        customerId: '16',
                        vehicleId: '16',
                        customerName: 'Patrick Hall',
                        customerEmail: 'patrick.hall@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Audi',
                        vehicleModel: 'A4',
                        value: 41200,
                        status: 'Proposal',
                        salesperson: 'Mike Johnson',
                        notes: 'Comparing lease vs finance options',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '17',
                        customerId: '17',
                        vehicleId: '17',
                        customerName: 'Kimberly Allen',
                        customerEmail: 'kimberly.allen@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Jeep',
                        vehicleModel: 'Grand Cherokee',
                        value: 36800,
                        status: 'Closed Won',
                        salesperson: 'Sarah Wilson',
                        notes: 'Off-road package included',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '18',
                        customerId: '18',
                        vehicleId: '18',
                        customerName: 'Timothy Young',
                        customerEmail: 'timothy.young@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Dodge',
                        vehicleModel: 'Charger',
                        value: 33900,
                        status: 'In Progress',
                        salesperson: 'Thomas Morales',
                        notes: 'Performance modifications discussed',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '19',
                        customerId: '19',
                        vehicleId: '19',
                        customerName: 'Angela Hernandez',
                        customerEmail: 'angela.hernandez@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Ram',
                        vehicleModel: '1500',
                        value: 41500,
                        status: 'Pending',
                        salesperson: 'Mike Johnson',
                        notes: 'Family safety features priority',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '20',
                        customerId: '20',
                        vehicleId: '20',
                        customerName: 'Jason King',
                        customerEmail: 'jason.king@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'GMC',
                        vehicleModel: 'Sierra',
                        value: 44200,
                        status: 'Proposal',
                        salesperson: 'Sarah Wilson',
                        notes: 'Adventure package for off-road use',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '21',
                        customerId: '21',
                        vehicleId: '21',
                        customerName: 'Melissa Wright',
                        customerEmail: 'melissa.wright@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Cadillac',
                        vehicleModel: 'XT5',
                        value: 46800,
                        status: 'Closed Won',
                        salesperson: 'Thomas Morales',
                        notes: 'Executive luxury package',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '22',
                        customerId: '22',
                        vehicleId: '22',
                        customerName: 'Scott Lopez',
                        customerEmail: 'scott.lopez@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Lincoln',
                        vehicleModel: 'Corsair',
                        value: 39800,
                        status: 'In Progress',
                        salesperson: 'Mike Johnson',
                        notes: 'Fleet purchase for business',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '23',
                        customerId: '23',
                        vehicleId: '23',
                        customerName: 'Laura Hill',
                        customerEmail: 'laura.hill@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Buick',
                        vehicleModel: 'Encore GX',
                        value: 27500,
                        status: 'Pending',
                        salesperson: 'Sarah Wilson',
                        notes: 'Certified pre-owned warranty important',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '24',
                        customerId: '24',
                        vehicleId: '24',
                        customerName: 'Daniel Green',
                        customerEmail: 'daniel.green@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Chrysler',
                        vehicleModel: 'Pacifica',
                        value: 37900,
                        status: 'Proposal',
                        salesperson: 'Thomas Morales',
                        notes: 'Classic car trade-in evaluation',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '25',
                        customerId: '25',
                        vehicleId: '25',
                        customerName: 'Heather Adams',
                        customerEmail: 'heather.adams@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Mitsubishi',
                        vehicleModel: 'Outlander',
                        value: 26800,
                        status: 'Closed Won',
                        salesperson: 'Mike Johnson',
                        notes: 'Fuel efficiency was deciding factor',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '26',
                        customerId: '26',
                        vehicleId: '26',
                        customerName: 'Ryan Baker',
                        customerEmail: 'ryan.baker@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Volvo',
                        vehicleModel: 'XC60',
                        value: 52800,
                        status: 'In Progress',
                        salesperson: 'Sarah Wilson',
                        notes: 'First car purchase, parent co-signer',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '27',
                        customerId: '27',
                        vehicleId: '27',
                        customerName: 'Crystal Gonzalez',
                        customerEmail: 'crystal.gonzalez@email.com',
                        vehicleYear: 2022,
                        vehicleMake: 'Genesis',
                        vehicleModel: 'G90',
                        value: 58500,
                        status: 'Pending',
                        salesperson: 'Thomas Morales',
                        notes: 'Lease terms being finalized',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '28',
                        customerId: '28',
                        vehicleId: '28',
                        customerName: 'Eric Nelson',
                        customerEmail: 'eric.nelson@email.com',
                        vehicleYear: 2023,
                        vehicleMake: 'Tesla',
                        vehicleModel: 'Model 3',
                        value: 42900,
                        status: 'Closed Won',
                        salesperson: 'Mike Johnson',
                        notes: 'Technology package with latest features',
                        dateCreated: new Date().toISOString(),
                        expectedCloseDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ];
                this.save(sampleDeals);
            }
        }
    },
    
    // Tasks Methods (keeping localStorage for now)
    tasks: {
        // Remove method for backward compatibility
        remove: function(id) {
            return this.delete(id);
        },
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
                    },
                    // Additional 25 tasks
                    {
                        id: '3',
                        title: 'Schedule test drive for Robert Wilson',
                        description: 'Arrange test drive for work truck evaluation',
                        priority: 'High',
                        status: 'New',
                        assignedTo: 'Sales Rep 1',
                        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Appointment',
                        relatedTo: 'Lead',
                        relatedId: '3',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Mike Johnson'
                    },
                    {
                        id: '4',
                        title: 'Prepare luxury vehicle presentation',
                        description: 'Create presentation for Jennifer Martinez luxury features',
                        priority: 'Medium',
                        status: 'In Progress',
                        assignedTo: 'Sales Rep 3',
                        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Presentation',
                        relatedTo: 'Lead',
                        relatedId: '4',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Sarah Wilson'
                    },
                    {
                        id: '5',
                        title: 'Research electric vehicle incentives',
                        description: 'Find available rebates and incentives for David Anderson',
                        priority: 'Medium',
                        status: 'New',
                        assignedTo: 'Sales Rep 2',
                        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Research',
                        relatedTo: 'Lead',
                        relatedId: '5',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Thomas Morales'
                    },
                    {
                        id: '6',
                        title: 'Student discount verification',
                        description: 'Verify Amanda Taylor student status for discount',
                        priority: 'Low',
                        status: 'New',
                        assignedTo: 'Sales Rep 1',
                        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Verification',
                        relatedTo: 'Lead',
                        relatedId: '6',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Mike Johnson'
                    },
                    {
                        id: '7',
                        title: 'Sports car insurance quotes',
                        description: 'Get insurance quotes for Christopher Thomas sports car',
                        priority: 'High',
                        status: 'In Progress',
                        assignedTo: 'Sales Rep 3',
                        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Insurance',
                        relatedTo: 'Lead',
                        relatedId: '7',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Sarah Wilson'
                    },
                    {
                        id: '8',
                        title: 'Family vehicle safety demo',
                        description: 'Schedule safety feature demonstration for Michelle Jackson',
                        priority: 'Medium',
                        status: 'New',
                        assignedTo: 'Sales Rep 2',
                        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Demonstration',
                        relatedTo: 'Lead',
                        relatedId: '8',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Thomas Morales'
                    },
                    {
                        id: '9',
                        title: 'Hybrid technology explanation',
                        description: 'Prepare hybrid technology overview for Kevin White',
                        priority: 'Medium',
                        status: 'Completed',
                        assignedTo: 'Sales Rep 1',
                        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Education',
                        relatedTo: 'Lead',
                        relatedId: '9',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Mike Johnson'
                    },
                    {
                        id: '10',
                        title: 'Crossover comparison chart',
                        description: 'Create comparison chart for Stephanie Harris crossover options',
                        priority: 'Low',
                        status: 'New',
                        assignedTo: 'Sales Rep 3',
                        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Analysis',
                        relatedTo: 'Lead',
                        relatedId: '10',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Sarah Wilson'
                    },
                    {
                        id: '11',
                        title: 'Commercial vehicle fleet pricing',
                        description: 'Calculate fleet pricing for Brian Clark contractor needs',
                        priority: 'High',
                        status: 'In Progress',
                        assignedTo: 'Sales Rep 2',
                        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Pricing',
                        relatedTo: 'Lead',
                        relatedId: '11',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Thomas Morales'
                    },
                    {
                        id: '12',
                        title: 'Convertible seasonal availability',
                        description: 'Check convertible inventory for Nicole Lewis summer purchase',
                        priority: 'Medium',
                        status: 'New',
                        assignedTo: 'Sales Rep 1',
                        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Inventory',
                        relatedTo: 'Lead',
                        relatedId: '12',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Mike Johnson'
                    },
                    {
                        id: '13',
                        title: 'Diesel fuel economy analysis',
                        description: 'Prepare fuel economy report for Gregory Robinson commute',
                        priority: 'Medium',
                        status: 'In Progress',
                        assignedTo: 'Sales Rep 3',
                        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Analysis',
                        relatedTo: 'Lead',
                        relatedId: '13',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Sarah Wilson'
                    },
                    {
                        id: '14',
                        title: 'Pet-friendly vehicle features',
                        description: 'Research cargo space and pet features for Rachel Walker',
                        priority: 'Low',
                        status: 'New',
                        assignedTo: 'Sales Rep 2',
                        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Research',
                        relatedTo: 'Lead',
                        relatedId: '14',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Thomas Morales'
                    },
                    {
                        id: '15',
                        title: 'Young professional styling consultation',
                        description: 'Schedule styling consultation for Patrick Hall coupe selection',
                        priority: 'Medium',
                        status: 'New',
                        assignedTo: 'Sales Rep 1',
                        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Consultation',
                        relatedTo: 'Lead',
                        relatedId: '15',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Mike Johnson'
                    },
                    {
                        id: '16',
                        title: 'City parking solutions demo',
                        description: 'Demonstrate compact parking features for Kimberly Allen',
                        priority: 'Medium',
                        status: 'Completed',
                        assignedTo: 'Sales Rep 3',
                        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Demonstration',
                        relatedTo: 'Lead',
                        relatedId: '16',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Sarah Wilson'
                    },
                    {
                        id: '17',
                        title: 'Track day performance specs',
                        description: 'Compile performance specifications for Timothy Young track use',
                        priority: 'High',
                        status: 'In Progress',
                        assignedTo: 'Sales Rep 2',
                        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Specifications',
                        relatedTo: 'Lead',
                        relatedId: '17',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Thomas Morales'
                    },
                    {
                        id: '18',
                        title: 'Family safety ratings research',
                        description: 'Research safety ratings for Angela Hernandez family vehicle',
                        priority: 'High',
                        status: 'New',
                        assignedTo: 'Sales Rep 1',
                        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Research',
                        relatedTo: 'Lead',
                        relatedId: '18',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Mike Johnson'
                    },
                    {
                        id: '19',
                        title: '4WD capability demonstration',
                        description: 'Schedule off-road demonstration for Jason King adventure needs',
                        priority: 'Medium',
                        status: 'New',
                        assignedTo: 'Sales Rep 3',
                        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Demonstration',
                        relatedTo: 'Lead',
                        relatedId: '19',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Sarah Wilson'
                    },
                    {
                        id: '20',
                        title: 'Executive luxury package presentation',
                        description: 'Prepare luxury package presentation for Melissa Wright',
                        priority: 'High',
                        status: 'In Progress',
                        assignedTo: 'Sales Rep 2',
                        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Presentation',
                        relatedTo: 'Lead',
                        relatedId: '20',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Thomas Morales'
                    },
                    {
                        id: '21',
                        title: 'Fleet vehicle bulk pricing',
                        description: 'Calculate bulk pricing for Scott Lopez business fleet',
                        priority: 'High',
                        status: 'New',
                        assignedTo: 'Sales Rep 1',
                        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Pricing',
                        relatedTo: 'Lead',
                        relatedId: '21',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Mike Johnson'
                    },
                    {
                        id: '22',
                        title: 'Certified pre-owned warranty details',
                        description: 'Compile warranty information for Laura Hill CPO interest',
                        priority: 'Medium',
                        status: 'In Progress',
                        assignedTo: 'Sales Rep 3',
                        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Documentation',
                        relatedTo: 'Lead',
                        relatedId: '22',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Sarah Wilson'
                    },
                    {
                        id: '23',
                        title: 'Classic car appraisal coordination',
                        description: 'Arrange classic car appraisal for Daniel Green trade-in',
                        priority: 'Medium',
                        status: 'New',
                        assignedTo: 'Sales Rep 2',
                        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Appraisal',
                        relatedTo: 'Lead',
                        relatedId: '23',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Thomas Morales'
                    },
                    {
                        id: '24',
                        title: 'Fuel efficiency comparison report',
                        description: 'Create MPG comparison report for Heather Adams commute',
                        priority: 'Medium',
                        status: 'Completed',
                        assignedTo: 'Sales Rep 1',
                        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Report',
                        relatedTo: 'Lead',
                        relatedId: '24',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Mike Johnson'
                    },
                    {
                        id: '25',
                        title: 'First-time buyer program information',
                        description: 'Prepare first-time buyer program details for Ryan Baker',
                        priority: 'High',
                        status: 'New',
                        assignedTo: 'Sales Rep 3',
                        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Program Info',
                        relatedTo: 'Lead',
                        relatedId: '25',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Sarah Wilson'
                    },
                    {
                        id: '26',
                        title: 'Lease terms comparison',
                        description: 'Compare lease vs purchase options for Crystal Gonzalez',
                        priority: 'Medium',
                        status: 'In Progress',
                        assignedTo: 'Sales Rep 2',
                        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Analysis',
                        relatedTo: 'Lead',
                        relatedId: '26',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Thomas Morales'
                    },
                    {
                        id: '27',
                        title: 'Technology features demonstration',
                        description: 'Schedule tech features demo for Eric Nelson connectivity needs',
                        priority: 'High',
                        status: 'New',
                        assignedTo: 'Sales Rep 1',
                        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        taskType: 'Demonstration',
                        relatedTo: 'Lead',
                        relatedId: '27',
                        createdAt: new Date().toISOString(),
                        createdBy: 'Mike Johnson'
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
                        parameters: {
                            dateRange: 'current-month',
                            includeCharts: true,
                            format: 'pdf'
                        }
                    },
                    {
                        id: '2',
                        title: 'Inventory Aging Report',
                        description: 'Analysis of vehicle inventory aging with recommendations for pricing adjustments and promotional strategies.',
                        category: 'Inventory',
                        type: 'on-demand',
                        frequency: 'Weekly',
                        lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        parameters: {
                            agingThreshold: 60,
                            includePhotos: false,
                            sortBy: 'daysOnLot'
                        }
                    },
                    {
                        id: '3',
                        title: 'Lead Conversion Analysis',
                        description: 'Detailed breakdown of lead sources, conversion rates, and sales funnel performance.',
                        category: 'Marketing',
                        type: 'scheduled',
                        frequency: 'Quarterly',
                        lastGenerated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        parameters: {
                            includeSourceBreakdown: true,
                            compareToLastPeriod: true,
                            format: 'excel'
                        }
                    }
                ];
                this.save(sampleReports);
            }
        }
    },
    
    // Utility Methods
    utils: {
        // Initialize all data stores with sample data if they don't exist
        initializeAllData: function() {
            console.log('Initializing all data stores...');
            
            try {
                // Initialize each data store
                DataService.customers.init();
                DataService.inventory.init();
                DataService.leads.init();
                DataService.deals.init();
                DataService.tasks.init();
                DataService.reports.init();
                
                console.log('All data stores initialized successfully');
            } catch (error) {
                console.error('Error initializing data stores:', error);
            }
        },
        
        // Clear all data (useful for testing)
        clearAllData: function() {
            localStorage.removeItem('autocrm_customers');
            localStorage.removeItem('autocrm_inventory');
            localStorage.removeItem('autocrm_leads');
            localStorage.removeItem('autocrm_deals');
            localStorage.removeItem('autocrm_tasks');
            localStorage.removeItem('autocrm_reports');
            console.log('All data cleared');
        },
        
        // Export all data
        exportAllData: function() {
            return {
                customers: DataService.customers.getAll(),
                inventory: DataService.inventory.getAll(),
                leads: DataService.leads.getAll(),
                deals: DataService.deals.getAll(),
                tasks: DataService.tasks.getAll(),
                reports: DataService.reports.getAll(),
                exportDate: new Date().toISOString()
            };
        },
        
        // Import all data
        importAllData: function(data) {
            if (data.customers) DataService.customers.save(data.customers);
            if (data.inventory) DataService.inventory.save(data.inventory);
            if (data.leads) DataService.leads.save(data.leads);
            if (data.deals) DataService.deals.save(data.deals);
            if (data.tasks) DataService.tasks.save(data.tasks);
            if (data.reports) DataService.reports.save(data.reports);
            console.log('All data imported successfully');
        }
    }
};