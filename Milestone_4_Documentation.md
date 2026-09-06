# BuildTrack — Milestone 4 Documentation

## Introduction

Milestone 4 focuses on documenting the individual contributions of team members and the major features implemented in the BuildTrack Construction Project Management System.

The work covered in this milestone includes:

| Team Member | Module | Module Name |
| --- | --- | --- |
| Dhanshri | Module 8 | Notification System |
| Lokash | Module 9 | Dashboard & Analytics |
| Abhay | Module 10 | Reports & Documentation System |
| Saalini | Module 11 | Budget & Cost Management |

The modules are designed to work together using actual database information, role-based access control, and integration with other BuildTrack modules.

## Individual Contributions

### Dhanshri — Module 8: Notification System

#### Objective

The Notification System is responsible for automatically informing users about important project activities, updates, assignments, alerts, and deadlines according to their roles and project responsibilities.

#### Features Implemented

- Project Update Notifications
- Task Assignment Notifications
- Procurement Alerts
- Attendance Alerts
- Deadline Notifications
- System Notifications
- Notification Dropdown/Panel
- Notification/Alerts Page
- Unread Notification Count
- Notification Details/View
- Read/Unread Notification Status
- Role-based Notification Handling

#### Key Functionality

Notifications are generated from actual system events and displayed only to relevant users.

The general flow is:

**Action/Event → Notification Generated → Relevant User → Notification Displayed**

The system ensures that users cannot access notifications belonging to other users or unauthorized projects.

#### Integration

The module integrates with project, task, procurement, attendance, and other system activities.

### Lokash — Module 9: Dashboard & Analytics

#### Objective

The Dashboard & Analytics module provides users with a summarized view of important project and system information based on their roles.

#### Project Manager Dashboard

The Project Manager dashboard provides:

- Project Progress
- Budget Utilization
- Workforce Status
- Resource Utilization
- Procurement Overview

All dashboard information is retrieved from actual database records.

#### Admin Dashboard

The Admin dashboard provides:

- User Management
- Project Monitoring
- System Analytics
- Reports Management
- Activity Monitoring

#### Key Components

- Project Manager Dashboard
- Admin Dashboard
- Project Overview
- User Management
- Project Monitoring
- System Analytics
- Reports Management
- Activity Monitoring
- Role-based Sidebar/Navigation
- Dashboard Cards
- Tables and Charts
- Project/Filter Selection

#### Integration

Module 9 collects information from multiple BuildTrack modules:

- Module 2 → Project Progress
- Module 3 → Site Progress and Milestones
- Module 4 → Resource Utilization
- Module 5 → Material Information
- Module 6 → Workforce Status
- Module 7 → Procurement Overview
- Module 8 → Notifications
- Module 10 → Reports
- Module 11 → Budget Utilization

The dashboard uses role-based access so that users can only view information they are authorized to access.

### Abhay — Module 10: Reports & Documentation System

#### Objective

The Reports & Documentation System collects information from different BuildTrack modules and presents it in a structured report format.

The module allows authorized users to view, filter, generate, and export project reports in PDF and Excel formats.

#### Important Design Requirement

Module 10 does not maintain a separate project-data set.

It retrieves actual information from the existing database and other modules.

#### Report Types

##### Project Progress Reports

Includes:

- Project Selection
- Project Status
- Completion Percentage
- Milestone Information
- Work Completion
- Delays and Progress Information

##### Resource Utilization Reports

Includes:

- Resource Allocation
- Resource Utilization
- Resource Availability
- Project-wise Resource Information

##### Workforce Reports

Includes:

- Workforce Allocation
- Attendance Information
- Workforce Status
- Project-wise Workforce Data

##### Procurement Reports

Includes:

- Procurement Requests
- Purchase Orders
- Vendors/Suppliers
- Invoices
- Procurement Status

##### Budget Reports

Includes:

- Planned Budget
- Estimated Cost
- Actual Expenses
- Utilized Budget
- Remaining Budget

#### Export Features

The module supports:

- PDF Report Generation
- Excel Export
- Report Preview
- Report Filtering
- Project Selection

#### Role-Based Access

Reports are restricted according to the permissions defined in Module 1.

For example:

- **Admin:** Can access system-level reports.
- **Project Manager:** Can access reports related to assigned projects.
- Other users can only access information permitted by their role.

