# EINSPOT Solutions Web Application Architecture

## Core Architecture

### Technology Stack
- Framework: Vite + React + TypeScript
- UI: Tailwind CSS + shadcn/ui
- State Management: Zustand
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Form Management: React Hook Form + Zod
- API Client: @tanstack/react-query
- Animation: Framer Motion

### Key Design Patterns
1. Atomic Design Components
2. Feature-First Directory Structure
3. Custom Hook Abstractions
4. Centralized State Management
5. Type-Safe Database Operations

### Core Features
1. Dynamic Theming System
2. Role-Based Access Control
3. Admin Dashboard
4. URL Management System
5. Menu Management System
6. Error Boundary Implementation
7. Performance Optimization

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   └── admin/          # Admin-specific components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/      # Supabase client & types
├── lib/               # Utility libraries
├── pages/             # Route components
├── stores/            # Zustand state stores
└── utils/             # Helper functions
```

## State Management

### Theme Store
- Manages application themes
- Handles theme switching
- Persists theme preferences

### Menu Store
- Manages navigation menu items
- Handles menu item CRUD operations
- Maintains menu order

### URL Management
- Custom URL mapping
- SEO-friendly URLs
- URL validation and conflict resolution

## Security & Performance

### Security Measures
1. Role-Based Access Control
2. Input Validation
3. Type Safety
4. Error Boundaries
5. Rate Limiting

### Performance Optimizations
1. Dynamic Imports
2. Image Optimization
3. Skeleton Loading
4. State Persistence
5. Query Caching

## Database Schema

### Core Tables
1. themes
2. menu_items
3. custom_urls
4. profiles
5. admin_invitations

### Relationships
Detailed in migrations/*.sql

## Development Guidelines

1. Type Safety
   - Use TypeScript strictly
   - Define interfaces for all data structures
   - Validate API responses

2. Component Structure
   - Follow atomic design principles
   - Implement error boundaries
   - Use proper prop typing

3. State Management
   - Use Zustand for global state
   - Implement proper error handling
   - Add persistence where needed

4. Code Style
   - Follow ESLint configuration
   - Use prettier for formatting
   - Follow component naming conventions

5. Testing
   - Unit tests for utilities
   - Component testing with React Testing Library
   - E2E tests with Cypress

## Feature Implementation Guide

When implementing new features:
1. Add database migrations
2. Update TypeScript types
3. Create/update components
4. Add state management
5. Implement error handling
6. Add loading states
7. Write tests
8. Update documentation
