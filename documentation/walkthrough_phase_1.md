# Walkthrough: Phase 1 - Configuración Inicial

Se hacompletado la configuración de la infraestructura base del proyecto **Countries3**.

## Resumen de Cambios

### 1. Estructura Monorepo (Turborepo + pnpm)
Se ha creado un monorepositorio con la siguiente arquitectura:
*   `apps/backend`: API NestJS (Puerto 3001)
*   `apps/frontend`: Panel Next.js 15 + TailwindCSS (Puerto 3000)
*   `packages/shared`: Librería compartida para DTOs e interfaces.
*   `turbo.json`: Pipeline de construcción optimizado.

### 2. Dockerización (Full Stack)
Se ha creado el archivo `docker-compose.dev.yml` que orquesta:
*   **MongoDB**: Base de datos principal (Puerto 27017).
    *   *Script de Inicialización*: Crea automáticamente `world`, `auth_db` y `audit_db`.
*   **Backend**: Servicio NestJS en modo desarrollo (Hot Reload).
*   **Frontend**: Servicio Next.js en modo desarrollo (Hot Reload).

### 3. Gestión de Secretos y Git
*   `.gitignore`: Optimizado para Node, NestJS, Next.js y entornos locales.
*   `.env.example`: Plantilla con las cadenas de conexión a MongoDB.
*   **Git**: Repositorio inicializado en la raíz.

## Cómo Ejecutar el Entorno

Para levantar todo el ecosistema en modo desarrollo:

1.  **Copiar Variables de Entorno**:
    ```bash
    cp .env.example .env
    ```

2.  **Iniciar Docker Compose**:
    ```bash
    docker-compose -f docker-compose.dev.yml up --build
    ```

Esto iniciará:
*   Frontend en [http://localhost:3000](http://localhost:3000)
*   Backend en [http://localhost:3001](http://localhost:3001)
*   MongoDB en `localhost:27017`

## Verificación
*   Se ha verificado que `pnpm build` compila correctamente Backend, Frontend y Shared.
*   Se ha verificado que la instalación de dependencias está aislada (`pnpm install`).
