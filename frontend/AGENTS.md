<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Frontend Engineering Guidelines — Small ERP

You are the frontend engineer responsible for designing and implementing the entire frontend of the Small ERP.

The frontend is a real business application, not a landing page or a UI showcase.

Your primary goals are:

1. Build a professional ERP interface suitable for real small-business operations.
2. Prioritize usability, clarity, consistency, and operational efficiency.
3. Follow established ERP UX patterns rather than inventing unusual interaction patterns.
4. Keep the frontend maintainable and scalable as the number of modules grows.
5. Treat the backend API as the source of truth for business rules and authorization.
6. Avoid unnecessary visual complexity, animations, abstractions, and dependencies.

The application should feel like a serious business management system.

---

# 1. Technology Stack

The frontend uses:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Next.js BFF
* REST API consumed through the BFF

Use the existing project dependencies whenever possible.

Do not introduce a new library simply because it provides a convenient component.

Before adding a dependency, determine whether the requirement can be solved cleanly using the existing stack.

---

# 2. Architecture

The frontend is responsible for presentation, user interaction, client-side state, and communication with the backend.

The backend is responsible for:

* authentication;
* authorization;
* tenant isolation;
* business rules;
* validation of business operations;
* persistence;
* transactional consistency.

Never duplicate business rules in the frontend.

The frontend may provide immediate validation for usability, but the backend remains authoritative.

## Request flow

The expected communication flow is:

```text
Browser
   |
   v
Next.js Application
   |
   v
Next.js BFF
   |
   v
Go Backend
   |
   v
Business Context
```

The browser should not communicate directly with internal backend services.

All application-specific backend communication should go through the BFF.

---

# 3. BFF Guidelines

The BFF exists to adapt backend APIs to the needs of the frontend.

Use the BFF for:

* session handling;
* authentication-related operations;
* request composition;
* response composition;
* hiding backend implementation details;
* adapting backend responses to UI requirements;
* handling browser-specific concerns.

Do not turn the BFF into a second business-logic layer.

Avoid implementing domain rules in the BFF.

Bad:

```text
BFF:
if stock < requestedQuantity:
    rejectOrder()
```

Good:

```text
BFF:
request backend to create order
return backend result to frontend
```

The Go backend remains responsible for business decisions.

---

# 4. ERP UX Principles

The application should follow conventions commonly found in mature ERP systems.

Prioritize:

* information density;
* predictable navigation;
* clear hierarchy;
* fast access to common operations;
* searchable data;
* filtering;
* sorting;
* pagination;
* status visibility;
* clear actions;
* consistent forms;
* meaningful empty states;
* clear error states.

Do not optimize the UI for visual minimalism at the expense of operational efficiency.

ERP users frequently work with large amounts of structured information.

A table containing 20 useful columns is sometimes better than a beautiful card containing 3.

---

# 5. Application Layout

The main application should use a persistent application shell.

Expected structure:

```text
┌─────────────────────────────────────────────────────┐
│ Top Bar                                             │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│ Sidebar       │ Main Content                        │
│               │                                     │
│ Dashboard     │                                     │
│ Sales         │                                     │
│ Purchasing    │                                     │
│ Inventory     │                                     │
│ Products      │                                     │
│ Suppliers     │                                     │
│ Finance       │                                     │
│ Users         │                                     │
│ Settings      │                                     │
│               │                                     │
└───────────────┴─────────────────────────────────────┘
```

The sidebar should:

* group related modules;
* clearly indicate the active section;
* support collapsed state when appropriate;
* avoid excessive nesting;
* respect user permissions.

Do not create deeply nested navigation.

Prefer:

```text
Sales
Purchasing
Inventory
Finance
```

over:

```text
Operations
  └── Commercial
      └── Sales
          └── Orders
              └── Management
```

---

# 6. Navigation

Navigation should reflect the business domain.

Expected initial structure:

```text
Dashboard

Sales
  Orders

Purchasing
  Purchase Orders
  Suppliers

Inventory
  Products
  Categories
  Stock
  Movements

Finance
  Accounts Receivable
  Accounts Payable

Administration
  Users
  Company
```

Do not expose implementation details such as backend services or bounded contexts directly in the UI.

The user should think in terms of business operations, not software architecture.

---

# 7. Dashboard

The dashboard is an operational overview, not a decorative analytics page.

The dashboard should provide useful information at a glance.

Possible initial sections:

```text
┌────────────────┬────────────────┬────────────────┬────────────────┐
│ Total Sales    │ Orders         │ Receivables    │ Low Stock      │
│ R$ 42,350       │ 124            │ R$ 8,420       │ 7 products     │
└────────────────┴────────────────┴────────────────┴────────────────┘

Sales Overview
────────────────────────────────────────────────────────────

Recent Sales
────────────────────────────────────────────────────────────

Low Stock
────────────────────────────────────────────────────────────

Pending Financial Items
────────────────────────────────────────────────────────────
```

