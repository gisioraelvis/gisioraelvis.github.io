import { CONFIGS } from "../configs.js";
import { Utils } from "../utils.js";

/**
 * UI animations, interactions, and content management module
 */
export const Animations = {
  // Selector for animatable elements
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
    this.setupContentExpanders();
    this.setupSkillsTabs();
    this.setupSkillIndicators();
    this.setupSkillsObserver();
  },

  setupNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
  },

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

  checkElementsInView() {
    document.querySelectorAll(this.ANIMATABLE_ELEMENTS).forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("animate-in");
      }
    });
  },

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

  closeMobileMenu() {
    document.body.classList.remove("menu-open");
    const menuToggle = document.querySelector(".menu-toggle");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  },

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

          const altText = button.getAttribute("data-alt-text");
          if (altText) {
            const currentText = button.textContent;
            button.textContent = altText;
            button.setAttribute("data-alt-text", currentText);
          }
        });
      });
  },

  setupContentExpanders() {
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

  addContentExpander(containerSelector, itemSelector, initialCount, sectionId) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    if (items.length <= initialCount) return;

    let buttonContainer = document.querySelector(
      `#${sectionId} .show-more-container`
    );

    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.className = "show-more-container";
      container.parentNode.insertBefore(buttonContainer, container.nextSibling);
    } else {
      buttonContainer.innerHTML = "";
    }

    const showMoreBtn = document.createElement("button");
    showMoreBtn.className = "show-more-btn";
    showMoreBtn.innerHTML = 'Show More <i class="fas fa-chevron-down"></i>';
    buttonContainer.appendChild(showMoreBtn);

    let isExpanded = false;
    items.forEach((item, index) => {
      if (index >= initialCount) {
        item.classList.add("hidden-item");
      } else {
        item.classList.remove("hidden-item");
      }
    });

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

      showMoreBtn.innerHTML = isExpanded
        ? 'Show Less <i class="fas fa-chevron-up"></i>'
        : 'Show More <i class="fas fa-chevron-down"></i>';

      if (!isExpanded && items[initialCount - 1]) {
        items[initialCount - 1].scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    });
  },

  // Skills Tabs Integration

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

  updateSkillsTabStates(tabs, activeTab) {
    tabs.forEach((tab) => {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected", "false");
    });

    activeTab.classList.add("active");
    activeTab.setAttribute("aria-selected", "true");
  },

  showSkillsTabContent(tab) {
    const targetId = tab.getAttribute("aria-controls");
    const categories = document.querySelectorAll(".skills-main-category");

    categories.forEach((category) => {
      category.classList.remove("active");
    });

    document.getElementById(targetId)?.classList.add("active");
  },

  setupSkillIndicators() {
    document.querySelectorAll(".skills-icons a").forEach((icon) => {
      const title = icon.getAttribute("title") || "";
      const percentageMatch = title.match(/(\d+)%/);

      if (!percentageMatch || !percentageMatch[1]) return;

      const percentage = parseInt(percentageMatch[1], 10);
      icon.style.setProperty("--skill-percentage", `${percentage}%`);

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
