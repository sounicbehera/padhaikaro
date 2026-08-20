# Scalable Online Learning Management System (LMS)

A production-grade Learning Management System engineered for scalability, real-time interactivity, and high availability. 


## System Architecture & Technical Stack

This system is built using a modern decoupled architecture, prioritizing type safety, efficient data fetching, and scalable real-time communication.

*   **Frontend:** React, Apollo Client (Caching & State Management)
*   **Backend:** Node.js, Express.js, GraphQL (Apollo Server)
*   **Database:** MongoDB (Document store for flexible schema design)
*   **Real-time:** Socket.io (Configured for stateless horizontal scaling)
*   **Security:** JWT (Access/Refresh token rotation), bcrypt
*   **Testing:** Jest (Unit/Integration), Cypress (End-to-End)

## Core Features & Design Decisions

### 1. Authentication & Authorization
*   Role-Based Access Control (RBAC) for Admin, Instructor, and Student.
*   **Design Choice:** Stateless JWT authentication utilizing short-lived access tokens (memory) and HTTP-only, secure cookies for refresh tokens to mitigate XSS and CSRF attacks.

### 2. Course Management (GraphQL API)
*   Schema-first GraphQL implementation.
*   **Optimization:** Integration of `DataLoader` to batch and cache database requests, strictly preventing the GraphQL N+1 query problem when resolving complex relationships (e.g., fetching a course and its thousands of enrolled students).

### 3. Real-Time Collaboration
*   Live Q&A, instant notifications, and real-time chat utilizing WebSockets.
*   **Scalability:** Implemented a Redis Pub/Sub adapter with Socket.io to allow horizontal scaling across multiple Node.js instances without dropping connections.

## Local Setup & Deployment

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Redis (For WebSocket scaling)

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
REDIS_URL=your_redis_url
