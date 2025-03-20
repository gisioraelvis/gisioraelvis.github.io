import { CONFIGS } from "../configs.js";
import { Utils } from "../utils.js";

/**
 * Handles all navigation-related functionality and scrolling behaviors
 */
export const Navigation = {
  /**
   * Initialize navigation components
   */
  init() {
    this.setupNavbarScroll();
    this.setupActiveNavLink();
    this.setupSmoothScrolling();
    this.setupMobileMenu();
    this.setupBackToTop();
    this.setupSkillsTabs();
  },

  /**
   * Toggle navbar appearance on scroll
   */
  setupNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
  },

  /**
   * Highlight active navigation link based on scroll position
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
   * Enable smooth scrolling for anchor links
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
   * Setup mobile menu with accessibility support
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

    navLinks.forEach((link) => {
      link.addEventListener("click", () => this.closeMobileMenu());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeMobileMenu();
    });
  },

  /**
   * Close mobile menu and reset aria states
   */
  closeMobileMenu() {
    document.body.classList.remove("menu-open");
    const menuToggle = document.querySelector(".menu-toggle");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  },

  /**
   * Setup back to top button behavior
   */
  setupBackToTop() {
    const backToTopButton = document.getElementById("backToTop");
    if (!backToTopButton) return;

    let scrollTimer;
    let lastScrollTop = 0;
    let wasVisible = false;
    let isAnimating = false;

    const updateButtonState = (scrollTop) => {
      const shouldShow = scrollTop > 300;
      backToTopButton.classList.toggle("visible", shouldShow);

      if (shouldShow) {
        backToTopButton.classList.toggle("was-visible", wasVisible);
        wasVisible = true;

        const direction =
          scrollTop > lastScrollTop ? "scrolling-down" : "scrolling-up";
        lastScrollTop = scrollTop;

        if (!isAnimating) {
          backToTopButton.classList.remove("scrolling-up", "scrolling-down");
          backToTopButton.classList.add(direction);
        }

        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          if (!isAnimating) {
            backToTopButton.classList.remove("scrolling-up", "scrolling-down");
          }
        }, 500);
      } else {
        setTimeout(() => {
          wasVisible = false;
          backToTopButton.classList.remove("was-visible");
        }, 300);
      }
    };

    const handleScroll = Utils.debounce(() => {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      updateButtonState(scrollTop);
    }, 50);

    backToTopButton.addEventListener("click", (e) => {
      e.preventDefault();

      backToTopButton.classList.add("active");
      isAnimating = true;

      setTimeout(() => {
        backToTopButton.classList.remove("active");
        isAnimating = false;

        const currentScrollTop =
          document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScrollTop < 50) {
          backToTopButton.classList.remove("scrolling-up", "scrolling-down");
        } else {
          updateButtonState(currentScrollTop);
        }
      }, 1000);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        backToTopButton.classList.remove("scrolling-up", "scrolling-down");
      }
    });

    handleScroll();
  },

  /**
   * Setup skills category tabs interaction
   */
  setupSkillsTabs() {
    const categoryTabs = document.querySelectorAll(".skills-category-tab");
    if (!categoryTabs.length) return;

    categoryTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.updateSkillsTabStates(categoryTabs, tab);
        this.showSkillsTabContent(tab);
      });
    });
  },

  /**
   * Update tab states for accessibility
   */
  updateSkillsTabStates(tabs, activeTab) {
    tabs.forEach((tab) => {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected", "false");
    });

    activeTab.classList.add("active");
    activeTab.setAttribute("aria-selected", "true");
  },

  /**
   * Show content for selected tab
   */
  showSkillsTabContent(tab) {
    const targetId = tab.getAttribute("aria-controls");
    const categories = document.querySelectorAll(".skills-main-category");

    categories.forEach((category) => {
      category.classList.remove("active");
    });

    document.getElementById(targetId)?.classList.add("active");
  },
};
