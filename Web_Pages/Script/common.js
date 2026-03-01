// common.js

// Load Navbar
fetch("navbar.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;

    // Highlight active link automatically
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".main-nav a").forEach(link => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  });

// Load Footer
fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;

    // Set current year dynamically
    const yearSpan = document.getElementById("currentYear");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  });





  /* =========================================================
   SMART "BACK TO TOP" BUTTON LOGIC
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // We use a slight delay or mutation observer because the footer is loaded dynamically
  const initBackToTop = setInterval(() => {
    const topBtn = document.getElementById('backToTop');
    
    if (topBtn) {
      clearInterval(initBackToTop); // Stop checking once we find the button
      
      // Show button when scrolled down 300px
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          topBtn.classList.add('show');
        } else {
          topBtn.classList.remove('show');
        }
      });

      // Smooth scroll to top on click
      topBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }, 500); // Checks every half second until the footer is loaded
});


// Global Mobile Modal Generator
function showMobileModal(htmlContent) {
  // Prevent firing on desktop
  if (window.innerWidth > 768) return;

  // Create overlay if it doesn't exist
  let overlay = document.querySelector('.mobile-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-modal-overlay';
    document.body.appendChild(overlay);

    // Close on background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMobileModal();
    });
  }

  overlay.innerHTML = `
    <div class="mobile-modal-content">
      <div class="mobile-modal-close" onclick="closeMobileModal()">✕</div>
      ${htmlContent}
    </div>
  `;

  // Force reflow and animate in
  setTimeout(() => overlay.classList.add('active'), 10);
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeMobileModal() {
  const overlay = document.querySelector('.mobile-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => {
      document.body.style.overflow = '';
    }, 300);
  }
}