/**
 * Loading Manager - Handles loading states for forms, buttons, and page transitions
 */

class LoadingManager {
    constructor() {
        this.pageLoadingOverlay = null;
        this.init();
    }

    init() {
        this.createPageLoadingOverlay();
        this.setupPageTransitionListeners();
    }

    /**
     * Create the page loading overlay
     */
    createPageLoadingOverlay() {
        if (this.pageLoadingOverlay) return;

        this.pageLoadingOverlay = document.createElement('div');
        this.pageLoadingOverlay.className = 'page-loading-overlay';
        this.pageLoadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <p class="loading-message">Loading...</p>
            </div>
        `;
        document.body.appendChild(this.pageLoadingOverlay);
    }

    /**
     * Show page loading overlay
     * @param {string} message - Loading message to display
     */
    showPageLoading(message = 'Loading...') {
        if (!this.pageLoadingOverlay) this.createPageLoadingOverlay();
        
        const messageElement = this.pageLoadingOverlay.querySelector('.loading-message');
        if (messageElement) {
            messageElement.textContent = message;
        }

        // Apply dark theme if active
        const isDarkTheme = document.body.classList.contains('theme-dark');
        this.pageLoadingOverlay.classList.toggle('dark', isDarkTheme);

        this.pageLoadingOverlay.classList.add('active');
    }

    /**
     * Hide page loading overlay
     */
    hidePageLoading() {
        if (this.pageLoadingOverlay) {
            this.pageLoadingOverlay.classList.remove('active');
        }
    }

    /**
     * Show loading state for a button
     * @param {HTMLElement} button - Button element
     * @param {string} loadingText - Text to show while loading
     */
    showButtonLoading(button, loadingText = null) {
        if (!button) return;

        button.classList.add('btn-loading');
        button.disabled = true;

        // Store original text
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent;
        }

        // Wrap text in span for animation
        if (!button.querySelector('.btn-text')) {
            button.innerHTML = `<span class="btn-text">${button.innerHTML}</span>`;
        }

        if (loadingText) {
            button.querySelector('.btn-text').textContent = loadingText;
        }
    }

    /**
     * Hide loading state for a button
     * @param {HTMLElement} button - Button element
     */
    hideButtonLoading(button) {
        if (!button) return;

        button.classList.remove('btn-loading');
        button.disabled = false;

        // Restore original text
        if (button.dataset.originalText) {
            const textSpan = button.querySelector('.btn-text');
            if (textSpan) {
                textSpan.textContent = button.dataset.originalText;
            } else {
                button.textContent = button.dataset.originalText;
            }
        }
    }

    /**
     * Show loading state for a form
     * @param {HTMLElement} form - Form element
     */
    showFormLoading(form) {
        if (!form) return;
        form.classList.add('form-loading');
    }

    /**
     * Hide loading state for a form
     * @param {HTMLElement} form - Form element
     */
    hideFormLoading(form) {
        if (!form) return;
        form.classList.remove('form-loading');
    }

    /**
     * Show loading state for a card/container
     * @param {HTMLElement} element - Element to show loading for
     */
    showCardLoading(element) {
        if (!element) return;
        element.classList.add('card-loading');
    }

    /**
     * Hide loading state for a card/container
     * @param {HTMLElement} element - Element to hide loading for
     */
    hideCardLoading(element) {
        if (!element) return;
        element.classList.remove('card-loading');
    }

    /**
     * Show loading state for a table
     * @param {HTMLElement} table - Table element
     */
    showTableLoading(table) {
        if (!table) return;
        table.classList.add('table-loading');
    }

    /**
     * Hide loading state for a table
     * @param {HTMLElement} table - Table element
     */
    hideTableLoading(table) {
        if (!table) return;
        table.classList.remove('table-loading');
    }

    /**
     * Create an inline loading spinner
     * @param {string} text - Text to display with spinner
     * @returns {HTMLElement} Loading element
     */
    createInlineLoading(text = 'Loading...') {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-inline';
        loadingElement.innerHTML = `
            <div class="spinner-inline"></div>
            <span>${text}</span>
        `;
        return loadingElement;
    }

    /**
     * Create a skeleton loading element
     * @param {string} type - Type of skeleton (text, avatar, card)
     * @param {number} lines - Number of lines for text skeleton
     * @returns {HTMLElement} Skeleton element
     */
    createSkeleton(type = 'text', lines = 3) {
        const skeleton = document.createElement('div');
        
        switch (type) {
            case 'text':
                skeleton.className = 'skeleton-container';
                for (let i = 0; i < lines; i++) {
                    const line = document.createElement('div');
                    line.className = 'skeleton skeleton-text';
                    skeleton.appendChild(line);
                }
                break;
            case 'avatar':
                skeleton.className = 'skeleton skeleton-avatar';
                break;
            case 'card':
                skeleton.className = 'skeleton skeleton-card';
                break;
        }
        
        return skeleton;
    }

    /**
     * Setup automatic page transition loading
     */
    setupPageTransitionListeners() {
        // Handle navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            
            // Skip external links, anchors, and javascript links
            if (!href || 
                href.startsWith('#') || 
                href.startsWith('javascript:') || 
                href.startsWith('mailto:') || 
                href.startsWith('tel:') ||
                href.includes('://')) {
                return;
            }

            // Skip if it's the current page
            if (href === window.location.pathname.split('/').pop()) {
                return;
            }

            // Show loading for internal navigation
            this.showPageLoading('Navigating...');
        });

        // Handle form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (!form.classList.contains('no-loading')) {
                this.showFormLoading(form);
                
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    this.showButtonLoading(submitButton, 'Processing...');
                }
            }
        });

        // Hide loading when page loads
        window.addEventListener('load', () => {
            this.hidePageLoading();
        });

        // Hide loading on page show (for back/forward navigation)
        window.addEventListener('pageshow', () => {
            this.hidePageLoading();
        });

        // Show loading on beforeunload
        window.addEventListener('beforeunload', () => {
            this.showPageLoading('Loading...');
        });
    }

    /**
     * Simulate async operation with loading
     * @param {Function} asyncFunction - Async function to execute
     * @param {HTMLElement} element - Element to show loading on
     * @param {string} type - Type of loading (button, form, card, table, page)
     * @param {string} message - Loading message
     */
    async withLoading(asyncFunction, element = null, type = 'page', message = 'Loading...') {
        try {
            // Show loading
            switch (type) {
                case 'button':
                    this.showButtonLoading(element, message);
                    break;
                case 'form':
                    this.showFormLoading(element);
                    break;
                case 'card':
                    this.showCardLoading(element);
                    break;
                case 'table':
                    this.showTableLoading(element);
                    break;
                case 'page':
                default:
                    this.showPageLoading(message);
                    break;
            }

            // Execute async function
            const result = await asyncFunction();
            return result;

        } catch (error) {
            console.error('Error in async operation:', error);
            throw error;
        } finally {
            // Hide loading
            switch (type) {
                case 'button':
                    this.hideButtonLoading(element);
                    break;
                case 'form':
                    this.hideFormLoading(element);
                    break;
                case 'card':
                    this.hideCardLoading(element);
                    break;
                case 'table':
                    this.hideTableLoading(element);
                    break;
                case 'page':
                default:
                    this.hidePageLoading();
                    break;
            }
        }
    }

    /**
     * Create a progress bar
     * @param {HTMLElement} container - Container to append progress bar
     * @param {boolean} indeterminate - Whether progress is indeterminate
     * @returns {Object} Progress bar controller
     */
    createProgressBar(container, indeterminate = false) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-bar-fill';
        if (indeterminate) {
            progressFill.classList.add('indeterminate');
        }
        
        progressBar.appendChild(progressFill);
        container.appendChild(progressBar);

        return {
            element: progressBar,
            setProgress: (percent) => {
                if (!indeterminate) {
                    progressFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
                }
            },
            remove: () => {
                if (progressBar.parentNode) {
                    progressBar.parentNode.removeChild(progressBar);
                }
            }
        };
    }
}

// Create global instance
window.LoadingManager = new LoadingManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}