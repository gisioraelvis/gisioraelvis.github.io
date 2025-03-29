# Code Refinement Guidelines 

Clean up, optimize and ensure modularity. 
You're free to enhance/refine/extend the code approbriately, but don't break existing functionality. 

## Project Structure

This is a component-based and modular portfolio website project with vanilla JS, CSS & html.

```
portfolio/
│
├── assets/           # Static assets like images and data
│   ├── data/         # JSON files for dynamic content
│   ├── favicon/      # Favicon files
│   └── images/       # Portfolio images
│
├── github-profile/   # Source for syncing GitHub profile README
│   └── README.md
│
├── scripts/          # JavaScript modules for functionality
│   ├── modules/      # Feature-specific modules
│   │   ├── analytics.js      # Analytics integration
│   │   ├── animations.js     # UI animations
│   │   ├── expander.js       # Expandable content
│   │   ├── navigation.js     # Navigation handling
│   │   ├── projects.js       # GitHub projects integration
│   │   └── theme.js          # Theme switching
│   ├── configs.js   # Configuration settings
│   ├── main.js      # Main entry point
│   └── utils.js     # Utility functions
│
├── styles/           # CSS files for styling
│   ├── base/         # Base styles and variables
│   ├── components/   # Component-specific styles
│   └── main.css      # Main CSS entry point
│
├── .github/          # GitHub Actions workflows
│   └── workflows/
│       ├── update-featured-repos.yml   # Updates featured repos
│       └── update-github-profile.yml   # Syncs GitHub profile README
│
├── index.html        # Main HTML file
└── README.md         # Project documentation
```
## Technical Standards
- Follow DRY principles and functional programming where appropriate
- Maintain clean, concise, and meaningful comments
- Ensure consistent naming conventions across files
- Implement appropriate error handling and security best practices
- Preserve the vanilla approach HTML, CSS, JS (no frameworks)

Remember, maintain the project's overall architecture and functionality but you're free to improve the UI, UX & DX