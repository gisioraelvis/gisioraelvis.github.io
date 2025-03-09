import { CONFIG } from "../config.js";
import { Utils } from "../utils/utils.js";

/**
 * Animation controller for handling element animations
 */
export const AnimationController = {
  /**
   * Initialize animations for elements
   */
  init() {
    // Set up intersection observer for animations
    this.setupIntersectionObserver();

    // Initial check for elements in view
    this.checkElementsInView();

    // Recheck on scroll and load
    window.addEventListener("load", this.checkElementsInView.bind(this));
    window.addEventListener(
      "scroll",
      Utils.debounce(this.checkElementsInView.bind(this), 50)
    );
  },

  /**
   * Setup intersection observer for animations
   */
  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: CONFIG.animation.threshold }
    );

    // Select all animatable elements
    document
      .querySelectorAll(
        ".about-card, .timeline-item, .certification-item, .skills-category, .project-card, .contact-card"
      )
      .forEach((el) => {
        observer.observe(el);
      });
  },

  /**
   * Check if elements are in view and animate them
   */
  checkElementsInView() {
    const animateElements = document.querySelectorAll(
      ".about-card, .timeline-item, .certification-item, .skills-category, .contact-card"
    );

    animateElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("animate-in");
      }
    });
  },
};
