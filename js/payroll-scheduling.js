// Print W2 for a specific employee
function printW2(employeeId) {
    const emp = PayrollSchedulingData.employees.getAll().find(e => e.id === employeeId);
    if (!emp) {
        alert('Employee not found.');
        return;
    }
    
    const year = document.getElementById('w2-year-filter')?.value || '2024';
    const w2Html = generateW2Html(emp, year);
    
    const w2Window = window.open('', '_blank');
    w2Window.document.write(`
        <html>
            <head>
                <title>W2 Form - ${emp.firstName} ${emp.lastName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .w2-form { border: 2px solid #000; padding: 20px; max-width: 800px; margin: 0 auto; }
                    .w2-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .w2-section { margin-bottom: 15px; }
                    .w2-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .w2-box { border: 1px solid #000; padding: 5px; margin: 2px; flex: 1; }
                    .w2-label { font-weight: bold; font-size: 12px; }
                    .w2-value { font-size: 14px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>${w2Html}</body>
        </html>
    `);
    w2Window.document.close();
    w2Window.print();
}

// Print W2s for all employees
function printAllW2s() {
    const employees = PayrollSchedulingData.employees.getAll();
    const year = document.getElementById('w2-year-filter')?.value || '2024';
    
    if (employees.length === 0) {
        alert('No employees found.');
        return;
    }
    
    let allW2Html = '';
    employees.forEach((emp, index) => {
        allW2Html += generateW2Html(emp, year);
        if (index < employees.length - 1) {
            allW2Html += '<div style="page-break-after: always;"></div>';
        }
    });
    
    const w2Window = window.open('', '_blank');
    w2Window.document.write(`
        <html>
            <head>
                <title>All W2 Forms - ${year}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .w2-form { border: 2px solid #000; padding: 20px; max-width: 800px; margin: 0 auto 40px auto; }
                    .w2-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .w2-section { margin-bottom: 15px; }
                    .w2-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .w2-box { border: 1px solid #000; padding: 5px; margin: 2px; flex: 1; }
                    .w2-label { font-weight: bold; font-size: 12px; }
                    .w2-value { font-size: 14px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>${allW2Html}</body>
        </html>
    `);
    w2Window.document.close();
    w2Window.print();
}

// Generate W2 HTML for an employee
function generateW2Html(employee, year) {
    // Calculate estimated annual earnings (this would come from actual payroll data in a real system)
    const estimatedAnnualHours = employee.employmentType === 'full-time' ? 2080 : 1040;
    const grossWages = (employee.hourlyRate * estimatedAnnualHours).toFixed(2);
    const federalTax = (grossWages * 0.22).toFixed(2);
    const socialSecurityWages = Math.min(grossWages, 160200).toFixed(2);
    const socialSecurityTax = (socialSecurityWages * 0.062).toFixed(2);
    const medicareWages = grossWages;
    const medicareTax = (grossWages * 0.0145).toFixed(2);
    const stateTax = (grossWages * 0.05).toFixed(2);
    
    return `
        <div class="w2-form">
            <div class="w2-header">
                <h2>Form W-2 Wage and Tax Statement ${year}</h2>
                <p><strong>AutoConnect Dealership</strong></p>
                <p>123 Auto Drive, Car City, ST 12345</p>
                <p>EIN: 12-3456789</p>
            </div>
            
            <div class="w2-section">
                <div class="w2-row">
                    <div class="w2-box">
                        <div class="w2-label">Employee Name:</div>
                        <div class="w2-value">${employee.firstName} ${employee.lastName}</div>
                    </div>
                    <div class="w2-box">
                        <div class="w2-label">Employee ID:</div>
                        <div class="w2-value">${employee.employeeId}</div>
                    </div>
                </div>
                
                <div class="w2-row">
                    <div class="w2-box">
                        <div class="w2-label">Position:</div>
                        <div class="w2-value">${employee.position}</div>
                    </div>
                    <div class="w2-box">
                        <div class="w2-label">Department:</div>
                        <div class="w2-value">${formatDepartment(employee.department)}</div>
                    </div>
                </div>
            </div>
            
            <div class="w2-section">
                <h3>Wage and Tax Information</h3>
                <div class="w2-row">
                    <div class="w2-box">
                        <div class="w2-label">1. Wages, tips, other compensation:</div>
                        <div class="w2-value">$${grossWages}</div>
                    </div>
                    <div class="w2-box">
                        <div class="w2-label">2. Federal income tax withheld:</div>
                        <div class="w2-value">$${federalTax}</div>
                    </div>
                </div>
                
                <div class="w2-row">
                    <div class="w2-box">
                        <div class="w2-label">3. Social security wages:</div>
                        <div class="w2-value">$${socialSecurityWages}</div>
                    </div>
                    <div class="w2-box">
                        <div class="w2-label">4. Social security tax withheld:</div>
                        <div class="w2-value">$${socialSecurityTax}</div>
                    </div>
                </div>
                
                <div class="w2-row">
                    <div class="w2-box">
                        <div class="w2-label">5. Medicare wages and tips:</div>
                        <div class="w2-value">$${medicareWages}</div>
                    </div>
                    <div class="w2-box">
                        <div class="w2-label">6. Medicare tax withheld:</div>
                        <div class="w2-value">$${medicareTax}</div>
                    </div>
                </div>
                
                <div class="w2-row">
                    <div class="w2-box">
                        <div class="w2-label">17. State income tax:</div>
                        <div class="w2-value">$${stateTax}</div>
                    </div>
                    <div class="w2-box">
                        <div class="w2-label">18. Local wages, tips, etc.:</div>
                        <div class="w2-value">$${grossWages}</div>
                    </div>
                </div>
            </div>
            
            <div class="w2-section">
                <p><small><em>This is a demo W2 form. In a real implementation, actual payroll data would be used for calculations.</em></small></p>
                <p><small>Generated on: ${new Date().toLocaleDateString()}</small></p>
            </div>
        </div>
    `;
}
// Payroll & Scheduling Management JavaScript