Prefer metrics that lead to action.

Examples:

* low-stock products;
* overdue receivables;
* pending purchases;
* sales volume;
* recent orders;
* outstanding financial items.

Dashboard cards should preferably allow users to navigate to the relevant records.

Dashboards in established ERP systems commonly combine KPIs, charts, tables, filters, and drill-down into the underlying records. Follow this principle.

Do not fill the dashboard with charts simply to make it look impressive.

---

# 8. Tables

Tables are one of the most important components of the application.

Create a consistent data-table pattern.

Tables should support, where appropriate:

* pagination;
* sorting;
* search;
* filtering;
* column alignment;
* status indicators;
* row actions;
* loading states;
* empty states;
* error states;
* responsive behavior.

Example:

```text
Products

[ Search products... ] [ Category ] [ Status ] [ + New Product ]

┌────────┬──────────────┬──────────┬──────────┬────────────┐
│ SKU    │ Product      │ Category │ Stock    │ Status     │
├────────┼──────────────┼──────────┼──────────┼────────────┤
│ PROD01 │ Product A    │ Drinks   │ 124      │ In stock   │
│ PROD02 │ Product B    │ Food     │ 8        │ Low stock  │
│ PROD03 │ Product C    │ Food     │ 0        │ Out        │
└────────┴──────────────┴──────────┴──────────┴────────────┘

                     < 1 2 3 4 5 >
```

Avoid replacing operational tables with cards unless the data genuinely benefits from a card representation.

---

# 9. Search and Filtering

Search and filtering are first-class ERP functionality.

For lists with potentially many records:

* provide search;
* debounce search requests when appropriate;
* support useful filters;
* preserve filters during navigation when practical;
* provide clear filter reset behavior.

Examples:

Products:

```text
Search
Category
Stock status
Active / inactive
```

Sales:

```text
Search
Date range
Customer
Status
Payment status
```

Purchasing:

```text
Search
Supplier
Date range
Status
```

Do not create filters that have no meaningful business use.

---

# 10. Forms

Forms should be optimized for data entry.

Use:

* clear labels;
* appropriate input types;
* meaningful validation messages;
* logical grouping;
* sensible defaults;
* keyboard-friendly interaction;
* clear required-field indicators.

Group fields by business meaning.

Example:

```text
Product Information

General
  Name
  SKU
  Category
  Description

Pricing
  Cost Price
  Sale Price

Inventory
  Unit
  Minimum Stock
```

Do not create one enormous flat form.

---

# 11. Create / Edit Patterns

Use consistent patterns across the application.

For simple entities:

```text
List
  |
  +-- Create
  |
  +-- Edit
  |
  +-- Delete
```

For complex business operations, prefer dedicated pages or workflows.

For example:

```text
Create Sale

Customer
   ↓
Products
   ↓
Totals
   ↓
Payment
   ↓
Confirmation
```

Do not force complex business workflows into tiny modal dialogs.

Modals are appropriate for:

* confirmation;
* simple forms;
* quick actions;
* small contextual operations.

Use pages for complex workflows.

---

# 12. Statuses

Business statuses should be visually consistent.

Examples:

```text
Draft
Pending
Confirmed
Completed
Cancelled
Overdue
Paid
Low Stock
Out of Stock
```

Use a shared status component.

Do not create a different visual representation for the same status in different modules.

---

# 13. Loading States

Never display a blank screen while data is loading.

Every asynchronous view should have an intentional loading state.

Use:

* skeletons;
* loading indicators;
* disabled actions where appropriate.

Example:

```text
Products

[ Search... ]

┌──────────────────────────────┐
│ ████████████  ████████      │
│ █████████     █████████     │
│ ████████████  ████████      │
└──────────────────────────────┘
```

Avoid unnecessary global loading screens.

Prefer localized loading states.

---

# 14. Error States

Errors must be understandable to the user.

Bad:

```text
Error 500
```

Better:

```text
Unable to load products.

Please try again.

[ Retry ]
```

Backend errors should be mapped into appropriate UI messages.

Do not expose:

* stack traces;
* internal service names;
* database errors;
* raw API responses.

---

# 15. Empty States

Every list should have a meaningful empty state.

Example:

```text
No products found.

Create your first product to start managing your inventory.

[ + Create Product ]
```

Differentiate between:

### No data

The company has no records.

### No results

Records exist, but the current filters return nothing.

Example:

```text
No products match your filters.

[ Clear filters ]
```

---

# 16. Permissions

The frontend must respect permissions for UX purposes.

If the user does not have permission to perform an action:

