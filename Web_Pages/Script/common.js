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