// Data Service for Payroll & Scheduling
const PayrollSchedulingData = {
    KEYS: {
        EMPLOYEES: 'autocrm_employees',
        SCHEDULES: 'autocrm_schedules',
        TIMESHEETS: 'autocrm_timesheets'
    },
    
    // Employees Methods
    employees: {
        getAll: function() {
            return JSON.parse(localStorage.getItem(PayrollSchedulingData.KEYS.EMPLOYEES)) || [];
        },
        save: function(employees) {
            localStorage.setItem(PayrollSchedulingData.KEYS.EMPLOYEES, JSON.stringify(employees));
        },
        add: function(employee) {
            const employees = this.getAll();
            if (!employee.id) {
                employee.id = 'EMP' + String(employees.length + 1).padStart(3, '0');
            }
            if (!employee.employeeId) {
                employee.employeeId = 'AC' + String(employees.length + 1).padStart(3, '0');
            }
            employees.push(employee);
            this.save(employees);
            return employee;
        },
        update: function(employeeId, updates) {
            const employees = this.getAll();
            const index = employees.findIndex(emp => emp.id === employeeId);
            if (index !== -1) {
                employees[index] = { ...employees[index], ...updates };
                this.save(employees);
                return true;
            }
            return false;
        },
        remove: function(employeeId) {
            const employees = this.getAll();
            const filtered = employees.filter(emp => emp.id !== employeeId);
            this.save(filtered);
            return filtered.length < employees.length;
        }
    },
    
    // Schedules Methods
    schedules: {
        getAll: function() {
            return JSON.parse(localStorage.getItem(PayrollSchedulingData.KEYS.SCHEDULES)) || [];
        },
        save: function(schedules) {
            localStorage.setItem(PayrollSchedulingData.KEYS.SCHEDULES, JSON.stringify(schedules));
        },
        add: function(schedule) {
            const schedules = this.getAll();
            if (!schedule.id) {
                schedule.id = 'SCH' + String(schedules.length + 1).padStart(3, '0');
            }
            schedules.push(schedule);
            this.save(schedules);
            return schedule;
        },
        update: function(scheduleId, updates) {
            const schedules = this.getAll();
            const index = schedules.findIndex(sch => sch.id === scheduleId);
            if (index !== -1) {
                schedules[index] = { ...schedules[index], ...updates };
                this.save(schedules);
                return true;
            }
            return false;
        },
        remove: function(scheduleId) {
            const schedules = this.getAll();
            const filtered = schedules.filter(sch => sch.id !== scheduleId);
            this.save(filtered);
            return filtered.length < schedules.length;
        }
    },
    
    // Timesheets Methods
    timesheets: {
        getAll: function() {
            return JSON.parse(localStorage.getItem(PayrollSchedulingData.KEYS.TIMESHEETS)) || [];
        },
        save: function(timesheets) {
            localStorage.setItem(PayrollSchedulingData.KEYS.TIMESHEETS, JSON.stringify(timesheets));
        },
        add: function(timesheet) {
            const timesheets = this.getAll();
            if (!timesheet.id) {
                timesheet.id = 'TS' + String(timesheets.length + 1).padStart(3, '0');
            }
            timesheets.push(timesheet);
            this.save(timesheets);
            return timesheet;
        },
        update: function(timesheetId, updates) {
            const timesheets = this.getAll();
            const index = timesheets.findIndex(ts => ts.id === timesheetId);
            if (index !== -1) {
                timesheets[index] = { ...timesheets[index], ...updates };
                this.save(timesheets);
                return true;
            }
            return false;
        }
    },
    
    // Initialize with sample data
    init: function() {
        if (this.employees.getAll().length === 0) {
            this.employees.save(sampleEmployees);
        }
        if (this.schedules.getAll().length === 0) {
            this.schedules.save(sampleSchedules);
        }
        if (this.timesheets.getAll().length === 0) {
            this.timesheets.save(sampleTimesheets);
        }
    }
};

