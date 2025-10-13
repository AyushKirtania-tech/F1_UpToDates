// navbar.js - Mobile Navigation Handler
// This script handles the hamburger menu functionality

(function() {
  'use strict';

  // Wait for DOM to be fully loaded
  function initNavbar() {
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.main-nav');
    const header = document.querySelector('.site-header');
    
    if (!toggleButton || !nav) {
      console.warn('Navbar elements not found. Retrying...');
      // Retry after a short delay (in case navbar.html is still loading)
      setTimeout(initNavbar, 100);
      return;
    }
    console.log('Button clicked!', toggleButton);
    console.log('✅ Navbar initialized');

    // Toggle menu function
    function toggleMenu() {
      const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
      
      // Toggle aria-expanded
      toggleButton.setAttribute('aria-expanded', !isExpanded);
      
      // Toggle active classes
      toggleButton.classList.toggle('active');
      nav.classList.toggle('active');
      header.classList.toggle('menu-open');
      
      // Prevent body scroll when menu is open
      if (!isExpanded) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    // Close menu function
    function closeMenu() {
      toggleButton.classList.remove('active');
      nav.classList.remove('active');
      header.classList.remove('menu-open');
      toggleButton.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    // Click event on toggle button
    toggleButton.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
      console.log('Menu toggled');
    });

    // Close menu when clicking nav links
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        closeMenu();
        console.log('Menu closed via link click');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInside = header.contains(event.target);
      if (!isClickInside && nav.classList.contains('active')) {
        closeMenu();
        console.log('Menu closed via outside click');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && nav.classList.contains('active')) {
        closeMenu();
        console.log('Menu closed via Escape key');
      }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Close menu if resizing to desktop
        if (window.innerWidth > 768 && nav.classList.contains('active')) {
          closeMenu();
          console.log('Menu closed due to resize');
        }
      }, 250);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    // DOM is already loaded
    initNavbar();
  }

})();