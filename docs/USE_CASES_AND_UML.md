# Use Cases and UML Diagrams

Diagrams use [Mermaid](https://mermaid.js.org/) (render in GitHub, VS Code, or export to images for reports).

---

## 1. Actors

| Actor | Description |
|-------|-------------|
| **Client** | End customer submitting and tracking service requests |
| **Admin** | Operates backlog: assign, reprioritize, change status |
| **Developer** | Executes assigned development work |
| **Tester** | Verifies or returns work with bugs |

---

## 2. Use case diagram

```mermaid
flowchart LR
  subgraph actors
    C[Client]
    A[Admin]
    D[Developer]
    T[Tester]
  end
  subgraph system [Service Management System]
    UC1[Register]
    UC2[Login]
    UC3[Submit service request]
    UC4[Track requests]
    UC5[Submit feedback]
    UC6[View all requests]
    UC7[Assign request to staff]
    UC8[Update request status]
    UC9[View assigned dev tasks]
    UC10[Update dev status]
    UC11[View tester queue]
    UC12[Verify / report bugs]
    UC13[Email/SMS notify - planned]
    UC14[Generate report - planned]
  end
  C --> UC1
  C --> UC2
  C --> UC3
  C --> UC4
  C --> UC5
  A --> UC2
  A --> UC6
  A --> UC7
  A --> UC8
  A --> UC14
  D --> UC2
  D --> UC9
  D --> UC10
  T --> UC2
  T --> UC11
  T --> UC12
  UC7 -.-> UC13
  UC8 -.-> UC13
```

---

## 3. Sequence diagram — Login

```mermaid
sequenceDiagram
  participant U as User Browser
  participant API as Express API
  participant DB as MongoDB

  U->>API: POST /api/auth/login { email, password }
  API->>DB: find user by email
  DB-->>API: user document (hash)
  API->>API: bcrypt.compare(password, hash)
  alt valid
    API->>API: sign JWT(id, role, name)
    API-->>U: 200 { user fields, token }
    U->>U: store token; redirect to dashboard
  else invalid
    API-->>U: 401 { message }
  end
```

---

## 4. Sequence diagram — Submit service request

```mermaid
sequenceDiagram
  participant C as Client
  participant API as Express API
  participant MW as JWT Middleware
  participant DB as MongoDB

  C->>API: POST /api/client/requests + Bearer token
  API->>MW: verify JWT, check role client
  MW-->>API: req.user
  API->>API: validate body
  API->>DB: insert ServiceRequest
  DB-->>API: saved document
  API-->>C: 201 created request
```

---

## 5. Sequence diagram — Admin assigns developer (simplified)

```mermaid
sequenceDiagram
  participant A as Admin UI
  participant API as Express API
  participant DB as MongoDB

  A->>API: PUT /api/admin/requests/:id { assignedDev, ... }
  API->>DB: findById, update fields
  Note over API,DB: May set status Pending Approval to Assigned
  DB-->>API: updated document
  API-->>A: 200 updated request
  Note over A,API: Planned: notification to developer
```

---

## 6. Class diagram (domain model)

```mermaid
classDiagram
  class User {
    +ObjectId _id
    +String name
    +String email
    +String password
    +String role
    +Date createdAt
  }
  class ServiceRequest {
    +ObjectId _id
    +ObjectId client
    +String serviceType
    +String description
    +String priority
    +String status
    +ObjectId assignedDev
    +ObjectId assignedTester
    +String devStatus
    +String testerStatus
    +String bugsReported
    +Date slaDeadline
    +Date createdAt
  }
  class Feedback {
    +ObjectId _id
    +ObjectId client
    +ObjectId serviceRequest
    +Number rating
    +String comments
    +Date createdAt
  }
  User "1" --> "*" ServiceRequest : submits
  User "0..1" --> "*" ServiceRequest : assignedDev
  User "0..1" --> "*" ServiceRequest : assignedTester
  User "1" --> "*" Feedback : writes
  ServiceRequest "1" --> "*" Feedback : has
```

---

## 7. Activity diagram — Request lifecycle (high level)

```mermaid
flowchart TD
  Start([Client submits request]) --> Pending[Pending Approval]
  Pending -->|Admin rejects| Rejected([Rejected])
  Pending -->|Admin assigns dev| Assigned[Assigned]
  Assigned --> InDev[In Development]
  InDev --> InTest[In Testing]
  InTest -->|Bugs found| InDev
  InTest -->|Verified| Ready[Ready for Delivery]
  Ready --> Completed([Completed])
  Completed -->|Optional| Feedback[Client feedback]
```

---

## 8. Table — Use case to API mapping

| Use case | Primary API |
|----------|-------------|
| Register | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Submit request | `POST /api/client/requests` |
| Track requests | `GET /api/client/requests` |
| Feedback | `POST /api/client/feedback` |
| Admin view all | `GET /api/admin/requests` |
| Assign / update | `PUT /api/admin/requests/:id` |
| Dev tasks | `GET /api/developer/tasks` |
| Dev status | `PUT /api/developer/tasks/:id/status` |
| Tester queue | `GET /api/tester/tasks` |
| Verify | `PUT /api/tester/tasks/:id/verify` |
| Report bug | `PUT /api/tester/tasks/:id/bug` |