// Sample data
const sampleEmployees = [
    {
        id: 'EMP006',
        firstName: 'Thomas',
        lastName: 'Morales',
        email: 'thomas.morales@autoconnect.com',
        phone: '(555) 987-6543',
        department: 'executive',
        position: 'CEO',
        hireDate: '2020-01-01',
        employeeId: 'AC006',
        hourlyRate: 100.00,
        employmentType: 'full-time',
        status: 'active'
    },
    {
        id: 'EMP001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@autoconnect.com',
        phone: '(555) 123-4567',
        department: 'service',
        position: 'Senior Technician',
        hireDate: '2022-01-15',
        employeeId: 'AC001',
        hourlyRate: 28.50,
        employmentType: 'full-time',
        status: 'active'
    },
    {
        id: 'EMP002',
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'sarah.davis@autoconnect.com',
        phone: '(555) 234-5678',
        department: 'sales',
        position: 'Sales Representative',
        hireDate: '2021-08-20',
        employeeId: 'AC002',
        hourlyRate: 22.00,
        employmentType: 'full-time',
        status: 'active'
    },
    {
        id: 'EMP003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@autoconnect.com',
        phone: '(555) 345-6789',
        department: 'service',
        position: 'Technician',
        hireDate: '2023-03-10',
        employeeId: 'AC003',
        hourlyRate: 24.00,
        employmentType: 'full-time',
        status: 'active'
    },
    {
        id: 'EMP004',
        firstName: 'Emily',
        lastName: 'Wilson',
        email: 'emily.wilson@autoconnect.com',
        phone: '(555) 456-7890',
        department: 'parts',
        position: 'Parts Specialist',
        hireDate: '2022-11-05',
        employeeId: 'AC004',
        hourlyRate: 19.50,
        employmentType: 'part-time',
        status: 'active'
    },
    {
        id: 'EMP005',
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'robert.brown@autoconnect.com',
        phone: '(555) 567-8901',
        department: 'finance',
        position: 'Finance Manager',
        hireDate: '2020-05-12',
        employeeId: 'AC005',
        hourlyRate: 35.00,
        employmentType: 'full-time',
        status: 'active'
    }
];

const sampleSchedules = [
    {
        id: 'SCH001',
        employeeId: 'EMP001',
        date: '2024-03-18',
        startTime: '08:00',
        endTime: '16:00',
        shiftType: 'morning',
        notes: 'Regular shift'
    },
    {
        id: 'SCH002',
        employeeId: 'EMP002',
        date: '2024-03-18',
        startTime: '12:00',
        endTime: '20:00',
        shiftType: 'afternoon',
        notes: 'Sales floor coverage'
    },
    {
        id: 'SCH003',
        employeeId: 'EMP003',
        date: '2024-03-18',
        startTime: '08:00',
        endTime: '16:00',
        shiftType: 'morning',
        notes: 'Service bay 2'
    }
];

const sampleTimesheets = [
    {
        id: 'TS001',
        employeeId: 'EMP001',
        weekOf: '2024-03-11',
        hoursWorked: 40,
        overtimeHours: 0,
        regularPay: 1140.00,
        overtimePay: 0,
        totalPay: 1140.00,
        status: 'approved'
    },
    {
        id: 'TS002',
        employeeId: 'EMP002',
        weekOf: '2024-03-11',
        hoursWorked: 42,
        overtimeHours: 2,
        regularPay: 880.00,
        overtimePay: 66.00,
        totalPay: 946.00,
        status: 'pending'
    }
];

let currentWeek = new Date();

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
        case 'employees':
            loadEmployees();
            break;
        case 'schedule':
            loadSchedule();
            break;
        case 'timesheet':
            loadTimesheets();
            break;
        case 'payroll':
            loadPayroll();
            break;
        case 'w2':
            loadW2Employees();
            break;
    }
}

