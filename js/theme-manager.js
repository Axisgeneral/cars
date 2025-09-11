// Global Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.init();
    }

    init() {
        // Apply the current theme immediately
        this.applyTheme(this.currentTheme);
        
        // Listen for theme changes from other pages
        window.addEventListener('storage', (e) => {
            if (e.key === 'autoconnect_settings') {
                const settings = JSON.parse(e.newValue);
                if (settings && settings.theme !== this.currentTheme) {
                    this.currentTheme = settings.theme;
                    this.applyTheme(this.currentTheme);
                }
            }
        });
    }

    // Load theme from localStorage
    loadTheme() {
        const settings = localStorage.getItem('autoconnect_settings');
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            return parsedSettings.theme || 'blue';
        }
        return 'blue'; // Default theme
    }

    // Apply theme to the current page
    applyTheme(theme) {
        // Remove all existing theme classes
        document.body.classList.remove('theme-blue', 'theme-dark', 'theme-green', 'theme-purple');
        
        // Add the new theme class
        document.body.classList.add(`theme-${theme}`);
        
        // Update the current theme
        this.currentTheme = theme;
        
        // Dispatch custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme } 
        }));
        
        console.log(`Theme applied: ${theme}`);
    }

    // Change theme and save to localStorage
    changeTheme(theme) {
        // Update settings in localStorage
        const settings = JSON.parse(localStorage.getItem('autoconnect_settings') || '{}');
        settings.theme = theme;
        localStorage.setItem('autoconnect_settings', JSON.stringify(settings));
        
        // Apply the theme
        this.applyTheme(theme);
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Get available themes
    getAvailableThemes() {
        return [
            { id: 'blue', name: 'Modern Blue', description: 'Professional blue theme (Default)' },
            { id: 'dark', name: 'Dark Mode', description: 'Easy on the eyes dark theme' },
            { id: 'green', name: 'Nature Green', description: 'Fresh green color scheme' },
            { id: 'purple', name: 'Royal Purple', description: 'Elegant purple theme' }
        ];
    }
}

// Create global theme manager instance
window.themeManager = new ThemeManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}