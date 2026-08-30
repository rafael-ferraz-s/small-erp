# Small ERP

A simple ERP for small businesses, developed as a portfolio project. The platform brings together the main operational processes of a business into a single system: sales, purchasing, inventory, and financial management.

## Objective

The project aims to demonstrate the development of a business application with:

* modular monolith architecture;
* clear separation of business contexts;
* authentication and role-based authorization;
* tenant-level data isolation;
* frontend separated from the backend, with a BFF layer;
* traceability of actions performed within the system.

The initial scope is deliberately kept simple. Infrastructure, persistence, and deployment decisions will be documented as the project evolves.

## Stack

### Backend

* Go;
* modular monolith;
* HTTP API for the ERP modules;
* business rules organized by context.

The backend will run as a single application, while its modules will have clearly defined responsibilities. This keeps the system operationally simple without sacrificing an architecture that can evolve in the future.

### Frontend

* Next.js;
* React;
* TypeScript;
* Next.js will also be used as the BFF (Backend for Frontend).

The BFF handles interface-specific concerns such as user sessions, response composition, and communication with the Go API. The browser does not need direct knowledge of the backend's internal details.

## Multitenancy

The system is multitenant by company. Each company represents a tenant and has its own users, products, suppliers, purchases, sales, inventory movements, and financial data.

Every business operation must be associated with a company. The tenant must be identified and validated throughout the authentication and authorization flow, preventing users from accessing or modifying data belonging to another company.

In the initial model, the company will be the primary boundary for data isolation. The technical persistence strategy, such as a shared database with a `tenant_id` or separate databases, will be defined at a later stage.

## Access Control

There are only two access roles:

### `super_admin`

This role is intended for platform administration. It can view and manage global information, such as registered companies and the overall state of the platform.

This role does not represent an operational user within a company. Access to tenant data must be explicit and controlled.

### `admin`

This is the administrator of a company. It has granular permissions within its own tenant and can access the modules and operations authorized for that company.

The user's role and permissions must never allow access to another tenant.

## Planned Modules

* **Companies and Users:** registration of tenants and users associated with each company.

* **Authentication and RBAC:** login, sessions, roles, and granular permissions.

* **Products:** catalog, pricing, units, and commercial information.

* **Categories:** product organization.

* **Suppliers:** supplier registration and purchasing relationships.

* **Purchasing:** purchase orders and product receipts.

* **Sales:** sales operations and their associated items.

* **Inventory:** stock balances and movements resulting from purchases and sales.

* **Accounts Payable and Receivable:** the company's financial obligations and receivables.

* **Dashboard:** summarized indicators for monitoring business operations.

* **Audit:** records of important actions performed within the platform.

Each module should contain its own rules and expose only the contracts necessary for communication with other contexts.

## Repository Structure

```text
.
├── backend/       # Go API and business rules
├── frontend/      # Next.js application and BFF layer
├── docs/          # Architecture documentation and project decisions
└── infra/         # Infrastructure and runtime configuration
```

The internal organization of each application may evolve, but the separation between backend, frontend, documentation, and infrastructure should remain explicit.

## Simplified Flow

```text
User
  |
  v
Next.js Frontend + BFF
  |
  v
Go Modular Monolith API
  |
  v
ERP Business Contexts
```

The frontend authenticates the user and forwards operations through the BFF. The backend validates the user's identity, role, tenant, and permissions before executing any business rule.

## Initial Principles

* A company can only access its own data.
* Authentication identifies the user; authorization determines what the user can do.
* The backend is the final authority over permissions and tenant isolation.
* Relevant changes must generate audit records.
* Communication between modules should use clear contracts.
* The solution should remain simple while the domain is still being discovered.

## Status

The project is currently in the initial definition and structuring phase. The natural next steps are:

1. define the identity, company, user, and permission model;
2. choose the persistence layer and the definitive tenant isolation strategy;
3. create the modular monolith skeleton in Go;
4. implement authentication and the first operational flow;
5. evolve the documentation alongside architectural decisions.

## Documentation

* [Architecture Overview](docs/architecture/overview.md)
* [Bounded Contexts](docs/architecture/bounded-contexts.md)
