# RackOptix API

The RackOptix API is a Node.js-based API layer that serves as the interface between the frontend application and the backend optimization engine.

## Features

- RESTful API endpoints for facility, product, equipment, and layout management
- WebSocket support for real-time updates during optimization
- Integration with the Python optimization engine
- Authentication and authorization
- Input validation and error handling

## Technology Stack

- Node.js 18+
- TypeScript
- Express.js
- Sequelize ORM
- PostgreSQL with PostGIS
- WebSockets for real-time communication

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14+ with PostGIS extension

### Installation

1. Clone the repository
2. Navigate to the API directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgres://username:password@localhost:5432/rackoptix
   OPTIMIZATION_ENGINE_URL=http://localhost:8000
   ```

### Running the Server

To start the development server:

```
npm run dev
```

To build and run in production mode:

```
npm run build
npm start
```

The API will be available at http://localhost:3000

## API Documentation

### Endpoints

#### Facilities

- `GET /api/facilities` - Get all facilities
- `GET /api/facilities/:id` - Get facility by ID
- `POST /api/facilities` - Create a new facility
- `PUT /api/facilities/:id` - Update a facility
- `DELETE /api/facilities/:id` - Delete a facility

#### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

#### Equipment

- `GET /api/equipment` - Get all equipment
- `GET /api/equipment/:id` - Get equipment by ID
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

#### Layouts

- `GET /api/layouts` - Get all layouts
- `GET /api/layouts/:id` - Get layout by ID
- `POST /api/layouts` - Create a new layout
- `PUT /api/layouts/:id` - Update a layout
- `DELETE /api/layouts/:id` - Delete a layout

#### Optimization

- `POST /api/optimization/generate` - Generate a new layout
- `POST /api/optimization/optimize` - Optimize an existing layout
- `POST /api/optimization/elevations` - Optimize rack elevations
- `POST /api/optimization/aisles` - Optimize aisle widths
- `POST /api/optimization/slotting` - Optimize SKU slotting
- `GET /api/optimization/evaluate/:id` - Evaluate a layout

### WebSocket API

Connect to the WebSocket endpoint at `ws://localhost:3000` to receive real-time updates during optimization processes.

## Development

### Project Structure

```
api/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── tests/              # Test cases
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

### Running Tests

```
npm test
```

## License

Proprietary - All rights reserved