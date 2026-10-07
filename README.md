# Product Management System

A full-stack web application for managing products, categories, stock, prices, and sales.

This project was created as a Product Management application with a React frontend, ASP.NET Core Web API backend, and MySQL database.

## Features

### Product Management
- Add new products
- Edit product details
- Delete products
- View product details
- Upload product images
- Manage product price and stock
- Search and filter products
- Pagination for the product list
- Automatically show products as "Out of Stock" when stock is 0

### Category Management
- Add categories
- Edit category names
- Activate or deactivate categories
- Delete categories
- View products under categories

### Dashboard
- Total products
- Active products
- Out-of-stock products
- Category information
- Sales information
- Recent products
- Monthly sales information

### Login
- Admin login
- JWT-based authentication
- Protected API endpoints
- Login Credentials 
  Username : admin 
  Password : Admin@123

## Technologies Used

**Frontend**
- React.js
- React Router
- Axios
- CSS

**Backend**
- ASP.NET Core 8 Web API
- Entity Framework Core
- JWT Authentication

**Database**
- MySQL 8


## How to Run the Project

You need to run the database, the backend and the frontend. Use two Command Prompt windows, one for the backend and one for the frontend, and keep both open.

### 1. Install the software

Install Node.js, the .NET 8 SDK, MySQL with MySQL Workbench, and Git.

### 2. Download the project


git clone https://github.com/Anajana74/ProductManagement.git
cd ProductManagement


### 3. Create the database

1. Open MySQL Workbench and connect to your local server.
2. Go to File > Open SQL Script and select Database/schema.sql from the project folder.
3. Click the lightning bolt button to run the script.

### 4. Start the backend

1. Open backend/appsettings.json and replace YOUR_PASSWORD with your MySQL password.
2. In the first Command Prompt window, run:


cd ProductManagement/backend
dotnet restore
dotnet run


3. Wait until you see "Now listening on: http://localhost:5000". Keep this window open.

### 5. Start the frontend

In the second Command Prompt window, run:


cd ProductManagement/frontend
npm install
npm start


The website opens at http://localhost:3000.

### 6. Log in

Username: admin

Password: Admin@123

## Common Problems

If the login page shows "Failed to fetch", the backend is not running. Start it as in step 4.

If the backend stops with a MySQL error, check the password in appsettings.json and make sure MySQL is running and schema.sql was run.

If the backend uses a port other than 5000, change the API address at the top of frontend/src/api.js.

If dotnet shows a version error, change net8.0 in backend/ProductManagement.Api.csproj to your installed .NET version.

## Project Structure

Database: SQL scripts

backend: ASP.NET Core Web API

frontend: React application

## Author

Anjana
