document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle functionality
  const themeToggle = document.getElementById("themeToggle");
  const moonIcon = '<i class="fas fa-moon"></i>';
  const sunIcon = '<i class="fas fa-sun"></i>';

  // Check if user has a theme preference
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Set initial theme based on user preference or default to dark
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.remove("dark");
    themeToggle.innerHTML = moonIcon;
  } else {
    document.body.classList.add("dark");
    themeToggle.innerHTML = sunIcon;
  }

  // Toggle theme when button is clicked
  themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("dark")) {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
      themeToggle.innerHTML = moonIcon;
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
      themeToggle.innerHTML = sunIcon;
    }
  });

  // Navbar scroll effect
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Active nav link
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  function highlightNavLink() {
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
  }

  window.addEventListener("scroll", highlightNavLink);

  // Fetch GitHub projects
  fetchGitHubProjects();

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });

  // Animate elements on scroll
  const animateElements = document.querySelectorAll(
    ".about-card, .timeline-item, .certification-item, .skill-category"
  );

  function checkIfInView() {
    animateElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("animate-in");
      }
    });
  }

  // Add animation classes to CSS
  const style = document.createElement("style");
  style.textContent = `
      .about-card, .timeline-item, .certification-item, .skill-category, .project-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      
      .animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      .timeline-item:nth-child(1) {
        transition-delay: 0.1s;
      }
      
      .timeline-item:nth-child(2) {
        transition-delay: 0.2s;
      }
      
      .timeline-item:nth-child(3) {
        transition-delay: 0.3s;
      }
      
      .about-card:nth-child(1) {
        transition-delay: 0.1s;
      }
      
      .about-card:nth-child(2) {
        transition-delay: 0.2s;
      }
      
      .about-card:nth-child(3) {
        transition-delay: 0.3s;
      }
      
      .certification-item:nth-child(n) {
        transition-delay: calc(0.1s * var(--n));
      }
      
      .skill-category:nth-child(1) {
        transition-delay: 0.1s;
      }
      
      .skill-category:nth-child(2) {
        transition-delay: 0.2s;
      }
      
      .skill-category:nth-child(3) {
        transition-delay: 0.3s;
      }
      
      .skill-category:nth-child(4) {
        transition-delay: 0.4s;
      }
    `;
  document.head.appendChild(style);

  window.addEventListener("load", checkIfInView);
  window.addEventListener("scroll", checkIfInView);

  // Add show more functionality to sections that may grow
  addShowMoreFunctionality(".timeline", ".timeline-item", 2, "experience");
  addShowMoreFunctionality(
    ".certifications-grid",
    ".certification-item",
    4,
    "education"
  );
  addShowMoreFunctionality(".projects-grid", ".project-card", 4, "projects");
});

// Add this function after the existing functions but before the DOMContentLoaded event

/**
 * Adds "Show More" functionality to sections that may grow over time
 * @param {string} containerSelector - The selector for the container element
 * @param {string} itemSelector - The selector for the items to paginate
 * @param {number} initialCount - Number of items to show initially
 * @param {string} sectionId - The ID of the section for targeting the button container
 */
function addShowMoreFunctionality(
  containerSelector,
  itemSelector,
  initialCount,
  sectionId
) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = container.querySelectorAll(itemSelector);
  if (items.length <= initialCount) return; // Don't add pagination if not needed

  // Create button container if it doesn't exist
  let buttonContainer = document.querySelector(
    `#${sectionId} .show-more-container`
  );
  if (!buttonContainer) {
    buttonContainer = document.createElement("div");
    buttonContainer.className = "show-more-container";
    container.parentNode.insertBefore(buttonContainer, container.nextSibling);
  }

  // Create show more button
  const showMoreBtn = document.createElement("button");
  showMoreBtn.className = "show-more-btn";
  showMoreBtn.innerHTML = 'Show More <i class="fas fa-chevron-down"></i>';
  buttonContainer.appendChild(showMoreBtn);

  // Hide items beyond the initial count
  let isExpanded = false;
  items.forEach((item, index) => {
    if (index >= initialCount) {
      item.classList.add("hidden-item");
    }
  });

  // Add click event to toggle visibility
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

    // Update button text
    if (isExpanded) {
      showMoreBtn.innerHTML = 'Show Less <i class="fas fa-chevron-up"></i>';
    } else {
      showMoreBtn.innerHTML = 'Show More <i class="fas fa-chevron-down"></i>';

      // Scroll back to the last visible item
      if (items[initialCount - 1]) {
        items[initialCount - 1].scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }
  });
}

