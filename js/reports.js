// Reports functionality for TheOnePages
// Handles report display, filtering, and generation

const ReportsManager = {
    currentFilter: 'all',
    currentSort: 'dateCreated',
    
    init: function() {
        this.loadReports();
        this.setupEventListeners();
        this.setupFilters();
    },
    
    setupEventListeners: function() {
        // Category filter buttons
        document.querySelectorAll('.category-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
            });
        });
        
        // Sort dropdown
        const sortSelect = document.getElementById('sort-reports');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortReports(e.target.value);
            });
        }
        
        // Generate report buttons
        document.querySelectorAll('.generate-report-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.generateReport(e.target.dataset.reportType);
            });
        });
        
        // View report buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-report-btn')) {
                this.viewReport(e.target.dataset.reportId);
            }
        });
        
        // Delete report buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-report-btn')) {
                this.deleteReport(e.target.dataset.reportId);
            }
        });
    },
    
    setupFilters: function() {
        const categories = DataService.reports.getCategories();
        const filterContainer = document.querySelector('.category-filters');
        
        if (filterContainer && categories.length > 0) {
            let filtersHTML = '<button class="category-filter active" data-category="all">All Reports</button>';
            categories.forEach(category => {
                filtersHTML += `<button class="category-filter" data-category="${category}">${category}</button>`;
            });
            filterContainer.innerHTML = filtersHTML;
        }
    },
    
    loadReports: function() {
        const reports = DataService.reports.getAll();
        this.displayReports(reports);
        this.updateReportStats(reports);
    },
    
    displayReports: function(reports) {
        const container = document.getElementById('reports-container');
        if (!container) return;
        
        if (reports.length === 0) {
            container.innerHTML = `
                <div class="no-reports">
                    <i class="fas fa-chart-bar"></i>
                    <h3>No Reports Found</h3>
                    <p>No reports match your current filter criteria.</p>
                </div>
            `;
            return;
        }
        
        const reportsHTML = reports.map(report => this.createReportCard(report)).join('');
        container.innerHTML = reportsHTML;
    },
    
    createReportCard: function(report) {
        const lastGenerated = report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : 'Never';
        const nextScheduled = report.nextScheduled ? new Date(report.nextScheduled).toLocaleDateString() : 'N/A';
        
        const statusClass = report.status === 'Active' ? 'status-active' : 'status-inactive';
        const typeIcon = this.getTypeIcon(report.type);
        const categoryColor = this.getCategoryColor(report.category);
        
        return `
            <div class="report-card" data-category="${report.category}">
                <div class="report-header">
                    <div class="report-title-section">
                        <h3 class="report-title">${report.title}</h3>
                        <span class="report-category" style="background-color: ${categoryColor}">${report.category}</span>
                    </div>
                    <div class="report-actions">
                        <button class="btn btn-sm btn-primary view-report-btn" data-report-id="${report.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-secondary generate-report-btn" data-report-type="${report.type}" data-report-id="${report.id}">
                            <i class="fas fa-sync"></i> Generate
                        </button>
                        <button class="btn btn-sm btn-danger delete-report-btn" data-report-id="${report.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="report-description">
                    <p>${report.description}</p>
                </div>
                
                <div class="report-details">
                    <div class="report-detail">
                        <i class="${typeIcon}"></i>
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${report.type} (${report.frequency})</span>
                    </div>
                    <div class="report-detail">
                        <i class="fas fa-calendar-check"></i>
                        <span class="detail-label">Last Generated:</span>
                        <span class="detail-value">${lastGenerated}</span>
                    </div>
                    <div class="report-detail">
                        <i class="fas fa-calendar-plus"></i>
                        <span class="detail-label">Next Scheduled:</span>
                        <span class="detail-value">${nextScheduled}</span>
                    </div>
                    <div class="report-detail">
                        <i class="fas fa-user"></i>
                        <span class="detail-label">Created By:</span>
                        <span class="detail-value">${report.createdBy}</span>
                    </div>
                </div>
                
                <div class="report-footer">
                    <span class="report-status ${statusClass}">${report.status}</span>
                    <span class="report-date">Created: ${new Date(report.dateCreated).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    },
    
    getTypeIcon: function(type) {
        const icons = {
            'scheduled': 'fas fa-clock',
            'on-demand': 'fas fa-play',
            'dynamic': 'fas fa-bolt'
        };
        return icons[type] || 'fas fa-file-alt';
    },
    
    getCategoryColor: function(category) {
        const colors = {
            'Sales': '#10b981',
            'Inventory': '#3b82f6',
            'Marketing': '#f59e0b',
            'Customer Service': '#8b5cf6',
            'Financial': '#ef4444',
            'Service': '#06b6d4',
            'HR': '#84cc16',
            'Market Research': '#f97316'
        };
        return colors[category] || '#6b7280';
    },
    
    filterByCategory: function(category) {
        this.currentFilter = category;
        
        // Update active filter button
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Filter reports
        let reports = DataService.reports.getAll();
        if (category !== 'all') {
            reports = reports.filter(report => report.category === category);
        }
        
        this.displayReports(reports);
    },
    
    sortReports: function(sortBy) {
        this.currentSort = sortBy;
        let reports = DataService.reports.getAll();
        
        // Apply current filter
        if (this.currentFilter !== 'all') {
            reports = reports.filter(report => report.category === this.currentFilter);
        }
        
        // Sort reports
        reports.sort((a, b) => {
            switch(sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'lastGenerated':
                    return new Date(b.lastGenerated || 0) - new Date(a.lastGenerated || 0);
                case 'dateCreated':
                default:
                    return new Date(b.dateCreated) - new Date(a.dateCreated);
            }
        });
        
        this.displayReports(reports);
    },
    
    generateReport: function(reportType, reportId = null) {
        if (reportId) {
            const report = DataService.reports.get(reportId);
            if (report) {
                // Update last generated timestamp
                DataService.reports.update(reportId, {
                    lastGenerated: new Date().toISOString()
                });
                
                this.showNotification(`Report "${report.title}" has been generated successfully!`, 'success');
                this.loadReports(); // Refresh the display
            }
        } else {
            // Generate dynamic reports
            let generatedReport;
            switch(reportType) {
                case 'sales':
                    generatedReport = DataService.reports.generateSalesReport();
                    break;
                case 'inventory':
                    generatedReport = DataService.reports.generateInventoryReport();
                    break;
                default:
                    this.showNotification('Unknown report type', 'error');
                    return;
            }
            
            if (generatedReport) {
                this.viewDynamicReport(generatedReport);
            }
        }
    },
    
    viewReport: function(reportId) {
        const report = DataService.reports.get(reportId);
        if (!report) {
            this.showNotification('Report not found', 'error');
            return;
        }
        
        // For now, show a modal with report details
        // In a real application, this would open a detailed report view
        this.showReportModal(report);
    },
    
    viewDynamicReport: function(report) {
        this.showDynamicReportModal(report);
    },
    
    deleteReport: function(reportId) {
        if (confirm('Are you sure you want to delete this report?')) {
            const success = DataService.reports.delete(reportId);
            if (success) {
                this.showNotification('Report deleted successfully', 'success');
                this.loadReports();
            } else {
                this.showNotification('Failed to delete report', 'error');
            }
        }
    },
    
    showReportModal: function(report) {
        const modalHTML = `
            <div class="modal-overlay" id="report-modal">
                <div class="modal-content report-modal">
                    <div class="modal-header">
                        <h2>${report.title}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="report-info">
                            <div class="info-row">
                                <strong>Category:</strong> ${report.category}
                            </div>
                            <div class="info-row">
                                <strong>Type:</strong> ${report.type} (${report.frequency})
                            </div>
                            <div class="info-row">
                                <strong>Status:</strong> ${report.status}
                            </div>
                            <div class="info-row">
                                <strong>Created By:</strong> ${report.createdBy}
                            </div>
                            <div class="info-row">
                                <strong>Last Generated:</strong> ${report.lastGenerated ? new Date(report.lastGenerated).toLocaleString() : 'Never'}
                            </div>
                        </div>
                        <div class="report-description">
                            <h3>Description</h3>
                            <p>${report.description}</p>
                        </div>
                        <div class="report-parameters">
                            <h3>Parameters</h3>
                            <pre>${JSON.stringify(report.parameters, null, 2)}</pre>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary generate-report-btn" data-report-id="${report.id}">Generate Now</button>
                        <button class="btn btn-secondary modal-close">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupModalEvents();
    },
    
    showDynamicReportModal: function(report) {
        let dataHTML = '';
        
        if (report.category === 'Sales') {
            dataHTML = `
                <div class="report-stats">
                    <div class="stat-card">
                        <h4>Total Revenue</h4>
                        <p class="stat-value">$${report.data.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Total Deals</h4>
                        <p class="stat-value">${report.data.totalDeals}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Average Deal Size</h4>
                        <p class="stat-value">$${report.data.avgDealSize.toLocaleString()}</p>
                    </div>
                </div>
            `;
        } else if (report.category === 'Inventory') {
            dataHTML = `
                <div class="report-stats">
                    <div class="stat-card">
                        <h4>Total Vehicles</h4>
                        <p class="stat-value">${report.data.totalVehicles}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Available</h4>
                        <p class="stat-value">${report.data.availableVehicles}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Average Price</h4>
                        <p class="stat-value">$${report.data.avgPrice.toLocaleString()}</p>
                    </div>
                </div>
                <div class="make-breakdown">
                    <h4>Inventory by Make</h4>
                    ${Object.entries(report.data.makeBreakdown).map(([make, count]) => 
                        `<div class="breakdown-item">${make}: ${count} vehicles</div>`
                    ).join('')}
                </div>
            `;
        }
        
        const modalHTML = `
            <div class="modal-overlay" id="dynamic-report-modal">
                <div class="modal-content report-modal">
                    <div class="modal-header">
                        <h2>${report.title}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="report-info">
                            <div class="info-row">
                                <strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}
                            </div>
                            <div class="info-row">
                                <strong>Category:</strong> ${report.category}
                            </div>
                        </div>
                        ${dataHTML}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="window.print()">Print Report</button>
                        <button class="btn btn-secondary modal-close">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupModalEvents();
    },
    
    setupModalEvents: function() {
        const modal = document.querySelector('.modal-overlay');
        const closeButtons = modal.querySelectorAll('.modal-close');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.remove();
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Setup generate button in modal
        const generateBtn = modal.querySelector('.generate-report-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', (e) => {
                this.generateReport('scheduled', e.target.dataset.reportId);
                modal.remove();
            });
        }
    },
    
    updateReportStats: function(reports) {
        const statsContainer = document.querySelector('.reports-stats');
        if (!statsContainer) return;
        
        const totalReports = reports.length;
        const activeReports = reports.filter(r => r.status === 'Active').length;
        const scheduledReports = reports.filter(r => r.type === 'scheduled').length;
        const categories = [...new Set(reports.map(r => r.category))].length;
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${totalReports}</div>
                <div class="stat-label">Total Reports</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${activeReports}</div>
                <div class="stat-label">Active Reports</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${scheduledReports}</div>
                <div class="stat-label">Scheduled Reports</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${categories}</div>
                <div class="stat-label">Categories</div>
            </div>
        `;
    },
    
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data service first
    DataService.initAll();
    
    // Then initialize reports manager
    ReportsManager.init();
});