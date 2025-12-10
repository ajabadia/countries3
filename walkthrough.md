# Walkthrough: Inicio de Proyecto Countries3

Este documento detalla qué se ha construido y cómo ejecutar el entorno completo.

## 1. Arquitectura Desplegada

*   **Monorepositorio**: Gestionado con Turborepo y pnpm.
    *   `apps/backend`: NestJS (Puerto 3001).
    *   `apps/frontend`: Next.js 15 (Puerto 3000).
*   **Docker Full Stack**:
    *   `mongo`: MongoDB 8.0 (con db `world`, `auth_db` creada).
    *   `backend`: Node.js 20 Alpine.
    *   `frontend`: Node.js 20 Alpine.

## 2. Cómo Ejecutar

1.  **Requisitos**: Docker Desktop instalado y corriendo.
2.  **Comando de Arranque**:
    ```powershell
    docker-compose -f docker-compose.dev.yml up --build --force-recreate
    ```

## 3. Credenciales y Pruebas

Se ha creado un usuario administrador por defecto:

*   **URL Login**: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
*   **Usuario**: `admin`
*   **Contraseña**: `admin123`

### Flujo de Prueba
1.  Ingresa las credenciales.
2.  Deberías ser redirigido al `/dashboard`.
3.  Verás tu ID de usuario y nombre.

## 4. Notas Técnicas

*   Si modificas código en `apps/backend` o `apps/frontend`, los contenedores se recargarán automáticamente (Hot Reload).
*   Si instalas nuevas dependencias, recuerda regenerar los contenedores para que se instalen dentro de Linux.
