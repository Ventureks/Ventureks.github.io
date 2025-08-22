# Overview

This is a full-stack CRM (Customer Relationship Management) system built with React, Express, and PostgreSQL. The application provides comprehensive business management tools including contractor management, task planning, offer creation, email communication, and support ticket handling. It features a modern web interface with authentication, role-based access control, and a responsive design built with Tailwind CSS and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built as a Single Page Application (SPA) using React with TypeScript. The application uses Wouter for lightweight client-side routing and TanStack Query for server state management and caching. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, styled with Tailwind CSS for consistent design patterns. The frontend follows a feature-based organization with dedicated pages for each major functionality area (contractors, tasks, offers, emails, support).

### Backend Architecture
The server is built with Express.js and follows a RESTful API design pattern. The application uses a modular architecture with separate layers for routing, storage abstraction, and database operations. Authentication is handled through simple username/password validation with CAPTCHA verification. The server includes middleware for request logging, error handling, and CORS support. The storage layer provides an abstraction interface that can be implemented with different storage backends.

### Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes tables for users, contractors, tasks, offers, emails, support tickets, and notifications. Each entity has appropriate relationships and includes common fields like timestamps and unique identifiers. The database configuration supports both local development and cloud deployment with Neon Database.

### Authentication & Authorization
The system implements a basic authentication mechanism with username/password credentials and CAPTCHA verification. User sessions are managed through localStorage on the client side. The application supports role-based access control with different permission levels (admin, user). Authentication state is managed through React Context and persisted across browser sessions.

### State Management
Client-side state is managed through a combination of React Context for authentication state and TanStack Query for server state management. The application uses optimistic updates and automatic cache invalidation to provide a responsive user experience. Local component state is used for form data and UI interactions.

### Build & Development Tools
The project uses Vite as the build tool and development server, providing fast hot module replacement and optimized production builds. TypeScript is configured across the entire stack for type safety. The application includes path aliases for clean imports and supports both development and production environments with different configurations.

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database for data persistence, configured to work with Neon Database for cloud deployment
- **Drizzle ORM**: Type-safe database operations and schema management with automatic migrations

### UI Component Libraries
- **Radix UI**: Unstyled, accessible UI primitives for building the component system
- **shadcn/ui**: Pre-built component library based on Radix UI with consistent styling
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design
- **Lucide React**: Icon library for consistent iconography throughout the application

### Development & Build Tools
- **Vite**: Build tool and development server with hot module replacement
- **TypeScript**: Type checking and enhanced developer experience across the stack
- **ESBuild**: Fast JavaScript bundler used by Vite for production builds

### Frontend Libraries
- **React**: Core UI library with hooks and context for state management
- **Wouter**: Lightweight routing library for single-page application navigation
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form handling with validation and error management
- **date-fns**: Date manipulation and formatting utilities

### Backend Libraries
- **Express.js**: Web application framework for the REST API server
- **Zod**: Schema validation for API inputs and data transformation
- **connect-pg-simple**: PostgreSQL session store for Express sessions