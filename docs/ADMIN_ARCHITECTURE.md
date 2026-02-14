# Admin Panel & Super Admin Architecture

This document describes the complete architecture for the Admin Panel and Super Admin Panel in NetFlow ISP Management Platform.

---

## 🏗️ Architecture Overview

NetFlow uses a **multi-tenant SaaS architecture** with clear role separation:

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUPER ADMIN PANEL                           │
│                  (SaaS Owner / System Owner)                    │
│                                                                 │
│  • Create/Manage ISPs                                           │
│  • Global Router View                                           │
│  • System-wide Analytics                                        │
│  • Subscription Management                                      │
│  • Feature Flags                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       ADMIN PANEL                               │
│                    (ISP Level Admin)                            │
│                                                                 │
│  • Manage Routers                                               │
│  • PPP Users Management                                         │
│  • Billing & Invoices                                           │
│  • Staff Management                                             │
│  • Organization Settings                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      USER DASHBOARD                             │
│                    (Basic Staff / Users)                        │
│                                                                 │
│  • View Routers (Read-only)                                     │
│  • View PPP Users                                               │
│  • Monitor Traffic                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Role Architecture

### Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| `super_admin` | 100 | System owner, full access to all tenants |
| `org_admin` | 50 | ISP administrator, manages one organization |
| `technician` | 30 | Technical staff, manages PPP and routers |
| `reseller` | 20 | Reseller, can create PPP users |
| `user` | 10 | Basic staff, read-only access |

### Role Permissions

#### 🟢 User (Basic Staff)
```typescript
permissions: [
  'routers:read',
  'ppp:read',
  'hotspot:read',
  'profiles:read'
]
```

#### 🟡 Technician
```typescript
permissions: [
  'routers:read',
  'routers:execute',
  'ppp:create', 'ppp:read', 'ppp:update', 'ppp:disconnect',
  'hotspot:read', 'hotspot:update',
  'users:read',
  'profiles:read',
  'analytics:read'
]
```

#### 🔵 Reseller
```typescript
permissions: [
  'routers:read',
  'ppp:read', 'ppp:create',
  'profiles:read',
  'billing:read',
  'invoices:read'
]
```

#### 🟠 Org Admin (ISP Admin)
```typescript
permissions: [
  'routers:*',        // Full router access
  'users:*',          // Manage staff users
  'ppp:*',            // Full PPP access
  'hotspot:*',        // Full hotspot access
  'profiles:*',       // Manage packages
  'billing:read', 'billing:update',
  'invoices:*',
  'analytics:read',
  'reports:*',
  'settings:*',
  'audit:read'
]
```

#### 🔴 Super Admin (System Owner)
```typescript
permissions: ['*']  // Full system access
```

---

## 📁 Folder Structure

```
frontend/app/
├── (admin)/                          # Admin Panel Route Group
│   ├── layout.tsx                    # Admin layout with blue/green theme
│   └── admin/
│       ├── dashboard/page.tsx        # ISP Admin Dashboard
│       ├── routers/page.tsx          # Router Management
│       ├── ppp/page.tsx              # PPP Users Management
│       ├── profiles/page.tsx         # Profile/Package Management
│       ├── hotspot/page.tsx          # Hotspot Management
│       ├── billing/page.tsx          # Billing & Invoices
│       ├── analytics/page.tsx        # Analytics
│       ├── reports/page.tsx          # Reports
│       ├── staff/page.tsx            # Staff Management
│       └── settings/page.tsx         # Organization Settings
│
├── (super-admin)/                    # Super Admin Route Group
│   ├── layout.tsx                    # Super Admin layout with red accent
│   └── super-admin/
│       ├── dashboard/page.tsx        # Global Dashboard
│       ├── isps/page.tsx             # ISP Management
│       ├── clusters/page.tsx         # Router Clusters
│       ├── routers/page.tsx          # Global Routers View
│       ├── subscriptions/page.tsx    # Subscription Plans
│       ├── analytics/page.tsx        # System Analytics
│       ├── billing/page.tsx          # Billing Engine
│       ├── presets/page.tsx          # Command Presets
│       ├── audit/page.tsx            # Audit Logs
│       ├── settings/page.tsx         # System Settings
│       └── flags/page.tsx            # Feature Flags
│
├── (dashboard)/                      # Regular User Dashboard
│   └── ...
│
├── unauthorized/page.tsx             # Access Denied Page
├── login/page.tsx                    # Login Page
└── register/page.tsx                 # Registration Page
```

