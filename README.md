# Weather App

A modern weather application built with React, TypeScript, and Three.js, featuring a 3D globe visualization, interactive weather maps, and detailed weather information.

## Features

- Real-time weather data from OpenWeather API
- 3D interactive globe with weather visualization
- Interactive weather map with location markers
- Hourly and daily weather forecasts
- Current weather conditions with detailed metrics
- Dark mode support
- Responsive design

## Tech Stack

- React 18
- TypeScript
- Vite
- Three.js with React Three Fiber
- React Query
- Zustand for state management
- TailwindCSS
- Leaflet for maps
- Framer Motion for animations

## Prerequisites

- Node.js 16+ and npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd weather-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your OpenWeather API key:
```
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

### Deploying to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Build the project:
```bash
npm run build
```

3. Deploy with Vercel:
```bash
vercel
```

4. Configure environment variables in Vercel:
   - Go to your project settings in Vercel
   - Add the following environment variable:
     - Name: `VITE_OPENWEATHER_API_KEY`
     - Value: `your_api_key_here`

### Alternative Deployment Options

#### Static Hosting (Netlify, GitHub Pages, etc.)

1. Build the project:
```bash
npm run build
```

2. The built files will be in the `dist` directory
3. Deploy the contents of the `dist` directory to your hosting provider

#### Self-hosted

1. Build the project:
```bash
npm run build
```

2. Serve the `dist` directory using a static file server:
```bash
npm run preview
```

## Environment Variables

The following environment variables are required:

- `VITE_OPENWEATHER_API_KEY`: Your OpenWeather API key

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
