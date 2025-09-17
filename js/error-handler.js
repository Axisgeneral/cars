// Global Error Handler for TheOnePages
// Suppresses browser extension errors and provides better error handling

(function() {
    'use strict';
    
    // List of error messages to suppress (typically from browser extensions)
    const suppressedErrors = [
        'message channel closed before a response was received',
        'A listener indicated an asynchronous response by returning true',
        'Extension context invalidated',
        'Could not establish connection',
        'The message port closed before a response was received'
    ];
    
    // Global error handler
    window.addEventListener('error', function(e) {
        // Check if this is a suppressed error
        if (e.message && suppressedErrors.some(msg => e.message.includes(msg))) {
            console.debug('Suppressed extension error:', e.message);
            e.preventDefault();
            return true;
        }
        
        // Log other errors for debugging (in development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Application Error:', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                error: e.error
            });
        }
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        // Check if this is a suppressed error
        if (e.reason && e.reason.message && 
            suppressedErrors.some(msg => e.reason.message.includes(msg))) {
            console.debug('Suppressed extension promise rejection:', e.reason.message);
            e.preventDefault();
            return true;
        }
        
        // Log other promise rejections for debugging (in development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Unhandled Promise Rejection:', e.reason);
        }
    });
    
    // Console override to reduce extension noise (optional)
    const originalConsoleError = console.error;
    console.error = function(...args) {
        // Check if any argument contains suppressed error messages
        const shouldSuppress = args.some(arg => 
            typeof arg === 'string' && 
            suppressedErrors.some(msg => arg.includes(msg))
        );
        
        if (!shouldSuppress) {
            originalConsoleError.apply(console, args);
        }
    };
    
})();