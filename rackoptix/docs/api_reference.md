# RackOptix API Reference

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Versioning](#versioning)
6. [Endpoints](#endpoints)
   - [Facilities](#facilities)
   - [Zones](#zones)
   - [Obstructions](#obstructions)
   - [Products](#products)
   - [Product Categories](#product-categories)
   - [Equipment](#equipment)
   - [Equipment Types](#equipment-types)
   - [Layouts](#layouts)
   - [Racks](#racks)
   - [Aisles](#aisles)
   - [Optimization](#optimization)
   - [Reports](#reports)
   - [Users](#users)
   - [Projects](#projects)
7. [WebSocket API](#websocket-api)
8. [Pagination](#pagination)
9. [Filtering and Sorting](#filtering-and-sorting)
10. [Webhooks](#webhooks)

## Introduction

The RackOptix API is a RESTful API that provides programmatic access to the RackOptix warehouse layout optimization system. This reference documentation provides detailed information about the available endpoints, request and response formats, and authentication requirements.

Base URL: `https://api.rackoptix.com/v1`

## Authentication

The RackOptix API uses JSON Web Tokens (JWT) for authentication. To authenticate, you need to include the JWT token in the `Authorization` header of your requests.

```
Authorization: Bearer <your_token>
```

### Obtaining a Token

To obtain a token, send a POST request to the `/auth/login` endpoint with your credentials:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "your.email@example.com",
  "password": "your_password"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

The token is valid for 24 hours (86400 seconds).

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. In case of an error, the response body will contain additional information about the error.

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "A human-readable error message",
    "details": {
      "field1": "Error details for field1",
      "field2": "Error details for field2"
    }
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | INVALID_REQUEST | The request is invalid or malformed |
| 401 | UNAUTHORIZED | Authentication is required or has failed |
| 403 | FORBIDDEN | The authenticated user does not have permission to access the resource |
| 404 | NOT_FOUND | The requested resource was not found |
| 409 | CONFLICT | The request conflicts with the current state of the resource |
| 422 | VALIDATION_ERROR | The request contains invalid data |
| 429 | RATE_LIMIT_EXCEEDED | The rate limit has been exceeded |
| 500 | INTERNAL_SERVER_ERROR | An unexpected error occurred on the server |

## Rate Limiting

The API implements rate limiting to prevent abuse. The rate limits are as follows:

- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

If you exceed the rate limit, you will receive a 429 Too Many Requests response.

## Versioning

The API is versioned using the URL path. The current version is v1.

```
https://api.rackoptix.com/v1
```

## Endpoints

### Facilities

#### Get All Facilities

```http
GET /facilities
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | string | Filter facilities by project ID |
| page | integer | Page number for pagination (default: 1) |
| limit | integer | Number of items per page (default: 20, max: 100) |
| sort | string | Field to sort by (e.g., name, createdAt) |
| order | string | Sort order (asc or desc, default: asc) |

Response:

```json
{
  "data": [
    {
      "id": "facility-1",
      "projectId": "project-1",
      "name": "Main Distribution Center",
      "length": 500,
      "width": 300,
      "height": 40,
      "units": "ft",
      "boundary": [[0, 0], [500, 0], [500, 300], [0, 300], [0, 0]],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-02T00:00:00Z"
    },
    {
      "id": "facility-2",
      "projectId": "project-1",
      "name": "Secondary Warehouse",
      "length": 400,
      "width": 250,
      "height": 35,
      "units": "ft",
      "boundary": [[0, 0], [400, 0], [400, 250], [0, 250], [0, 0]],
      "createdAt": "2025-01-03T00:00:00Z",
      "updatedAt": "2025-01-04T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

#### Get Facility by ID

```http
GET /facilities/{id}
```

Response:

```json
{
  "data": {
    "id": "facility-1",
    "projectId": "project-1",
    "name": "Main Distribution Center",
    "length": 500,
    "width": 300,
    "height": 40,
    "units": "ft",
    "boundary": [[0, 0], [500, 0], [500, 300], [0, 300], [0, 0]],
    "zones": [
      {
        "id": "zone-1",
        "name": "Receiving",
        "geometry": [[0, 0], [100, 0], [100, 300], [0, 300], [0, 0]],
        "purpose": "receiving"
      },
      {
        "id": "zone-2",
        "name": "Storage",
        "geometry": [[100, 0], [400, 0], [400, 300], [100, 300], [100, 0]],
        "purpose": "storage"
      }
    ],
    "obstructions": [
      {
        "id": "obstruction-1",
        "type": "column",
        "geometry": [[50, 50], [52, 50], [52, 52], [50, 52], [50, 50]],
        "height": 40
      }
    ],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-02T00:00:00Z"
  }
}
```

#### Create Facility

```http
POST /facilities
Content-Type: application/json

{
  "projectId": "project-1",
  "name": "New Facility",
  "length": 600,
  "width": 400,
  "height": 45,
  "units": "ft",
  "boundary": [[0, 0], [600, 0], [600, 400], [0, 400], [0, 0]]
}
```

Response:

```json
{
  "data": {
    "id": "facility-3",
    "projectId": "project-1",
    "name": "New Facility",
    "length": 600,
    "width": 400,
    "height": 45,
    "units": "ft",
    "boundary": [[0, 0], [600, 0], [600, 400], [0, 400], [0, 0]],
    "zones": [],
    "obstructions": [],
    "createdAt": "2025-01-05T00:00:00Z",
    "updatedAt": "2025-01-05T00:00:00Z"
  }
}
```

#### Update Facility

```http
PUT /facilities/{id}
Content-Type: application/json

{
  "name": "Updated Facility Name",
  "length": 650,
  "width": 450,
  "height": 50,
  "units": "ft",
  "boundary": [[0, 0], [650, 0], [650, 450], [0, 450], [0, 0]]
}
```

Response:

```json
{
  "data": {
    "id": "facility-3",
    "projectId": "project-1",
    "name": "Updated Facility Name",
    "length": 650,
    "width": 450,
    "height": 50,
    "units": "ft",
    "boundary": [[0, 0], [650, 0], [650, 450], [0, 450], [0, 0]],
    "zones": [],
    "obstructions": [],
    "createdAt": "2025-01-05T00:00:00Z",
    "updatedAt": "2025-01-06T00:00:00Z"
  }
}
```

#### Delete Facility

```http
DELETE /facilities/{id}
```

Response:

```
204 No Content
```

### Zones

#### Get Zones for Facility

```http
GET /facilities/{facilityId}/zones
```

Response:

```json
{
  "data": [
    {
      "id": "zone-1",
      "facilityId": "facility-1",
      "name": "Receiving",
      "geometry": [[0, 0], [100, 0], [100, 300], [0, 300], [0, 0]],
      "purpose": "receiving",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-02T00:00:00Z"
    },
    {
      "id": "zone-2",
      "facilityId": "facility-1",
      "name": "Storage",
      "geometry": [[100, 0], [400, 0], [400, 300], [100, 300], [100, 0]],
      "purpose": "storage",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-02T00:00:00Z"
    }
  ]
}
```

#### Create Zone

```http
POST /facilities/{facilityId}/zones
Content-Type: application/json

{
  "name": "Shipping",
  "geometry": [[400, 0], [500, 0], [500, 300], [400, 300], [400, 0]],
  "purpose": "shipping"
}
```

Response:

```json
{
  "data": {
    "id": "zone-3",
    "facilityId": "facility-1",
    "name": "Shipping",
    "geometry": [[400, 0], [500, 0], [500, 300], [400, 300], [400, 0]],
    "purpose": "shipping",
    "createdAt": "2025-01-07T00:00:00Z",
    "updatedAt": "2025-01-07T00:00:00Z"
  }
}
```

### Obstructions

#### Get Obstructions for Facility

```http
GET /facilities/{facilityId}/obstructions
```

Response:

```json
{
  "data": [
    {
      "id": "obstruction-1",
      "facilityId": "facility-1",
      "type": "column",
      "geometry": [[50, 50], [52, 50], [52, 52], [50, 52], [50, 50]],
      "height": 40,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-02T00:00:00Z"
    }
  ]
}
```

#### Create Obstruction

```http
POST /facilities/{facilityId}/obstructions
Content-Type: application/json

{
  "type": "column",
  "geometry": [[150, 150], [152, 150], [152, 152], [150, 152], [150, 150]],
  "height": 40
}
```

Response:

```json
{
  "data": {
    "id": "obstruction-2",
    "facilityId": "facility-1",
    "type": "column",
    "geometry": [[150, 150], [152, 150], [152, 152], [150, 152], [150, 150]],
    "height": 40,
    "createdAt": "2025-01-07T00:00:00Z",
    "updatedAt": "2025-01-07T00:00:00Z"
  }
}
```

### Products

#### Get All Products

```http
GET /products
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | string | Filter products by project ID |
| categoryId | string | Filter products by category ID |
| velocityClass | string | Filter products by velocity class (A, B, or C) |
| page | integer | Page number for pagination (default: 1) |
| limit | integer | Number of items per page (default: 20, max: 100) |
| sort | string | Field to sort by (e.g., name, createdAt) |
| order | string | Sort order (asc or desc, default: asc) |

Response:

```json
{
  "data": [
    {
      "id": "product-1",
      "projectId": "project-1",
      "categoryId": "category-1",
      "name": "Laptop",
      "sku": "ELEC-001",
      "length": 15,
      "width": 10,
      "height": 2,
      "weight": 5,
      "units": "in",
      "velocityClass": "A",
      "storageRequirements": ["standard"],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-02T00:00:00Z"
    },
    {
      "id": "product-2",
      "projectId": "project-1",
      "categoryId": "category-1",
      "name": "Smartphone",
      "sku": "ELEC-002",
      "length": 6,
      "width": 3,
      "height": 0.5,
      "weight": 0.5,
      "units": "in",
      "velocityClass": "A",
      "storageRequirements": ["standard"],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-02T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

#### Get Product by ID

```http
GET /products/{id}
```

Response:

```json
{
  "data": {
    "id": "product-1",
    "projectId": "project-1",
    "categoryId": "category-1",
    "name": "Laptop",
    "sku": "ELEC-001",
    "length": 15,
    "width": 10,
    "height": 2,
    "weight": 5,
    "units": "in",
    "velocityClass": "A",
    "storageRequirements": ["standard"],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-02T00:00:00Z"
  }
}
```

#### Create Product

```http
POST /products
Content-Type: application/json

{
  "projectId": "project-1",
  "categoryId": "category-1",
  "name": "Tablet",
  "sku": "ELEC-003",
  "length": 10,
  "width": 7,
  "height": 0.5,
  "weight": 1,
  "units": "in",
  "velocityClass": "B",
  "storageRequirements": ["standard"]
}
```

Response:

```json
{
  "data": {
    "id": "product-3",
    "projectId": "project-1",
    "categoryId": "category-1",
    "name": "Tablet",
    "sku": "ELEC-003",
    "length": 10,
    "width": 7,
    "height": 0.5,
    "weight": 1,
    "units": "in",
    "velocityClass": "B",
    "storageRequirements": ["standard"],
    "createdAt": "2025-01-07T00:00:00Z",
    "updatedAt": "2025-01-07T00:00:00Z"
  }
}
```

### Optimization

#### Generate Layout

```http
POST /optimization/generate
Content-Type: application/json

{
  "facilityId": "facility-1",
  "equipmentId": "equipment-1",
  "optimizationParameters": {
    "aisleWidth": 10.0,
    "rackType": "selective",
    "maxHeight": 20.0,
    "objective": "storage_capacity"
  }
}
```

Response:

```json
{
  "data": {
    "id": "layout-1",
    "facilityId": "facility-1",
    "name": "Generated Layout",
    "racks": [
      {
        "id": "rack-1",
        "type": "selective",
        "x": 120,
        "y": 50,
        "length": 40,
        "width": 4,
        "height": 20,
        "orientation": 0,
        "levels": 4,
        "bays": 10
      },
      {
        "id": "rack-2",
        "type": "selective",
        "x": 120,
        "y": 70,
        "length": 40,
        "width": 4,
        "height": 20,
        "orientation": 0,
        "levels": 4,
        "bays": 10
      }
    ],
    "aisles": [
      {
        "id": "aisle-1",
        "name": "Aisle 1",
        "width": 10,
        "path": [[120, 60], [160, 60]]
      }
    ],
    "metrics": {
      "storageCapacity": 1200,
      "spaceUtilization": 0.85,
      "accessibility": 0.9
    },
    "createdAt": "2025-01-07T00:00:00Z",
    "updatedAt": "2025-01-07T00:00:00Z"
  }
}
```

#### Optimize Elevations

```http
POST /optimization/elevations
Content-Type: application/json

{
  "layoutId": "layout-1",
  "equipmentId": "equipment-1",
  "productIds": ["product-1", "product-2", "product-3"],
  "objective": "balanced",
  "constraints": {
    "maxLevels": 6,
    "minLevelHeight": 4.0
  }
}
```

Response:

```json
{
  "data": {
    "layoutId": "layout-1",
    "elevations": [
      {
        "rackId": "rack-1",
        "levels": [
          {
            "level": 1,
            "height": 6.0
          },
          {
            "level": 2,
            "height": 6.0
          },
          {
            "level": 3,
            "height": 4.0
          },
          {
            "level": 4,
            "height": 4.0
          }
        ]
      },
      {
        "rackId": "rack-2",
        "levels": [
          {
            "level": 1,
            "height": 6.0
          },
          {
            "level": 2,
            "height": 6.0
          },
          {
            "level": 3,
            "height": 4.0
          },
          {
            "level": 4,
            "height": 4.0
          }
        ]
      }
    ],
    "metrics": {
      "storageCapacity": 1250,
      "spaceUtilization": 0.87,
      "accessibility": 0.88
    }
  }
}
```

#### Optimize Slotting

```http
POST /optimization/slotting
Content-Type: application/json

{
  "layoutId": "layout-1",
  "productIds": ["product-1", "product-2", "product-3"],
  "objective": "travel_time",
  "constraints": {
    "respectVelocityClasses": true,
    "maxProductsPerBay": 4
  }
}
```

Response:

```json
{
  "data": {
    "layoutId": "layout-1",
    "assignments": [
      {
        "productId": "product-1",
        "rackId": "rack-1",
        "bay": 1,
        "level": 1,
        "quantity": 10
      },
      {
        "productId": "product-2",
        "rackId": "rack-1",
        "bay": 2,
        "level": 1,
        "quantity": 20
      },
      {
        "productId": "product-3",
        "rackId": "rack-2",
        "bay": 1,
        "level": 1,
        "quantity": 15
      }
    ],
    "metrics": {
      "travelEfficiency": 0.92,
      "pickEfficiency": 0.88
    }
  }
}
```

#### Evaluate Layout

```http
GET /optimization/evaluate/{layoutId}
```

Response:

```json
{
  "data": {
    "layoutId": "layout-1",
    "metrics": {
      "storageCapacity": 1250,
      "spaceUtilization": 0.87,
      "accessibility": 0.88,
      "travelEfficiency": 0.92,
      "pickEfficiency": 0.88
    }
  }
}
```

## WebSocket API

The RackOptix API provides a WebSocket interface for real-time updates during optimization processes.

### Connection

Connect to the WebSocket endpoint:

```
wss://api.rackoptix.com/v1/ws
```

Include your authentication token as a query parameter:

```
wss://api.rackoptix.com/v1/ws?token=your_token
```

### Message Format

Messages are sent and received in JSON format:

```json
{
  "type": "message_type",
  "data": {
    // Message-specific data
  }
}
```

### Message Types

#### Optimization Progress

```json
{
  "type": "optimization_progress",
  "data": {
    "jobId": "job-1",
    "progress": 75,
    "status": "running",
    "message": "Optimizing rack elevations",
    "timestamp": "2025-01-07T12:34:56Z"
  }
}
```

#### Optimization Complete

```json
{
  "type": "optimization_complete",
  "data": {
    "jobId": "job-1",
    "layoutId": "layout-1",
    "status": "completed",
    "message": "Optimization completed successfully",
    "metrics": {
      "storageCapacity": 1250,
      "spaceUtilization": 0.87,
      "accessibility": 0.88
    },
    "timestamp": "2025-01-07T12:35:30Z"
  }
}
```

#### Optimization Error

```json
{
  "type": "optimization_error",
  "data": {
    "jobId": "job-1",
    "status": "failed",
    "error": {
      "code": "OPTIMIZATION_FAILED",
      "message": "Failed to optimize layout due to conflicting constraints"
    },
    "timestamp": "2025-01-07T12:35:30Z"
  }
}
```

## Pagination

All endpoints that return collections support pagination using the `page` and `limit` query parameters:

```
GET /products?page=2&limit=50
```

The response includes pagination metadata:

```json
{
  "data": [
    // Collection items
  ],
  "meta": {
    "page": 2,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting using query parameters:

```
GET /products?categoryId=category-1&velocityClass=A&sort=name&order=asc
```

## Webhooks

RackOptix supports webhooks for event notifications. You can configure webhooks in the API settings to receive notifications for various events.

### Webhook Events

- `facility.created`
- `facility.updated`
- `facility.deleted`
- `product.created`
- `product.updated`
- `product.deleted`
- `layout.created`
- `layout.updated`
- `layout.deleted`
- `optimization.started`
- `optimization.completed`
- `optimization.failed`

### Webhook Payload

```json
{
  "event": "optimization.completed",
  "timestamp": "2025-01-07T12:35:30Z",
  "data": {
    "jobId": "job-1",
    "layoutId": "layout-1",
    "status": "completed",
    "metrics": {
      "storageCapacity": 1250,
      "spaceUtilization": 0.87,
      "accessibility": 0.88
    }
  }
}
```

### Webhook Security

Webhook requests include a signature in the `X-RackOptix-Signature` header. You should verify this signature to ensure the request is authentic.

The signature is a HMAC SHA-256 hash of the request body, using your webhook secret as the key.