# Sweech Backend

## 🛠 Tech Stack

- **Runtime**: Node.js LTS
- **Framework**: NestJS (Express-based)
- **Language**: TypeScript
- **Database**: PostgreSQL 14.2
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Container**: Docker & Docker Compose
- **Code Quality**: ESLint (Google Style Guide) & Prettier
- **API Documentation**: Swagger/OpenAPI

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js LTS
- npm/yarn
- PostgreSQL 14.2

### Development Setup

1. **Clone & Install Dependencies**

   ```bash
   git clone <repository-url>
   cd sweech-backend
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Configure your environment variables in .env
   ```

3. **Database Setup**

   ```bash
   # Start PostgreSQL container
   docker-compose up -d postgres

   # Run database migrations
   npx prisma migrate deploy

   # Push schema changes
   npx prisma db push
   ```

4. **Start Development Server**

   ```bash
   npm run start:dev
   ```

   Application will be available at `http://localhost:3001`

### Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📝 API Documentation

### Authentication Endpoints

- **POST** `/auth/signup`
  - Register new user
  - Body: `{ "email": string, "password": string, "username": string }`

- **POST** `/auth/login`
  - User login
  - Body: `{ "email": string, "password": string }`
  - Returns: JWT token

### Posts Endpoints

- **POST** `/posts`
  - Create new post
  - Auth: Required
  - Body: `{ "title": string, "content": string }`

- **GET** `/posts`
  - List posts with pagination
  - Query: `?page=1&limit=20`

- **GET** `/posts/:id`
  - Get post details
  - Auth: Required

### Comments Endpoints

- **POST** `/posts/:postId/comments`
  - Add comment to post
  - Auth: Required
  - Body: `{ "content": string }`

- **GET** `/posts/:postId/comments`
  - List comments with cursor pagination
  - Query: `?cursor=xyz&limit=10`

- **DELETE** `/posts/:postId/comments/:commentId`
  - Delete comment
  - Auth: Required

### User Activity Endpoints

- **GET** `/users/login-history`
  - Get user login history
  - Auth: Required

- **GET** `/users/rankings`
  - Get weekly login rankings
  - Auth: Required

## 🔒 Security Features

- Password Encryption (bcrypt)
- JWT-based Authentication
- Request Rate Limiting
- CORS Enabled
- Input Validation
- SQL Injection Protection (via Prisma)

## 🔍 Logging System

- HTTP Request/Response Logging
- Response Time Tracking
- Database Connection Status
- Error Tracking
- Request Body & Response Logging

## 💻 Development Commands

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate Prisma client
npx prisma generate

# Create database migration
npx prisma migrate dev --name <migration-name>
```

## 🏗 Project Structure

```
src/
├── auth/           # Authentication module
├── posts/          # Posts module
├── comments/       # Comments module
├── common/         # Shared code, interceptors, filters
├── config/         # Configuration
├── prisma/         # Database layer
└── main.ts         # Application entry point
```

## ⚙️ Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sweech

# JWT
JWT_SECRET=your-256-bit-secret
JWT_EXPIRATION=20m
```

## 🚨 Error Handling

Consistent error response format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error type"
}
```

## 📄 Postman Collection

- Sweech API -> /postman/Sweech-Backend.postman_collection.json
