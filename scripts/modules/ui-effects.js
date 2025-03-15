import { CONFIG } from "../config.js";
import { Utils } from "../utils/utils.js";

/**
 * Navigation and UI effects module
 */
export const UIEffects = {
  /**
   * Initialize all UI effects
   */
  init() {
    this.setupNavbarScroll();
    this.setupActiveNavLink();
    this.setupSmoothScrolling();
    this.setupParallaxEffects();
    this.setupAnimationStyles();
    this.setupMobileMenu();
    this.setupBackToTop();
  },

  /**
   * Set up navbar scroll effect
   */
  setupNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  },

  /**
   * Set up active nav link highlighting
   */
  setupActiveNavLink() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");
    if (!sections.length || !navLinks.length) return;

    const highlightNavLink = Utils.debounce(() => {
      const scrollPosition = window.scrollY;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("active");
            }
          });
        }
      });
    }, 50); // Debounce to improve performance

    window.addEventListener("scroll", highlightNavLink);
  },

  /**
   * Set up smooth scrolling for anchor links
   */
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - CONFIG.animation.scrollOffset,
            behavior: "smooth",
          });
        }
      });
    });
  },

  /**
   * Set up parallax effects for badges
   */
  setupParallaxEffects() {
    const badges = document.querySelectorAll(".badge");
    if (!badges.length) return;

    window.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      badges.forEach((badge) => {
        const speed = 20;
        const xOffset = (x - 0.5) * speed;
        const yOffset = (y - 0.5) * speed;

        badge.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    });
  },

  /**
   * Set up CSS animation styles
   */
  setupAnimationStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .about-card, .timeline-item, .certification-item, .skills-category, .project-card, .contact-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      
      .animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      /* Timeline animations */
      .timeline-item:nth-child(1) { transition-delay: 0.1s; }
      .timeline-item:nth-child(2) { transition-delay: 0.2s; }
      .timeline-item:nth-child(3) { transition-delay: 0.3s; }
      
      /* About card animations */
      .about-card:nth-child(1) { transition-delay: 0.1s; }
      .about-card:nth-child(2) { transition-delay: 0.2s; }
      .about-card:nth-child(3) { transition-delay: 0.3s; }
      
      /* Certification animations */
      .certification-item:nth-child(n) { transition-delay: calc(0.1s * var(--n, 1)); }
      
      /* Skills animations */
      .skills-category:nth-child(1) { transition-delay: 0.1s; }
      .skills-category:nth-child(2) { transition-delay: 0.2s; }
      .skills-category:nth-child(3) { transition-delay: 0.3s; }
      
      /* Hidden items */
      .hidden-item {
        display: none;
        opacity: 0;
        transform: translateY(20px);
      }
      
      .show-item {
        display: block;
        animation: fadeInUp 0.5s forwards;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * Set up mobile menu
   */
  setupMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const menuOverlay = document.querySelector(".menu-overlay");
    const navLinks = document.querySelectorAll(".nav-links a");
    const closeButton = document.querySelector(".close-menu");

    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        document.body.classList.toggle("menu-open");
        const isOpen = document.body.classList.contains("menu-open");
        menuToggle.setAttribute("aria-expanded", isOpen);
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", () => this.closeMobileMenu());
    }

    if (menuOverlay) {
      menuOverlay.addEventListener("click", () => this.closeMobileMenu());
    }

    // Close menu when a nav link is clicked
    navLinks.forEach((link) => {
      link.addEventListener("click", () => this.closeMobileMenu());
    });

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeMobileMenu();
    });
  },

  /**
   * Close the mobile menu
   */
  closeMobileMenu() {
    const body = document.body;
    const menuToggle = document.querySelector(".menu-toggle");

    body.classList.remove("menu-open");

    // Update aria-expanded attribute
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  },

  /**
   * Set up back to top button behavior
   */
  setupBackToTop() {
    const backToTopButton = document.getElementById("backToTop");
    if (!backToTopButton) return;

    // Show button when user scrolls down 300px
    const scrollFunction = Utils.debounce(() => {
      if (
        document.body.scrollTop > 300 ||
        document.documentElement.scrollTop > 300
      ) {
        backToTopButton.classList.add("visible");
      } else {
        backToTopButton.classList.remove("visible");
      }
    }, 50); // Debounce to improve performance

    // Smooth scroll to top when button is clicked
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    // Attach scroll event listener
    window.addEventListener("scroll", scrollFunction);
  },
};
