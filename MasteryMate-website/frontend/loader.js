// Hide loader after a delay and show content
window.addEventListener('load', function() {
    setTimeout(function() {
        // Hide loader
        document.querySelector('.loader-container').style.display = 'none';
        // Show main content
        document.querySelector('main').style.visibility = 'visible';
        document.body.style.overflow = 'auto'; // Allow overflow after loader is hidden
    }, 1000); // Adjust the delay time (in milliseconds) as needed
});

document.addEventListener("DOMContentLoaded", function() {
    const sections = document.querySelectorAll(".section");

    const options = {
        rootMargin: "0px",
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.transition = "opacity 0.5s ease, transform 0.5s ease"; // Add smoother transition
                entry.target.style.opacity = "1"; // Fade in when section is in view
                entry.target.style.transform = "translateY(0)"; // Slide in from top
                observer.unobserve(entry.target); // Stop observing once animation is complete
            }
        });
    }, options);

    sections.forEach(function(section) {
        observer.observe(section); // Start observing each section
    });

    // Smooth scroll to section when navlink is clicked
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(function(navLink) {
        navLink.addEventListener("click", function(event) {
            event.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: "smooth"
                });
            }
        });
    });
});