// Load employees
function loadEmployees() {
    const container = document.getElementById('employees-list');
    const departmentFilter = document.getElementById('department-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let employees = PayrollSchedulingData.employees.getAll();
    let filteredEmployees = employees;
    
    if (departmentFilter) {
        filteredEmployees = filteredEmployees.filter(emp => emp.department === departmentFilter);
    }
    
    if (statusFilter) {
        filteredEmployees = filteredEmployees.filter(emp => emp.status === statusFilter);
    }
    
    container.innerHTML = filteredEmployees.map(employee => `
        <div class="employee-card">
            <div class="employee-header">
                <div class="employee-info">
                    <h4>${employee.firstName} ${employee.lastName}</h4>
                    <p class="employee-id">ID: ${employee.employeeId}</p>
                    <p class="position">${employee.position}</p>
                </div>
                <div class="employee-status">
                    <span class="status-badge ${employee.status}">${formatStatus(employee.status)}</span>
                    <span class="department-badge">${formatDepartment(employee.department)}</span>
                </div>
            </div>
            <div class="employee-details">
                <div class="contact-info">
                    <p><i class="fas fa-envelope"></i> ${employee.email}</p>
                    <p><i class="fas fa-phone"></i> ${employee.phone}</p>
                </div>
                <div class="employment-info">
                    <p><strong>Hire Date:</strong> ${formatDate(employee.hireDate)}</p>
                    <p><strong>Type:</strong> ${formatEmploymentType(employee.employmentType)}</p>
                    <p><strong>Rate:</strong> $${employee.hourlyRate.toFixed(2)}/hr</p>
                </div>
            </div>
            <div class="employee-actions">
                <button class="btn btn-sm btn-primary" onclick="editEmployee('${employee.id}')">Edit</button>
                <button class="btn btn-sm btn-secondary" onclick="viewEmployeeSchedule('${employee.id}')">Schedule</button>
                <button class="btn btn-sm btn-info" onclick="viewEmployeeTimesheet('${employee.id}')">Timesheet</button>
            </div>
        </div>
    `).join('');
}

// Load schedule
function loadSchedule() {
    const container = document.getElementById('schedule-grid');
    updateWeekDisplay();
    
    // Create schedule grid
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({length: 13}, (_, i) => i + 7); // 7 AM to 7 PM
    
    let gridHTML = '<div class="schedule-header">';
    gridHTML += '<div class="time-column">Time</div>';
    days.forEach(day => {
        gridHTML += `<div class="day-column">${day}</div>`;
    });
    gridHTML += '</div>';
    
    hours.forEach(hour => {
        gridHTML += '<div class="schedule-row">';
        gridHTML += `<div class="time-slot">${formatHour(hour)}</div>`;
        days.forEach((day, dayIndex) => {
            const daySchedules = getSchedulesForDay(dayIndex);
            gridHTML += `<div class="day-slot" data-day="${dayIndex}" data-hour="${hour}">`;
            daySchedules.forEach(schedule => {
                if (isScheduleInHour(schedule, hour)) {
                    const employees = PayrollSchedulingData.employees.getAll();
                    const employee = employees.find(emp => emp.id === schedule.employeeId);
                    if (employee) {
                        gridHTML += `<div class="schedule-item">${employee.firstName} ${employee.lastName}</div>`;
                    }
                }
            });
            gridHTML += '</div>';
        });
        gridHTML += '</div>';
    });
    
    container.innerHTML = gridHTML;
}

// Load timesheets
function loadTimesheets() {
    const container = document.getElementById('timesheet-list');
    const employeeFilter = document.getElementById('employee-filter').value;
    const weekFilter = document.getElementById('week-filter').value;
    
    let timesheets = PayrollSchedulingData.timesheets.getAll();
    let filteredTimesheets = timesheets;
    
    if (employeeFilter) {
        filteredTimesheets = filteredTimesheets.filter(ts => ts.employeeId === employeeFilter);
    }
    
    if (weekFilter) {
        filteredTimesheets = filteredTimesheets.filter(ts => ts.weekOf === weekFilter);
    }
    
    container.innerHTML = filteredTimesheets.map(timesheet => {
        const employees = PayrollSchedulingData.employees.getAll();
        const employee = employees.find(emp => emp.id === timesheet.employeeId);
        return `
            <div class="timesheet-card">
                <div class="timesheet-header">
                    <div class="timesheet-info">
                        <h4>${employee.firstName} ${employee.lastName}</h4>
                        <p class="week-of">Week of ${formatDate(timesheet.weekOf)}</p>
                    </div>
                    <div class="timesheet-status">
                        <span class="status-badge ${timesheet.status}">${formatStatus(timesheet.status)}</span>
                    </div>
                </div>
                <div class="timesheet-details">
                    <div class="hours-info">
                        <div class="hours-item">
                            <span class="label">Regular Hours:</span>
                            <span class="value">${timesheet.hoursWorked - timesheet.overtimeHours}</span>
                        </div>
                        <div class="hours-item">
                            <span class="label">Overtime Hours:</span>
                            <span class="value">${timesheet.overtimeHours}</span>
                        </div>
                        <div class="hours-item">
                            <span class="label">Total Hours:</span>
                            <span class="value">${timesheet.hoursWorked}</span>
                        </div>
                    </div>
                    <div class="pay-info">
                        <div class="pay-item">
                            <span class="label">Regular Pay:</span>
                            <span class="value">$${timesheet.regularPay.toFixed(2)}</span>
                        </div>
                        <div class="pay-item">
                            <span class="label">Overtime Pay:</span>
                            <span class="value">$${timesheet.overtimePay.toFixed(2)}</span>
                        </div>
                        <div class="pay-item total">
                            <span class="label">Total Pay:</span>
                            <span class="value">$${timesheet.totalPay.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div class="timesheet-actions">
                    <button class="btn btn-sm btn-primary" onclick="editTimesheet('${timesheet.id}')">Edit</button>
                    <button class="btn btn-sm btn-success" onclick="approveTimesheet('${timesheet.id}')">Approve</button>
                </div>
            </div>
        `;
    }).join('');
}

// Load payroll
function loadPayroll() {
    const container = document.getElementById('payroll-list');
    const timesheets = PayrollSchedulingData.timesheets.getAll();
    // Calculate payroll summary
    const totalPayroll = timesheets.reduce((sum, ts) => sum + ts.totalPay, 0);
    const totalHours = timesheets.reduce((sum, ts) => sum + ts.hoursWorked, 0);
    const totalOvertime = timesheets.reduce((sum, ts) => sum + ts.overtimeHours, 0);
    // Update summary cards
    document.querySelector('.payroll-summary .payroll-card:nth-child(1) .amount').textContent = `$${totalPayroll.toFixed(2)}`;
    document.querySelector('.payroll-summary .payroll-card:nth-child(2) .amount').textContent = totalHours;
    document.querySelector('.payroll-summary .payroll-card:nth-child(3) .amount').textContent = employees.filter(emp => emp.status === 'active').length;
    document.querySelector('.payroll-summary .payroll-card:nth-child(4) .amount').textContent = totalOvertime;
    container.innerHTML = timesheets.map(timesheet => {
        const employee = employees.find(emp => emp.id === timesheet.employeeId);
        return `
            <div class="payroll-item">
                <div class="payroll-employee">
                    <h4>${employee.firstName} ${employee.lastName}</h4>
                    <p>${employee.position}</p>
                    <p>ID: ${employee.employeeId}</p>
                </div>
                <div class="payroll-hours">
                    <p>Regular: ${timesheet.hoursWorked - timesheet.overtimeHours}h</p>
                    <p>Overtime: ${timesheet.overtimeHours}h</p>
                    <p><strong>Total: ${timesheet.hoursWorked}h</strong></p>
                </div>
                <div class="payroll-pay">
                    <p>Regular: $${timesheet.regularPay.toFixed(2)}</p>
                    <p>Overtime: $${timesheet.overtimePay.toFixed(2)}</p>
                    <p><strong>Total: $${timesheet.totalPay.toFixed(2)}</strong></p>
                </div>
                <div class="payroll-actions">
                    <button class="btn btn-sm btn-primary" onclick="generatePaystub('${timesheet.id}')">Pay Stub</button>
                </div>
            </div>
        `;
    }).join('');
}

// Modal functions
function openEmployeeModal() {
    const modal = document.getElementById('employee-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeEmployeeModal() {
    const modal = document.getElementById('employee-modal');
    const form = document.getElementById('employee-form');
    
    if (modal) modal.classList.remove('active');
    if (form) form.reset();
    
    // Reset form title and button text
    const title = document.querySelector('#employee-modal .modal-title');
    const button = document.querySelector('button[form="employee-form"]');
    if (title) title.textContent = 'Add Employee';
    if (button) button.textContent = 'Add Employee';
    
    // Remove edit ID
    if (form) delete form.dataset.editId;
}

function openScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    if (modal) {
        modal.classList.add('active');
        loadEmployeesForSchedule();
    }
}

function closeScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    const form = document.getElementById('schedule-form');
    
    if (modal) modal.classList.remove('active');
    if (form) form.reset();
    
    // Reset form title and button text
    const title = document.querySelector('#schedule-modal .modal-title');
    const button = document.querySelector('button[form="schedule-form"]');
    if (title) title.textContent = 'Schedule Shift';
    if (button) button.textContent = 'Schedule Shift';
    
    // Remove edit ID
    if (form) delete form.dataset.editId;
}