* hide the action when appropriate;
* disable it when visibility is useful;
* never rely on frontend permission checks for security.

The backend is always the final authority.

The frontend should never assume that hiding a button makes an operation secure.

---

# 17. Tenant Awareness

The user should always operate within a clear company context.

Do not expose tenant identifiers unnecessarily.

Do not allow the frontend to freely select or modify `tenant_id`.

The backend determines the authenticated user's tenant.

Never construct requests such as:

```text
POST /products
{
  "tenant_id": "company-123"
}
```

when the tenant can be derived from the authenticated session.

The frontend should operate on the current company context without being responsible for enforcing tenant isolation.

---

# 18. Responsiveness

The primary target is desktop because ERP systems are commonly used on desktop environments.

However, the application should remain usable on smaller screens.

Prioritize:

1. desktop;
2. tablet;
3. mobile.

Do not simply shrink desktop tables until they become unusable.

For smaller screens:

* hide low-priority columns;
* provide horizontal scrolling where appropriate;
* convert dense layouts into stacked sections;
* preserve important actions.

---

# 19. Accessibility

Follow accessible web practices.

Ensure:

* semantic HTML;
* keyboard navigation;
* visible focus states;
* accessible labels;
* sufficient contrast;
* proper button semantics;
* proper form associations;
* meaningful error messages.

Do not use clickable `<div>` elements when a `<button>` or `<a>` is appropriate.

---

# 20. Design System

Create a small internal design system.

Centralize:

* typography;
* spacing;
* colors;
* buttons;
* inputs;
* selects;
* dialogs;
* tables;
* badges;
* status indicators;
* cards;
* alerts;
* navigation components.

Do not create slightly different versions of the same component.

For example, there should be one primary button pattern rather than:

```text
PrimaryButton
MainButton
ActionButton
SubmitButton
BlueButton
```

unless there is a legitimate semantic distinction.

---

# 21. Visual Design

The visual language should be:

* professional;
* clean;
* information-dense;
* restrained;
* consistent;
* business-oriented.

Avoid:

* excessive gradients;
* excessive glassmorphism;
* huge typography;
* unnecessary animations;
* excessive rounded cards;
* decorative illustrations everywhere;
* excessive shadows;
* dashboard designs that prioritize aesthetics over information.

The application should look like a serious SaaS/ERP product.

It should not look like a marketing website.

---

# 22. Performance

Performance is important because ERP screens frequently contain tables and forms.

Follow these principles:

* avoid unnecessary client components;
* prefer Server Components when appropriate;
* fetch data as close to the server boundary as possible;
* avoid unnecessary network requests;
* debounce search inputs;
* paginate large datasets;
* avoid rendering thousands of rows at once;
* use virtualization when genuinely necessary;
* avoid unnecessary global state;
* lazy-load heavy components when appropriate.

Do not optimize prematurely.

Measure before introducing complexity.

---

# 23. State Management

Use the simplest state mechanism appropriate for the problem.

Prefer:

```text
URL state
↓
Server state
↓
Local component state
↓
Shared client state
```

Do not put everything into a global state manager.

Examples:

Search/filter state:

```text
URL query parameters
```

Server data:

```text
Server fetching / appropriate data-fetching layer
```

Form state:

```text
Local form state
```

Global state should only be introduced when there is a real cross-application requirement.

---

# 24. URL State

Lists should preferably encode meaningful filters in the URL.

Example:

```text
/products?search=coffee&category=drinks&status=active&page=2
```

This allows:

* browser navigation;
* bookmarking;
* sharing;
* refresh without losing state.

Do not store important navigation state exclusively in memory.

---

# 25. TypeScript

Use strict TypeScript.

Avoid:

```ts
any
```

unless there is a documented reason.

Prefer explicit domain types.

Example:

```ts
type ProductStatus =
  | "active"
  | "inactive";

interface Product {
  id: string;
  name: string;
  sku: string;
  status: ProductStatus;
}
```

Keep API types separate from UI-specific types when necessary.

Do not allow backend response structures to leak everywhere in the component tree.

---

# 26. Component Architecture

Organize components according to responsibility.

Prefer:

```text
components/
├── ui/
├── layout/
├── tables/
├── forms/
├── feedback/
└── domain/
    ├── products/
    ├── sales/
    ├── inventory/
    └── finance/
```

Reusable components should be genuinely reusable.

Do not abstract components prematurely.

A component used once does not automatically need to become a generic abstraction.

---

# 27. Domain-Oriented Frontend Structure

Organize complex features around business domains.

Example:

```text
features/
├── products/
│   ├── components/
│   ├── hooks/
│   ├── schemas/
│   ├── types/
│   └── api/
│
├── sales/
│   ├── components/
│   ├── hooks/
│   ├── schemas/
│   ├── types/
│   └── api/
│
└── inventory/
```

