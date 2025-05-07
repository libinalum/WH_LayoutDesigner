# RackOptix User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard](#dashboard)
4. [Projects](#projects)
5. [Facilities](#facilities)
6. [Products](#products)
7. [Equipment](#equipment)
8. [Layout Optimization](#layout-optimization)
9. [Reports](#reports)
10. [Exporting](#exporting)
11. [Collaboration](#collaboration)
12. [Settings](#settings)
13. [Troubleshooting](#troubleshooting)
14. [FAQ](#faq)

## Introduction

Welcome to RackOptix, a powerful warehouse layout optimization system designed to help you create efficient warehouse layouts, optimize rack configurations, and manage product slotting. This user guide will walk you through the features and functionality of RackOptix to help you get the most out of the system.

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection
- Screen resolution of at least 1280x800

### Accessing RackOptix

1. Open your web browser and navigate to [https://app.rackoptix.com](https://app.rackoptix.com)
2. Log in with your credentials
3. If you don't have an account, click "Sign Up" and follow the registration process

### First-Time Setup

When you first log in to RackOptix, you'll be guided through a setup wizard that will help you:

1. Create your first project
2. Define your facility
3. Set up your product catalog
4. Configure your equipment

## Dashboard

The dashboard is your home base in RackOptix, providing an overview of your projects and key metrics.

### Dashboard Components

- **Project Cards**: Quick access to your recent projects
- **Metrics Overview**: Key performance indicators for your projects
- **Recent Activity**: Recent changes and updates
- **Notifications**: System notifications and alerts

### Customizing Your Dashboard

1. Click the "Customize" button in the top-right corner of the dashboard
2. Drag and drop widgets to rearrange them
3. Click the gear icon on each widget to configure it
4. Click "Save" to apply your changes

## Projects

Projects are the top-level organizational unit in RackOptix, containing facilities, products, equipment, and layouts.

### Creating a New Project

1. Click "Projects" in the main navigation
2. Click "New Project"
3. Enter a name and description for your project
4. Select a project template (Distribution Center, Fulfillment Center, or Cold Storage)
5. Click "Create Project"

### Project Templates

- **Distribution Center**: Optimized for efficient storage and distribution of products
- **Fulfillment Center**: Optimized for order picking and fulfillment
- **Cold Storage**: Optimized for temperature-controlled storage

### Managing Projects

- **Edit Project**: Click the project card and select "Edit" to modify project details
- **Archive Project**: Click the project card and select "Archive" to archive the project
- **Delete Project**: Click the project card and select "Delete" to permanently delete the project

## Facilities

Facilities represent the physical warehouse space that you're optimizing.

### Creating a Facility

1. Navigate to your project
2. Click "Facilities" in the project navigation
3. Click "New Facility"
4. Enter the facility details:
   - Name
   - Dimensions (length, width, height)
   - Units (feet or meters)
5. Click "Create Facility"

### Drawing the Facility Boundary

1. On the facility editor page, use the drawing tools to define the facility boundary
2. Click on the canvas to place points
3. Double-click to complete the boundary

### Adding Zones

Zones are areas within your facility with specific purposes (e.g., receiving, storage, shipping).

1. Click "Add Zone" in the facility editor
2. Enter a name and purpose for the zone
3. Use the drawing tools to define the zone boundary
4. Click "Save Zone"

### Adding Obstructions

Obstructions are physical barriers within your facility (e.g., columns, walls, offices).

1. Click "Add Obstruction" in the facility editor
2. Select the obstruction type (column, wall, or other)
3. Use the drawing tools to define the obstruction
4. Enter the height of the obstruction
5. Click "Save Obstruction"

## Products

Products are the items that will be stored in your warehouse.

### Adding Products

1. Navigate to your project
2. Click "Products" in the project navigation
3. Click "New Product"
4. Enter the product details:
   - Name
   - SKU
   - Dimensions (length, width, height)
   - Weight
   - Units
   - Velocity class (A, B, or C)
   - Storage requirements
5. Click "Create Product"

### Importing Products

1. Click "Import" on the Products page
2. Download the template CSV file
3. Fill in your product data in the template
4. Upload the completed CSV file
5. Review and confirm the imported products

### Managing Product Categories

1. Click "Categories" on the Products page
2. Click "New Category" to create a new category
3. Enter a name and description for the category
4. Click "Create Category"
5. To assign products to a category, select the products and click "Assign to Category"

## Equipment

Equipment represents the material handling equipment used in your warehouse.

### Adding Equipment

1. Navigate to your project
2. Click "Equipment" in the project navigation
3. Click "New Equipment"
4. Enter the equipment details:
   - Name
   - Type (reach truck, counterbalance forklift, order picker, etc.)
   - Maximum height
   - Minimum aisle width
   - Turning radius
   - Maximum capacity
   - Units
5. Click "Create Equipment"

### Equipment Compatibility

The Equipment Compatibility Checker helps you determine if your equipment is compatible with your rack configuration.

1. Click "Compatibility Checker" on the Equipment page
2. Select the equipment and rack configuration to check
3. The system will analyze the compatibility and display the results

## Layout Optimization

Layout optimization is the core functionality of RackOptix, allowing you to generate and optimize warehouse layouts.

### Generating a Layout

1. Navigate to your project
2. Click "Layout Optimizer" in the project navigation
3. Select the facility to optimize
4. Select the equipment to use
5. Configure the optimization parameters:
   - Aisle width
   - Rack type
   - Maximum height
   - Optimization objective (storage capacity, space utilization, or accessibility)
6. Click "Generate Layout"

### Optimizing Rack Elevations

1. On the Layout Optimizer page, click "Optimize Elevations"
2. Select the products to consider
3. Configure the optimization parameters:
   - Maximum number of levels
   - Minimum level height
   - Optimization objective (storage capacity, space utilization, or accessibility)
4. Click "Optimize"

### Optimizing Product Slotting

1. On the Layout Optimizer page, click "Optimize Slotting"
2. Select the products to slot
3. Configure the optimization parameters:
   - Respect velocity classes
   - Maximum products per bay
   - Optimization objective (travel time, pick efficiency, or balanced)
4. Click "Optimize"

### Evaluating Layouts

1. On the Layout Optimizer page, click "Evaluate Layout"
2. The system will analyze the layout and display key metrics:
   - Storage capacity
   - Space utilization
   - Accessibility
   - Travel efficiency
   - Pick efficiency

### 3D Visualization

The 3D Visualization tool allows you to view your layout in three dimensions.

1. On the Layout Optimizer page, click "3D View"
2. Use the mouse to rotate, pan, and zoom the view
3. Click on racks to see detailed information
4. Use the controls to toggle visibility of different elements

## Reports

RackOptix provides comprehensive reporting capabilities to help you analyze and share your layouts.

### Generating Reports

1. Navigate to your project
2. Click "Reports" in the project navigation
3. Click "New Report"
4. Select the report type:
   - Layout Summary
   - Rack Inventory
   - Optimization Comparison
5. Configure the report parameters
6. Click "Generate Report"

### Customizing Reports

1. On the Reports page, click on a report to open it
2. Click "Customize" to modify the report
3. Add, remove, or rearrange sections
4. Click "Save" to apply your changes

### Sharing Reports

1. On the Reports page, click on a report to open it
2. Click "Share" to share the report
3. Enter the email addresses of the recipients
4. Add an optional message
5. Click "Send"

## Exporting

RackOptix allows you to export your layouts in various formats for use in other systems.

### Export Formats

- **CAD Export**: Export to DXF or DWG format for use in CAD systems
- **3D Model Export**: Export to SKP, OBJ, or GLTF format for use in 3D modeling software
- **PDF Export**: Export to PDF for printing and sharing
- **Data Export**: Export to CSV or JSON for data analysis
- **Image Export**: Export to PNG or JPG for presentations

### Exporting a Layout

1. Navigate to your layout
2. Click "Export" in the top-right corner
3. Select the export format
4. Configure the export options
5. Click "Export"
6. Download the exported file

## Collaboration

RackOptix includes collaboration features to help teams work together on layouts.

### Comments and Annotations

1. Navigate to your layout
2. Click "Comments" in the top-right corner
3. Click on the layout to add a comment at a specific location
4. Enter your comment
5. Click "Save Comment"

### Version History

1. Navigate to your layout
2. Click "History" in the top-right corner
3. View the version history of the layout
4. Click on a version to view it
5. Click "Restore" to revert to a previous version

### Sharing Layouts

1. Navigate to your layout
2. Click "Share" in the top-right corner
3. Enter the email addresses of the recipients
4. Select the permission level (view or edit)
5. Add an optional message
6. Click "Share"

## Settings

The Settings page allows you to configure your account and preferences.

### Account Settings

1. Click your profile picture in the top-right corner
2. Select "Settings"
3. Update your account information:
   - Name
   - Email
   - Password
   - Profile picture
4. Click "Save Changes"

### Notification Settings

1. Go to Settings
2. Click "Notifications"
3. Configure your notification preferences:
   - Email notifications
   - In-app notifications
   - Notification frequency
4. Click "Save Changes"

### Display Settings

1. Go to Settings
2. Click "Display"
3. Configure your display preferences:
   - Theme (light or dark)
   - Units (imperial or metric)
   - Date format
   - Time format
4. Click "Save Changes"

## Troubleshooting

### Common Issues

#### Layout Generation Fails

- Ensure your facility boundary is properly defined
- Check that your facility dimensions are reasonable
- Verify that your equipment is compatible with your facility

#### Slow Performance

- Try using a smaller dataset for optimization
- Close other browser tabs and applications
- Clear your browser cache

#### Export Fails

- Check your internet connection
- Ensure your layout is not too complex
- Try a different export format

### Getting Help

If you encounter issues not covered in this guide, please:

1. Click the "Help" button in the bottom-right corner
2. Search the knowledge base for your issue
3. If you can't find a solution, click "Contact Support" to submit a support ticket

## FAQ

### General Questions

**Q: How many projects can I create?**
A: The number of projects you can create depends on your subscription plan. Basic plans allow up to 5 projects, while Premium and Enterprise plans offer unlimited projects.

**Q: Can I collaborate with external users?**
A: Yes, you can share layouts and reports with external users. They will receive an email invitation to view or edit the shared content.

**Q: Is my data secure?**
A: Yes, RackOptix uses industry-standard security measures to protect your data. All data is encrypted in transit and at rest.

### Technical Questions

**Q: What browsers are supported?**
A: RackOptix supports the latest versions of Chrome, Firefox, Safari, and Edge.

**Q: Can I use RackOptix offline?**
A: No, RackOptix requires an internet connection to function properly.

**Q: Can I import data from other systems?**
A: Yes, RackOptix supports importing product data from CSV files. Support for importing from other warehouse management systems is coming soon.

### Optimization Questions

**Q: How long does optimization take?**
A: Optimization time depends on the complexity of your facility and the number of products. Simple optimizations take seconds, while complex optimizations may take a few minutes.

**Q: What optimization algorithms are used?**
A: RackOptix uses a combination of constraint programming, genetic algorithms, and heuristic methods to optimize layouts.

**Q: Can I customize the optimization parameters?**
A: Yes, RackOptix provides extensive customization options for optimization parameters, allowing you to tailor the optimization to your specific needs.