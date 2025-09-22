// Modal Utility Functions

const ModalUtils = {
    // Create modal HTML structure
    createModal: function(id, title, content, footerButtons = []) {
    // Remove any existing modal with the same ID
    this.removeModal(id);
    const modalHTML = `
            <div id="${id}" class="modal-overlay" style="display: none;">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button type="button" class="modal-close" data-modal-close>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${footerButtons.map(btn => `
                            <button type="button" class="btn ${btn.class}" ${btn.attributes || ''}>
                                ${btn.icon ? `<i class="${btn.icon}"></i>` : ''}
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Initialize modal events
        this.initModalEvents(id);
        
        return document.getElementById(id);
    },
    
    // Initialize modal event listeners
    initModalEvents: function(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Close buttons (support multiple elements like header X and footer Cancel)
        const closeBtns = modal.querySelectorAll('[data-modal-close]');
        if (closeBtns && closeBtns.length) {
            closeBtns.forEach(btn => btn.addEventListener('click', () => this.closeModal(modalId)));
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modalId);
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal(modalId);
            }
        });
    },
    
    // Open modal
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Close modal
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },
    
    // Remove modal from DOM
    removeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },
    
    // Show loading state on button
    setButtonLoading: function(button, loading = true) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    },
    
    // Form validation utilities
    validateForm: function(formElement) {
        const errors = {};
        const requiredFields = formElement.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            const value = field.value.trim();
            const fieldName = field.name || field.id;
            
            if (!value) {
                errors[fieldName] = 'This field is required';
            } else {
                // Email validation
                if (field.type === 'email' && !this.isValidEmail(value)) {
                    errors[fieldName] = 'Please enter a valid email address';
                }
                
                // Phone validation
                if (field.type === 'tel' && !this.isValidPhone(value)) {
                    errors[fieldName] = 'Please enter a valid phone number';
                }
            }
        });
        
        return errors;
    },
    
    // Display form errors
    displayFormErrors: function(errors) {
        // Clear previous errors
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
        
        // Display new errors
        Object.keys(errors).forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (field) {
                const formGroup = field.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.add('error');
                    
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = errors[fieldName];
                    formGroup.appendChild(errorDiv);
                }
            }
        });
    },
    
    // Clear form errors
    clearFormErrors: function() {
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
    },
    
    // Email validation
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Phone validation
    isValidPhone: function(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
    },
    
    // Format form data
    getFormData: function(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },
    
    // Populate form with data
    populateForm: function(formElement, data) {
        Object.keys(data).forEach(key => {
            // Special handling for address object and top-level address fields
            if (key === 'address' && typeof data.address === 'object') {
                const address = data.address;
                if (formElement.querySelector('[name="street"]')) {
                    formElement.querySelector('[name="street"]').value = data.street || address.street || '';
                }
                if (formElement.querySelector('[name="city"]')) {
                    formElement.querySelector('[name="city"]').value = data.city || address.city || '';
                }
                if (formElement.querySelector('[name="state"]')) {
                    formElement.querySelector('[name="state"]').value = data.state || address.state || '';
                }
                if (formElement.querySelector('[name="zip"]')) {
                    formElement.querySelector('[name="zip"]').value = data.zip || address.zip || address.zipCode || '';
                }
                return;
            }
            // Map company, type, zip fields to form field names
            let formKey = key;
            if (key === 'type') formKey = 'customerType';
            if (key === 'zip' || key === 'zipCode') formKey = 'zip';
            const field = formElement.querySelector(`[name="${formKey}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = data[key];
                } else if (field.type === 'radio') {
                    const radioButton = formElement.querySelector(`[name="${formKey}"][value="${data[key]}"]`);
                    if (radioButton) radioButton.checked = true;
                } else {
                    field.value = data[key] || '';
                }
            }
        });
    },
    
    // Show success message
    showSuccessMessage: function(message, duration = 3000) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        successDiv.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
            ${message}
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => successDiv.remove(), 300);
        }, duration);
    },
    
    // Show error message
    showErrorMessage: function(message, duration = 5000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message-toast';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle" style="margin-right: 0.5rem;"></i>
            ${message}
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, duration);
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Global safety: ensure any [data-modal-close] click closes the nearest modal overlay
// This protects against cases where per-modal listeners fail to bind
if (!window.__modalUtilsGlobalCloseBound) {
    window.__modalUtilsGlobalCloseBound = true;
    document.addEventListener('click', (event) => {
        const closeEl = event.target.closest('[data-modal-close]');
        if (!closeEl) return;
        const overlay = closeEl.closest('.modal-overlay');
        if (overlay && overlay.id) {
            ModalUtils.closeModal(overlay.id);
            if (closeEl.hasAttribute('data-modal-remove')) {
                ModalUtils.removeModal(overlay.id);
            }
        }
    });
}