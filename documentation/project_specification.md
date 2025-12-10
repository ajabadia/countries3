# Especificación del Proyecto: Plataforma Central de Datos e Identidad

## 1. Visión del Proyecto
Crear un ecosistema centralizado de **Gestión de Datos Maestros (MDM)** y **Gestión de Identidad (IAM)**.
Esta aplicación NO se limita a países/idiomas. Su propósito es ser el **Panel de Administración Unificado** para múltiples dominios de datos (Países, Legal, Usuarios, etc.) que alimentarán a diversas aplicaciones satélite (Visualizadores, Apps móviles, Webs corporativas).

> **Enfoque**: "Single Source of Truth" (Fuente única de la verdad) para datos y usuarios.

## 2. Filosofía y Estándares (Norma General)

*   **Extensibilidad**: El sistema debe estar preparado para añadir nuevos "Módulos de Negocio" (ej: Información Legal) sin refactorizar el núcleo.
*   **DRY & Modularización**: (Igual que antes...)
*   **Separación de Responsabilidades**: (Igual que antes...)
*   **Estilos**: BEM.

## 3. Arquitectura de Datos (Multi-DB y Escalable)
El sistema gestionará múltiples bases de datos para aislar contextos:

1.  **Auth DB (`auth_db`)**: **NÚCLEO ESTRATÉGICO**. Identidad compartida por TODOS los proyectos de la organización.
2.  **Audit DB (`audit_db`)**: Trazabilidad transversal.
3.  **World DB (`world`)**: Dominio Geográfico inicial.
4.  **Legal DB (`legal_db`)**: (Futuro) Datos legales/normativos.
5.  **...Otros**: El sistema aceptará nuevas conexiones dinámicas.

---

## 4. Estrategia de Identidad (IAM) - "El Proyecto Auth"

**Pregunta Clave**: ¿Cómo compartir usuarios entre esta App y futuros proyectos?
**Respuesta**: Implementando el patrón **Identity Provider (IdP)**.

### Diseño del "Servicio de Autenticación"
La gestión de usuarios (Login, Registro, Reset Password, Perfil) NO debe ser un módulo acoplado a la lógica de "Países". Debe tratarse como un **Sub-Proyecto Independiente** (o Microservicio) dentro del repositorio.

*   **API Pública de Auth**: Expondrá endpoints estándar (`/auth/login`, `/auth/me`, `/auth/reset-password`) que consumirán TANTO esta aplicación de mantenimiento COMO la futura aplicación de visualización.
*   **Reutilización**: Al centralizar la lógica en un servicio, cualquier nueva app solo necesita "conectares" a este servicio para tener autenticación resuelta.
*   **Base de Datos Única**: `auth_db` es la única que contiene credenciales. Ninguna otra app debe duplicar tablas de usuarios.

---

## 5. Propuesta Tecnológica (Stack "Premium")
(Se mantiene NestJS + Next.js...)

## 6. Alcance Funcional Ampliado

### Módulo 1: Identidad y Accesos (IAM Core)
*   **Servicio de Autenticación Central**: (Login, JWT, Refresh Tokens).
*   **Gestión de Cuentas**: "Mi Perfil", Cambio de Password, Recuperación.
*    **Admin de Usuarios**: CRUD completo para administradores.

### Módulo 2: Dominios de Negocio (MDM)
Diseñado para crecer. Inicialmente incluye:

*   **Sub-Módulo: Geografía (`world`)**:
    *   Gestor de Árbol, Países, Idiomas.
*   **Sub-Módulo: Legal** (Futuro, pero preparado):
    *   Gestión de normativas, textos legales por país.

### Módulo 3: Auditoría Transversal
*   Cualquier cambio en **Cualquier Módulo** (Auth, World, Legal) escribe en `audit_db`.


---

## 5. Reglas de Negocio Críticas (Migradas)
*   **Integridad Referencial Lógica**: El Backend debe validar manualmente que un `userId` exista en `auth_db` antes de guardar referencias.
*   **Inmutabilidad de Logs**: Prohibido editar/borrar logs desde la API.
*   **Jerarquía**: Mantener siempre coherente el array `ancestors` al mover nodos.

## 6. Siguientes Pasos
1.  Inicializar repositorio (Monorepo o Repos separados).
2.  Configurar conexión a las 3 BBDD en NestJS.
3.  Implementar Auth Module.
