// Authentication Handler

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login or logout page
    const isLoginPage = window.location.pathname.includes('index.html') || 
                        window.location.pathname.endsWith('/') ||
                        window.location.pathname.endsWith('/frontend/');
    const isLogoutPage = window.location.pathname.includes('logout.html');
    
    // If not on login or logout page, check authentication
    if (!isLoginPage && !isLogoutPage) {
        checkAuthentication();
    }
    
    // Add event listener to logout button if it exists
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'logout.html';
        });
    }
    
    // Update user info in sidebar if it exists
    updateUserInfo();
});

// Check if user is authenticated
function checkAuthentication() {
    const user = JSON.parse(localStorage.getItem('autocrm_user'));
    
    // If no user or not logged in, redirect to login page
    if (!user || !user.isLoggedIn) {
        window.location.href = 'index.html';
    }
}

// Update user info in sidebar
function updateUserInfo() {
    const userNameElement = document.querySelector('.user-name');
    const userRoleElement = document.querySelector('.user-role');
    
    if (userNameElement && userRoleElement) {
        const user = JSON.parse(localStorage.getItem('autocrm_user'));
        
        if (user) {
            userNameElement.textContent = user.name;
            userRoleElement.textContent = user.role;
        }
    }
}