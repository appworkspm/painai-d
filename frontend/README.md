# Painai Frontend

This is the frontend for the Painai Timesheet Management System, built with React, TypeScript, and Vite. The application is designed as a Progressive Web App (PWA) with offline capabilities, push notifications, and an installable experience.

## Features

- 🚀 **Progressive Web App** - Installable on any device with offline support
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 🎨 **Modern UI** - Built with Radix UI and Tailwind CSS
- ⚡ **Fast Performance** - Optimized builds with Vite
- 🔄 **Real-time Updates** - Powered by React Query
- 🔒 **Secure** - JWT authentication and secure HTTP headers

## Getting Started

### Prerequisites

- Node.js 18+
- npm or Yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_URL=http://localhost:8000/api
   VITE_APP_NAME="Painai"
   VITE_APP_DESCRIPTION="Painai Timesheet Management System"
   VITE_THEME_COLOR="#2563eb"
   ```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## PWA Features

The application includes the following PWA features:

- **Web App Manifest** - For installable experience
- **Service Worker** - For offline support and caching
- **App Icons** - Multiple sizes for different devices
- **Splash Screens** - Custom splash screens for iOS and Android
- **Theme Color** - Matches the app's color scheme

## Deployment

The application is configured for deployment on Render. The `render.yaml` file contains the necessary configuration for deployment.

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Base URL for the API | Yes | - |
| `VITE_APP_NAME` | Application name | No | "Painai" |
| `VITE_APP_DESCRIPTION` | Application description | No | "Painai Timesheet Management System" |
| `VITE_THEME_COLOR` | Theme color for the app | No | "#2563eb" |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | No | false |

## Browser Support

The application supports the latest versions of:

- Chrome
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
