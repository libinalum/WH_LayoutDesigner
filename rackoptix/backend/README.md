# RackOptix Optimization Engine

The RackOptix Optimization Engine is a Python-based backend component that provides warehouse layout optimization capabilities for the RackOptix application.

## Features

- Facility layout generation and optimization
- Rack elevation profile optimization
- Aisle width optimization
- SKU slotting optimization
- Layout evaluation and metrics calculation

## Technology Stack

- Python 3.9+
- Google OR-Tools for constraint programming and optimization
- NumPy and Pandas for data manipulation
- FastAPI for API endpoints
- PostgreSQL with PostGIS for data storage

## Getting Started

### Prerequisites

- Python 3.9 or higher
- PostgreSQL 14+ with PostGIS extension

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

### Running the Server

To start the development server:

```
python -m src.main
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Project Structure

```
backend/
├── src/
│   ├── algorithms/    # Optimization algorithms
│   ├── core/          # Core engine components
│   ├── models/        # Data models
│   ├── utils/         # Utility functions
│   └── main.py        # FastAPI application
├── tests/             # Test cases
├── requirements.txt   # Dependencies
└── setup.py           # Package setup
```

### Running Tests

```
pytest
```

## License

Proprietary - All rights reserved