# GEM - Portfolio Website

My portfolio website as a dynamic and interactive resume of my experience, skills and projects.

A reflection of my tech journey learnings, achievements and aspirations.

## Features

Built with modern web technologies and best practices.

- 📱 Fully responsive design to ensure compatibility across devices
- 🌓 Light/Dark mode toggle for a personalized viewing experience
- ✨ Modern animations and transitions for a polished look
- 🔄 Dynamic GitHub projects showcase, automatically updated
- ⚡ Optimized for fast loading and performance
- 📊 Integrated analytics for tracking visitor interactions
- 🧩 Modular architecture for easy maintenance and scalability
- 🚀 CI/CD workflows for seamless updates and deployments

## Development Setup

### Prerequisites

To work on this project, you need:

- Basic knowledge of HTML, CSS and JavaScript
- A modern web browser
- A code editor (e.g., VSCode)
- A GitHub account (for API integration)

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/gisioraelvis/gisioraelvis.github.io.git
cd gisioraelvis.github.io
```

2. Open `index.html` in your browser or use a local development server like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VSCode.

## Project Structure

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

## Technical Details

### JavaScript Architecture

The JavaScript code is modular and follows best practices:

- **Module Loader**: Ensures efficient and error-resilient module loading
- **Lazy Loading**: Non-critical features load after the initial render
- **Error Handling**: Graceful degradation to prevent cascading failures

### CSS Architecture

The CSS is organized for maintainability:

- **Component-Based**: Each UI component has its own CSS file
- **Base Styles**: Shared styles and variables for consistency
- **Modular Imports**: All styles are imported into `main.css`

## Automated Workflows

### Featured Repositories Update

This workflow fetches my pinned GitHub repositories and updates `assets/data/featured-repos.json` weekly or on demand.

### GitHub Profile README Sync

This workflow syncs my portfolio README with my GitHub profile, ensuring centralized convinient and consistent updates.  

## Deployment

The website is deployed using GitHub Pages at [gisioraelvis.github.io](https://gisioraelvis.github.io).

1. Hosted on GitHub
2. GitHub Pages enabled in repository settings
3. Automatically deployed from the `main` branch

## Feedback and Contributions

I welcome feedback and contributions! Feel free to:

1. Open an issue for suggestions or bug reports
2. Submit a pull request for improvements
3. Contact me directly using the information below

## Contact

- Email: gisioraelvis20@gmail.com
- LinkedIn: [linkedin.com/in/gisioraelvis](https://linkedin.com/in/gisioraelvis)
- Twitter: [x.com/gisioraelvis](https://x.com/gisioraelvis)

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- GitHub API for project integration
