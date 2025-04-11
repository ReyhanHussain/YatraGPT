// animations.js - Handles scroll animations and visual effects

// Initialize scroll animation effects
const initScrollAnimations = () => {
    // Select elements to animate
    const elements = document.querySelectorAll(
        '.feature-card, .section-title, .day-card, ' + 
        '.results-card, .profile-card, .step-card, .memory-item'
    );
    
    // Create intersection observer to trigger animations when elements come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Trigger when at least 10% of the element is visible
    });
    
    // Observe each element
    elements.forEach(element => {
        observer.observe(element);
    });
};

export default initScrollAnimations; 