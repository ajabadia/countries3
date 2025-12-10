# Countries3 🌍

A modern full-stack application for managing geographic data, languages, users, and audit logs. Built with Next.js, NestJS, and MongoDB.

## 📋 Features

### ✅ Implemented Modules

- **🌐 Geography Management**
  - Hierarchical area structure (Continents → Countries → Regions → Cities)
  - CRUD operations with parent-child relationships
  - Soft delete functionality
  - JSON import/export capabilities

- **👥 User Management**
  - User authentication with JWT
  - Role-based access control (Admin/User)
  - User activation/deactivation
  - Password hashing (bcrypt)

- **🗣️ Languages Module**
  - 131+ languages with ISO codes
  - Active/inactive status management
  - Multi-language support for countries
  - Search and filtering capabilities

- **📊 Audit Logs**
  - Automatic request logging
  - User activity tracking
  - HTTP method and status code tracking
  - Detailed metadata storage

### 🎨 UI Features

- **Modern Dark Theme** with blue accents
- **Responsive Design** for all screen sizes
- **Development Footer** showing file paths (dev mode only)
- **Interactive Modals** for CRUD operations
- **Real-time Validation** with class-validator
- **Back Navigation** on all pages

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)

### Backend
- **NestJS 10**
- **MongoDB** with Mongoose
- **Passport JWT** authentication
- **Class Validator** for DTOs
- **Bcrypt** for password hashing

### Infrastructure
- **Docker & Docker Compose**
- **pnpm** workspaces (monorepo)
- **Shared TypeScript types** package

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ajabadia/countries3.git
   cd countries3
   ```

2. **Start the application**
   
   **Windows:**
   ```bash
   start.bat
   ```
   
   **Linux/Mac:**
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - MongoDB: localhost:27017

### Default Credentials

- **Admin:** `ajabadia@gmail.com` / `111111`
- **User:** `readyuser@test.com` / `password123`

## 📁 Project Structure

```
countries3/
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   └── services/     # API services
│   └── backend/          # NestJS application
│       ├── src/
│       │   ├── auth/     # Authentication module
│       │   ├── users/    # User management
│       │   ├── geography/# Geography module
│       │   ├── languages/# Languages module
│       │   └── audit/    # Audit logging
│       └── test/
├── packages/
│   └── shared/           # Shared TypeScript types
├── docker/
│   └── mongo-init/       # MongoDB initialization
├── documentation/        # Project documentation
│   ├── walkthrough.md
│   └── lessons_learned.md
├── docker-compose.dev.yml
├── start.bat            # Windows startup script
├── stop.bat             # Windows stop script
├── restart.bat          # Windows restart script
└── commit.bat           # Quick git commit script
```

## 🔧 Development Scripts

### Windows Scripts

- `start.bat` - Start all Docker containers
- `stop.bat` - Stop all containers
- `restart.bat` - Restart containers
- `commit.bat "message"` - Quick git commit and push

### Manual Commands

```bash
# Start services
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Restart a specific service
docker compose -f docker-compose.dev.yml restart frontend
```

## 📚 API Documentation

### Authentication
- `POST /auth/login` - User login
- `GET /auth/profile` - Get current user profile

### Users
- `GET /users` - List all users
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Soft delete user

### Geography
- `GET /geography` - Get all areas
- `GET /geography/:id` - Get area by ID
- `POST /geography` - Create area
- `PATCH /geography/:id` - Update area
- `DELETE /geography/:id` - Soft delete area

### Languages
- `GET /languages` - List all languages
- `GET /languages?active=true` - List active languages only
- `POST /languages` - Create language
- `PATCH /languages/:id` - Update language
- `DELETE /languages/:id` - Soft delete language

### Audit
- `GET /audit?limit=100` - Get audit logs

## 🔐 Environment Variables

Create `.env` files in the respective directories:

### Backend (.env)
```env
MONGODB_URI=mongodb://mongo:27017/countries3
JWT_SECRET=your-secret-key-here
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🧪 Testing

```bash
# Backend tests
cd apps/backend
pnpm test

# Frontend tests
cd apps/frontend
pnpm test
```

## 📝 Documentation

- [Walkthrough](./documentation/walkthrough.md) - Complete feature walkthrough
- [Lessons Learned](./documentation/lessons_learned.md) - Development insights and solutions

## 🐛 Known Issues

- **Bcrypt Native Module**: Currently using stubbed password hashing in Docker. For production, migrate to `bcryptjs` or use Debian-based Docker image.
- **TypeScript Lints**: Some non-critical lints exist related to implicit `any` types and missing module declarations.

## 🚧 Roadmap

- [ ] Migrate to bcryptjs for production
- [ ] Implement full RBAC with route guards
- [ ] Add unit and E2E tests
- [ ] Generate API documentation with Swagger
- [ ] Add data export/import features
- [ ] Implement advanced search and filtering

## 👨‍💻 Author

**Antonio Jabadia**
- Email: ajabadia@gmail.com
- GitHub: [@ajabadia](https://github.com/ajabadia)

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using Next.js, NestJS, and MongoDB**