// Load employees for schedule form
function loadEmployeesForSchedule() {
    const select = document.getElementById('schedule-employee');
    let employees = PayrollSchedulingData.employees.getAll();
    if (!Array.isArray(employees)) {
        employees = [];
    }
    select.innerHTML = '<option value="">Select Employee</option>' + 
        employees.map(emp => `<option value="${emp.id}">${emp.firstName} ${emp.lastName}</option>`).join('');
}

// Schedule navigation
function previousWeek() {
    currentWeek.setDate(currentWeek.getDate() - 7);
    loadSchedule();
}

function nextWeek() {
    currentWeek.setDate(currentWeek.getDate() + 7);
    loadSchedule();
}

function updateWeekDisplay() {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Monday
    document.getElementById('current-week').textContent = `Week of ${formatDate(weekStart.toISOString().split('T')[0])}`;
}

// Form submission handlers
function initFormHandlers() {
    const employeeForm = document.getElementById('employee-form');
    const scheduleForm = document.getElementById('schedule-form');
    
    if (employeeForm) {
        employeeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const editId = this.dataset.editId;
            const employeeData = {
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                department: document.getElementById('department').value,
                position: document.getElementById('position').value,
                hireDate: document.getElementById('hire-date').value,
                employeeId: document.getElementById('employee-id').value,
                hourlyRate: parseFloat(document.getElementById('hourly-rate').value),
                employmentType: document.getElementById('employment-type').value,
                status: 'active'
            };
            
            if (editId) {
                // Update existing employee
                PayrollSchedulingData.employees.update(editId, employeeData);
                showNotification('Employee updated successfully!', 'success');
            } else {
                // Add new employee
                PayrollSchedulingData.employees.add(employeeData);
                showNotification('Employee added successfully!', 'success');
            }
            
            closeEmployeeModal();
            loadEmployees();
        });
    }
    
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const shiftType = document.getElementById('shift-type').value;
            let startTime, endTime;
            
            if (shiftType === 'custom') {
                startTime = document.getElementById('start-time').value;
                endTime = document.getElementById('end-time').value;
            } else {
                const shiftTimes = {
                    'morning': { start: '08:00', end: '16:00' },
                    'afternoon': { start: '12:00', end: '20:00' },
                    'evening': { start: '16:00', end: '00:00' }
                };
                startTime = shiftTimes[shiftType].start;
                endTime = shiftTimes[shiftType].end;
            }
            
            const scheduleData = {
                employeeId: document.getElementById('schedule-employee').value,
                date: document.getElementById('shift-date').value,
                startTime: startTime,
                endTime: endTime,
                shiftType: shiftType,
                notes: document.getElementById('shift-notes').value
            };
            
            PayrollSchedulingData.schedules.add(scheduleData);
            closeScheduleModal();
            loadSchedule();
            
            showNotification('Shift scheduled successfully!', 'success');
        });
    }
    
    // Handle shift type change
    const shiftTypeSelect = document.getElementById('shift-type');
    if (shiftTypeSelect) {
        shiftTypeSelect.addEventListener('change', function() {
            const customFields = document.getElementById('custom-time-fields');
            if (customFields) {
                if (this.value === 'custom') {
                    customFields.style.display = 'flex';
                } else {
                    customFields.style.display = 'none';
                }
            }
        });
    }
}

// Utility functions
function formatStatus(status) {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatDepartment(department) {
    return department.charAt(0).toUpperCase() + department.slice(1);
}

function formatEmploymentType(type) {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function formatHour(hour) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
}

function getSchedulesForDay(dayIndex) {
    // This would filter schedules for the specific day
    const schedules = PayrollSchedulingData.schedules.getAll();
    return schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate.getDay() === (dayIndex + 1) % 7; // Adjust for Monday start
    });
}

function isScheduleInHour(schedule, hour) {
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    return hour >= startHour && hour < endHour;
}

