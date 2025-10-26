# CRUD + RBAC Platform: Your Next Low-Code Backend Starte

##  Features—The Core Magic

  * **Design Your Models:** Use the form-based editor to define fields, types, and set the RBAC permissions for each role. No more digging into database files to define a table\!
  * **File-Based Models:** Model definitions are saved as clear, readable **JSON files** (`/models/`), which is great for version control and persistence.
  * **Dynamic CRUD APIs:** Once you hit "Publish," you instantly get fully functional REST endpoints for your new model. Fast, simple, and ready to go.
  * **Instant Admin UI:** Get a generic interface with dynamic forms and tables right out of the box to manage your data immediately.
  * **RBAC Built-in:** Configure who can do what with predefined roles like **Admin**, **Manager**, and **Viewer**.
  * **Ownership Rules:** Need fine-grained control? Add an optional "owner" field to ensure users can only modify their own records.

-----

## 🛠️ The Modern Tech Stack

We're using a blazing-fast, modern stack that's easy to develop with:

  * **Frontend:** **Next.js 15** (App Router) + **TypeScript**, styled beautifully with **Tailwind CSS** and ready-made components from **shadcn/ui**.
  * **Backend:** **Next.js API routes** (because why use two servers?) and **TypeScript**.
  * **Database:** **SQLite** for simplicity in development, managed by the excellent **Prisma ORM**.
  * **Authentication:** Set up to integrate easily with **NextAuth.js**.
  * **State Management:** Ready for **Zustand** and **TanStack Query** right out of the box.

-----

##  Getting Started (Five Minutes to Launch\!)

You'll need Node.js (v18+) and npm/yarn installed.

### Installation

1.  **Grab the Code:**

    ```bash
    git clone <https://github.com/Abhiram-Bhat/CRUD-RBAC>
    cd crud-rbac-platform
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Database Setup:** This creates your local `dev.db` and pushes the initial schema.

    ```bash
    npm run db:push
    ```

4.  **Fire It Up\!**

    ```bash
    npm run dev
    ```

    Your platform should be running at `http://localhost:3000`.

-----

## 🗺️ How to Use the Platform

The whole workflow is designed to be simple and visual:

### 1\. Define Your Data Model

  * Go to the dashboard and click **"Create Model."**
  * **Basic Info:** Give it a name (e.g., "Product"), an optional table name, and an optional **Owner Field** (like `ownerId`) if you need ownership logic.
  * **Add Fields:** Define your fields (string, number, boolean, etc.) and mark them as `Required` or `Unique` as needed.
  * **Set Permissions:** For each field, configure the permissions for **Admin**, **Manager**, and **Viewer** roles (e.g., a "Viewer" can only **read**).
  * **Save** the definition.

### 2\. Publish It

  * Find your model in the list and click the **settings icon** (usually a gear).
  * Hit **"Publish."** This single action does three things:
    1.  Saves the model definition as a JSON file.
    2.  **Generates the dynamic CRUD API endpoints.**
    3.  **Enables the data management UI.**

### 3\. Manage Data (Admin UI)

  * Click the **users icon** next to your published model.
  * You'll be taken to the live admin interface where you can **Create**, **View**, **Edit**, and **Delete** records using the dynamically generated forms and tables.

### 4\. Hit the APIs\!

The moment a model is published, you can start hitting the fully protected endpoints immediately.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/crud/<modelName>` | Create a new record |
| `GET` | `/api/crud/<modelName>` | Get all records |
| `GET` | `/api/crud/<modelName>?id=<id>` | Get a specific record |
| `PUT` | `/api/crud/<modelName>?id=<id>` | Update a record |
| `DELETE` | `/api/crud/<modelName>?id=<id>` | Delete a record |

-----

## 🔐 RBAC Explained

Access control is a top priority for this platform.

### Role-Based Permissions

We start with three standard roles, easily extensible:

  * **Admin:** Complete **full access** (create, read, update, delete).
  * **Manager:** Can **create, read, and update** records.
  * **Viewer:** **Read-only** access.

### Ownership Rules

If you set an `ownerField` (like `userId`):

  * A non-Admin user can **only** update or delete records where the `ownerField` matches their own ID.
  * Admins, naturally, bypass this and can modify any record.

The permission check happens automatically in the **RBAC middleware** before any database operation is allowed.

-----

## 📂 Project Structure Snapshot

If you dive into the code, here's the lay of the land:

```
src/
├── app/
│   ├── api/
│   │   ├── crud/              # The heart of the dynamic API generation
│   └── page.tsx               # Main dashboard component
├── components/                # UI components, including the Model Form & Admin views
└── lib/
    ├── model-persistence.ts   # Logic for saving models to JSON
    └── rbac.ts                # The RBAC permission checking logic
models/                        # Where your published JSON models live
prisma/
└── schema.prisma              # Database schema definition
```

-----

## 💻 Development & Extensibility

### Scripts to Know

| Script | What it Does |
| :--- | :--- |
| `npm run dev` | Starts the dev server |
| `npm run build` | Creates the production build |
| `npm run db:push` | Pushes schema changes to the local SQLite DB |
| `npm run db:generate` | Generates the Prisma client |
| `npm test` | Runs Unit Tests |

### Extending the Platform

This project is built to be a great starting point:

  * **New Field Types?** Just add to the `fieldTypes` array in the model form.
  * **Need more roles?** Extend the `Role` enum in your Prisma schema.
  * **Custom Validation?** The form components use **Zod** schemas, making custom validation a snap\!
This project is done by Abhiram T A
contact-abhiramta267@gmail.com
