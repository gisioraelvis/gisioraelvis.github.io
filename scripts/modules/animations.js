import { CONFIGS } from "../configs.js";

/**
 * Handles UI animations, effects, and skill visualizations
 */
export const Animations = {
  // Elements that receive entrance animations
  ANIMATABLE_ELEMENTS:
    ".about-card, .timeline-item, .certification-item, .skills-category, .project-card, .contact-card",

  /**
   * Initialize animation effects and visualizations
   */
  init() {
    this.setupParallaxEffects();
    this.setupAnimations();
    this.setupSkillIndicators();
    this.setupSkillsObserver();
  },

  /**
   * Setup parallax movement effects on badges
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
   * Setup intersection-based animations
   */
  setupAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: CONFIGS.animation.threshold }
    );

    document.querySelectorAll(this.ANIMATABLE_ELEMENTS).forEach((el) => {
      observer.observe(el);
    });

    this.checkElementsInView();
    window.addEventListener("load", () => this.checkElementsInView());
  },

  /**
   * Apply animations to elements already in viewport
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
   * Setup skill percentage indicators with visual cues
   */
  setupSkillIndicators() {
    document.querySelectorAll(".skills-icons a").forEach((icon) => {
      const title = icon.getAttribute("title") || "";
      const percentageMatch = title.match(/(\d+)%/);

      if (!percentageMatch || !percentageMatch[1]) return;

      const percentage = parseInt(percentageMatch[1], 10);
      icon.style.setProperty("--skill-percentage", `${percentage}%`);

      // Reset classes before applying new ones
      icon.classList.remove(
        "expert-level",
        "advanced-level",
        "intermediate-level",
        "beginner-level"
      );

      this.applyProficiencyClass(icon, percentage);
      icon.classList.add("with-indicator");
    });
  },

  /**
   * Apply appropriate proficiency class based on percentage
   */
  applyProficiencyClass(element, percentage) {
    if (percentage >= 85) {
      element.classList.add("expert-level");
    } else if (percentage >= 75) {
      element.classList.add("advanced-level");
    } else if (percentage >= 65) {
      element.classList.add("intermediate-level");
    } else {
      element.classList.add("beginner-level");
    }
  },

  /**
   * Setup observation-based animations for skills
   */
  setupSkillsObserver() {
    const skillsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            skillsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );

    document
      .querySelectorAll(".skills-category, .soft-skill-item")
      .forEach((element) => {
        skillsObserver.observe(element);
      });
  },
};