// Action functions
function editEmployee(id) {
    const employees = PayrollSchedulingData.employees.getAll();
    const employee = employees.find(emp => emp.id === id);
    
    if (employee) {
        // Populate the existing modal with employee data
        document.getElementById('first-name').value = employee.firstName || '';
        document.getElementById('last-name').value = employee.lastName || '';
        document.getElementById('email').value = employee.email || '';
        document.getElementById('phone').value = employee.phone || '';
        document.getElementById('department').value = employee.department || '';
        document.getElementById('position').value = employee.position || '';
        document.getElementById('hire-date').value = employee.hireDate || '';
        document.getElementById('employee-id').value = employee.employeeId || '';
        document.getElementById('hourly-rate').value = employee.hourlyRate || '';
        document.getElementById('employment-type').value = employee.employmentType || '';
        
        // Update modal title and button text
        const title = document.querySelector('#employee-modal .modal-title');
        const button = document.querySelector('button[form="employee-form"]');
        if (title) title.textContent = 'Edit Employee';
        if (button) button.textContent = 'Update Employee';
        
        // Set edit ID on form
        const form = document.getElementById('employee-form');
        if (form) form.dataset.editId = id;
        
        // Open the modal
        openEmployeeModal();
    } else {
        showNotification('Employee not found', 'error');
    }
}

function viewEmployeeSchedule(id) {
    const employees = PayrollSchedulingData.employees.getAll();
    const employee = employees.find(emp => emp.id === id);
    
    if (employee) {
        // Switch to schedule tab and filter by employee
        showTab('schedule');
        showNotification(`Viewing schedule for ${employee.firstName} ${employee.lastName}`, 'info');
    } else {
        showNotification('Employee not found', 'error');
    }
}

function viewEmployeeTimesheet(id) {
    const employees = PayrollSchedulingData.employees.getAll();
    const employee = employees.find(emp => emp.id === id);
    
    if (employee) {
        // Switch to timesheet tab and filter by employee
        showTab('timesheet');
        const employeeFilter = document.getElementById('employee-filter');
        if (employeeFilter) {
            employeeFilter.value = id;
            loadTimesheets();
        }
        showNotification(`Viewing timesheets for ${employee.firstName} ${employee.lastName}`, 'info');
    } else {
        showNotification('Employee not found', 'error');
    }
}

function editTimesheet(id) {
    const timesheets = PayrollSchedulingData.timesheets.getAll();
    const timesheet = timesheets.find(ts => ts.id === id);
    
    if (timesheet) {
        createTimesheetEditModal(timesheet);
    } else {
        showNotification('Timesheet not found', 'error');
    }
}

function approveTimesheet(id) {
    PayrollSchedulingData.timesheets.update(id, { status: 'approved' });
    loadTimesheets();
    showNotification('Timesheet approved successfully!', 'success');
}

function generatePaystub(id) {
    const timesheets = PayrollSchedulingData.timesheets.getAll();
    const employees = PayrollSchedulingData.employees.getAll();
    const timesheet = timesheets.find(ts => ts.id === id);
    
    if (timesheet) {
        const employee = employees.find(emp => emp.id === timesheet.employeeId);
        if (employee) {
            createPaystubModal(timesheet, employee);
        } else {
            showNotification('Employee not found', 'error');
        }
    } else {
        showNotification('Timesheet not found', 'error');
    }
}

function processPayroll() {
    const timesheets = PayrollSchedulingData.timesheets.getAll();
    const pendingTimesheets = timesheets.filter(ts => ts.status === 'pending');
    
    if (pendingTimesheets.length === 0) {
        showNotification('No pending timesheets to process', 'info');
        return;
    }
    
    // Mark all pending timesheets as processed
    pendingTimesheets.forEach(timesheet => {
        PayrollSchedulingData.timesheets.update(timesheet.id, { status: 'processed' });
    });
    
    loadTimesheets();
    showNotification(`Processed ${pendingTimesheets.length} timesheets successfully!`, 'success');
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    PayrollSchedulingData.init();
    
    // Initialize form handlers
    initFormHandlers();
    
    // Initialize modal handlers
    initModalHandlers();
    
    // Initialize event listeners for filters
    const departmentFilter = document.getElementById('department-filter');
    const statusFilter = document.getElementById('status-filter');
    const employeeFilter = document.getElementById('employee-filter');
    const weekFilter = document.getElementById('week-filter');
    
    if (departmentFilter) departmentFilter.addEventListener('change', loadEmployees);
    if (statusFilter) statusFilter.addEventListener('change', loadEmployees);
    if (employeeFilter) employeeFilter.addEventListener('change', loadTimesheets);
    if (weekFilter) weekFilter.addEventListener('change', loadTimesheets);
    
    // Load initial data (employees tab is default)
    loadEmployees();
    
    // Add notification styles if not present
    addNotificationStyles();
});

// Initialize modal handlers for click-outside-to-close
function initModalHandlers() {
    const employeeModal = document.getElementById('employee-modal');
    const scheduleModal = document.getElementById('schedule-modal');
    
    if (employeeModal) {
        employeeModal.addEventListener('click', function(e) {
            if (e.target === employeeModal) {
                closeEmployeeModal();
            }
        });
    }
    
    if (scheduleModal) {
        scheduleModal.addEventListener('click', function(e) {
            if (e.target === scheduleModal) {
                closeScheduleModal();
            }
        });
    }
}

