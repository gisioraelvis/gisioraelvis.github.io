/**
 * Configuration object for site-wide settings
 */
export const CONFIG = {
  github: {
    username: "gisioraelvis",
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    cacheKey: "github_repos_cache",
    fetchLimit: 50,
    analyzeLimit: 15,
    displayLimit: 6,
    apiTimeout: 10000, // 10 seconds
    // Add repositories you want to exclude from display
    excludedRepos: [
      // Example: "test-repo", "playground", "learning"
    ],
    // Add repositories you want to showcase at the top
    featuredRepos: [
      // Example: "portfolio-website", "important-project"
    ],
    // Scoring weights for repository ranking
    weights: {
      size: 0.4, // 40% weight for code size
      commits: 0.3, // 30% weight for commit activity
      stars: 0.2, // 20% weight for stars
      recency: 0.1, // 10% weight for recency
    },
  },
  animation: {
    threshold: 0.1, // Intersection observer threshold
    scrollOffset: 80, // Offset for smooth scrolling
  },
  showMore: {
    initialItems: {
      experience: 2, // Initial number of timeline items to show
      education: 6, // Initial number of certification items to show
      projects: 4, // Initial number of project items to show
    },
  },
  // SEO configuration and structured data
  seo: {
    // Schema.org structured data for person profile
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Elvis Gisiora",
      jobTitle: "Software Engineer",
      url: "https://gisioraelvis.github.io/gem",
      image:
        "https://gisioraelvis.github.io/gem/assets/gisioraelvis-passport.jpg",
      sameAs: [
        "https://linkedin.com/in/gisioraelvis",
        "https://github.com/gisioraelvis",
        "https://x.com/gisioraelvis",
      ],
      worksFor: {
        "@type": "Organization",
        name: "Griffin Global Technologies",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Egerton University",
      },
      knowsAbout: [
        "Software Development",
        "Full-Stack Web Development",
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        ".NET",
        "Java",
        "Spring Boot",
        "DevOps",
        "Cloud Computing",
        "System Integration",
      ],
    },
  },
};