---

## 🎨 Theme Differentiation

### Admin Panel (Blue/Green Theme)
```css
/* Primary Colors */
--admin-primary: blue-500;
--admin-secondary: emerald-500;

/* Sidebar */
background: gradient-to-b from-slate-900 to-slate-950;
border-right: border-slate-800;

/* Active State */
background: bg-blue-500/20;
text: text-blue-400;
border: border-blue-500/30;

/* Role Badge */
background: bg-emerald-500/10;
text: text-emerald-400;
```

### Super Admin Panel (Dark + Red Accent)
```css
/* Primary Colors */
--super-primary: red-500;
--super-secondary: orange-500;

/* Sidebar */
background: gradient-to-b from-slate-900 to-slate-950;
border-right: border-red-900/30;

/* Active State */
background: bg-red-500/20;
text: text-red-400;
border: border-red-500/30;

/* Role Badge */
background: bg-red-500/10;
text: text-red-400;
```

---

## 🛡️ Permission Middleware

### Backend Middleware

Located at: `backend/src/middleware/permissions.ts`

#### Usage Examples

```typescript
import { 
  requireAuth, 
  requireRole, 
  requirePermission,
  requireSuperAdmin,
  requireOrgAdmin 
} from './middleware/permissions.js';

// Require authentication
app.get('/api/profile', { preHandler: requireAuth }, handler);

// Require specific role
app.get('/api/admin/*', { preHandler: requireRole('org_admin') }, handler);

// Require specific permission
app.post('/api/routers', { preHandler: requirePermission('routers:create') }, handler);

// Require super admin
app.get('/api/super-admin/*', { preHandler: requireSuperAdmin }, handler);

// Require org admin
app.get('/api/admin/users', { preHandler: requireOrgAdmin }, handler);
```

### Frontend Permission Hook

Located at: `frontend/lib/hooks/usePermissions.ts`

#### Usage Examples

```tsx
import { usePermissions, useRequirePermission, useAdminAccess } from '@/lib/hooks/usePermissions';

function MyComponent() {
  const { 
    user, 
    hasPermission, 
    isSuperAdmin, 
    canAccessAdminPanel 
  } = usePermissions();

  if (!hasPermission('routers:create')) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>
      {isSuperAdmin && <SuperAdminFeatures />}
    </div>
  );
}

// Require permission in component
function RouterManagement() {
  const { hasPermission } = useRequirePermission('routers:read');
  
  return <RouterList />;
}

// Require admin access
function AdminPage() {
  const { user } = useAdminAccess();
  
  return <AdminDashboard user={user} />;
}
```

---

## 🏢 Multi-Tenant Database Design

### Key Tables

```sql
-- Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  router_limit INTEGER DEFAULT 10,
  user_limit INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users (with organization isolation)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Routers (with organization isolation)
CREATE TABLE routers (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  ip_address INET NOT NULL,
  status router_status NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PPP Secrets (with organization isolation via router)
CREATE TABLE ppp_secrets (
  id UUID PRIMARY KEY,
  router_id UUID REFERENCES routers(id),
  name VARCHAR(100) NOT NULL,
  status ppp_secret_status NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row-Level Security

Every query must include `organization_id` filter:

```typescript
// Correct: Filter by organization
const routers = await db.query.routers.findMany({
  where: and(
    eq(routers.organizationId, user.organizationId),
    eq(routers.status, 'online')
  ),
});

