import { CONFIGS } from "../configs.js";
import { Utils } from "../utils.js";

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
    this.setupMobileMenu();
    this.setupBackToTop();
    this.setupAnimations();
    this.setupShowMoreHandlers();
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
            top: targetElement.offsetTop - CONFIGS.animation.scrollOffset,
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
   * Set up animations using Intersection Observer and handle initial visibility
   */
  setupAnimations() {
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
      { threshold: CONFIGS.animation.threshold }
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

  /**
   * Set up handlers for "show more" functionality, preserves original display properties
   */
  setupShowMoreHandlers() {
    document.querySelectorAll(".hidden-item").forEach((item) => {
      const computedStyle = window.getComputedStyle(item);
      item.dataset.originalDisplay =
        computedStyle.display !== "none"
          ? computedStyle.display
          : item.tagName === "DIV"
          ? "block"
          : "inline";
    });

    // Handle show more/less buttons
    document
      .querySelectorAll('[data-action="show-more"], [data-action="show-less"]')
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          const targetId = button.getAttribute("data-target");
          const targetItems = document.querySelectorAll(targetId);

          targetItems.forEach((item) => {
            if (item.classList.contains("hidden-item")) {
              item.classList.remove("hidden-item");
              item.classList.add("show-item");
              item.style.display = item.dataset.originalDisplay;
            } else {
              item.classList.add("hidden-item");
              item.classList.remove("show-item");
            }
          });

          // Toggle button text if data-alt-text is provided
          const altText = button.getAttribute("data-alt-text");
          if (altText) {
            const currentText = button.textContent;
            button.textContent = altText;
            button.setAttribute("data-alt-text", currentText);
          }
        });
      });
  },
};
