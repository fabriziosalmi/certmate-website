# CertMate Website

Beautiful landing page for the CertMate SSL Certificate Management System.

## 🌟 Features

- **Modern Design**: Clean, professional design with smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **Performance**: Optimized for fast loading and smooth interactions
- **Accessibility**: WCAG compliant with keyboard navigation support
- **SEO Optimized**: Proper meta tags and semantic HTML structure

## 🚀 Quick Start

This website is designed to be hosted on GitHub Pages. Simply push to the `main` branch and enable GitHub Pages in your repository settings.

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/fabriziosalmi/certmate-website.git
cd certmate-website
```

2. Open `index.html` in your browser or serve with a local server:
```bash
# Using Python 3
python -m http.server 8080

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8080
```

3. Visit `http://localhost:8080` to view the website

## 📁 Project Structure

```
certmate-website/
├── index.html              # Main HTML file
├── assets/
│   ├── styles.css          # Main stylesheet
│   ├── script.js           # JavaScript functionality
│   └── favicon-placeholder.txt
├── README.md               # This file
└── .gitignore             # Git ignore file
```

## 🎨 Design System

### Colors
- **Primary**: #2563eb (Blue)
- **Secondary**: #f59e0b (Amber)
- **Accent**: #10b981 (Emerald)
- **Gray Scale**: From #f9fafb to #111827

### Typography
- **Font Family**: Inter (Google Fonts)
- **Responsive sizing**: From 0.75rem to 3.75rem

### Components
- Modern gradient buttons with hover effects
- Animated terminal window
- Interactive tab system
- Responsive navigation with mobile menu
- Copy-to-clipboard functionality
- Smooth scroll animations

## 🔧 Customization

### Updating Content
Edit the `index.html` file to update:
- Hero section text and stats
- Feature descriptions
- DNS provider information
- Installation instructions
- API documentation links

### Styling Changes
Modify `assets/styles.css` to customize:
- Color scheme (CSS custom properties in `:root`)
- Typography settings
- Component styling
- Responsive breakpoints

### Adding Functionality
Enhance `assets/script.js` to add:
- New interactive features
- Analytics tracking
- Form handling
- Additional animations

## 🌐 GitHub Pages Setup

1. Go to your repository settings
2. Scroll down to "Pages" section
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

Your website will be available at: `https://fabriziosalmi.github.io/certmate-website/`

## 📱 Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Features**: CSS Grid, Flexbox, CSS Custom Properties, Intersection Observer

## 🔍 SEO Features

- Semantic HTML5 structure
- Open Graph meta tags for social media
- Twitter Card meta tags
- Proper heading hierarchy
- Alt text for images
- Structured data ready

## 🚀 Performance

- **CSS**: Optimized with custom properties for maintainability
- **JavaScript**: Vanilla JS for maximum performance
- **Images**: Lazy loading support built-in
- **Fonts**: Google Fonts with preconnect for faster loading
- **Icons**: Font Awesome CDN with efficient loading

## 🎯 Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Semantic HTML structure
- Color contrast ratios meet guidelines

## 📊 Analytics

The website includes Google Analytics tracking code placeholders. To enable analytics:

1. Get your Google Analytics tracking ID
2. Add the tracking code to the `<head>` section of `index.html`
3. Uncomment the analytics functions in `script.js`

## 🤝 Contributing

To contribute to the website:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Test locally
5. Commit: `git commit -am 'Add new feature'`
6. Push: `git push origin feature/new-feature`
7. Create a Pull Request

## 📄 License

This website is licensed under the MIT License - see the main CertMate project for details.

## 🔗 Related Links

- [CertMate Main Project](https://github.com/fabriziosalmi/certmate)
- [Documentation](https://github.com/fabriziosalmi/certmate/blob/main/README.md)
- [Installation Guide](https://github.com/fabriziosalmi/certmate/blob/main/INSTALLATION.md)
- [DNS Providers](https://github.com/fabriziosalmi/certmate/blob/main/DNS_PROVIDERS.md)

---

Made with ❤️ by [Fabrizio Salmi](https://github.com/fabriziosalmi)
