// Mobile navigation for sidebar on small screens
// This script enables the hamburger menu to open/close the sidebar and overlay

(function initMobileNav() {
  function setup() {
    // Support both class names for mobile menu button
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle') || document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    if (!mobileMenuToggle || !sidebar) return;

    // Ensure only one overlay exists
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }

    // Toggle sidebar visibility
    mobileMenuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    });

    // Close when clicking outside (overlay)
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });

    // Close sidebar after selecting a menu item on mobile
    const menuItems = document.querySelectorAll('.sidebar-nav a');
    menuItems.forEach(item => {
      item.addEventListener('click', function() {
        if (window.innerWidth < 768) {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
        }
      });
    });

    // Reset state on resize
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();