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
          top: targetElement.offsetTop - 20,
          behavior: "smooth",
        });
      }
    });
  });

  // Add active class to section when scrolled into view
  const sections = document.querySelectorAll(".section");

  function highlightCurrentSection() {
    const scrollPosition = window.scrollY;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        section.classList.add("active-section");
      } else {
        section.classList.remove("active-section");
      }
    });
  }

  window.addEventListener("scroll", highlightCurrentSection);

  // Initialize animations
  function animateOnScroll() {
    const elements = document.querySelectorAll(
      ".experience-item, .project-item, .education-item, .certification-item"
    );

    elements.forEach((element) => {
      const position = element.getBoundingClientRect();

      // If element is in viewport
      if (position.top < window.innerHeight && position.bottom >= 0) {
        element.classList.add("animate-in");
      }
    });
  }

  // Add animation classes to CSS
  const style = document.createElement("style");
  style.textContent = `
      .experience-item, .project-item, .education-item, .certification-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
      }
      
      .animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      .active-section {
        border-left: 3px solid var(--primary-color);
        padding-left: 10px;
      }
    `;
  document.head.appendChild(style);

  // Run animation on load and scroll
  window.addEventListener("load", animateOnScroll);
  window.addEventListener("scroll", animateOnScroll);
});

// Function to fetch GitHub projects
async function fetchGitHubProjects() {
  const username = "gisioraelvis";
  const projectsContainer = document.getElementById("github-projects");

  try {
    // First try to get pinned repositories
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`
    );

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const repos = await response.json();

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
          <div class="project-item">
            <div class="project-details">
              <h3>
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
              </h3>
              <p>${repo.description || "No description available."}</p>
              <div class="project-tech">
                ${
                  repo.language
                    ? `<span><span class="project-language" style="background-color: ${languageColor}"></span>${repo.language}</span>`
                    : ""
                }
                <span><i class="fas fa-star"></i> ${
                  repo.stargazers_count
                }</span>
                <span><i class="fas fa-code-branch"></i> ${
                  repo.forks_count
                }</span>
              </div>
            </div>
          </div>
        `;

      projectsContainer.innerHTML += projectHTML;
    });

    // Add "View More" button
    projectsContainer.innerHTML += `
        <div class="view-more-container">
          <a href="https://github.com/${username}?tab=repositories" target="_blank" class="view-more-btn">
            GitHub <i class="fas fa-external-link-alt"></i>
          </a>
        </div>
      `;

    // Add styles for the view more button
    const style = document.createElement("style");
    style.textContent = `
        .view-more-container {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }
        
        .view-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: var(--primary-color);
          color: white;
          border-radius: 4px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .view-more-btn:hover {
          background-color: var(--secondary-color);
          text-decoration: none;
        }
      `;
    document.head.appendChild(style);

    // Run animation for newly added elements
    animateOnScroll();
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    projectsContainer.innerHTML = `
        <div class="error-message">
          <p><i class="fas fa-exclamation-circle"></i> Failed to load GitHub projects.</p>
          <p>Please check your connection and try again.</p>
        </div>
      `;
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

// Helper function for animations
function animateOnScroll() {
  const elements = document.querySelectorAll(
    ".experience-item, .project-item, .education-item, .certification-item"
  );

  elements.forEach((element) => {
    const position = element.getBoundingClientRect();

    // If element is in viewport
    if (position.top < window.innerHeight && position.bottom >= 0) {
      element.classList.add("animate-in");
    }
  });
}
