# Task Manager - Angular Coding Challenge

A modern, feature-rich task management application built with Angular 20, Nx, and Angular Material.

## 🚀 Features

### Core Functionality
- ✅ **Create, Edit, and Delete Tasks** - Full CRUD operations for task management
- ✅ **Task Priorities** - Low, Medium, and High priority levels with visual indicators
- ✅ **Task Status** - Mark tasks as Open or Completed
- ✅ **Due Dates** - Set and track task due dates with overdue indicators
- ✅ **Detailed Descriptions** - Add comprehensive descriptions to each task

### Advanced Features
- 🔍 **Live Search** - Real-time search across task titles and descriptions
- 🎯 **Smart Filtering** - Filter by priority and status with multi-select chips
- 📊 **Flexible Sorting** - Sort by title, due date, priority, created date, or status
- 🎨 **Clean Modern UI** - Material Design with smooth animations and transitions

## 📋 Prerequisites

- **Node.js**: v18.16.9 or higher
- **npm**: v9.0.0 or higher
- **Angular CLI**: v20.3.0 (installed as dev dependency)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd angular-challenge-christoffer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 📦 Available Scripts

- **`npm start`** - Start development server (default port: 4200)
- **`npm run build`** - Build production bundle
- **`npm test`** - Run unit tests with Jest
- **`npm run lint`** - Run ESLint code quality checks

## 🏗️ Project Structure

```
angular-challenge-christoffer/
├── src/
│   ├── app/
│   │   ├── components/           # Feature components
│   │   │   ├── task-list/        # Main task overview with filters
│   │   │   ├── task-card/        # Reusable task card component
│   │   │   ├── task-detail/      # Detailed task view
│   │   │   └── task-form-dialog/ # Create/edit dialog
│   │   ├── models/               # TypeScript interfaces and types
│   │   │   └── task.model.ts     # Task-related types
│   │   ├── services/             # Business logic services
│   │   │   └── task.service.ts   # Task state management
│   │   ├── app.ts                # Root component
│   │   ├── app.html              # Root template
│   │   ├── app.scss              # Root styles
│   │   ├── app.routes.ts         # Application routing
│   │   └── app.config.ts         # App configuration
│   ├── index.html                # HTML entry point
│   ├── main.ts                   # Application bootstrap
│   └── styles.scss               # Global styles and Material theme
├── e2e/                          # End-to-end tests (Playwright)
├── nx.json                       # Nx workspace configuration
├── project.json                  # Project-specific configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

