# Service Management System Implementation Plan

This document outlines the architecture, database schema, API structure, and UI flow for the Service Management System.

## User Review Required

> [!IMPORTANT]  
> Please review the proposed database schema, tech stack choices, and the folder structure before I proceed with generating the code.
> - **Tech Stack:** Frontend (Vanilla HTML, CSS, JS with Bootstrap), Backend (Node.js, Express.js), Database (MongoDB via Mongoose).
> - **Authentication:** We will use JWT (JSON Web Tokens) for role-based authentication and authorization. Does that work for you?
> - **Database Mocks:** Do you already have a MongoDB connection string (e.g. MongoDB Atlas), or would you like me to set it up to use a local MongoDB instance `mongodb://localhost:27017/sermng` by default?

## System Architecture

### 1. Database Schema (MongoDB / Mongoose)

**User Model**
- `name` (String)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (Enum: `client`, `admin`, `developer`, `tester`)
- `createdAt` (Date)

**ServiceRequest Model**
- `client` (ObjectId -> User)
- `serviceType` (String: e.g., 'Website Development', 'Bug Fixing', 'Maintenance')
- `description` (String)
- `priority` (Enum: `Low`, `Medium`, `High`)
- `status` (Enum: `Pending Approval`, `Assigned`, `In Development`, `In Testing`, `Ready for Delivery`, `Completed`, `Rejected`)
- `assignedDev` (ObjectId -> User, nullable)
- `assignedTester` (ObjectId -> User, nullable)
- `devStatus` (Enum: `Not Started`, `In Progress`, `Completed`)
- `testerStatus` (Enum: `Pending`, `Bugs Found`, `Verified`)
- `bugsReported` (String, nullable)
- `slaDeadline` (Date, nullable)
- `createdAt` (Date)

**Feedback Model**
- `client` (ObjectId -> User)
- `serviceRequest` (ObjectId -> ServiceRequest)
- `rating` (Number: 1-5)
- `comments` (String)
- `createdAt` (Date)

### 2. Backend API Structure

**Auth Routes** (`/api/auth`)
- `POST /register`: Register a new user
- `POST /login`: Authenticate and return JWT token

**Client Routes** (`/api/client`)
- `POST /requests`: Create a new service request
- `GET /requests`: Get requests for the logged-in client
- `POST /feedback`: Submit feedback for a completed request

**Admin Routes** (`/api/admin`)
- `GET /requests`: View all service requests
- `PUT /requests/:id/approve`: Approve/reject request, assign Dev & Tester, set SLA
- `GET /users`: List all developers, testers, etc. for assignment

**Developer Routes** (`/api/developer`)
- `GET /tasks`: View assigned tasks (Service Requests)
- `PUT /tasks/:id/status`: Update `devStatus` (Not Started, In Progress, Completed)

**Tester Routes** (`/api/tester`)
- `GET /tasks`: View completed dev tasks assigned to them
- `PUT /tasks/:id/report-bug`: Report a bug and send back to development
- `PUT /tasks/:id/verify`: Mark as verified and `Ready for Delivery`

### 3. Frontend Application Structure

The frontend will use pure HTML, CSS, JavaScript, and Bootstrap 5 to ensure a clean, responsive, and student-friendly architecture. It will communicate with the backend via standard `fetch` API calls.

**Directory Mapping:**
- `public/index.html`: Landing page (Company info, Services, login/register buttons).
- `public/auth.html`: Handles both Login and Registration.
- `public/css/style.css`: Custom UI styles, modern and responsive.
- `public/js/`: API services and scripts for each page.
- `public/dashboards/`
  - `client.html`: Form to submit request, table to view past requests.
  - `admin.html`: Table of all requests, modal to assign staff.
  - `developer.html`: View tasks, update statuses.
  - `tester.html`: Approve tasks or log bugs.
  - `feedback.html`: Client form for providing service feedback.

## Proposed Changes

### Backend Setup
- Initialize standard express app structure in `d:\Downloads\Projects\sermng`.
- Add security middleware (cors, express.json) and mongoose.
- Implementation of models, controllers, and routes as detailed above.

### Frontend Setup
- Establish `public` folder served statically by Express (`app.use(express.static('public'))`).
- Create modern UI with Bootstrap container classes and custom CSS ensuring a premium feel.
- Create role-based navigation and authentication guards (checking JWT in `localStorage`).

## Open Questions

- > [!IMPORTANT] Is generating everything locally within the `d:\Downloads\Projects\sermng` workspace fine?
- > [!IMPORTANT] Would you like a script to populate standard users out-of-the-box (e.g. pre-creating an Admin, Developer, and Tester account) for easier testing?

## Verification Plan

### Automated/Manual Testing approach
1. Start the server via `npm start`.
2. Open `http://localhost:3000` to preview the Landing Page.
3. Test User Registration (Register as Client).
4. As Client, create a Service Request.
5. Create an Admin account via DB seeding or register script.
6. Login as Admin, assign the ticket to a Dev and Tester.
7. Login as Dev, change status to 'Completed'.
8. Login as Tester, Verify the fix.
9. Login as Client, see status as Completed and submit feedback.