// Super admin: No filter needed
if (user.role === 'super_admin') {
  const allRouters = await db.query.routers.findMany();
}
```

---

## 🚀 Getting Started

### 1. Create Super Admin User

```typescript
// Run once to create super admin
await authService.register({
  email: 'admin@netflow.app',
  password: 'secure-password',
  firstName: 'Super',
  lastName: 'Admin',
  role: 'super_admin',
});
```

### 2. Create ISP Organization

```typescript
// Super admin creates ISP
const org = await db.insert(organizations).values({
  name: 'FastNet ISP',
  slug: 'fastnet',
  domain: 'fastnet.netflow.app',
  subscriptionPlan: 'enterprise',
  routerLimit: 50,
  userLimit: 5000,
});
```

### 3. Create ISP Admin

```typescript
// Create admin for the ISP
await authService.register({
  email: 'admin@fastnet.isp',
  password: 'secure-password',
  firstName: 'John',
  lastName: 'Doe',
  organizationId: org.id,
  role: 'org_admin',
});
```

---

## 📊 Dashboard Features

### Admin Dashboard (ISP Level)

- **Stats Cards**: Total Users, Active PPP, Offline Users, Revenue, Online Routers, Alerts
- **Live Traffic Chart**: Bandwidth usage over time
- **Router Health**: CPU/Memory monitoring per router
- **Recent Activity**: Latest system events
- **PPP Logins**: Last 10 user connections

### Super Admin Dashboard (System Level)

- **Global Stats**: Total ISPs, Total Routers, Active PPP (All tenants), System CPU, Monthly Revenue, Suspended Accounts
- **Global Traffic Chart**: Bandwidth across all ISPs
- **Revenue Overview**: Monthly recurring revenue
- **ISP Management**: List of all ISPs with status
- **System Resources**: Infrastructure health monitoring
- **System Events**: Platform-wide activity log

---

## 🔧 API Routes

### Admin Routes (Requires org_admin+)

```
GET    /api/admin/dashboard          # Admin dashboard stats
GET    /api/admin/routers            # List routers
POST   /api/admin/routers            # Create router
GET    /api/admin/routers/:id        # Get router
PUT    /api/admin/routers/:id        # Update router
DELETE /api/admin/routers/:id        # Delete router
GET    /api/admin/ppp                # List PPP users
POST   /api/admin/ppp                # Create PPP user
GET    /api/admin/users              # List staff users
POST   /api/admin/users              # Create staff user
GET    /api/admin/billing            # Billing overview
GET    /api/admin/analytics          # Analytics data
```

### Super Admin Routes (Requires super_admin)

```
GET    /api/super-admin/dashboard    # Global dashboard stats
GET    /api/super-admin/isps         # List all ISPs
POST   /api/super-admin/isps         # Create ISP
PUT    /api/super-admin/isps/:id     # Update ISP
DELETE /api/super-admin/isps/:id     # Delete ISP
PUT    /api/super-admin/isps/:id/suspend   # Suspend ISP
PUT    /api/super-admin/isps/:id/activate  # Activate ISP
GET    /api/super-admin/routers      # All routers globally
GET    /api/super-admin/subscriptions # Subscription plans
GET    /api/super-admin/audit        # System audit logs
GET    /api/super-admin/flags        # Feature flags
PUT    /api/super-admin/flags/:id    # Update feature flag
```

---

## 📝 Best Practices

### 1. Always Check Permissions on Backend

```typescript
// ❌ Wrong: Only frontend check
if (user.role === 'admin') {
  // Do something
}

// ✅ Correct: Backend middleware
app.post('/api/admin/routers', { 
  preHandler: [requireAuth, requirePermission('routers:create')] 
}, handler);
```

### 2. Use Route Groups for Layout Separation

```typescript
// (admin) route group for ISP admins
// (super-admin) route group for system owner
// Each has its own layout with different theme
```

### 3. Filter Data by Organization

```typescript
// Always filter queries by organization_id
const data = await db.query.routers.findMany({
  where: eq(routers.organizationId, user.organizationId),
});
```

### 4. Log All Admin Actions

```typescript
// Create audit log for every admin action
await auditService.log({
  organizationId: user.organizationId,
  userId: user.id,
  action: 'router.create',
  entityType: 'routers',
  entityId: router.id,
});
```

---

## 🔗 Related Files

- [`backend/src/middleware/permissions.ts`](../../backend/src/middleware/permissions.ts) - Backend permission middleware
- [`frontend/lib/auth/permissions.ts`](../../frontend/lib/auth/permissions.ts) - Frontend permission utilities
- [`frontend/lib/hooks/usePermissions.ts`](../../frontend/lib/hooks/usePermissions.ts) - React permission hooks
- [`frontend/components/auth/RoleBadge.tsx`](../../frontend/components/auth/RoleBadge.tsx) - Role badge component
- [`frontend/app/(admin)/layout.tsx`](../../frontend/app/(admin)/layout.tsx) - Admin panel layout
- [`frontend/app/(super-admin)/layout.tsx`](../../frontend/app/(super-admin)/layout.tsx) - Super admin panel layout

---

## 📚 Additional Resources

- [Multi-Tenant Architecture](./MULTI_TENANT.md)
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
