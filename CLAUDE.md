# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (swift-nginx/portal-ui/)
```sh
npm run dev          # Start Vite dev server on port 5173, proxying /api → localhost:8080
npm run build        # Typecheck + Vite build (outputs to ../html/swift-portal)
npm run test         # Run Vitest tests once
npm run test:watch   # Vitest watch mode
npm run typecheck    # vue-tsc --noEmit
npm run preview      # Vite preview on port 4173
```

### Backend (swift/)
```sh
mvn clean install    # Build all Maven modules (Java 11)
```
Run individual services via their `*Application.java` main class in IDE or `java -jar target/*.jar`. Each service needs Nacos running at `192.168.121.128:8848`.

### Run a single frontend test
```sh
npm test -- src/utils/id.test.ts
```

## Architecture

### Project Layout
```
swiftshop-v2.0/
├── swift/                          # Java backend — Spring Boot + Cloud microservices
│   ├── pom.xml                     # Parent POM (multi-module Maven)
│   ├── swift-common/               # Shared library (R<T>, exceptions, utils, interceptors)
│   ├── swift-api/                  # Feign client contracts for inter-service calls
│   ├── swift-gateway/              # Spring Cloud Gateway (port 8080, JWT auth filter)
│   ├── swift-service/              # Consolidated monolith service (legacy)
│   ├── user-service/               # User registration, login, addresses
│   ├── item-service/               # Product CRUD + search (Elasticsearch indexes)
│   ├── cart-service/               # Shopping cart
│   ├── trade-service/              # Order management + RabbitMQ listeners
│   └── pay-service/                # Payment processing (balance-only currently)
└── swift-nginx/                    # Frontend + reverse proxy
    ├── conf/nginx.conf             # Nginx: 3 server blocks (portal:18080, admin:18081, refresh-admin:18082)
    ├── portal-ui/                  # Vue 3 + TypeScript + Vite 6 SPA
    │   └── src/
    │       ├── types/              # All TS interfaces (Item, CartItem, Order, SearchParams, etc.) + ApiError class
    │       ├── services/           # Axios API client layer (api.ts + domain modules)
    │       ├── stores/             # Pinia stores (auth, cart, catalog, checkout, payment)
    │       ├── views/              # 11 page components (Entry, Home, Search, Product, Login, Cart, Checkout, Pay, PaymentResult, NotFound)
    │       ├── components/         # Reusable UI components (ConfirmDialog, EmptyState, ProductCard, QuantityStepper, SiteHeader, SiteFooter, ToastStack)
    │       ├── composables/        # useNotice composable
    │       ├── router/             # Vue Router with auth guard, legacy .html redirects
    │       ├── utils/              # id, money, search, session, spec utils (with tests)
    │       └── styles/             # Global CSS variables and base styles
    └── html/                       # Built assets + admin panels
        ├── swift-portal/           # Built portal SPA output
        ├── swift-admin/            # Vue 2 + Element UI admin (static HTML/JS)
        └── swift-refresh-admin/    # Vue 2 + Element UI refresh admin with ECharts
```

### Backend Architecture

**Stack:** Java 11, Spring Boot 2.7.12, Spring Cloud 2021.0.3, Spring Cloud Alibaba 2021.0.4.0, MyBatis-Plus 3.4.3, MySQL 8.0, Nacos, RabbitMQ, Seata, Elasticsearch 7.12.1

**Service communication:** Each service registers with Nacos. Inter-service calls use Spring Cloud OpenFeign with `swift-api` defining client contracts. Feign requests automatically forward the `user-info` header via a request interceptor in `DefaultFeignConfig`.

**Auth flow:** Gateway (`MyGlobalFilter`) validates JWT (RSA keystore) on every request except excluded paths. Downstream services read `user-info` header via `UserInfoInterceptor` in `MvcConfig`, stored in `UserContext` (ThreadLocal). JWT claims are handled in `JwtTool` classes — each service that needs token parsing has its own (gateway + per-service).

**API response pattern:** All controllers return `R<T>` wrapper or domain DTOs directly. Global `CommonExceptionAdvice` catches exceptions and maps them to `R.error()` with appropriate HTTP status codes. Exception hierarchy: `CommonException` → `BadRequestException`, `DbException`, `ForbiddenException`, `UnauthorizedException`, `BizIllegalException`.

**Pagination:** `PageQuery` extends MyBatis-Plus `Page`, `PageDTO` wraps results with total/pages/list. Frontend has matching `PageResult<T>` type.

**Distributed transactions:** Seata handles cross-service tx (order → inventory → cart cleanup). MQ async events: order timeout (delayed messages in trade-service), payment status updates, cart cleanup on order creation.

**Configuration strategy:** Each service has a local `application.yaml` + shared configs pulled from Nacos via `bootstrap.yaml` (shared-jdbc, shared-log, shared-swagger, shared-seata, shared-mq). Active profile defaults to `dev`.

### Frontend Architecture

**ID handling:** Java `Long` IDs are sent as JSON numbers but `json-bigint` in the Axios transform layer converts them to strings to avoid precision loss. The `id.ts` utility normalizes IDs.

**Money:** Stored as integer cents on the frontend. `formatCents()` in `money.ts` formats display values. The backend sends prices as integers (cents).

**Routing:** Vue Router with lazy-loaded views. Auth guard redirects unauthenticated users to login with return-url tracking. Legacy `.html` routes (e.g., `/search.html`, `/cart.html`) redirect to new SPA routes.

**State management:** Pinia stores with a consistent pattern — async `load()` actions, loading/error/mutating state flags, optimistic UI updates for cart mutations. `cart` store is the most complex, with selected-item tracking and bulk operations.

**API layer:** Axios client configured with base `/api` prefix, `json-bigint` response transform, token injection via request interceptor, and 401 response handler that clears session and redirects.

**Styling:** Scoped CSS with CSS custom properties (—color-ink, —color-muted, —color-border, —color-surface, —color-white, —color-success, —color-accent, —color-disabled, --color-error). BEM-like class naming. No CSS framework dependency.

### Nginx

Three server blocks: portal (18080, SPA with `try_files` fallback), admin (18081, static), refresh-admin (18082, static). All proxy `/api` → `localhost:8080` with CORS headers and URL rewrite stripping `/api` prefix.

## Key Patterns

- **DTO/PO separation** — persistence objects (`po/`) vs data transfer objects (`dto/`) mapped via `BeanUtils.copyBean()`
- **Service interface + impl** — `I*Service` interface + `*ServiceImpl` implementation
- **Mapper layer** — MyBatis-Plus Mappers for DB access
- **Feign + Fallback** — inter-service calls with circuit breaker pattern (`*ClientFallbackFactory`)
- **Enum-driven state** — e.g., `UserStatus`, `PayStatus`, `PayType` with `@EnumValue` for MyBatis-Plus
- **Global interceptors** — `UserInfoInterceptor` in common module, gateway-level auth via `MyGlobalFilter`
- **Ponytail mode** — prefer the minimal solution, avoid over-engineering, YAGNI
