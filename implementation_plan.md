# Implementation Plan - Phase 7: Real Audit Module

This phase involves activating the `AuditInterceptor` (currently a placeholder) to write actual log entries into the `audit_db`.

## Goals
1.  Define `AuditLog` Schema in Mongoose (connected to `audit_db`).
2.  Implement `AuditService` to handle asynchronous log writing.
3.  Connect `AuditInterceptor` to `AuditService`.
4.  Verify logs are created on CRUD operations.

## Proposed Changes

### Backend (`apps/backend`)

#### [NEW] `src/audit/schemas/audit-log.schema.ts`
- Schema for `audit_logs`:
  - `userId`: string (required)
  - `action`: string (required)
  - `resource`: string (collection name)
  - `resourceId`: string (optional)
  - `details`: Object (payload/diff)
  - `timestamp`: Date (default: now)

#### [NEW] `src/audit/audit.service.ts`
- Method `log(userId, action, resource, resourceId, details)`
- Asynchronous execution (fire and forget) to not block response.

#### [NEW] `src/audit/audit.module.ts`
- Registers `AuditLog` schema with `audit_db` connection.
- Exports `AuditService`.

#### [MODIFY] `src/common/interceptors/audit.interceptor.ts`
- Inject `AuditService`.
- Capture:
  - User ID from `request.user`.
  - HTTP Method -> Action (POST=CREATE, PATCH=UPDATE, DELETE=DELETE).
  - URL -> Resource.
  - Body -> Details.

#### [MODIFY] `src/app.module.ts`
- Import `AuditModule`.

## Verification Plan
1.  **Action**: Perform a `PATCH /geography/areas/TEST_CHILD`.
2.  **Check**: Query `audit_logs` collection to confirm a generic entry `{ action: 'UPDATE', resource: 'geography/areas', ... }` exists.