// Add notification styles
function addNotificationStyles() {
    if (!document.getElementById('payroll-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'payroll-notification-styles';
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

// Modal creation functions
function createTimesheetEditModal(timesheet) {
    const employees = PayrollSchedulingData.employees.getAll();
    const employee = employees.find(emp => emp.id === timesheet.employeeId);
    
    const modalHTML = `
        <div id="timesheet-edit-modal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Timesheet - ${employee ? employee.firstName + ' ' + employee.lastName : 'Unknown'}</h3>
                    <button type="button" class="close-btn" onclick="closeTimesheetEditModal()">&times;</button>
                </div>
                <form id="timesheet-edit-form">
                    <div class="form-section">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-hoursWorked">Hours Worked *</label>
                                <input type="number" id="edit-hoursWorked" name="hoursWorked" value="${timesheet.hoursWorked}" min="0" max="168" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-overtimeHours">Overtime Hours</label>
                                <input type="number" id="edit-overtimeHours" name="overtimeHours" value="${timesheet.overtimeHours}" min="0" max="80">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-regularPay">Regular Pay</label>
                                <input type="number" id="edit-regularPay" name="regularPay" value="${timesheet.regularPay}" step="0.01" min="0" readonly>
                            </div>
                            <div class="form-group">
                                <label for="edit-overtimePay">Overtime Pay</label>
                                <input type="number" id="edit-overtimePay" name="overtimePay" value="${timesheet.overtimePay}" step="0.01" min="0" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="edit-status">Status</label>
                            <select id="edit-status" name="status">
                                <option value="pending" ${timesheet.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="approved" ${timesheet.status === 'approved' ? 'selected' : ''}>Approved</option>
                                <option value="processed" ${timesheet.status === 'processed' ? 'selected' : ''}>Processed</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeTimesheetEditModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Timesheet</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Auto-calculate pay when hours change
    const hoursInput = document.getElementById('edit-hoursWorked');
    const overtimeInput = document.getElementById('edit-overtimeHours');
    const regularPayInput = document.getElementById('edit-regularPay');
    const overtimePayInput = document.getElementById('edit-overtimePay');
    
    function calculatePay() {
        if (employee) {
            const hours = parseFloat(hoursInput.value) || 0;
            const overtime = parseFloat(overtimeInput.value) || 0;
            const regularHours = Math.max(0, hours - overtime);
            
            const regularPay = regularHours * employee.hourlyRate;
            const overtimePay = overtime * employee.hourlyRate * 1.5;
            
            regularPayInput.value = regularPay.toFixed(2);
            overtimePayInput.value = overtimePay.toFixed(2);
        }
    }
    
    hoursInput.addEventListener('input', calculatePay);
    overtimeInput.addEventListener('input', calculatePay);
    
    document.getElementById('timesheet-edit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updates = {
            hoursWorked: parseFloat(formData.get('hoursWorked')),
            overtimeHours: parseFloat(formData.get('overtimeHours')) || 0,
            regularPay: parseFloat(formData.get('regularPay')),
            overtimePay: parseFloat(formData.get('overtimePay')),
            totalPay: parseFloat(formData.get('regularPay')) + parseFloat(formData.get('overtimePay')),
            status: formData.get('status')
        };
        
        PayrollSchedulingData.timesheets.update(timesheet.id, updates);
        loadTimesheets();
        closeTimesheetEditModal();
        showNotification('Timesheet updated successfully!', 'success');
    });
}

function closeTimesheetEditModal() {
    const modal = document.getElementById('timesheet-edit-modal');
    if (modal) {
        modal.remove();
    }
}

function createPaystubModal(timesheet, employee) {
    const modalHTML = `
        <div id="paystub-modal" class="modal active">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Pay Stub</h3>
                    <button type="button" class="close-btn" onclick="closePaystubModal()">&times;</button>
                </div>
                <div class="paystub-content">
                    <div class="paystub-header">
                        <h4>${employee.firstName} ${employee.lastName}</h4>
                        <p>Employee ID: ${employee.employeeId}</p>
                        <p>Week of: ${formatDate(timesheet.weekOf)}</p>
                    </div>
                    <div class="paystub-details">
                        <div class="pay-line">
                            <span>Regular Hours (${timesheet.hoursWorked - timesheet.overtimeHours})</span>
                            <span>$${timesheet.regularPay.toFixed(2)}</span>
                        </div>
                        <div class="pay-line">
                            <span>Overtime Hours (${timesheet.overtimeHours})</span>
                            <span>$${timesheet.overtimePay.toFixed(2)}</span>
                        </div>
                        <div class="pay-line total">
                            <span><strong>Total Pay</strong></span>
                            <span><strong>$${timesheet.totalPay.toFixed(2)}</strong></span>
                        </div>
                    </div>
                    <div class="paystub-footer">
                        <p><small>Generated on ${new Date().toLocaleDateString()}</small></p>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closePaystubModal()">Close</button>
                    <button type="button" class="btn btn-primary" onclick="printPaystub()">Print</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add paystub styles
    if (!document.getElementById('paystub-styles')) {
        const style = document.createElement('style');
        style.id = 'paystub-styles';
        style.textContent = `
            .paystub-content {
                padding: 20px 30px;
            }
            .paystub-header {
                text-align: center;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .paystub-header h4 {
                margin: 0 0 10px 0;
                color: #1e40af;
            }
            .paystub-header p {
                margin: 5px 0;
                color: #6b7280;
            }
            .pay-line {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f3f4f6;
            }
            .pay-line.total {
                border-top: 2px solid #e5e7eb;
                border-bottom: 2px solid #e5e7eb;
                margin-top: 10px;
                padding: 12px 0;
                font-size: 1.1em;
            }
            .paystub-footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
            }
        `;
        document.head.appendChild(style);
    }
}

function closePaystubModal() {
    const modal = document.getElementById('paystub-modal');
    if (modal) {
        modal.remove();
    }
}

function printPaystub() {
    window.print();
}

// Load W2 employees
function loadW2Employees() {
    const container = document.getElementById('w2-employee-list');
    if (!container) return;
    
    const employees = PayrollSchedulingData.employees.getAll();
    const year = document.getElementById('w2-year-filter')?.value || '2024';
    
    container.innerHTML = employees.map(employee => {
        const estimatedAnnualHours = employee.employmentType === 'full-time' ? 2080 : 1040;
        const grossWages = (employee.hourlyRate * estimatedAnnualHours).toFixed(2);
        
        return `
            <div class="w2-employee-card">
                <div class="w2-employee-header">
                    <div class="w2-employee-info">
                        <h4>${employee.firstName} ${employee.lastName}</h4>
                        <p class="employee-id">ID: ${employee.employeeId}</p>
                        <p class="position">${employee.position}</p>
                        <p class="department">${formatDepartment(employee.department)}</p>
                    </div>
                    <div class="w2-employee-status">
                        <span class="status-badge ${employee.status}">${formatStatus(employee.status)}</span>
                        <span class="employment-type">${formatEmploymentType(employee.employmentType)}</span>
                    </div>
                </div>
                <div class="w2-employee-details">
                    <div class="w2-wage-info">
                        <p><strong>Hourly Rate:</strong> $${employee.hourlyRate.toFixed(2)}</p>
                        <p><strong>Est. Annual Wages (${year}):</strong> $${grossWages}</p>
                        <p><strong>Hire Date:</strong> ${formatDate(employee.hireDate)}</p>
                    </div>
                </div>
                <div class="w2-employee-actions">
                    <button class="btn btn-primary" onclick="printW2('${employee.id}')">
                        <i class="fas fa-print"></i> Print W2
                    </button>
                    <button class="btn btn-secondary" onclick="viewW2Preview('${employee.id}')">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter W2 employees based on search and year
function filterW2Employees() {
    const searchTerm = document.getElementById('w2-employee-search')?.value.toLowerCase() || '';
    const year = document.getElementById('w2-year-filter')?.value || '2024';
    const container = document.getElementById('w2-employee-list');
    
    if (!container) return;
    
    let employees = PayrollSchedulingData.employees.getAll();
    
    // Filter by search term
    if (searchTerm) {
        employees = employees.filter(emp => 
            emp.firstName.toLowerCase().includes(searchTerm) ||
            emp.lastName.toLowerCase().includes(searchTerm) ||
            emp.employeeId.toLowerCase().includes(searchTerm) ||
            emp.department.toLowerCase().includes(searchTerm) ||
            emp.position.toLowerCase().includes(searchTerm) ||
            emp.email.toLowerCase().includes(searchTerm)
        );
    }
    
    container.innerHTML = employees.map(employee => {
        const estimatedAnnualHours = employee.employmentType === 'full-time' ? 2080 : 1040;
        const grossWages = (employee.hourlyRate * estimatedAnnualHours).toFixed(2);
        
        return `
            <div class="w2-employee-card">
                <div class="w2-employee-header">
                    <div class="w2-employee-info">
                        <h4>${employee.firstName} ${employee.lastName}</h4>
                        <p class="employee-id">ID: ${employee.employeeId}</p>
                        <p class="position">${employee.position}</p>
                        <p class="department">${formatDepartment(employee.department)}</p>
                    </div>
                    <div class="w2-employee-status">
                        <span class="status-badge ${employee.status}">${formatStatus(employee.status)}</span>
                        <span class="employment-type">${formatEmploymentType(employee.employmentType)}</span>
                    </div>
                </div>
                <div class="w2-employee-details">
                    <div class="w2-wage-info">
                        <p><strong>Hourly Rate:</strong> $${employee.hourlyRate.toFixed(2)}</p>
                        <p><strong>Est. Annual Wages (${year}):</strong> $${grossWages}</p>
                        <p><strong>Hire Date:</strong> ${formatDate(employee.hireDate)}</p>
                    </div>
                </div>
                <div class="w2-employee-actions">
                    <button class="btn btn-primary" onclick="printW2('${employee.id}')">
                        <i class="fas fa-print"></i> Print W2
                    </button>
                    <button class="btn btn-secondary" onclick="viewW2Preview('${employee.id}')">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Show no results message if no employees found
    if (employees.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No employees found</h3>
                <p>Try adjusting your search criteria or check if employees exist for the selected year.</p>
            </div>
        `;
    }
}

// View W2 preview in a modal
function viewW2Preview(employeeId) {
    const emp = PayrollSchedulingData.employees.getAll().find(e => e.id === employeeId);
    if (!emp) {
        alert('Employee not found.');
        return;
    }
    
    const year = document.getElementById('w2-year-filter')?.value || '2024';
    const w2Html = generateW2Html(emp, year);
    
    const modalHTML = `
        <div id="w2-preview-modal" class="modal-overlay">
            <div class="modal large-modal">
                <div class="modal-header">
                    <h3 class="modal-title">W2 Preview - ${emp.firstName} ${emp.lastName} (${year})</h3>
                    <button class="modal-close" onclick="closeW2PreviewModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="w2-preview-content">
                        ${w2Html}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeW2PreviewModal()">Close</button>
                    <button type="button" class="btn btn-primary" onclick="printW2('${employeeId}')">Print W2</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close W2 preview modal
function closeW2PreviewModal() {
    const modal = document.getElementById('w2-preview-modal');
    if (modal) {
        modal.remove();
    }
}