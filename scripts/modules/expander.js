import { CONFIGS } from "../configs.js";

/**
 * Handles expandable content and "show more/less" functionality
 */
export const ContentExpander = {
  /**
   * Initialize content expansion functionality
   */
  init() {
    this.setupShowMoreHandlers();
    this.setupContentExpanders();
  },

  /**
   * Setup handlers for generic show/hide toggles
   */
  setupShowMoreHandlers() {
    // Store original display styles for proper restoration
    document.querySelectorAll(".hidden-item").forEach((item) => {
      const computedStyle = window.getComputedStyle(item);
      item.dataset.originalDisplay =
        computedStyle.display !== "none"
          ? computedStyle.display
          : item.tagName === "DIV"
          ? "block"
          : "inline";
    });

    // Attach click handlers to toggle buttons
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

          // Toggle button text if alt text is provided
          const altText = button.getAttribute("data-alt-text");
          if (altText) {
            const currentText = button.textContent;
            button.textContent = altText;
            button.setAttribute("data-alt-text", currentText);
          }
        });
      });
  },

  /**
   * Setup content expanders for all section types
   */
  setupContentExpanders() {
    // Add expanders to different sections with configuration
    this.addContentExpander(
      ".timeline",
      ".timeline-item",
      CONFIGS.showMore.initialItems.experience,
      "experience"
    );

    this.addContentExpander(
      ".certifications-grid",
      ".certification-item",
      CONFIGS.showMore.initialItems.education,
      "education"
    );

    this.addContentExpander(
      ".projects-grid",
      ".project-card",
      CONFIGS.showMore.initialItems.projects,
      "projects"
    );

    this.addContentExpander(
      ".soft-skills-grid",
      ".soft-skill-item",
      CONFIGS.showMore.initialItems.softSkills,
      "skills"
    );
  },

  /**
   * Add show more/less button to a content section
   * @param {string} containerSelector - Container element selector
   * @param {string} itemSelector - Item elements selector
   * @param {number} initialCount - Number of items to show initially
   * @param {string} sectionId - Section identifier for DOM placement
   */
  addContentExpander(containerSelector, itemSelector, initialCount, sectionId) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    if (items.length <= initialCount) return; // No need for expander

    // Get or create button container
    let buttonContainer = document.querySelector(
      `#${sectionId} .show-more-container`
    );

    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.className = "show-more-container";
      container.parentNode.insertBefore(buttonContainer, container.nextSibling);
    } else {
      buttonContainer.innerHTML = ""; // Clear existing content
    }

    // Create show more button
    const showMoreBtn = document.createElement("button");
    showMoreBtn.className = "show-more-btn";
    showMoreBtn.innerHTML = 'Show More <i class="fas fa-chevron-down"></i>';
    buttonContainer.appendChild(showMoreBtn);

    // Initialize visibility state
    let isExpanded = false;
    items.forEach((item, index) => {
      if (index >= initialCount) {
        item.classList.add("hidden-item");
      } else {
        item.classList.remove("hidden-item");
      }
    });

    // Handle toggling
    showMoreBtn.addEventListener("click", () => {
      isExpanded = !isExpanded;

      items.forEach((item, index) => {
        if (index >= initialCount) {
          if (isExpanded) {
            item.classList.remove("hidden-item");
            item.classList.add("show-item");
          } else {
            item.classList.remove("show-item");
            item.classList.add("hidden-item");
          }
        }
      });

      // Update button text based on state
      showMoreBtn.innerHTML = isExpanded
        ? 'Show Less <i class="fas fa-chevron-up"></i>'
        : 'Show More <i class="fas fa-chevron-down"></i>';

      // Scroll to visible content when collapsing
      if (!isExpanded && items[initialCount - 1]) {
        items[initialCount - 1].scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    });
  },
};
