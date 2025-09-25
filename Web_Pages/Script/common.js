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