#### Data Flow

**Modules → Database → Module 10 → Report Generation → View/Export**

#### Integration

Module 10 integrates with:

- Project Management
- Site Progress
- Resource Management
- Workforce Management
- Procurement Management
- Budget & Cost Management

The module is designed to generate reports dynamically using actual database information rather than static or hard-coded data.

### Saalini — Module 11: Budget & Cost Management

#### Objective

The Budget & Cost Management module manages the financial aspects of construction projects.

It allows authorized users to plan budgets, estimate costs, track expenses, monitor financial status, and generate financial reports.

#### Budget Planning

Authorized users can define the project budget and allocate it to different cost categories:

- Labor Cost
- Material Cost
- Equipment Cost
- Transportation Cost
- Maintenance Cost
- Administrative Cost

The system maintains both the overall project budget and category-wise allocations.

#### Cost Estimation

The module allows authorized users to record estimated costs for activities and cost categories.

The system supports comparison between:

**Estimated Cost vs Actual Cost**

#### Expense Tracking

Actual project expenses are recorded against the appropriate project and cost category.

Expenses can include:

- Labor
- Materials
- Equipment
- Transportation
- Maintenance
- Administrative Activities

#### Budget Monitoring

The system automatically calculates:

- Total Planned Budget
- Estimated Cost
- Actual Amount Spent
- Remaining Budget
- Budget Utilization Percentage

When an expense is added or updated, the financial summary is automatically updated using database records.

#### Financial Reporting

Financial information can be used by Module 10 to generate budget and cost reports.

#### Integration

Module 11 integrates with:

- Workforce Management
- Material & Inventory Management
- Resource Management
- Procurement Management
- Module 9 Dashboard & Analytics
- Module 10 Reports & Documentation System

#### Expected Components

- Budget Dashboard
- Budget Planning Page
- Cost Estimation Page
- Expense Management Page
- Budget Monitoring Page
- Financial Summary/Report Page
- Cost Category Management
- Project Selection/Filtering
- Budget Utilization Display
- Role-based Access Control

#### Financial Flow

**Project → Budget Planning → Cost Estimation → Actual Expenses → Budget Monitoring → Financial Reporting**

## Module Integration

The four modules developed for this milestone are connected with the existing BuildTrack architecture.

The overall flow can be represented as:

**Project Data → Operational Modules → Database → Dashboard/Reports/Financial Monitoring**

### Major Integration Points

| Module | Provides Information To |
| --- | --- |
| Module 8 — Notifications | Relevant users and system activities |
| Module 9 — Dashboard | Project, workforce, resources, procurement and financial information |
| Module 10 — Reports | Project, resource, workforce, procurement and financial reports |
| Module 11 — Budget & Cost | Dashboard and reporting modules |

## Role-Based Access Control

All modules follow the role-based access control implemented in Module 1.

Users should only be able to access information and perform operations according to their assigned permissions.

Examples include:

- Admin → System-level access
- Project Manager → Access to assigned projects
- Authorized financial users → Budget and expense management
- Other users → Only permitted information

Both frontend and backend authorization should be applied to prevent unauthorized access.

## Database-Driven Implementation

The modules are designed to use actual database records instead of static or hard-coded information.

Important data such as:

- Project progress
- Notifications
- Workforce information
- Resources
- Procurement records
- Budgets
- Expenses
- Reports

must be retrieved from the database.

Changes to the underlying records should automatically reflect in dashboards, reports, notifications, and financial summaries where applicable.

## Testing and Validation

The implemented modules should be tested for:

- Role-based access
- Project-based access
- Database integration
- Dynamic data retrieval
- Notification read/unread status
- Dashboard calculations
- Budget calculations
- Expense calculations
- Remaining budget calculation
- Budget utilization percentage
- Report generation
- PDF export
- Excel export
- Integration between modules

Special attention should be given to ensuring that unauthorized users cannot access restricted project, financial, notification, or report information.

## Milestone 4 Outcome

Milestone 4 establishes an integrated system for:

**Notifications → Dashboard & Analytics → Reports & Documentation → Budget & Cost Management**

The modules collectively improve BuildTrack's ability to monitor project activities, analyze project information, generate structured reports, and manage project finances using database-driven and role-based functionality.
