// Index page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('autocrm_user'));
    
    // If user is logged in, redirect to dashboard
    if (user && user.isLoggedIn) {
        window.location.href = 'dashboard.html';
    }
});