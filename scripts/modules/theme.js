/**
 * Theme management module
 */
export const ThemeManager = {
  /**
   * Initialize theme based on preferences
   */
  init() {
    const themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;

    const moonIcon = '<i class="fas fa-moon"></i>';
    const sunIcon = '<i class="fas fa-sun"></i>';

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
  },
};
