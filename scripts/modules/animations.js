import { CONFIG } from "../config.js";
import { Utils } from "../utils/utils.js";

/**
 * Navigation and UI effects module
 */
export const Animations = {
  // Selector for all animatable elements
  ANIMATABLE_ELEMENTS:
    ".about-card, .timeline-item, .certification-item, .skills-category, .project-card, .contact-card",

  /**
   * Initialize all UI effects and animations
   */
  init() {
    this.setupNavbarScroll();
    this.setupActiveNavLink();
    this.setupSmoothScrolling();
    this.setupParallaxEffects();
    this.setupAnimationStyles();
    this.setupMobileMenu();
    this.setupBackToTop();
    this.setupAnimations();
  },

  /**
   * Set up navbar scroll effect
   */
  setupNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
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
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${sectionId}`
            );
          });
        }
      });
    }, 50);

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
      ${this.ANIMATABLE_ELEMENTS} {
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
   * Set up animations using Intersection Observer and handle initial visibility
   */
  setupAnimations() {
    // Create and configure the intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            // Once animated, no need to observe anymore
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: CONFIG.animation.threshold }
    );

    // Observe all animatable elements
    document.querySelectorAll(this.ANIMATABLE_ELEMENTS).forEach((el) => {
      observer.observe(el);
    });

    // Initial check for elements already in view
    this.checkElementsInView();

    // Also check on window load to ensure all elements are properly animated
    window.addEventListener("load", () => this.checkElementsInView());
  },

  /**
   * Check which elements are in view and animate them immediately
   */
  checkElementsInView() {
    document.querySelectorAll(this.ANIMATABLE_ELEMENTS).forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("animate-in");
      }
    });
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
        menuToggle.setAttribute(
          "aria-expanded",
          document.body.classList.contains("menu-open")
        );
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
    document.body.classList.remove("menu-open");
    const menuToggle = document.querySelector(".menu-toggle");
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
      const scrolled =
        document.body.scrollTop > 300 ||
        document.documentElement.scrollTop > 300;
      backToTopButton.classList.toggle("visible", scrolled);
    }, 50);

    // Smooth scroll to top when button is clicked
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    window.addEventListener("scroll", scrollFunction);
  },
};