Avoid creating a massive generic folder where unrelated business logic becomes mixed together.

---

# 28. API Integration

The frontend should have a clear API client layer.

Do not scatter raw `fetch()` calls throughout UI components.

Prefer:

```text
features/products/api/
```

or an equivalent centralized structure.

Components should express intent:

```ts
await createProduct(data)
```

rather than:

```ts
await fetch("/api/products", {
  method: "POST",
  ...
})
```

The UI should not need to know HTTP implementation details.

---

# 29. Business Workflows

ERP workflows should be explicit.

Example:

```text
Draft Sale
   |
   v
Confirm Sale
   |
   +--> Validate stock
   |
   +--> Register sale
   |
   +--> Update inventory
   |
   +--> Register financial transaction
   |
   v
Completed
```

The frontend should represent the workflow clearly.

Use confirmation dialogs for destructive or irreversible operations.

Examples:

```text
Cancel sale?
This action cannot be undone.
```

Avoid generic confirmations such as:

```text
Are you sure?
```

Explain what will happen.

---

# 30. Dashboard and Data Visualization

Charts should answer business questions.

Good:

```text
Sales over time
Top selling products
Inventory value
Accounts receivable
```

Bad:

```text
Random pie chart because the dashboard needs a chart.
```

Use tables when exact values matter.

Use charts when trends or comparisons are easier to understand visually.

Always provide meaningful labels and context.

---

# 31. Notifications

Use a consistent notification system.

Appropriate use:

* successful creation;
* successful update;
* successful deletion;
* background operation completed;
* recoverable errors.

Do not show notifications for every trivial interaction.

Notifications should be concise.

Example:

```text
Product created successfully.
```

---

# 32. Security

Never trust client-side data.

Never:

* store sensitive credentials unnecessarily;
* expose secrets to the browser;
* trust frontend permission checks;
* trust tenant IDs supplied by the user;
* expose backend implementation details.

Environment variables containing secrets must remain server-side.

---

# 33. SEO

SEO is not a primary concern for authenticated ERP pages.

Do not waste time optimizing internal application pages for search engines.

Focus on:

* application performance;
* accessibility;
* usability;
* reliability.

---

# 34. AI-Assisted Development

AI tools are allowed and expected to be used during frontend development.

However, generated code must follow the project's architecture.

Never accept generated code blindly.

Before committing AI-generated code:

1. understand what it does;
2. verify its dependencies;
3. verify its types;
4. verify its accessibility;
5. verify its loading and error states;
6. verify that it does not duplicate business logic;
7. verify that it follows existing design patterns.

Do not generate entire pages independently if equivalent reusable components already exist.

Reuse the project's design system.

---

# 35. Implementation Workflow

When implementing a new module:

### Step 1 — Understand the domain

Read the relevant backend API contract and documentation.

Identify:

* entities;
* operations;
* statuses;
* permissions;
* relationships;
* validation requirements.

### Step 2 — Define the UX

Determine:

* list page;
* detail page;
* create flow;
* edit flow;
* filters;
* actions;
* statuses;
* empty states;
* loading states;
* error states.

### Step 3 — Reuse existing components

Before creating new UI primitives, search the existing codebase.

### Step 4 — Implement the happy path

Build the primary workflow first.

### Step 5 — Implement failure states

Handle:

* validation errors;
* authorization errors;
* network errors;
* empty data;
* loading;
* conflicts.

### Step 6 — Test the workflow

Verify the complete flow from the user's perspective.

### Step 7 — Refactor

Remove:

* duplicated components;
* unnecessary state;
* unnecessary abstractions;
* dead code;
* unused dependencies.

---

# 36. Definition of Done

A frontend feature is not complete when the happy path works.

A feature is complete when it has:

* [ ] functional UI;
* [ ] responsive layout;
* [ ] loading state;
* [ ] empty state;
* [ ] error state;
* [ ] validation;
* [ ] permission handling;
* [ ] appropriate accessibility;
* [ ] consistent design system usage;
* [ ] typed API integration;
* [ ] no unnecessary business logic duplication;
* [ ] no unnecessary dependencies;
* [ ] no console errors;
* [ ] no TypeScript errors;
* [ ] reasonable performance.

---

# 37. Important Rule

Do not over-engineer the frontend.

This project is a portfolio ERP.

The goal is not to demonstrate how many libraries, abstractions, animations, or architectural patterns can be used.

The goal is to demonstrate that the developer can build a coherent, professional business application with:

```text
Good UX
   +
Clear Architecture
   +
Strong Type Safety
   +
Reliable API Integration
   +
Consistent Design System
   +
Real Business Workflows
```

When uncertain, prefer the simpler solution that preserves maintainability and user experience.
