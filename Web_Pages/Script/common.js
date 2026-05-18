/* common.js — Global loader + Premium auto-inject */

/* ─── 1. INJECT PREMIUM ASSETS (runs before anything else) ─── */
(function injectPremiumAssets() {
  // Google Fonts — Barlow Condensed + Barlow
  if (!document.querySelector('link[data-premium-font]')) {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.setAttribute('data-premium-font', '');
    font.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Barlow:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(font);
  }

  // premium-global.css — global design system
  if (!document.querySelector('link[data-premium-global]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.setAttribute('data-premium-global', '');

    // Auto-resolve path whether page is in root or a subfolder (e.g. /cars/)
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
    css.href = prefix + 'Styles/premium-global.css';
    document.head.appendChild(css);
  }

  // premium-global.js — global interactions
  if (!document.querySelector('script[data-premium-global]')) {
    const js = document.createElement('script');
    js.defer = true;
    js.setAttribute('data-premium-global', '');
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
    js.src = prefix + 'Script/premium-global.js';
    document.body.appendChild(js);
  }
})();

/* ─── 2. LOAD NAVBAR ──────────────────────────────────────── */
fetch("navbar.html")
  .then(res => res.text())
  .then(data => {
    const navEl = document.getElementById("navbar");
    if (!navEl) return;
    navEl.innerHTML = data;

    // Highlight active link
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".main-nav a").forEach(link => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  });

/* ─── 3. LOAD FOOTER ──────────────────────────────────────── */
fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    const footerEl = document.getElementById("footer");
    if (!footerEl) return;
    footerEl.innerHTML = data;

    // Set current year
    const yearSpan = document.getElementById("currentYear");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  });

/* ─── 4. SMART BACK TO TOP ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const initBackToTop = setInterval(() => {
    const topBtn = document.getElementById('backToTop');
    if (!topBtn) return;

    clearInterval(initBackToTop);

    window.addEventListener('scroll', () => {
      topBtn.classList.toggle('show', window.scrollY > 300);
    }, { passive: true });

    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, 500);
});

/* ─── 5. GLOBAL MOBILE MODAL ─────────────────────────────── */
function showMobileModal(htmlContent) {
  if (window.innerWidth > 768) return;

  let overlay = document.querySelector('.mobile-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-modal-overlay';
    document.body.appendChild(overlay);
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

  setTimeout(() => overlay.classList.add('active'), 10);
  document.body.style.overflow = 'hidden';
}

function closeMobileModal() {
  const overlay = document.querySelector('.mobile-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => { document.body.style.overflow = ''; }, 300);
  }
}