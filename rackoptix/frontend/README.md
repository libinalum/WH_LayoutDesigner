# RackOptix Frontend

The RackOptix Frontend is a React-based web application that provides the user interface for the RackOptix warehouse layout optimization system.

## Features

- Interactive facility drawing and editing
- Product and equipment management
- Layout visualization and optimization
- 2D canvas for facility design
- 3D visualization of warehouse layouts
- Real-time updates during optimization

## Technology Stack

- React 18+
- TypeScript
- Material UI for components
- Konva.js for 2D canvas manipulation
- Three.js for 3D visualization
- Zustand for state management
- Vite for fast development and building

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

### Running the Development Server

To start the development server:

```
npm run dev
```
or
```
yarn dev
```

The application will be available at http://localhost:3001

### Building for Production

To build the application for production:

```
npm run build
```
or
```
yarn build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── layout/     # Layout components
│   │   ├── facility/   # Facility-related components
│   │   ├── product/    # Product-related components
│   │   ├── equipment/  # Equipment-related components
│   │   └── layout/     # Layout-related components
│   ├── pages/          # Page components
│   ├── store/          # Zustand state management
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── theme.ts        # Material UI theme configuration
├── package.json        # Dependencies and scripts
└── vite.config.ts      # Vite configuration
```

## Key Components

### Facility Editor

The Facility Editor allows users to define the warehouse facility by drawing boundaries and placing obstructions like columns and walls. It provides a grid-based canvas with snapping functionality for precise drawing.

### Product Manager

The Product Manager allows users to manage their product catalog, including dimensions, weights, velocity classes, and storage requirements.

### Equipment Manager

The Equipment Manager allows users to define material handling equipment specifications, including reach heights, aisle width requirements, and turning radii.

### Layout Optimizer

The Layout Optimizer provides tools for generating and optimizing warehouse layouts based on the facility, products, and equipment. It includes visualization of the layout and performance metrics.

## License

Proprietary - All rights reserved