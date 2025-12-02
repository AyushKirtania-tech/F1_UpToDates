// navbar.js - Mobile Navigation Handler
(function() {
  'use strict';

  function initNavbar() {
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.main-nav');
    const header = document.querySelector('.site-header');
    
    if (!toggleButton || !nav) {
      // Retry after a short delay if elements not found
      setTimeout(initNavbar, 100);
      return;
    }

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
      document.body.classList.toggle('menu-open', !isExpanded);
    }

    // Close menu function
    function closeMenu() {
      toggleButton.classList.remove('active');
      nav.classList.remove('active');
      header.classList.remove('menu-open');
      toggleButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }

    // Click event on toggle button
    toggleButton.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking nav links
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInside = header.contains(event.target);
      if (!isClickInside && nav.classList.contains('active')) {
        closeMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && nav.classList.contains('active')) {
        closeMenu();
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
        }
      }, 250);
    });

    // Set active link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
      const linkPage = link.getAttribute('href');
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();