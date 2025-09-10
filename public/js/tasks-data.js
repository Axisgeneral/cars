// Tasks Data Service

// Initialize Tasks Data
function initTasksData() {
    // Initialize tasks data if it doesn't exist
    DataService.tasks.init();
    
    // Populate tasks table
    populateTasksTable();
}

// Populate Tasks Table
function populateTasksTable() {
    const tasks = DataService.tasks.getAll();
    const tableBody = document.querySelector('.tasks-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
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
    
    // Add tasks to the table
    sortedTasks.forEach(task => {
        const row = document.createElement('tr');
        
        // Create status badge HTML
        let statusBadgeHtml = '';
        switch(task.status) {
            case 'Pending':
                statusBadgeHtml = '<span class="status-badge pending">Pending</span>';
                break;
            case 'In Progress':
                statusBadgeHtml = '<span class="status-badge in-progress">In Progress</span>';
                break;
            case 'Completed':
                statusBadgeHtml = '<span class="status-badge completed">Completed</span>';
                break;
            default:
                statusBadgeHtml = '<span class="status-badge">' + task.status + '</span>';
        }
        
        // Create priority badge HTML
        let priorityBadgeHtml = '';
        switch(task.priority) {
            case 'High':
                priorityBadgeHtml = '<span class="priority-badge high">High</span>';
                break;
            case 'Medium':
                priorityBadgeHtml = '<span class="priority-badge medium">Medium</span>';
                break;
            case 'Low':
                priorityBadgeHtml = '<span class="priority-badge low">Low</span>';
                break;
            default:
                priorityBadgeHtml = '<span class="priority-badge">' + task.priority + '</span>';
        }
        
        // Create row HTML
        row.innerHTML = `
            <td>
                <input type="checkbox" id="task-${task.id}" name="selected-tasks" ${task.status === 'Completed' ? 'checked' : ''}>
                <label for="task-${task.id}"></label>
            </td>
            <td>${task.title}</td>
            <td>${task.description}</td>
            <td>${task.assignedTo}</td>
            <td>${formatDate(task.dueDate)}</td>
            <td>${priorityBadgeHtml}</td>
            <td>${statusBadgeHtml}</td>
            <td>${task.relatedTo ? `${task.relatedTo.type}: ${task.relatedTo.name}` : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="More Options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // If no tasks, show a message
    if (tasks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem;">No tasks found</td>';
        tableBody.appendChild(row);
    }
    
    // Update tasks stats
    updateTasksStats();
    
    // Re-initialize event listeners for the new elements
    initTasksEventListeners();
}

// Update Tasks Stats
function updateTasksStats() {
    const tasks = DataService.tasks.getAll();
    
    // Calculate stats
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    
    // Calculate overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = tasks.filter(task => 
        task.status !== 'Completed' && new Date(task.dueDate) < today).length;
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Update DOM elements
    const statsContainer = document.querySelector('.tasks-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Tasks:</span>
                <span class="stat-value">${totalTasks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pending:</span>
                <span class="stat-value">${pendingTasks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">In Progress:</span>
                <span class="stat-value">${inProgressTasks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Completed:</span>
                <span class="stat-value">${completedTasks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Overdue:</span>
                <span class="stat-value">${overdueTasks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Completion Rate:</span>
                <span class="stat-value">${completionRate}%</span>
            </div>
        `;
    }
}

// Initialize Tasks Event Listeners
function initTasksEventListeners() {
    // Task Checkboxes
    const taskCheckboxes = document.querySelectorAll('.tasks-table input[type="checkbox"]');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('tr');
            const taskTitle = row.cells[1].textContent;
            
            // Find the task by title
            const tasks = DataService.tasks.getAll();
            const task = tasks.find(t => t.title === taskTitle);
            
            if (task) {
                // Update task status
                if (this.checked) {
                    task.status = 'Completed';
                    task.dateCompleted = new Date().toISOString().split('T')[0];
                } else {
                    task.status = 'Pending';
                    delete task.dateCompleted;
                }
                
                // Save updated tasks
                DataService.tasks.save(tasks);
                
                // Refresh the table
                populateTasksTable();
            }
        });
    });
    
    // Action Buttons
    const viewButtons = document.querySelectorAll('.action-buttons .btn-icon[title="View Details"]');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const taskTitle = row.cells[1].textContent;
            viewTaskDetails(taskTitle);
        });
    });
    
    const editButtons = document.querySelectorAll('.action-buttons .btn-icon[title="Edit"]');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const taskTitle = row.cells[1].textContent;
            editTask(taskTitle);
        });
    });
    
    const moreButtons = document.querySelectorAll('.action-buttons .btn-icon[title="More Options"]');
    moreButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const taskTitle = row.cells[1].textContent;
            showMoreOptions(taskTitle, this);
        });
    });
}

