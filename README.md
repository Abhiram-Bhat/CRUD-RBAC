# CRUD + RBAC Platform

A comprehensive low-code platform that allows users to define data models from a web UI and automatically generates CRUD APIs, admin interfaces, and enforces role-based access control (RBAC).

## Features

- **Model Definition**: Form-based model editor with fields, types, and RBAC configuration
- **File-based Persistence**: Model definitions are saved as JSON files for versioning and persistence
- **Dynamic CRUD APIs**: Automatically generated REST endpoints for each published model
- **Admin Interface**: Generic UI for managing model data with dynamic forms and tables
- **Role-Based Access Control**: Configurable permissions per role (Admin, Manager, Viewer)
- **Ownership Rules**: Optional owner field for fine-grained access control

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Next.js API routes with TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: Ready for NextAuth.js integration
- **State Management**: Zustand and TanStack Query ready
- **UI Components**: Complete shadcn/ui component set with Lucide icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crud-rbac-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## How to Use

### 1. Define a Model

1. Click "Create Model" on the dashboard
2. Fill in the basic information:
   - **Model Name**: The name of your model (e.g., "Product", "Employee")
   - **Table Name**: Optional database table name (defaults to lowercase plural)
   - **Owner Field**: Optional field for ownership rules (e.g., "ownerId")

3. Add fields to your model:
   - **Field Name**: The name of the field
   - **Type**: Choose from string, number, boolean, date, or text
   - **Required**: Mark if the field is mandatory
   - **Unique**: Mark if the field value must be unique
   - **Default Value**: Optional default value for the field

4. Configure RBAC permissions:
   - **Admin**: Full permissions (create, read, update, delete)
   - **Manager**: Limited permissions (create, read, update)
   - **Viewer**: Read-only permissions

5. Click "Save Model Definition" to save your model

### 2. Publish a Model

1. From the model list, click the settings icon on a draft model
2. Click "Publish" to:
   - Save the model definition to a JSON file in `/models/`
   - Generate dynamic CRUD API endpoints
   - Enable the admin interface for data management

### 3. Manage Model Data

1. From the model list, click the users icon on a published model
2. Use the admin interface to:
   - **Create Records**: Fill in the dynamic form
   - **View Records**: See all records in a table
   - **Edit Records**: Modify existing records
   - **Delete Records**: Remove records with confirmation

### 4. Use the CRUD APIs

Once a model is published, the following API endpoints are automatically available:

```
POST   /api/crud/<modelName>     - Create a new record
GET    /api/crud/<modelName>     - Get all records
GET    /api/crud/<modelName>?id=<id>  - Get a specific record
PUT    /api/crud/<modelName>?id=<id>  - Update a record
DELETE /api/crud/<modelName>?id=<id>  - Delete a record
```

## API Examples

### Create a Product

```bash
curl -X POST http://localhost:3000/api/crud/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 999.99,
    "isActive": true
  }'
```

### Get All Products

```bash
curl http://localhost:3000/api/crud/product
```

### Get a Specific Product

```bash
curl "http://localhost:3000/api/crud/product?id=product-123"
```

### Update a Product

```bash
curl -X PUT "http://localhost:3000/api/crud/product?id=product-123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro",
    "price": 1299.99
  }'
```

### Delete a Product

```bash
curl -X DELETE "http://localhost:3000/api/crud/product?id=product-123"
```

## File-based Model Persistence

When a model is published, its definition is saved as a JSON file in the `/models/` directory. For example:

### `/models/Product.json`
```json
{
  "name": "Product",
  "fields": [
    {
      "name": "name",
      "type": "string",
      "required": true
    },
    {
      "name": "price",
      "type": "number",
      "required": true
    },
    {
      "name": "isActive",
      "type": "boolean",
      "default": true
    }
  ],
  "ownerField": "ownerId",
  "rbac": {
    "Admin": ["create", "read", "update", "delete"],
    "Manager": ["create", "read", "update"],
    "Viewer": ["read"]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## RBAC Implementation

### Role-Based Permissions

The system supports three default roles:

- **Admin**: Full access to all operations
- **Manager**: Can create, read, and update records
- **Viewer**: Can only read records

### Ownership Rules

If an `ownerField` is specified in the model definition:
- Users can only update/delete their own records
- Admin users can update/delete any record
- The ownership check is enforced at the API level

### Permission Checking

The RBAC middleware automatically checks permissions before allowing operations:
1. Load the model definition
2. Check user role permissions
3. For update/delete operations, check ownership if applicable
4. Allow or deny the operation based on permissions

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── models/           # Model management APIs
│   │   └── crud/             # Dynamic CRUD APIs
│   ├── page.tsx             # Main dashboard
│   └── layout.tsx           # App layout
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── model-definition-form.tsx  # Model creation form
│   ├── model-list.tsx       # Model list component
│   └── model-data-admin.tsx # Data management interface
└── lib/
    ├── db.ts                # Database connection
    ├── model-persistence.ts # File-based model storage
    ├── rbac.ts             # RBAC middleware
    └── utils.ts            # Utility functions
models/                     # Published model definitions
prisma/
└── schema.prisma          # Database schema
```

## Database Schema

The platform uses the following database tables:

- **User**: Stores user information with roles
- **ModelDefinition**: Stores model definitions in the database
- **Post**: Example table (can be removed)

```sql
-- User table with role support
CREATE TABLE User (
  id        TEXT PRIMARY KEY,
  email     TEXT UNIQUE,
  name      TEXT,
  role      TEXT DEFAULT 'VIEWER',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Model definitions
CREATE TABLE ModelDefinition (
  id          TEXT PRIMARY KEY,
  name        TEXT UNIQUE,
  tableName   TEXT,
  definition  TEXT, -- JSON string
  isPublished BOOLEAN DEFAULT FALSE,
  createdBy   TEXT,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run db:push`: Push database schema changes
- `npm run db:generate`: Generate Prisma client
- `npm run db:migrate`: Run database migrations

### Database Management

The platform uses Prisma with SQLite for development. To make changes to the database schema:

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Run `npm run db:generate` to update the Prisma client

### Adding New Features

The platform is designed to be extensible:

- **New Field Types**: Add to the `fieldTypes` array in the model form
- **New Roles**: Extend the `Role` enum in the Prisma schema
- **New Permissions**: Add to the `permissions` array in the model form
- **Custom Validation**: Extend the Zod schemas in the form components

## Testing

The platform includes comprehensive testing capabilities:

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### End-to-End Tests

```bash
npm run test:e2e
```

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Security Considerations

- **Authentication**: The platform is ready for NextAuth.js integration
- **Authorization**: RBAC middleware enforces permissions at the API level
- **Input Validation**: Zod schemas validate all form inputs
- **SQL Injection**: Prisma ORM provides protection against SQL injection
- **XSS Protection**: Next.js provides built-in XSS protection

