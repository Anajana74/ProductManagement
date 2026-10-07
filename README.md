# Product Management System

A full-stack mini product management web application. Admins can sign in, manage products and categories,
upload product images, track stock and prices, and view sales details on a dashboard.

## Features
- Secure login / logout (JWT authentication, default admin account)
- Dashboard with live statistics, monthly chart and recent products
- Add, edit and delete products
- Product image upload (PNG/JPG, max 2 MB, with a popup warning for invalid files)
- Stock and price management with automatic "Out of Stock" status
- Category management (add, rename, activate/deactivate, delete)
- Search, category/status filters and pagination
- Product details page with sales history and revenue
- Custom confirmation dialogs and toast notifications

## Tech stack
| Layer | Technology |
|-------|-----------|
| Frontend | React (Create React App), React Router, plain CSS |
| Backend | ASP.NET Core 8 Web API, Entity Framework Core, Pomelo MySQL provider |
| Auth | JWT bearer tokens, ASP.NET Core `PasswordHasher` |
| Database | MySQL 8 |

## Prerequisites
- [Node.js](https://nodejs.org) 18 or newer
- [.NET SDK](https://dotnet.microsoft.com/download) 8 or newer
- MySQL 8 with MySQL Workbench (or the `mysql` command line)
- Git

## Getting started

### 1. Clone the repository
```bash
git clone https://github.com/Anajana74/ProductManagement.git
cd ProductManagement
```

### 2. Set up the database
Run `Database/schema.sql` in MySQL Workbench (open the file and click the lightning-bolt button) or from the command line:
```bash
mysql -u root -p < Database/schema.sql
```
This creates the `product_management` database, all tables and sample data.

### 3. Configure and run the backend
Open `backend/appsettings.json` and put your MySQL password in the connection string:
```json
"Default": "Server=localhost;Port=3306;Database=product_management;User=root;Password=YOUR_PASSWORD;"
```
Then run:
```bash
cd backend
dotnet restore
dotnet run
```
The API starts at **http://localhost:5000**.
On the first run it also creates the `Users` table and the default admin account.

To use Swagger (API test page), run `set ASPNETCORE_ENVIRONMENT=Development` before `dotnet run`, then open `http://localhost:5000/swagger`.

### 4. Run the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm start
```
Open **http://localhost:3000** (or 3001 if 3000 is busy; both are allowed by the backend).

### 5. Sign in
| Username | Password |
|----------|----------|
| `admin` | `Admin@123` |

## Project structure
```
ProductManagement/
├── Database/
│   ├── schema.sql            Tables + sample data
│   └── useful_queries.sql    Reporting and maintenance queries
├── backend/                  ASP.NET Core Web API
│   ├── Controllers/          Auth, Products, Categories, Dashboard
│   ├── Models/               Entity classes
│   ├── Dtos/                 Request/response models
│   ├── Data/                 EF Core DbContext
│   ├── wwwroot/uploads/      Uploaded product images
│   └── Program.cs            App configuration
└── frontend/                 React application
    └── src/
        ├── pages/            Login, Dashboard, ProductList, ProductForm, ProductDetails, Categories
        ├── components/       Layout, Auth, Dialog (popups and toasts)
        ├── api.js            API client
        └── styles.css
```

## Database tables
| Table | Purpose | Key columns |
|-------|---------|-------------|
| `Categories` | Product categories | Id, Name (unique), IsActive |
| `Products` | Product catalogue | Id, Name, Sku (unique), CategoryId, Price, StockQuantity, Description, ImageUrl, IsActive |
| `Sales` | Sales records per product | Id, ProductId, Quantity, UnitPrice, SoldAt |
| `Users` | Login accounts | Id, Username (unique), PasswordHash, FullName, Role |

Relationships: a category has many products, and a product has many sales (deleting a product removes its sales).
A product's status is computed: stock 0 = *Out of Stock*, otherwise *Active* or *Inactive*.

## API endpoints
All endpoints except login require the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/dashboard` | Statistics, monthly chart data, recent products |
| GET | `/api/products` | List products (`search`, `categoryId`, `status`, `page`, `pageSize`) |
| GET | `/api/products/{id}` | Product details |
| POST | `/api/products` | Create product (multipart form-data, optional `Image`) |
| PUT | `/api/products/{id}` | Update product (multipart form-data) |
| PATCH | `/api/products/{id}/stock` | Update stock quantity |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/products/{id}/sales` | Units sold, revenue and sales history |
| GET | `/api/categories` | List categories (`search`) |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category (blocked if it has products) |

## Troubleshooting
| Problem | Fix |
|---------|-----|
| "Failed to fetch" in the browser | The backend isn't running, or the frontend port isn't listed in `Cors:Origins` in `appsettings.json`. |
| Backend crashes on start with a MySQL error | Check the password and that MySQL is running and `schema.sql` was executed. |
| Login says "Invalid username or password" | Use `admin` / `Admin@123`. |
| Images don't appear | Make sure the `backend/wwwroot/uploads` folder exists. |
| `dotnet` errors about the framework version | Change `net8.0` in `ProductManagement.Api.csproj` to your installed version. |

## Security notes
This project is intended for learning and local use. Before deploying anywhere public:
change the default admin password, set your own long `Jwt:Key` in `appsettings.json`, and never commit real database passwords.

## Author
Anjana
