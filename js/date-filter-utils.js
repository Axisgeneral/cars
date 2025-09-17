// Date filtering utilities for TheOnePages
// This module provides date range filtering functionality for all data types

const DateFilterUtils = {
    // Get date range based on filter option
    getDateRange: function(filterOption) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filterOption) {
            case 'Today':
                return {
                    start: today,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
                };
                
            case 'Yesterday':
                const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                return {
                    start: yesterday,
                    end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
                };
                
            case 'Last 7 Days':
                return {
                    start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
                    end: now
                };
                
            case 'This Month':
                return {
                    start: new Date(now.getFullYear(), now.getMonth(), 1),
                    end: now
                };
                
            case 'Last Month':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                return {
                    start: lastMonth,
                    end: lastMonthEnd
                };
                
            case 'All Time':
            default:
                return {
                    start: new Date(2020, 0, 1), // Start from 2020
                    end: now
                };
        }
    },
    
    // Filter array of items by date range
    filterByDateRange: function(items, dateField, filterOption, customStart = null, customEnd = null) {
        if (filterOption === 'All Time') {
            return items;
        }
        
        let dateRange;
        if (filterOption === 'Custom Range' && customStart && customEnd) {
            dateRange = {
                start: new Date(customStart),
                end: new Date(customEnd)
            };
        } else {
            dateRange = this.getDateRange(filterOption);
        }
        
        return items.filter(item => {
            if (!item[dateField]) return false;
            
            const itemDate = new Date(item[dateField]);
            return itemDate >= dateRange.start && itemDate <= dateRange.end;
        });
    },
    
    // Get filtered data for specific data type
    getFilteredData: function(dataType, filterOption, customStart = null, customEnd = null) {
        let items = [];
        let dateField = '';
        
        switch (dataType) {
            case 'inventory':
                items = DataService.inventory.getAll();
                dateField = 'dateAdded';
                break;
            case 'customers':
                items = DataService.customers.getAll();
                dateField = 'dateAdded';
                break;
            case 'leads':
                items = DataService.leads.getAll();
                dateField = 'dateCreated';
                break;
            case 'deals':
                items = DataService.deals.getAll();
                dateField = 'dateCreated';
                break;
            case 'sales':
                items = DataService.sales.getAll();
                dateField = 'saleDate';
                break;
            case 'tasks':
                items = DataService.tasks.getAll();
                dateField = 'dateCreated';
                break;
            default:
                return [];
        }
        
        return this.filterByDateRange(items, dateField, filterOption, customStart, customEnd);
    },
    
    // Calculate statistics for filtered data
    calculateStats: function(dataType, filterOption, customStart = null, customEnd = null) {
        const filteredData = this.getFilteredData(dataType, filterOption, customStart, customEnd);
        
        switch (dataType) {
            case 'deals':
                const totalValue = filteredData.reduce((sum, deal) => sum + (deal.value || 0), 0);
                const closedDeals = filteredData.filter(deal => deal.status === 'Closed Won');
                const closedValue = closedDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
                
                return {
                    total: filteredData.length,
                    totalValue: totalValue,
                    closed: closedDeals.length,
                    closedValue: closedValue,
                    conversionRate: filteredData.length > 0 ? (closedDeals.length / filteredData.length * 100).toFixed(1) : 0
                };
                
            case 'leads':
                const convertedLeads = filteredData.filter(lead => lead.status === 'Converted');
                return {
                    total: filteredData.length,
                    converted: convertedLeads.length,
                    conversionRate: filteredData.length > 0 ? (convertedLeads.length / filteredData.length * 100).toFixed(1) : 0
                };
                
            case 'customers':
            case 'inventory':
            case 'tasks':
            default:
                return {
                    total: filteredData.length
                };
        }
    }
};

// Make DateFilterUtils globally available
window.DateFilterUtils = DateFilterUtils;