// Apply Filters
function applyTasksFilters() {
    // Get filter values
    const status = document.getElementById('status-filter').value;
    const priority = document.getElementById('priority-filter').value;
    const assignedTo = document.getElementById('assigned-filter').value;
    const dueDate = document.getElementById('due-filter').value;
    
    // Get all tasks
    const allTasks = DataService.tasks.getAll();
    
    // Filter tasks
    let filteredTasks = allTasks;
    
    // Apply status filter
    if (status !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    // Apply priority filter
    if (priority !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    // Apply assigned to filter
    if (assignedTo !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.assignedTo === assignedTo);
    }
    
    // Apply due date filter
    if (dueDate !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        switch(dueDate) {
            case 'overdue':
                filteredTasks = filteredTasks.filter(task => 
                    new Date(task.dueDate) < today && task.status !== 'Completed');
                break;
            case 'today':
                filteredTasks = filteredTasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    return taskDate.getDate() === today.getDate() &&
                           taskDate.getMonth() === today.getMonth() &&
                           taskDate.getFullYear() === today.getFullYear();
                });
                break;
            case 'tomorrow':
                filteredTasks = filteredTasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    return taskDate.getDate() === tomorrow.getDate() &&
                           taskDate.getMonth() === tomorrow.getMonth() &&
                           taskDate.getFullYear() === tomorrow.getFullYear();
                });
                break;
            case 'week':
                filteredTasks = filteredTasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    return taskDate >= today && taskDate <= nextWeek;
                });
                break;
        }
    }
    
    // Sort filtered tasks
    const sortedTasks = filteredTasks.sort((a, b) => {
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
    
    // Update table with filtered tasks
    const tableBody = document.querySelector('.tasks-table tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add filtered tasks to the table
    sortedTasks.forEach(task => {
        const row = document.createElement('tr');
        
        // Create status badge HTML
        let statusBadgeHtml = '';
        switch(task.status) {
            case 'Pending':
                statusBadgeHtml = '<span class="status-badge pending">Pending</span>';
                break;
            case 'In Progress':
                statusBadgeHtml = '<span class="status-badge in-progress">In Progress</span>';
                break;
            case 'Completed':
                statusBadgeHtml = '<span class="status-badge completed">Completed</span>';
                break;
            default:
                statusBadgeHtml = '<span class="status-badge">' + task.status + '</span>';
        }
        
        // Create priority badge HTML
        let priorityBadgeHtml = '';
        switch(task.priority) {
            case 'High':
                priorityBadgeHtml = '<span class="priority-badge high">High</span>';
                break;
            case 'Medium':
                priorityBadgeHtml = '<span class="priority-badge medium">Medium</span>';
                break;
            case 'Low':
                priorityBadgeHtml = '<span class="priority-badge low">Low</span>';
                break;
            default:
                priorityBadgeHtml = '<span class="priority-badge">' + task.priority + '</span>';
        }
        
        // Create row HTML
        row.innerHTML = `
            <td>
                <input type="checkbox" id="task-${task.id}" name="selected-tasks" ${task.status === 'Completed' ? 'checked' : ''}>
                <label for="task-${task.id}"></label>
            </td>
            <td>${task.title}</td>
            <td>${task.description}</td>
            <td>${task.assignedTo}</td>
            <td>${formatDate(task.dueDate)}</td>
            <td>${priorityBadgeHtml}</td>
            <td>${statusBadgeHtml}</td>
            <td>${task.relatedTo ? `${task.relatedTo.type}: ${task.relatedTo.name}` : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="More Options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // If no tasks, show a message
    if (sortedTasks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 2rem;">No tasks found matching the selected filters</td>';
        tableBody.appendChild(row);
    }
    
    // Re-initialize event listeners for the new elements
    initTasksEventListeners();
    
    return sortedTasks.length;
}

// Reset Filters
function resetTasksFilters() {
    // Reset all filter dropdowns to first option
    document.getElementById('status-filter').selectedIndex = 0;
    document.getElementById('priority-filter').selectedIndex = 0;
    document.getElementById('assigned-filter').selectedIndex = 0;
    document.getElementById('due-filter').selectedIndex = 0;
    
    // Repopulate the table with all tasks
    populateTasksTable();
}

// View Task Details
function viewTaskDetails(taskTitle) {
    // Find the task by title
    const tasks = DataService.tasks.getAll();
    const task = tasks.find(t => t.title === taskTitle);
    
    if (!task) {
        alert(`Task with title "${taskTitle}" not found.`);
        return;
    }
    
    // For demo purposes, show an alert with task details
    alert(`
        Task Details:
        Title: ${task.title}
        Description: ${task.description}
        Assigned To: ${task.assignedTo}
        Due Date: ${formatDate(task.dueDate)}
        Priority: ${task.priority}
        Status: ${task.status}
        Related To: ${task.relatedTo ? `${task.relatedTo.type}: ${task.relatedTo.name}` : 'N/A'}
        Date Created: ${formatDate(task.dateCreated)}
        ${task.dateCompleted ? 'Date Completed: ' + formatDate(task.dateCompleted) : ''}
    `);
}

// Edit Task
function editTask(taskTitle) {
    // Find the task by title
    const tasks = DataService.tasks.getAll();
    const task = tasks.find(t => t.title === taskTitle);
    
    if (!task) {
        alert(`Task with title "${taskTitle}" not found.`);
        return;
    }
    
    // For demo purposes, show an alert
    alert(`Editing task "${taskTitle}". This would open an edit form in a real application.`);
}

// Show More Options
function showMoreOptions(taskTitle, buttonElement) {
    // Find the task by title
    const tasks = DataService.tasks.getAll();
    const task = tasks.find(t => t.title === taskTitle);
    
    if (!task) {
        alert(`Task with title "${taskTitle}" not found.`);
        return;
    }
    
    // For demo purposes, show an alert with options
    const options = ['Delete', 'Mark as Completed', 'Reassign', 'Change Priority', 'Add Note'];
    alert(`Options for task "${taskTitle}":\n\n${options.join('\n')}`);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}