// Update the function to fetch pinned repositories
async function fetchGitHubProjects() {
  const username = "gisioraelvis";
  const projectsContainer = document.getElementById("github-projects");

  try {
    // First try to get pinned repositories using GraphQL API
    const graphqlQuery = `
        query {
          user(login: "${username}") {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                  description
                  url
                  homepageUrl
                  stargazerCount
                  forkCount
                  primaryLanguage {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "bearer " + "ghp_", // This token is intentionally incomplete for security
      },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    // If GraphQL fails (due to missing token), fall back to REST API
    if (!response.ok) {
      throw new Error("GraphQL request failed");
    }

    const data = await response.json();
    let repos;

    // Check if we got pinned repos from GraphQL
    if (data.data && data.data.user && data.data.user.pinnedItems) {
      repos = data.data.user.pinnedItems.nodes.map((node) => ({
        name: node.name,
        description: node.description,
        html_url: node.url,
        homepage: node.homepageUrl,
        stargazers_count: node.stargazerCount,
        forks_count: node.forkCount,
        language: node.primaryLanguage ? node.primaryLanguage.name : null,
        language_color: node.primaryLanguage
          ? node.primaryLanguage.color
          : null,
      }));
    } else {
      // Fallback to REST API if GraphQL didn't work
      const restResponse = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`
      );
      if (!restResponse.ok) {
        throw new Error(`GitHub API returned ${restResponse.status}`);
      }
      repos = await restResponse.json();
    }

    // Clear loading spinner
    projectsContainer.innerHTML = "";

    if (repos.length === 0) {
      projectsContainer.innerHTML = "<p>No repositories found.</p>";
      return;
    }

    // Display repositories
    repos.forEach((repo) => {
      const languageColor =
        repo.language_color || getLanguageColor(repo.language);

      const projectHTML = `
          <div class="project-card">
            <div class="project-content">
              <div class="project-header">
                <h3 class="project-title">
                  <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                </h3>
                <div class="project-links">
                  <a href="${
                    repo.html_url
                  }" target="_blank" aria-label="GitHub Repository">
                    <i class="fab fa-github"></i>
                  </a>
                  ${
                    repo.homepage
                      ? `<a href="${repo.homepage}" target="_blank" aria-label="Live Demo"><i class="fas fa-external-link-alt"></i></a>`
                      : ""
                  }
                </div>
              </div>
              <p class="project-description">${
                repo.description || "No description available."
              }</p>
              <div class="project-footer">
                <div class="project-tech-stack">
                  ${
                    repo.language
                      ? `<span class="tech-tag"><span class="language-color" style="background-color: ${languageColor}"></span>${repo.language}</span>`
                      : ""
                  }
                </div>
                <div class="project-stats">
                  <span class="project-stat"><i class="fas fa-star"></i> ${
                    repo.stargazers_count
                  }</span>
                  <span class="project-stat"><i class="fas fa-code-branch"></i> ${
                    repo.forks_count
                  }</span>
                </div>
              </div>
            </div>
          </div>
        `;

      projectsContainer.innerHTML += projectHTML;
    });

    // Add "View More" button only if there are more than 4 projects
    if (repos.length > 4) {
      // First, limit visible projects to 4
      const projectCards = document.querySelectorAll(".project-card");
      projectCards.forEach((card, index) => {
        if (index >= 4) {
          card.classList.add("hidden-item");
        }
      });

      // Then add the GitHub link button
      projectsContainer.innerHTML += `
          <div class="view-more-container">
            <a href="https://github.com/${username}?tab=repositories" target="_blank" class="view-more-btn">
              View on GitHub <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        `;
    }

    // Animate project cards
    const projectCards = document.querySelectorAll(".project-card");
    projectCards.forEach((card, index) => {
      card.style.transitionDelay = `${0.1 * index}s`;
      setTimeout(() => {
        card.classList.add("animate-in");
      }, 100);
    });
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);

    // Fallback to REST API if GraphQL didn't work
    try {
      const restResponse = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`
      );
      if (!restResponse.ok) {
        throw new Error(`GitHub API returned ${restResponse.status}`);
      }

      const repos = await restResponse.json();

      // Clear loading spinner
      projectsContainer.innerHTML = "";

      if (repos.length === 0) {
        projectsContainer.innerHTML = "<p>No repositories found.</p>";
        return;
      }

      // Display repositories
      repos.forEach((repo) => {
        const languageColor = getLanguageColor(repo.language);

        const projectHTML = `
            <div class="project-card">
              <div class="project-content">
                <div class="project-header">
                  <h3 class="project-title">
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                  </h3>
                  <div class="project-links">
                    <a href="${
                      repo.html_url
                    }" target="_blank" aria-label="GitHub Repository">
                      <i class="fab fa-github"></i>
                    </a>
                    ${
                      repo.homepage
                        ? `<a href="${repo.homepage}" target="_blank" aria-label="Live Demo"><i class="fas fa-external-link-alt"></i></a>`
                        : ""
                    }
                  </div>
                </div>
                <p class="project-description">${
                  repo.description || "No description available."
                }</p>
                <div class="project-footer">
                  <div class="project-tech-stack">
                    ${
                      repo.language
                        ? `<span class="tech-tag"><span class="language-color" style="background-color: ${languageColor}"></span>${repo.language}</span>`
                        : ""
                    }
                  </div>
                  <div class="project-stats">
                    <span class="project-stat"><i class="fas fa-star"></i> ${
                      repo.stargazers_count
                    }</span>
                    <span class="project-stat"><i class="fas fa-code-branch"></i> ${
                      repo.forks_count
                    }</span>
                  </div>
                </div>
              </div>
            </div>
          `;

        projectsContainer.innerHTML += projectHTML;
      });

      // Add "View More" button only if there are more than 4 projects
      if (repos.length > 4) {
        // First, limit visible projects to 4
        const projectCards = document.querySelectorAll(".project-card");
        projectCards.forEach((card, index) => {
          if (index >= 4) {
            card.classList.add("hidden-item");
          }
        });

        // Then add the GitHub link button
        projectsContainer.innerHTML += `
            <div class="view-more-container">
              <a href="https://github.com/${username}?tab=repositories" target="_blank" class="view-more-btn">
                View on GitHub <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
          `;
      }

      // Animate project cards
      const projectCards = document.querySelectorAll(".project-card");
      projectCards.forEach((card, index) => {
        card.style.transitionDelay = `${0.1 * index}s`;
        setTimeout(() => {
          card.classList.add("animate-in");
        }, 100);
      });
    } catch (fallbackError) {
      console.error("Error with fallback fetch:", fallbackError);
      projectsContainer.innerHTML = `
          <div class="error-message">
            <p><i class="fas fa-exclamation-circle"></i> Failed to load GitHub projects.</p>
            <p>Please check your connection and try again.</p>
          </div>
        `;
    }
  }
}

// Function to get language color
function getLanguageColor(language) {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    Java: "#b07219",
    "C#": "#178600",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Go: "#00ADD8",
    Swift: "#ffac45",
    Kotlin: "#F18E33",
    Dart: "#00B4AB",
    Rust: "#dea584",
    Shell: "#89e051",
    "C++": "#f34b7d",
    C: "#555555",
  };

  return colors[language] || "#8257e5"; // Default purple color if language not in list
}

// Add typing animation to hero text
document.addEventListener("DOMContentLoaded", () => {
  // Add parallax effect to floating badges
  const badges = document.querySelectorAll(".badge");

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

  // Add intersection observer for better animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    },
    { threshold: 0.1 }
  );

  document
    .querySelectorAll(
      ".about-card, .timeline-item, .certification-item, .skill-category, .project-card"
    )
    .forEach((el) => {
      observer.observe(el);
    });
});
