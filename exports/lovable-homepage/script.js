// City of Doral - Clean JavaScript for Lovable
// Simplified from OpenCities CMS

document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
      this.setAttribute('aria-expanded', nav.classList.contains('active'));
    });
  }

  // Search Bar Typing Animation (optional)
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    const placeholders = [
      'Search for services...',
      'Find building permits...',
      'Explore parks and recreation...',
      'Look up city events...'
    ];
    let currentIndex = 0;

    setInterval(() => {
      currentIndex = (currentIndex + 1) % placeholders.length;
      searchInput.placeholder = placeholders[currentIndex];
    }, 3000);
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Dropdown hover for desktop
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('mouseenter', function() {
      this.querySelector('.nav-dropdown-menu')?.classList.add('active');
    });
    dropdown.addEventListener('mouseleave', function() {
      this.querySelector('.nav-dropdown-menu')?.classList.remove('active');
    });
  });
});
