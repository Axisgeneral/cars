// Dashboard Data Service

// Initialize Data
function initDashboardData() {
    // Initialize all data stores with sample data if they don't exist
    DataService.utils.initializeAllData();
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Update task list
    updateTaskList();
    
    // Update activity feed
    updateActivityFeed();
}

// Update Dashboard Stats
function updateDashboardStats() {
    // Get data
    const inventory = DataService.inventory.getAll();
    const deals = DataService.deals.getAll();
    const leads = DataService.leads.getAll();
    
    // Calculate stats
    const totalVehicles = inventory.length;
    const inStockVehicles = inventory.filter(item => item.status === 'in-stock').length;
    const soldVehicles = inventory.filter(item => item.status === 'sold').length;
    const totalRevenue = deals.filter(deal => deal.status === 'Closed')
                             .reduce((sum, deal) => sum + deal.vehicle.price, 0);
    const totalProfit = deals.filter(deal => deal.status === 'Closed')
                            .reduce((sum, deal) => sum + (deal.profit || 0), 0);
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'New').length;
    const hotLeads = leads.filter(lead => lead.status === 'Hot').length;
    
    // Update DOM elements
    document.querySelector('.kpi-card:nth-child(1) .kpi-value').textContent = soldVehicles;
    document.querySelector('.kpi-card:nth-child(2) .kpi-value').textContent = '$' + formatNumber(totalRevenue);
    document.querySelector('.kpi-card:nth-child(3) .kpi-value').textContent = totalLeads;
    document.querySelector('.kpi-card:nth-child(4) .kpi-value').textContent = Math.round((soldVehicles / totalLeads) * 100) + '%';
    
    // Update inventory stats
    const inventoryStatsElement = document.querySelector('.inventory-stats');
    if (inventoryStatsElement) {
        const totalElement = inventoryStatsElement.querySelector('.total-vehicles');
        const inStockElement = inventoryStatsElement.querySelector('.in-stock');
        const soldElement = inventoryStatsElement.querySelector('.sold');
        
        if (totalElement) totalElement.textContent = totalVehicles;
        if (inStockElement) inStockElement.textContent = inStockVehicles;
        if (soldElement) soldElement.textContent = soldVehicles;
    }
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update Task List
function updateTaskList() {
    const tasks = DataService.tasks.getAll();
    const taskList = document.querySelector('.task-list');
    
    if (!taskList) return;
    
    // Sort tasks by due date (most recent first) and priority
    const sortedTasks = tasks.sort((a, b) => {
        // First by status (pending first)
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        
        // Then by priority
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        
        // Then by due date
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    // Get only the first 5 tasks
    const recentTasks = sortedTasks.slice(0, 5);
    
    // Clear existing tasks
    taskList.innerHTML = '';
    
    // Add tasks to the list
    recentTasks.forEach(task => {
        const isCompleted = task.status === 'Completed';
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.style.opacity = isCompleted ? '0.6' : '1';
        
        taskItem.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="task-${task.id}" ${isCompleted ? 'checked' : ''}>
                <label for="task-${task.id}"></label>
            </div>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span class="task-due">Due: ${formatDate(task.dueDate)}</span>
                    <span class="task-priority ${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
            </div>
        `;
        
        taskList.appendChild(taskItem);
        
        // Add event listener to checkbox
        const checkbox = taskItem.querySelector(`#task-${task.id}`);
        checkbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            if (this.checked) {
                taskItem.style.opacity = '0.6';
                // Update task status in data service
                const taskToUpdate = tasks.find(t => t.id === task.id);
                if (taskToUpdate) {
                    taskToUpdate.status = 'Completed';
                    taskToUpdate.dateCompleted = new Date().toISOString().split('T')[0];
                    DataService.tasks.save(tasks);
                }
            } else {
                taskItem.style.opacity = '1';
                // Update task status in data service
                const taskToUpdate = tasks.find(t => t.id === task.id);
                if (taskToUpdate) {
                    taskToUpdate.status = 'Pending';
                    delete taskToUpdate.dateCompleted;
                    DataService.tasks.save(tasks);
                }
            }
        });
    });
    
    // If no tasks, show a message
    if (recentTasks.length === 0) {
        taskList.innerHTML = '<div class="no-data">No tasks found</div>';
    }
}

// Update Activity Feed
function updateActivityFeed() {
    const activityFeed = document.querySelector('.activity-feed');
    
    if (!activityFeed) return;
    
    // Create activity items from various data sources
    const activities = [];
    
    // Add activities from deals
    const deals = DataService.deals.getAll();
    deals.forEach(deal => {
        if (deal.dateClosed) {
            activities.push({
                type: 'deal',
                date: deal.dateClosed,
                title: `Deal closed with ${deal.customer.name}`,
                description: `${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model} - $${formatNumber(deal.vehicle.price)}`,
                icon: 'handshake'
            });
        } else if (deal.dateCreated) {
            activities.push({
                type: 'deal',
                date: deal.dateCreated,
                title: `New deal created with ${deal.customer.name}`,
                description: `${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model} - $${formatNumber(deal.vehicle.price)}`,
                icon: 'handshake'
            });
        }
    });
    
    // Add activities from leads
    const leads = DataService.leads.getAll();
    leads.forEach(lead => {
        activities.push({
            type: 'lead',
            date: lead.dateCreated,
            title: `New lead: ${lead.firstName} ${lead.lastName}`,
            description: `Source: ${lead.source}, Interest: ${lead.vehicleInterest.make} ${lead.vehicleInterest.model}`,
            icon: 'funnel-dollar'
        });
    });
    
    // Add activities from inventory
    const inventory = DataService.inventory.getAll();
    inventory.forEach(vehicle => {
        activities.push({
            type: 'inventory',
            date: vehicle.dateAdded,
            title: `New vehicle added to inventory`,
            description: `${vehicle.year} ${vehicle.make} ${vehicle.model} - $${formatNumber(vehicle.price)}`,
            icon: 'car'
        });
    });
    
    // Sort activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get only the first 10 activities
    const recentActivities = activities.slice(0, 10);
    
    // Update the activity feed
    activityFeed.innerHTML = '';
    
    // Add activities to the feed
    recentActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
                <div class="activity-time">${formatDate(activity.date)}</div>
            </div>
        `;
        
        activityFeed.appendChild(activityItem);
    });
    
    // If no activities, show a message
    if (recentActivities.length === 0) {
        activityFeed.innerHTML = '<div class="no-data">No recent activity</div>';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}