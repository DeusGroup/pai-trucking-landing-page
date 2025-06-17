# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static landing page for P.A.I. Trucking Corporation, a family-owned logistics company operating since 1981. The site is built with vanilla HTML, CSS, and JavaScript - no build process or frameworks required.

## Development Commands

### Local Development
```bash
# Serve locally using Python
python -m http.server 8000

# Or with Node.js live-server
npx live-server
```

### Testing
- Open `index.html` directly in browser for basic testing
- Use browser dev tools for responsive testing
- No automated test suite - manual testing required

## Architecture

### File Structure
- `index.html` - Main HTML with semantic structure and form
- `style.css` - Complete styling with CSS custom properties and responsive design
- `app.js` - All JavaScript functionality in vanilla JS modules

### Key Technical Decisions
- **No build process** - Direct file serving for simplicity
- **CSS custom properties** for theming (see `:root` in style.css)
- **Progressive enhancement** - Site works without JavaScript
- **Mobile-first responsive design** with CSS Grid and Flexbox
- **Modular JavaScript** - Functions organized by feature area

### JavaScript Modules
The app.js file is organized into functional modules:
- Navigation (smooth scrolling, active states)
- Mobile menu toggle
- Contact form validation and submission
- Scroll animations using Intersection Observer
- Notification system for user feedback

### Form Handling
The contact form uses client-side validation only. For production use, server-side processing needs to be implemented. Form validates:
- Required fields
- Email format
- Phone number format
- Real-time field validation on blur/input

### Styling System
Uses CSS custom properties for consistent theming:
```css
--primary-color: #1a365d;    /* Navy blue */
--accent-color: #f56500;     /* Orange */
```

### Image Strategy
Currently uses Unsplash placeholder images. Replace with actual company photos for production.

## Performance Considerations
- Vanilla JS for zero framework overhead
- CSS Grid/Flexbox for modern layouts
- Intersection Observer for scroll animations
- Debounced scroll handlers for performance
- Responsive images ready (data-src attributes for lazy loading)

## Browser Support
- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- IE11 with limited functionality
- Progressive enhancement ensures base functionality without JS