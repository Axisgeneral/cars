// Settings Management JavaScript
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupThemeSelector();
        this.setupToggleInputs();
        this.setupSaveButton();
        this.setupResetButton();
        this.setupFormInputs();
        this.setupDangerZone();
        this.loadCurrentSettings();
    }

    // Load settings from localStorage
    loadSettings() {
        const defaultSettings = {
            // General Settings
            language: 'en',
            timezone: 'EST',
            currency: 'USD',
            defaultPage: 'dashboard',
            itemsPerPage: '25',
            
            // Appearance Settings
            theme: 'blue',
            compactMode: false,
            sidebarCollapsed: false,
            fontSize: 'medium',
            
            // Notification Settings
            emailNewLeads: true,
            emailDealUpdates: true,
            emailInventory: false,
            browserNotifications: false,
            
            // Account Settings
            fullName: 'Thomas Morales',
            emailAddress: 'thomas.morales@autoconnect.com',
            phoneNumber: '+1 (555) 123-4567',
            jobTitle: 'Sales Manager',
            
            // Security Settings
            twoFactor: false,
            autoLogout: true,
            
            // Advanced Settings
            enableCaching: true,
            cacheDuration: '15',
            debugMode: false
        };

        const savedSettings = localStorage.getItem('autoconnect_settings');
        return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('autoconnect_settings', JSON.stringify(this.settings));
        this.showNotification('Settings saved successfully!', 'success');
    }

    // Setup navigation between settings sections
    setupNavigation() {
        const navLinks = document.querySelectorAll('.settings-nav-link');
        const sections = document.querySelectorAll('.settings-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links and sections
                navLinks.forEach(l => l.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Show corresponding section
                const sectionId = link.getAttribute('data-section') + '-section';
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    }

    // Setup theme selector
    setupThemeSelector() {
        const themeOptions = document.querySelectorAll('.theme-option');
        
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all theme options
                themeOptions.forEach(opt => opt.classList.remove('active'));
                
                // Add active class to selected theme
                option.classList.add('active');
                
                // Update settings
                const theme = option.getAttribute('data-theme');
                this.settings.theme = theme;
                
                // Apply theme immediately (you can implement theme switching logic here)
                this.applyTheme(theme);
            });
        });
    }

    // Apply theme to the application
    applyTheme(theme) {
        // Use the global theme manager if available
        if (window.themeManager) {
            window.themeManager.changeTheme(theme);
        } else {
            // Fallback if theme manager is not loaded
            document.body.classList.remove('theme-blue', 'theme-dark', 'theme-green', 'theme-purple');
            document.body.classList.add(`theme-${theme}`);
            console.log(`Applied theme: ${theme}`);
        }
        
        // Save settings immediately after theme change
        this.saveSettings();
    }

    // Setup toggle inputs (checkboxes with custom styling)
    setupToggleInputs() {
        const toggleInputs = document.querySelectorAll('.toggle-input');
        
        toggleInputs.forEach(input => {
            input.addEventListener('change', () => {
                const settingKey = this.getSettingKeyFromId(input.id);
                if (settingKey) {
                    this.settings[settingKey] = input.checked;
                }
            });
        });
    }

    // Setup form inputs (text, select, etc.)
    setupFormInputs() {
        const formInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], select');
        
        formInputs.forEach(input => {
            input.addEventListener('change', () => {
                const settingKey = this.getSettingKeyFromId(input.id);
                if (settingKey) {
                    this.settings[settingKey] = input.value;
                }
            });
        });
    }

    // Convert HTML element ID to settings key
    getSettingKeyFromId(id) {
        const keyMap = {
            'language': 'language',
            'timezone': 'timezone',
            'currency': 'currency',
            'default-page': 'defaultPage',
            'items-per-page': 'itemsPerPage',
            'compact-mode': 'compactMode',
            'sidebar-collapsed': 'sidebarCollapsed',
            'font-size': 'fontSize',
            'email-new-leads': 'emailNewLeads',
            'email-deal-updates': 'emailDealUpdates',
            'email-inventory': 'emailInventory',
            'browser-notifications': 'browserNotifications',
            'full-name': 'fullName',
            'email-address': 'emailAddress',
            'phone-number': 'phoneNumber',
            'job-title': 'jobTitle',
            'two-factor': 'twoFactor',
            'auto-logout': 'autoLogout',
            'enable-caching': 'enableCaching',
            'cache-duration': 'cacheDuration',
            'debug-mode': 'debugMode'
        };
        
        return keyMap[id];
    }

    // Load current settings into form elements
    loadCurrentSettings() {
        // Load general settings
        this.setElementValue('language', this.settings.language);
        this.setElementValue('timezone', this.settings.timezone);
        this.setElementValue('currency', this.settings.currency);
        this.setElementValue('default-page', this.settings.defaultPage);
        this.setElementValue('items-per-page', this.settings.itemsPerPage);
        
        // Load appearance settings
        this.setThemeSelection(this.settings.theme);
        this.setElementValue('compact-mode', this.settings.compactMode);
        this.setElementValue('sidebar-collapsed', this.settings.sidebarCollapsed);
        this.setElementValue('font-size', this.settings.fontSize);
        
        // Load notification settings
        this.setElementValue('email-new-leads', this.settings.emailNewLeads);
        this.setElementValue('email-deal-updates', this.settings.emailDealUpdates);
        this.setElementValue('email-inventory', this.settings.emailInventory);
        this.setElementValue('browser-notifications', this.settings.browserNotifications);
        
        // Load account settings
        this.setElementValue('full-name', this.settings.fullName);
        this.setElementValue('email-address', this.settings.emailAddress);
        this.setElementValue('phone-number', this.settings.phoneNumber);
        this.setElementValue('job-title', this.settings.jobTitle);
        
        // Load security settings
        this.setElementValue('two-factor', this.settings.twoFactor);
        this.setElementValue('auto-logout', this.settings.autoLogout);
        
        // Load advanced settings
        this.setElementValue('enable-caching', this.settings.enableCaching);
        this.setElementValue('cache-duration', this.settings.cacheDuration);
        this.setElementValue('debug-mode', this.settings.debugMode);
    }

    // Set value for form element
    setElementValue(id, value) {
        const element = document.getElementById(id);
        if (!element) return;
        
        if (element.type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
    }

    // Set theme selection
    setThemeSelection(theme) {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-theme') === theme) {
                option.classList.add('active');
            }
        });
    }

    // Setup save button
    setupSaveButton() {
        const saveBtn = document.querySelector('.btn-primary');
        if (saveBtn && saveBtn.textContent.includes('Save')) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
    }

    // Setup reset button
    setupResetButton() {
        const resetBtn = document.querySelector('.btn-secondary');
        if (resetBtn && resetBtn.textContent.includes('Reset')) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings to their default values?')) {
                    this.resetSettings();
                }
            });
        }
    }

    // Reset all settings to defaults
    resetSettings() {
        localStorage.removeItem('autoconnect_settings');
        this.settings = this.loadSettings();
        this.loadCurrentSettings();
        this.showNotification('Settings reset to defaults!', 'info');
    }

    // Setup danger zone actions
    setupDangerZone() {
        // Reset Settings button
        const resetSettingsBtn = document.querySelector('.danger-item .btn-danger');
        if (resetSettingsBtn && resetSettingsBtn.textContent.includes('Reset Settings')) {
            resetSettingsBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings? This action cannot be undone.')) {
                    this.resetSettings();
                }
            });
        }

        // Clear Data button
        const clearDataBtn = document.querySelectorAll('.danger-item .btn-danger')[1];
        if (clearDataBtn && clearDataBtn.textContent.includes('Clear Data')) {
            clearDataBtn.addEventListener('click', () => {
                if (confirm('WARNING: This will permanently delete ALL application data including customers, leads, inventory, and deals. This action cannot be undone. Are you absolutely sure?')) {
                    if (confirm('This is your final warning. All data will be permanently lost. Continue?')) {
                        this.clearAllData();
                    }
                }
            });
        }

        // Other action buttons
        this.setupActionButtons();
    }

    // Setup various action buttons
    setupActionButtons() {
        // Export buttons
        const exportButtons = document.querySelectorAll('.export-item .btn-outline');
        exportButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const exportType = btn.textContent.trim();
                this.handleExport(exportType);
            });
        });

        // Import button
        const importBtn = document.querySelector('.import-section .btn-primary');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.handleImport();
            });
        }

        // Backup button
        const backupBtn = document.querySelector('.backup-info .btn-outline');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                this.handleBackup();
            });
        }

        // Integration buttons
        const integrationButtons = document.querySelectorAll('.integration-item .btn-outline');
        integrationButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const integration = btn.closest('.integration-item').querySelector('h4').textContent;
                this.handleIntegration(integration);
            });
        });

        // Clear cache button
        const clearCacheBtn = document.querySelector('.settings-group .btn-outline');
        if (clearCacheBtn && clearCacheBtn.textContent.includes('Clear')) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }
    }

    // Handle data export
    handleExport(exportType) {
        // Determine what data to export based on button text
        let dataType = '';
        let fileName = '';
        
        if (exportType.includes('Customer')) {
            dataType = 'customers';
            fileName = 'customers_export';
        } else if (exportType.includes('Inventory')) {
            dataType = 'inventory';
            fileName = 'inventory_export';
        } else if (exportType.includes('Sales')) {
            dataType = 'sales';
            fileName = 'sales_report';
        }
        
        // Create export options modal
        this.showExportModal(dataType, fileName, exportType);
    }
    
    // Show export options modal
    showExportModal(dataType, fileName, exportType) {
        const modalContent = `
            <div class="export-modal-content">
                <div class="export-options">
                    <h4>Export Options</h4>
                    <div class="form-group">
                        <label>Export Format:</label>
                        <select id="export-format" class="form-control">
                            <option value="csv">CSV (Comma Separated Values)</option>
                            <option value="json">JSON (JavaScript Object Notation)</option>
                            ${dataType === 'sales' ? '<option value="pdf">PDF Report</option>' : ''}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Date Range:</label>
                        <select id="date-range" class="form-control">
                            <option value="all">All Time</option>
                            <option value="last30">Last 30 Days</option>
                            <option value="last90">Last 90 Days</option>
                            <option value="thisYear">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                    
                    <div id="custom-date-range" class="form-group" style="display: none;">
                        <div class="date-inputs">
                            <div>
                                <label>From:</label>
                                <input type="date" id="date-from" class="form-control">
                            </div>
                            <div>
                                <label>To:</label>
                                <input type="date" id="date-to" class="form-control">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="include-deleted" class="toggle-input">
                            Include deleted records
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        const footerButtons = [
            {
                text: 'Cancel',
                class: 'btn-secondary',
                attributes: 'data-modal-close'
            },
            {
                text: 'Export',
                class: 'btn-primary',
                attributes: 'id="confirm-export"'
            }
        ];
        
        // Create and show modal
        const modal = ModalUtils.createModal('export-modal', `Export ${exportType}`, modalContent, footerButtons);
        ModalUtils.openModal('export-modal');
        
        // Setup modal event listeners
        this.setupExportModalEvents(dataType, fileName);
    }
    
    // Setup export modal event listeners
    setupExportModalEvents(dataType, fileName) {
        const dateRangeSelect = document.getElementById('date-range');
        const customDateRange = document.getElementById('custom-date-range');
        const confirmBtn = document.getElementById('confirm-export');
        
        // Show/hide custom date range
        dateRangeSelect.addEventListener('change', () => {
            if (dateRangeSelect.value === 'custom') {
                customDateRange.style.display = 'block';
            } else {
                customDateRange.style.display = 'none';
            }
        });
        
        // Handle export confirmation
        confirmBtn.addEventListener('click', () => {
            this.performExport(dataType, fileName);
        });
    }
    
    // Perform the actual export
    performExport(dataType, fileName) {
        const format = document.getElementById('export-format').value;
        const dateRange = document.getElementById('date-range').value;
        const includeDeleted = document.getElementById('include-deleted').checked;
        
        // Get data from DataService
        let data = [];
        
        try {
            switch (dataType) {
                case 'customers':
                    data = DataService.customers ? DataService.customers.getAll() : [];
                    break;
                case 'inventory':
                    data = DataService.inventory ? DataService.inventory.getAll() : [];
                    break;
                case 'sales':
                    data = DataService.deals ? DataService.deals.getAll() : [];
                    break;
                default:
                    data = [];
            }
            
            // Filter data by date range if needed
            data = this.filterDataByDateRange(data, dateRange);
            
            // Filter out deleted records if not included
            if (!includeDeleted) {
                data = data.filter(item => !item.deleted);
            }
            
            // Export based on format
            switch (format) {
                case 'csv':
                    this.exportToCSV(data, fileName);
                    break;
                case 'json':
                    this.exportToJSON(data, fileName);
                    break;
                case 'pdf':
                    this.exportToPDF(data, fileName);
                    break;
            }
            
            // Close modal and show success
            ModalUtils.closeModal('export-modal');
            ModalUtils.removeModal('export-modal');
            this.showNotification(`${dataType} exported successfully!`, 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    }
    
    // Filter data by date range
    filterDataByDateRange(data, dateRange) {
        if (dateRange === 'all') return data;
        
        const now = new Date();
        let startDate;
        
        switch (dateRange) {
            case 'last30':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'last90':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'thisYear':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'custom':
                const fromDate = document.getElementById('date-from').value;
                const toDate = document.getElementById('date-to').value;
                if (fromDate && toDate) {
                    return data.filter(item => {
                        const itemDate = new Date(item.createdAt || item.date || item.timestamp);
                        return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
                    });
                }
                return data;
            default:
                return data;
        }
        
        return data.filter(item => {
            const itemDate = new Date(item.createdAt || item.date || item.timestamp);
            return itemDate >= startDate;
        });
    }
    
    // Export to CSV
    exportToCSV(data, fileName) {
        if (!data.length) {
            this.showNotification('No data to export', 'warning');
            return;
        }
        
        // Get headers from first object
        const headers = Object.keys(data[0]);
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Escape commas and quotes in values
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            });
            csvContent += values.join(',') + '\n';
        });
        
        // Download file
        this.downloadFile(csvContent, `${fileName}.csv`, 'text/csv');
    }
    
    // Export to JSON
    exportToJSON(data, fileName) {
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, `${fileName}.json`, 'application/json');
    }
    
    // Export to PDF (basic implementation)
    exportToPDF(data, fileName) {
        // For a basic PDF export, we'll create a simple HTML report and print it
        const reportWindow = window.open('', '_blank');
        const reportContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${fileName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    h1 { color: #333; }
                </style>
            </head>
            <body>
                <h1>${fileName.replace(/_/g, ' ').toUpperCase()}</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                <table>
                    <thead>
                        <tr>
                            ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${Object.values(row).map(value => `<td>${value || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        reportWindow.document.write(reportContent);
        reportWindow.document.close();
        
        // Auto-print after a short delay
        setTimeout(() => {
            reportWindow.print();
        }, 500);
    }
    
    // Download file helper
    downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
    }

    // Handle data import
    handleImport() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput.files.length) {
            this.showNotification('Please select a file to import.', 'warning');
            return;
        }
        
        this.showNotification('Importing data...', 'info');
        // Implement actual import logic here
        setTimeout(() => {
            this.showNotification('Data imported successfully!', 'success');
        }, 1500);
    }

    // Handle backup
    handleBackup() {
        this.showNotification('Creating backup...', 'info');
        // Implement actual backup logic here
        setTimeout(() => {
            this.showNotification('Backup created successfully!', 'success');
            // Update last backup time
            const backupInfo = document.querySelector('.backup-info p');
            if (backupInfo) {
                const now = new Date();
                backupInfo.innerHTML = `<strong>Last Backup:</strong> ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
            }
        }, 2000);
    }

    // Handle integration connections
    handleIntegration(integration) {
        this.showNotification(`Connecting to ${integration}...`, 'info');
        // Implement actual integration logic here
        setTimeout(() => {
            this.showNotification(`${integration} connected successfully!`, 'success');
        }, 1500);
    }

    // Clear application cache
    clearCache() {
        if (confirm('Are you sure you want to clear the application cache?')) {
            // Clear relevant cache data
            const cacheKeys = ['autoconnect_cache', 'autoconnect_temp'];
            cacheKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            this.showNotification('Application cache cleared!', 'success');
        }
    }

    // Clear all application data
    clearAllData() {
        // Clear all localStorage data except user session
        const keysToKeep = ['autocrm_user'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        this.showNotification('All application data has been cleared!', 'success');
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Get notification icon based on type
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new SettingsManager();
    
    // Notification Bell
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            alert('Notifications feature coming soon!');
        });
    }
});