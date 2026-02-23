// Script/about.js - Smooth Scroll Animations

document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with the 'fade-in' class
    const faders = document.querySelectorAll('.fade-in');

    // Create an Intersection Observer
    const appearOptions = {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Triggers slightly before it hits the very bottom
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                // Add the 'visible' class to trigger CSS animation
                entry.target.classList.add('visible');
                // Stop observing once it has animated in
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    // Apply observer to each fader element
    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });
    
    // Quick load for the hero section so it doesn't wait for scroll
    setTimeout(() => {
        const hero = document.querySelector('.about-hero.fade-in');
        if (hero) hero.classList.add('visible');
    }, 100);
});