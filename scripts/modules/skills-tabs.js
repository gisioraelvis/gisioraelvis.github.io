/**
 * SkillsTabs Module - Manages interactive skills category tabs and animations
 */
export class SkillsTabs {
  static init() {
    this.initTechStackTabs();
    this.setupSkillIndicators();
    this.setupIntersectionObservers();
    this.initResponsiveBehavior();
  }

  static initTechStackTabs() {
    const categoryTabs = document.querySelectorAll(".skills-category-tab");

    categoryTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Update tab states
        categoryTabs.forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        // Show corresponding content
        const targetId = tab.getAttribute("aria-controls");
        const categories = document.querySelectorAll(".skills-main-category");

        categories.forEach((category) => {
          category.classList.remove("active");
        });

        document.getElementById(targetId).classList.add("active");
      });
    });
  }

  /**
   * Enhanced skill indicators with consistent color matching between
   * skill icons, borders, tooltips and legend
   */
  static setupSkillIndicators() {
    document.querySelectorAll(".skills-icons a").forEach((icon) => {
      const title = icon.getAttribute("title") || "";
      const percentageMatch = title.match(/(\d+)%/);

      if (percentageMatch && percentageMatch[1]) {
        const percentage = parseInt(percentageMatch[1], 10);
        icon.style.setProperty("--skill-percentage", `${percentage}%`);

        // Remove any existing level classes first
        icon.classList.remove(
          "expert-level",
          "advanced-level",
          "intermediate-level",
          "beginner-level"
        );

        // Add proficiency level class based on percentage
        if (percentage >= 85) {
          icon.classList.add("expert-level");
        } else if (percentage >= 75) {
          icon.classList.add("advanced-level");
        } else if (percentage >= 65) {
          icon.classList.add("intermediate-level");
        } else {
          icon.classList.add("beginner-level");
        }

        // Make the conic gradient visible by default with subtle opacity
        icon.classList.add("with-indicator");
      }
    });
  }

  static setupIntersectionObservers() {
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

    // Observe skill categories and soft skill items
    document
      .querySelectorAll(".skills-category, .soft-skill-item")
      .forEach((element) => {
        skillsObserver.observe(element);
      });
  }

  static initResponsiveBehavior() {
    // Initial check
    this.handleViewportChange();

    // Throttled resize handler
    let resizeTimeout;
    window.addEventListener("resize", () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(this.handleViewportChange.bind(this), 100);
    });
  }

  static handleViewportChange() {
    const isMobile = window.innerWidth <= 768;
    const tabContainer = document.querySelector(".skills-category-tabs");

    if (!tabContainer) return;

    // Toggle mobile view class
    tabContainer.classList.toggle("mobile-view", isMobile);

    // Update accessibility attributes
    document.querySelectorAll(".skills-category-tab").forEach((tab) => {
      const shortText = tab.querySelector(".tab-text-short")?.textContent;
      const longText = tab.querySelector(".tab-text-long")?.textContent;

      if (shortText && longText) {
        tab.setAttribute("aria-label", isMobile ? shortText : longText);
      }
    });
  }
}
