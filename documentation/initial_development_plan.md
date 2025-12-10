# Plan de Desarrollo Inicial - Countries3

Este documento define la hoja de ruta para la **Fase 1** del proyecto, centrada en establecer los cimientos de la arquitectura multi-base de datos y el sistema de identidad centralizado.

## Objetivo de la Fase Inicial
Disponer de un **Monorepositorio** funcional con Backend (NestJS) y Frontend (Next.js) conectados, capaz de autenticar usuarios contra `auth_db` y listo para escalar a los dominios de negocio.

---

## Fases de Implementación

### Fase 1: Configuración del Entorno y Monorepo
**Objetivo**: Infraestructura base, Dockerización completa y aislamiento.

1.  **Inicialización del Monorepo**:
    *   Herramienta: `Turborepo` + `pnpm` (para gestión eficiente de dependencias y workspaces).
    *   **Aislamiento de Entorno**: Se usará `pnpm` para garantizar que todas las dependencias sean locales al proyecto. No se requerirán paquetes globales. Los scripts de mantenimiento se ejecutarán vía `npm scripts` o dentro de contenedores.
    *   Estructura:
        *   `apps/backend`: NestJS (API Principal).
        *   `apps/frontend`: Next.js (Panel de Control).
        *   `packages/shared`: Tipos e interfaces compartidas (DTOs).
2.  **Infraestructura Docker (Full Stack)**:
    *   `docker-compose.dev.yml`: Entorno de desarrollo con Hot Reload.
        *   MongoDB (con script de init para las 3 DBs).
        *   Backend (Volúmenes para código fuente).
        *   Frontend (Volúmenes para código fuente).
    *   `docker-compose.prod.yml`: Simulación de producción.
        *   Builds optimizados (Multi-stage builds).
    *   **Scripts de Utilidad**:
        *   Se crearán scripts en `package.json` para levantar entornos aislados sin necesidad de instalar nada más que Docker y Node.js en el host.

### Fase 2: Backend Core (NestJS) - "The Multi-DB Engine"
**Objetivo**: Conectar a múltiples BBDD y configurar la arquitectura base.

1.  **Módulo de Configuración**: Tipado estricto de variables de entorno (Joi/Zod).
2.  **Database Module (Provider Factory)**:
    *   Implementar `mongoose.createConnection` para las 3 bases de datos.
    *   Inyección de dependencias para `ConnectionWorld`, `ConnectionAuth`, `ConnectionAudit`.
3.  **Logging Interceptor**: Middleware que intercepte requests y prepare el terreno para `audit_db`.

### Fase 3: Identidad (IAM) - V1
**Objetivo**: Registro y Login funcional.

1.  **Auth Module (Backend)**:
    *   Definición del Schema `User` (en `auth_db`).
    *   Implementación de **Passport + JWT**.
    *   Endpoints:
        *   `POST /auth/register` (Inicialmente abierto para crear el primer admin).
        *   `POST /auth/login`.
        *   `GET /auth/me` (Validación de Token).
2.  **Seguridad**: Hash de contraseñas con `bcrypt`.

### Fase 4: Frontend Foundation (Next.js)
**Objetivo**: UI Base y autenticación cliente.

1.  **Setup de UI**: Configuración de TailwindCSS (si aplica) o CSS Modules + BEM (según especificación).
2.  **Estructura de Layouts**: Layout protegido vs Layout público.
3.  **Integración de Auth**:
    *   Formulario de Login.
    *   Manejo de Sesión (Guardar JWT, redirección).
4.  **Dashboard "Shell"**: Página principal vacía accesible solo tras login.

---

## Estrategia de Calidad y Pruebas (Nuevo)
Se preparará el terreno para **Pruebas Integradas** desde el día 1.

1.  **Backend E2E (Integración)**:
    *   Configuración de `jest-e2e.json` en NestJS.
    *   **Diferencial**: Se configurará un entorno de test que levante un contenedor de MongoDB efímero (o use una base de datos de test limpia) para ejecutar pruebas reales contra la BBDD, no solo mocks.
2.  **Calidad Codebase**:
    *   ESLint + Prettier configurados estrictamente en el root del monorepo.
    *   Husky (Git Hooks): Para correr linter antes de cada commit.

## Siguientes Pasos (Iteración 2)
Una vez completada esta fase, se procederá con:
*   **Fase 5**: Módulo de Geografía (CRUD de Árbol de Países).
*   **Fase 6**: Implementación real de Auditoría (`audit_db`).

## Notas Técnicas
*   **TypeScript Estricto**: Se aplicará `strict: true` en todo el proyecto.
*   **Aislamiento**: Todo comando debe ser ejecutable con `pnpm run <comando>`.
*   **Documentación Viva**: Se actualizarán los mds en `/documentation` si la arquitectura evoluciona.
