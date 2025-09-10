// Reports Manager for AutoConnect
// Handles report generation, display, and export functionality

const ReportsManager = {
    
    // Initialize the reports system
    init: function() {
        this.setupEventListeners();
        this.showAllReports(); // Show all reports by default
    },
    
    // Set up event listeners
    setupEventListeners: function() {
        // Category card clicks
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const category = card.dataset.category;
                this.filterReportsByCategory(category);
                this.highlightActiveCategory(card);
            });
        });
        
        // Report view buttons
        const viewButtons = document.querySelectorAll('.report-card .btn-icon[title="View Report"]');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const reportCard = button.closest('.report-card');
                const reportType = reportCard.dataset.report;
                this.viewReport(reportType);
            });
        });
        
        // Report export buttons
        const exportButtons = document.querySelectorAll('.report-card .btn-icon[title="Export"]');
        exportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const reportCard = button.closest('.report-card');
                const reportType = reportCard.dataset.report;
                this.exportReport(reportType);
            });
        });
        
        // Modal close functionality
        const closeModal = document.getElementById('close-report-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeReportModal();
            });
        }
        
        // Modal export and print buttons
        const exportReportBtn = document.getElementById('export-report-btn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => {
                this.exportCurrentReport();
            });
        }
        
        const printReportBtn = document.getElementById('print-report-btn');
        if (printReportBtn) {
            printReportBtn.addEventListener('click', () => {
                this.printCurrentReport();
            });
        }
        
        // Close modal when clicking outside
        const modal = document.getElementById('report-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeReportModal();
                }
            });
        }
    },
    
    // Filter reports by category
    filterReportsByCategory: function(category) {
        const reportSections = document.querySelectorAll('.report-section');
        reportSections.forEach(section => {
            if (section.dataset.category === category) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    },
    
    // Show all reports
    showAllReports: function() {
        const reportSections = document.querySelectorAll('.report-section');
        reportSections.forEach(section => {
            section.style.display = 'block';
        });
        this.clearCategoryHighlight();
    },
    
    // Highlight active category
    highlightActiveCategory: function(activeCard) {
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.classList.remove('active');
        });
        activeCard.classList.add('active');
    },
    
    // Clear category highlight
    clearCategoryHighlight: function() {
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.classList.remove('active');
        });
    },
    
    // View a specific report
    viewReport: function(reportType) {
        const reportData = this.generateReportData(reportType);
        const reportHtml = this.generateReportHtml(reportType, reportData);
        
        // Set modal title
        const modalTitle = document.getElementById('report-modal-title');
        modalTitle.textContent = this.getReportTitle(reportType);
        
        // Set report content
        const reportContent = document.getElementById('report-content');
        reportContent.innerHTML = reportHtml;
        
        // Store current report type for export/print
        this.currentReportType = reportType;
        this.currentReportData = reportData;
        
        // Show modal
        const modal = document.getElementById('report-modal');
        modal.style.display = 'block';
    },
    
    // Generate report data based on type
    generateReportData: function(reportType) {
        const customers = DataService.customers.getAll();
        const inventory = DataService.inventory.getAll();
        const leads = DataService.leads.getAll();
        const deals = DataService.deals.getAll();
        const sales = DataService.sales.getAll();
        
        switch (reportType) {
            case 'sales-summary':
                return this.generateSalesSummaryData(sales, deals);
            case 'monthly-sales':
                return this.generateMonthlySalesData(sales, deals);
            case 'salesperson-performance':
                return this.generateSalespersonPerformanceData(sales, deals);
            case 'deal-pipeline':
                return this.generateDealPipelineData(deals);
            case 'revenue-forecast':
                return this.generateRevenueForecastData(deals);
            case 'inventory-summary':
                return this.generateInventorySummaryData(inventory);
            case 'aging-inventory':
                return this.generateAgingInventoryData(inventory);
            case 'inventory-turnover':
                return this.generateInventoryTurnoverData(inventory, sales);
            case 'popular-vehicles':
                return this.generatePopularVehiclesData(inventory, leads);
            case 'customer-demographics':
                return this.generateCustomerDemographicsData(customers);
            case 'customer-acquisition':
                return this.generateCustomerAcquisitionData(customers);
            case 'customer-lifetime-value':
                return this.generateCustomerLifetimeValueData(customers, sales);
            case 'lead-conversion':
                return this.generateLeadConversionData(leads, deals);
            case 'lead-sources':
                return this.generateLeadSourcesData(leads);
            case 'lead-response-time':
                return this.generateLeadResponseTimeData(leads);
            case 'lead-pipeline':
                return this.generateLeadPipelineData(leads);
            default:
                return { error: 'Unknown report type' };
        }
    },
    
    // Generate Sales Summary Data
    generateSalesSummaryData: function(sales, deals) {
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
        const avgSaleAmount = totalSales > 0 ? totalRevenue / totalSales : 0;
        const totalDeals = deals.length;
        const completedDeals = deals.filter(deal => deal.status === 'Completed').length;
        const conversionRate = totalDeals > 0 ? (completedDeals / totalDeals * 100) : 0;
        
        return {
            totalSales,
            totalRevenue,
            avgSaleAmount,
            totalDeals,
            completedDeals,
            conversionRate: conversionRate.toFixed(1),
            salesByMonth: this.groupSalesByMonth(sales)
        };
    },
    
    // Generate Monthly Sales Data
    generateMonthlySalesData: function(sales, deals) {
        const salesByMonth = this.groupSalesByMonth(sales);
        const dealsByMonth = this.groupDealsByMonth(deals);
        
        return {
            salesByMonth,
            dealsByMonth,
            trend: this.calculateTrend(salesByMonth)
        };
    },
    
    // Generate Salesperson Performance Data
    generateSalespersonPerformanceData: function(sales, deals) {
        const salespeople = {};
        
        // Process sales
        sales.forEach(sale => {
            const salesperson = sale.salesperson || 'Unknown';
            if (!salespeople[salesperson]) {
                salespeople[salesperson] = {
                    name: salesperson,
                    sales: 0,
                    revenue: 0,
                    deals: 0
                };
            }
            salespeople[salesperson].sales++;
            salespeople[salesperson].revenue += sale.amount || 0;
        });
        
        // Process deals
        deals.forEach(deal => {
            const salesperson = deal.salesperson || 'Unknown';
            if (!salespeople[salesperson]) {
                salespeople[salesperson] = {
                    name: salesperson,
                    sales: 0,
                    revenue: 0,
                    deals: 0
                };
            }
            salespeople[salesperson].deals++;
        });
        
        // Convert to array and sort by revenue
        const performanceData = Object.values(salespeople)
            .sort((a, b) => b.revenue - a.revenue);
        
        return { performanceData };
    },
    
    // Generate Deal Pipeline Data
    generateDealPipelineData: function(deals) {
        const pipeline = {};
        let totalValue = 0;
        
        deals.forEach(deal => {
            const stage = deal.stage || 'Unknown';
            if (!pipeline[stage]) {
                pipeline[stage] = {
                    stage,
                    count: 0,
                    value: 0,
                    deals: []
                };
            }
            pipeline[stage].count++;
            pipeline[stage].value += deal.amount || 0;
            pipeline[stage].deals.push(deal);
            totalValue += deal.amount || 0;
        });
        
        return {
            pipeline: Object.values(pipeline),
            totalValue,
            totalDeals: deals.length
        };
    },
    
    // Generate Revenue Forecast Data
    generateRevenueForecastData: function(deals) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let forecastRevenue = 0;
        let highProbabilityRevenue = 0;
        let mediumProbabilityRevenue = 0;
        let lowProbabilityRevenue = 0;
        
        deals.forEach(deal => {
            const dealValue = deal.amount || 0;
            
            // Simple probability based on stage
            switch (deal.stage) {
                case 'Negotiation':
                case 'Closing':
                    highProbabilityRevenue += dealValue * 0.8;
                    break;
                case 'Proposal':
                case 'Qualified':
                    mediumProbabilityRevenue += dealValue * 0.5;
                    break;
                default:
                    lowProbabilityRevenue += dealValue * 0.2;
                    break;
            }
        });
        
        forecastRevenue = highProbabilityRevenue + mediumProbabilityRevenue + lowProbabilityRevenue;
        
        return {
            forecastRevenue,
            highProbabilityRevenue,
            mediumProbabilityRevenue,
            lowProbabilityRevenue,
            totalDeals: deals.length
        };
    },
    
    // Generate Inventory Summary Data
    generateInventorySummaryData: function(inventory) {
        const summary = {
            totalVehicles: inventory.length,
            byMake: {},
            byStatus: {},
            byPriceRange: {
                'Under $20k': 0,
                '$20k - $30k': 0,
                '$30k - $50k': 0,
                'Over $50k': 0
            },
            totalValue: 0
        };
        
        inventory.forEach(vehicle => {
            // By make
            const make = vehicle.make || 'Unknown';
            summary.byMake[make] = (summary.byMake[make] || 0) + 1;
            
            // By status
            const status = vehicle.status || 'Unknown';
            summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
            
            // By price range
            const price = vehicle.price || 0;
            if (price < 20000) {
                summary.byPriceRange['Under $20k']++;
            } else if (price < 30000) {
                summary.byPriceRange['$20k - $30k']++;
            } else if (price < 50000) {
                summary.byPriceRange['$30k - $50k']++;
            } else {
                summary.byPriceRange['Over $50k']++;
            }
            
            summary.totalValue += price;
        });
        
        return summary;
    },
    
    // Generate Aging Inventory Data
    generateAgingInventoryData: function(inventory) {
        const aging = {
            '0-30 days': 0,
            '31-60 days': 0,
            '61-90 days': 0,
            '90+ days': 0
        };
        
        const now = new Date();
        
        inventory.forEach(vehicle => {
            const dateAdded = new Date(vehicle.dateAdded);
            const daysOnLot = Math.floor((now - dateAdded) / (1000 * 60 * 60 * 24));
            
            if (daysOnLot <= 30) {
                aging['0-30 days']++;
            } else if (daysOnLot <= 60) {
                aging['31-60 days']++;
            } else if (daysOnLot <= 90) {
                aging['61-90 days']++;
            } else {
                aging['90+ days']++;
            }
        });
        
        return { aging, totalVehicles: inventory.length };
    },
    
    // Generate Customer Demographics Data
    generateCustomerDemographicsData: function(customers) {
        const demographics = {
            totalCustomers: customers.length,
            byState: {},
            byCity: {},
            newThisMonth: 0
        };
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        customers.forEach(customer => {
            // By state
            const state = customer.address?.state || 'Unknown';
            demographics.byState[state] = (demographics.byState[state] || 0) + 1;
            
            // By city
            const city = customer.address?.city || 'Unknown';
            demographics.byCity[city] = (demographics.byCity[city] || 0) + 1;
            
            // New this month
            const dateAdded = new Date(customer.dateAdded);
            if (dateAdded.getMonth() === currentMonth && dateAdded.getFullYear() === currentYear) {
                demographics.newThisMonth++;
            }
        });
        
        return demographics;
    },
    
    // Generate Lead Conversion Data
    generateLeadConversionData: function(leads, deals) {
        const totalLeads = leads.length;
        const convertedLeads = deals.length; // Assuming each deal came from a lead
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100) : 0;
        
        const conversionBySource = {};
        const conversionByStatus = {};
        
        leads.forEach(lead => {
            const source = lead.source || 'Unknown';
            if (!conversionBySource[source]) {
                conversionBySource[source] = { total: 0, converted: 0 };
            }
            conversionBySource[source].total++;
            
            const status = lead.status || 'Unknown';
            if (!conversionByStatus[status]) {
                conversionByStatus[status] = { total: 0, converted: 0 };
            }
            conversionByStatus[status].total++;
        });
        
        return {
            totalLeads,
            convertedLeads,
            conversionRate: conversionRate.toFixed(1),
            conversionBySource,
            conversionByStatus
        };
    },
    
    // Generate Lead Sources Data
    generateLeadSourcesData: function(leads) {
        const sources = {};
        
        leads.forEach(lead => {
            const source = lead.source || 'Unknown';
            sources[source] = (sources[source] || 0) + 1;
        });
        
        return {
            sources,
            totalLeads: leads.length
        };
    },
    
    // Generate Lead Pipeline Data
    generateLeadPipelineData: function(leads) {
        const pipeline = {};
        
        leads.forEach(lead => {
            const status = lead.status || 'Unknown';
            if (!pipeline[status]) {
                pipeline[status] = {
                    status,
                    count: 0,
                    leads: []
                };
            }
            pipeline[status].count++;
            pipeline[status].leads.push(lead);
        });
        
        return {
            pipeline: Object.values(pipeline),
            totalLeads: leads.length
        };
    },
    
    // Generate Inventory Turnover Data
    generateInventoryTurnoverData: function(inventory, sales) {
        const turnoverData = {
            totalInventory: inventory.length,
            soldThisMonth: 0,
            turnoverRate: 0,
            byMake: {},
            avgDaysOnLot: 0
        };
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Calculate sold this month
        sales.forEach(sale => {
            const saleDate = new Date(sale.date || sale.dateAdded);
            if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
                turnoverData.soldThisMonth++;
            }
        });
        
        // Calculate turnover rate (sold this month / total inventory)
        turnoverData.turnoverRate = inventory.length > 0 ? 
            ((turnoverData.soldThisMonth / inventory.length) * 100).toFixed(1) : 0;
        
        // Calculate average days on lot and turnover by make
        let totalDays = 0;
        inventory.forEach(vehicle => {
            const dateAdded = new Date(vehicle.dateAdded);
            const daysOnLot = Math.floor((now - dateAdded) / (1000 * 60 * 60 * 24));
            totalDays += daysOnLot;
            
            const make = vehicle.make || 'Unknown';
            if (!turnoverData.byMake[make]) {
                turnoverData.byMake[make] = {
                    count: 0,
                    avgDays: 0,
                    totalDays: 0
                };
            }
            turnoverData.byMake[make].count++;
            turnoverData.byMake[make].totalDays += daysOnLot;
        });
        
        turnoverData.avgDaysOnLot = inventory.length > 0 ? 
            Math.round(totalDays / inventory.length) : 0;
        
        // Calculate average days by make
        Object.keys(turnoverData.byMake).forEach(make => {
            const makeData = turnoverData.byMake[make];
            makeData.avgDays = Math.round(makeData.totalDays / makeData.count);
        });
        
        return turnoverData;
    },
    
    // Generate Popular Vehicles Data
    generatePopularVehiclesData: function(inventory, leads) {
        const popularity = {};
        
        // Count interest from leads
        leads.forEach(lead => {
            const interest = lead.interest || 'Unknown';
            popularity[interest] = (popularity[interest] || 0) + 1;
        });
        
        // Add inventory data
        inventory.forEach(vehicle => {
            const key = `${vehicle.make} ${vehicle.model}`;
            if (!popularity[key]) {
                popularity[key] = 0;
            }
        });
        
        // Convert to array and sort
        const popularVehicles = Object.entries(popularity)
            .map(([vehicle, interest]) => ({ vehicle, interest }))
            .sort((a, b) => b.interest - a.interest)
            .slice(0, 10); // Top 10
        
        return {
            popularVehicles,
            totalInterest: Object.values(popularity).reduce((sum, count) => sum + count, 0)
        };
    },
    
    // Generate Customer Acquisition Data
    generateCustomerAcquisitionData: function(customers) {
        const acquisition = {
            totalCustomers: customers.length,
            newThisMonth: 0,
            newLastMonth: 0,
            growthRate: 0,
            byMonth: {}
        };
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        customers.forEach(customer => {
            const dateAdded = new Date(customer.dateAdded);
            const month = dateAdded.getMonth();
            const year = dateAdded.getFullYear();
            const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
            
            // Count by month
            acquisition.byMonth[monthKey] = (acquisition.byMonth[monthKey] || 0) + 1;
            
            // Count new this month
            if (month === currentMonth && year === currentYear) {
                acquisition.newThisMonth++;
            }
            
            // Count new last month
            if (month === lastMonth && year === lastMonthYear) {
                acquisition.newLastMonth++;
            }
        });
        
        // Calculate growth rate
        if (acquisition.newLastMonth > 0) {
            acquisition.growthRate = (((acquisition.newThisMonth - acquisition.newLastMonth) / acquisition.newLastMonth) * 100).toFixed(1);
        }
        
        return acquisition;
    },
    
    // Generate Customer Lifetime Value Data
    generateCustomerLifetimeValueData: function(customers, sales) {
        const clvData = {
            totalCustomers: customers.length,
            totalRevenue: 0,
            avgCustomerValue: 0,
            repeatCustomers: 0,
            customerValues: []
        };
        
        const customerSales = {};
        
        // Group sales by customer
        sales.forEach(sale => {
            const customerId = sale.customerId;
            if (!customerSales[customerId]) {
                customerSales[customerId] = {
                    customerId,
                    totalSpent: 0,
                    purchaseCount: 0
                };
            }
            customerSales[customerId].totalSpent += sale.amount || 0;
            customerSales[customerId].purchaseCount++;
            clvData.totalRevenue += sale.amount || 0;
        });
        
        // Calculate customer values
        customers.forEach(customer => {
            const customerData = customerSales[customer.id] || { totalSpent: 0, purchaseCount: 0 };
            clvData.customerValues.push({
                customerId: customer.id,
                customerName: `${customer.firstName} ${customer.lastName}`,
                totalSpent: customerData.totalSpent,
                purchaseCount: customerData.purchaseCount
            });
            
            if (customerData.purchaseCount > 1) {
                clvData.repeatCustomers++;
            }
        });
        
        // Sort by total spent
        clvData.customerValues.sort((a, b) => b.totalSpent - a.totalSpent);
        
        // Calculate average customer value
        clvData.avgCustomerValue = customers.length > 0 ? 
            clvData.totalRevenue / customers.length : 0;
        
        return clvData;
    },
    
    // Generate Lead Response Time Data
    generateLeadResponseTimeData: function(leads) {
        const responseData = {
            totalLeads: leads.length,
            avgResponseTime: 0,
            responseRanges: {
                'Under 1 hour': 0,
                '1-4 hours': 0,
                '4-24 hours': 0,
                'Over 24 hours': 0,
                'No response': 0
            }
        };
        
        let totalResponseTime = 0;
        let responsesCount = 0;
        
        leads.forEach(lead => {
            // Simulate response time data (in a real app, this would be tracked)
            const responseTime = Math.random() * 48; // Random hours between 0-48
            
            if (responseTime < 1) {
                responseData.responseRanges['Under 1 hour']++;
            } else if (responseTime < 4) {
                responseData.responseRanges['1-4 hours']++;
            } else if (responseTime < 24) {
                responseData.responseRanges['4-24 hours']++;
            } else if (responseTime < 48) {
                responseData.responseRanges['Over 24 hours']++;
            } else {
                responseData.responseRanges['No response']++;
            }
            
            if (responseTime < 48) {
                totalResponseTime += responseTime;
                responsesCount++;
            }
        });
        
        responseData.avgResponseTime = responsesCount > 0 ? 
            (totalResponseTime / responsesCount).toFixed(1) : 0;
        
        return responseData;
    },
    
    // Helper function to group sales by month
    groupSalesByMonth: function(sales) {
        const months = {};
        
        sales.forEach(sale => {
            const date = new Date(sale.date || sale.dateAdded);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!months[monthKey]) {
                months[monthKey] = { count: 0, revenue: 0 };
            }
            months[monthKey].count++;
            months[monthKey].revenue += sale.amount || 0;
        });
        
        return months;
    },
    
    // Helper function to group deals by month
    groupDealsByMonth: function(deals) {
        const months = {};
        
        deals.forEach(deal => {
            const date = new Date(deal.dateAdded);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!months[monthKey]) {
                months[monthKey] = { count: 0, value: 0 };
            }
            months[monthKey].count++;
            months[monthKey].value += deal.amount || 0;
        });
        
        return months;
    },
    
    // Get report title
    getReportTitle: function(reportType) {
        const titles = {
            'sales-summary': 'Sales Summary Report',
            'monthly-sales': 'Monthly Sales Trend Report',
            'salesperson-performance': 'Salesperson Performance Report',
            'deal-pipeline': 'Deal Pipeline Report',
            'revenue-forecast': 'Revenue Forecast Report',
            'inventory-summary': 'Inventory Summary Report',
            'aging-inventory': 'Aging Inventory Report',
            'inventory-turnover': 'Inventory Turnover Report',
            'popular-vehicles': 'Popular Vehicles Report',
            'customer-demographics': 'Customer Demographics Report',
            'customer-acquisition': 'Customer Acquisition Report',
            'customer-lifetime-value': 'Customer Lifetime Value Report',
            'lead-conversion': 'Lead Conversion Report',
            'lead-sources': 'Lead Sources Report',
            'lead-response-time': 'Lead Response Time Report',
            'lead-pipeline': 'Lead Pipeline Report'
        };
        
        return titles[reportType] || 'Report';
    },
    
    // Generate HTML for report display
    generateReportHtml: function(reportType, data) {
        if (data.error) {
            return `<div class="error">Error: ${data.error}</div>`;
        }
        
        switch (reportType) {
            case 'sales-summary':
                return this.generateSalesSummaryHtml(data);
            case 'inventory-summary':
                return this.generateInventorySummaryHtml(data);
            case 'customer-demographics':
                return this.generateCustomerDemographicsHtml(data);
            case 'lead-conversion':
                return this.generateLeadConversionHtml(data);
            case 'deal-pipeline':
                return this.generateDealPipelineHtml(data);
            case 'salesperson-performance':
                return this.generateSalespersonPerformanceHtml(data);
            default:
                return this.generateGenericReportHtml(reportType, data);
        }
    },
    
    // Generate Sales Summary HTML
    generateSalesSummaryHtml: function(data) {
        return `
            <div class="report-summary">
                <div class="report-stats">
                    <div class="stat-item">
                        <h3>${data.totalSales}</h3>
                        <p>Total Sales</p>
                    </div>
                    <div class="stat-item">
                        <h3>$${data.totalRevenue.toLocaleString()}</h3>
                        <p>Total Revenue</p>
                    </div>
                    <div class="stat-item">
                        <h3>$${data.avgSaleAmount.toLocaleString()}</h3>
                        <p>Average Sale</p>
                    </div>
                    <div class="stat-item">
                        <h3>${data.conversionRate}%</h3>
                        <p>Conversion Rate</p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>Sales by Month</h3>
                    <div class="table-wrapper">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Sales Count</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(data.salesByMonth).map(([month, stats]) => `
                                    <tr>
                                        <td>${month}</td>
                                        <td>${stats.count}</td>
                                        <td>$${stats.revenue.toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Generate Inventory Summary HTML
    generateInventorySummaryHtml: function(data) {
        return `
            <div class="report-summary">
                <div class="report-stats">
                    <div class="stat-item">
                        <h3>${data.totalVehicles}</h3>
                        <p>Total Vehicles</p>
                    </div>
                    <div class="stat-item">
                        <h3>$${data.totalValue.toLocaleString()}</h3>
                        <p>Total Value</p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>Vehicles by Make</h3>
                    <div class="table-wrapper">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Make</th>
                                    <th>Count</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(data.byMake).map(([make, count]) => `
                                    <tr>
                                        <td>${make}</td>
                                        <td>${count}</td>
                                        <td>${((count / data.totalVehicles) * 100).toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>Vehicles by Price Range</h3>
                    <div class="table-wrapper">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Price Range</th>
                                    <th>Count</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(data.byPriceRange).map(([range, count]) => `
                                    <tr>
                                        <td>${range}</td>
                                        <td>${count}</td>
                                        <td>${((count / data.totalVehicles) * 100).toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Generate Customer Demographics HTML
    generateCustomerDemographicsHtml: function(data) {
        return `
            <div class="report-summary">
                <div class="report-stats">
                    <div class="stat-item">
                        <h3>${data.totalCustomers}</h3>
                        <p>Total Customers</p>
                    </div>
                    <div class="stat-item">
                        <h3>${data.newThisMonth}</h3>
                        <p>New This Month</p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>Customers by State</h3>
                    <div class="table-wrapper">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>State</th>
                                    <th>Count</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(data.byState).map(([state, count]) => `
                                    <tr>
                                        <td>${state}</td>
                                        <td>${count}</td>
                                        <td>${((count / data.totalCustomers) * 100).toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>Customers by City</h3>
                    <div class="table-wrapper">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>City</th>
                                    <th>Count</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(data.byCity).map(([city, count]) => `
                                    <tr>
                                        <td>${city}</td>
                                        <td>${count}</td>
                                        <td>${((count / data.totalCustomers) * 100).toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Generate Lead Conversion HTML
    generateLeadConversionHtml: function(data) {
        return `
            <div class="report-summary">
                <div class="report-stats">
                    <div class="stat-item">
                        <h3>${data.totalLeads}</h3>
                        <p>Total Leads</p>
                    </div>
                    <div class="stat-item">
                        <h3>${data.convertedLeads}</h3>
                        <p>Converted Leads</p>
                    </div>
                    <div class="stat-item">
                        <h3>${data.conversionRate}%</h3>
                        <p>Conversion Rate</p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>Conversion by Source</h3>
                    <div class="table-wrapper">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Source</th>
                                    <th>Total Leads</th>
                                    <th>Converted</th>
                                    <th>Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(data.conversionBySource).map(([source, stats]) => `
                                    <tr>
                                        <td>${source}</td>
                                        <td>${stats.total}</td>
                                        <td>${stats.converted}</td>
                                        <td>${stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : 0}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Generate Deal Pipeline HTML
    generateDealPipelineHtml: function(data) {
        return `
            <div class="report-summary">
                <div class="report-stats">
                    <div class="stat-item">
                        <h3>${data.totalDeals}</h3>
                        <p>Total Deals</p>
                    </div>
                    <div class="stat-item">
                        <h3>$${data.totalValue.toLocaleString()}</h3>
                        <p>Total Pipeline Value</p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>Deals by Stage</h3>
                    <div class="table-wrapper">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Stage</th>
                                    <th>Count</th>
                                    <th>Value</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.pipeline.map(stage => `
                                    <tr>
                                        <td>${stage.stage}</td>
                                        <td>${stage.count}</td>
                                        <td>$${stage.value.toLocaleString()}</td>
                                        <td>${((stage.count / data.totalDeals) * 100).toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Generate Salesperson Performance HTML
    generateSalespersonPerformanceHtml: function(data) {
        return `
            <div class="report-summary">
                <div class="report-section">
                    <h3>Salesperson Performance Rankings</h3>
                    <div class="table-wrapper">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Salesperson</th>
                                    <th>Sales</th>
                                    <th>Revenue</th>
                                    <th>Active Deals</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.performanceData.map((person, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${person.name}</td>
                                        <td>${person.sales}</td>
                                        <td>$${person.revenue.toLocaleString()}</td>
                                        <td>${person.deals}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Generate generic report HTML for other report types
    generateGenericReportHtml: function(reportType, data) {
        return `
            <div class="report-summary">
                <div class="report-section">
                    <h3>${this.getReportTitle(reportType)}</h3>
                    <p>This report contains sample data for demonstration purposes.</p>
                    <div class="sample-data">
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Close report modal
    closeReportModal: function() {
        const modal = document.getElementById('report-modal');
        modal.style.display = 'none';
        this.currentReportType = null;
        this.currentReportData = null;
    },
    
    // Export specific report
    exportReport: function(reportType) {
        const reportData = this.generateReportData(reportType);
        const reportTitle = this.getReportTitle(reportType);
        
        // Create CSV content
        const csvContent = this.generateCsvContent(reportType, reportData);
        
        // Download CSV
        this.downloadCsv(csvContent, `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    },
    
    // Export current report from modal
    exportCurrentReport: function() {
        if (this.currentReportType && this.currentReportData) {
            this.exportReport(this.currentReportType);
        }
    },
    
    // Print current report from modal
    printCurrentReport: function() {
        const reportContent = document.getElementById('report-content');
        if (reportContent) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${this.getReportTitle(this.currentReportType)}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .report-stats { display: flex; gap: 20px; margin-bottom: 30px; }
                            .stat-item { text-align: center; }
                            .stat-item h3 { margin: 0; font-size: 24px; color: #333; }
                            .stat-item p { margin: 5px 0 0 0; color: #666; }
                            .report-section { margin-bottom: 30px; }
                            .report-section h3 { border-bottom: 2px solid #333; padding-bottom: 5px; }
                            .report-table { width: 100%; border-collapse: collapse; }
                            .report-table th, .report-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            .report-table th { background-color: #f5f5f5; }
                        </style>
                    </head>
                    <body>
                        <h1>${this.getReportTitle(this.currentReportType)}</h1>
                        <p>Generated on: ${new Date().toLocaleDateString()}</p>
                        ${reportContent.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    },
    
    // Generate CSV content for export
    generateCsvContent: function(reportType, data) {
        // This is a simplified CSV generation - in a real app you'd want more sophisticated handling
        let csv = `Report: ${this.getReportTitle(reportType)}\n`;
        csv += `Generated: ${new Date().toISOString()}\n\n`;
        
        // Add data based on report type
        if (data.totalSales !== undefined) {
            csv += `Total Sales,${data.totalSales}\n`;
            csv += `Total Revenue,${data.totalRevenue}\n`;
            csv += `Conversion Rate,${data.conversionRate}%\n`;
        }
        
        return csv;
    },
    
    // Download CSV file
    downloadCsv: function(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    // Export all reports
    exportAllReports: function() {
        const allData = {
            exportDate: new Date().toISOString(),
            salesSummary: this.generateReportData('sales-summary'),
            inventorySummary: this.generateReportData('inventory-summary'),
            customerDemographics: this.generateReportData('customer-demographics'),
            leadConversion: this.generateReportData('lead-conversion')
        };
        
        const jsonContent = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `AutoConnect_Reports_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Make ReportsManager globally available
window.ReportsManager = ReportsManager;