# Lecciones Aprendidas (Lessons Learned)

Este documento recopila problemas técnicos encontrados y sus soluciones para evitar tropezar con la misma piedra en el futuro.

## 1. Integración Mongoose y NestJS (Versiones 8+)

### El Problema
Al intentar implementar el módulo de Geografía, nos encontramos con múltiples fallos de arranque ("CrashLoopBackOff") y errores de compilación TypeScript.
*   **Error 1**: `Virtual path "_id" conflicts with a real path in the schema`.
*   **Error 2**: `Interface 'Area' incorrectly extends interface 'Document'`.
*   **Error 3**: `MODULE_NOT_FOUND` al intentar cargar `mongoose` en un entorno monorepo con pnpm.

### La Causa
1.  **Gestión de `_id`**: En versiones recientes de Mongoose (v8+), el campo `_id` tiene un alias automático a `id`. Definir explícitamente `@Prop({ alias: '_id' })` o intentar sobrescribir el tipo `_id` sin cuidado causa conflictos internos graves.
2.  **SchemaFactory vs. Raw Schemas**: El decorador `@Schema` y `SchemaFactory.createForClass` de NestJS son muy estrictos con los tipos. Al trabajar con una base de datos existente (`world`) donde los `_id` son **Strings** manuales (ej: "ES", "EN") en lugar de `ObjectId`, la herencia predeterminada de `mongoose.Document` rompe la compilación.
3.  **Dependencias en Monorepo**: `pnpm` es estricto. Si `mongoose` no está explícitamente listado en el `package.json` de la aplicación (`apps/backend`), aunque esté en el root o instalado por otra librería, Docker puede no encontrarlo, o encontrar una versión incorrecta ("Phantom Dependencies").

### La Solución (Best Practices para este proyecto)
1.  **Schemas Manuales para Datos Legacy**: Para colecciones importadas con estructuras no estándar (como IDs de texto), es más seguro y rápido definir el Schema usando **Raw Mongoose**:
    ```typescript
    export const AreaSchema = new mongoose.Schema({ ... }, { collection: 'areas' });
    ```
    En lugar de luchar con `SchemaFactory`.

2.  **Interfaces con `Omit`**: Si usamos TypeScript, debemos ocultar el `_id` original de Mongoose para redefinirlo:
    ```typescript
    export interface Area extends Omit<mongoose.Document, '_id'> {
      _id: string; // Nuestro ID personalizado
      // ...
    }
    ```

3.  **Evitar Alias Redundantes**: Nunca usar `alias: '_id'` en la definición del campo. Mongoose ya lo maneja.

4.  **Instalación Explícita**: Asegurarse siempre de que `mongoose` y `@nestjs/mongoose` tengan versiones compatibles en el `package.json` del sub-proyecto y hacer un rebuild completo del contenedor (`docker compose up --build --force-recreate`) ante dudas de versiones "fantasmas".

## 2. Docker y Windows (File Locking)

### El Problema
Errores `EACCES: permission denied` al intentar `pnpm install` o borrar `node_modules`.

### La Solución
Windows bloquea archivos usados por contenedores Docker.
*   **Paso 1**: Parar el contenedor (`docker stop`).
*   **Paso 2**: Operar en el host (install/borrar).
*   **Paso 3**: Reiniciar contenedor.
*   **Alternativa Nuclear**: Usar un contenedor efímero para borrar archivos:
    ```bash
    docker run --rm -v ".:/app" alpine rm -rf /app/node_modules
    ```

## 3. Consultas en Datos Híbridos (Mongoose Filters)

### El Problema
Al añadir un campo nuevo al Schema (ej: `active: Boolean`) con un valor por defecto, las consultas que filtran por ese campo (`find({ active: true })`) **no devuelven** los documentos antiguos que aún no tienen ese campo (se importaron de Atlas sin él).

### La Solución
En lugar de filtrar por igualdad estricta, usar condiciones negativas para incluir los documentos donde el campo falta:
*   **Incorrecto**: `find({ active: true })` (Solo devuelve los nuevos).
*   **Correcto**: `find({ active: { $ne: false } })` (Devuelve true y undefined).

---

## 6. React Hydration Errors Caused by Browser Extensions

**Fecha:** 2025-12-10  
**Contexto:** User Management Module - Click events not working in frontend

### Problema
Todos los eventos de click (botones de editar, eliminar, guardar) no funcionaban en el frontend. La consola mostraba errores de hidratación de React:
```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

El error indicaba diferencias en atributos como:
- `className` del `<body>` (fuentes Geist)
- `data-jetski-tab-id` en `<html>` (extensión del navegador)

### Causa Raíz
React no puede manejar eventos correctamente cuando hay un **mismatch de hidratación** entre el HTML renderizado por el servidor y el que React espera en el cliente. Esto puede ser causado por:

1. **Fuentes dinámicas**: Variables de fuentes (Geist) que generan diferentes classNames
2. **Extensiones del navegador**: Extensiones que inyectan atributos en el HTML (ej: gestores de pestañas)
3. **Datos dinámicos**: `Date.now()`, `Math.random()`, etc.

### Solución
**Opción 1: Suprimir warnings (temporal)**
```tsx
<html lang="en" suppressHydrationWarning>
  <body className="antialiased" suppressHydrationWarning>
    {children}
  </body>
</html>
```

**Opción 2: Eliminar fuentes problemáticas**
Remover importaciones de fuentes que causan className dinámicos:
```tsx
// Antes
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

// Después
// (eliminado completamente)
```

**Opción 3: Usar navegador sin extensiones**
- Modo incógnito/privado
- Navegador dedicado para desarrollo (ej: Comet)
- Desactivar extensiones de gestión de pestañas

### Lecciones
1. **Los errores de hidratación bloquean TODOS los eventos**: No solo causan warnings, impiden que React maneje clicks, inputs, etc.
2. **Las extensiones del navegador pueden romper React**: Extensiones que modifican el DOM causan hydration mismatches.
3. **`suppressHydrationWarning` es un parche, no una solución**: Solo oculta el warning, no arregla la causa raíz.
4. **Usar navegador limpio para desarrollo**: Modo incógnito o navegador dedicado sin extensiones.
5. **Verificar en múltiples navegadores**: Si algo no funciona en un navegador, probar en otro antes de asumir que es un bug del código.

### Archivos Afectados
- `apps/frontend/app/layout.tsx`
- Todos los componentes con eventos de click

### Debugging
Para diagnosticar errores de hidratación:
1. Abrir DevTools (F12) → Console
2. Buscar mensajes de "hydration mismatch"
3. El error muestra qué atributo difiere (ej: `className`, `data-*`)
4. Probar en modo incógnito para descartar extensiones
5. Usar `suppressHydrationWarning` temporalmente para identificar si es el problema

---

## 5. NestJS ValidationPipe Requiere Decoradores en DTOs

**Fecha:** 2025-12-10  
**Contexto:** User Management Module - Creación de usuarios desde frontend

### Problema
Al intentar crear usuarios desde el frontend, el backend devolvía `500 Internal Server Error`. Los logs mostraban que el DTO llegaba vacío `{}` al servicio, aunque el frontend enviaba los datos correctamente.

### Causa Raíz
Los DTOs (`CreateUserDto`, `UpdateUserDto`) no tenían decoradores de `class-validator`. El `ValidationPipe` configurado con `transform: true` **requiere** decoradores para:
1. Transformar el JSON plano en una instancia de clase
2. Validar los tipos y formatos de datos
3. Aplicar `whitelist: true` para filtrar propiedades no deseadas

Sin decoradores, el pipe no puede transformar el payload y el DTO llega vacío.

### Solución
Agregar decoradores de `class-validator` a todos los DTOs:

```typescript
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
```

### Lecciones
1. **ValidationPipe + transform = decoradores obligatorios**: Si usas `ValidationPipe` con `transform: true`, TODOS los DTOs deben tener decoradores.
2. **Campos opcionales**: Usa `@IsOptional()` para campos que pueden ser `undefined`.
3. **Debugging**: Si el DTO llega vacío, verifica que tenga decoradores de validación.
4. **Instalación**: Asegúrate de tener `class-validator` y `class-transformer` instalados.

### Archivos Afectados
- `apps/backend/src/users/dto/create-user.dto.ts`
- `apps/backend/src/users/dto/update-user.dto.ts`
- `apps/backend/src/main.ts` (configuración del ValidationPipe)
**Regla de Oro**: Ante un error persistente de tipos o arranque en Mongoose/NestJS, **simplificar**. Volver a un Schema básico de Mongoose JS puro suele aislar el problema más rápido que depurar las abstracciones de NestJS.

## Backend Monorepo & Runtime
- **Problem**: `MODULE_NOT_FOUND` error when using path aliases (e.g. `@countries3/shared`) in NestJS backend, even if `tsconfig.json` has `paths` configured.
- **Root Cause**: `tsc` compiles to JavaScript but does not rewrite paths. Use of `tsc-watch` or standard node runtime does not resolve aliases without `tsconfig-paths` registration or a build process that handles it (like Webpack).
- **Solution**: For rapid development/verification in this environment, using **Relative Imports** or creating **Local Copies** of DTOs/Interfaces in the backend source is the most reliable fix.
- **PowerShell**: Syntax `&&` is not valid for chaining commands. Use `;` or separate lines.

## 4. Módulos Nativos en Docker (bcrypt y Alpine Linux)

### El Problema
Al implementar el módulo de User Management, el backend crasheaba con `fetch failed` / `connection reset` cada vez que se intentaba crear un usuario. Los logs mostraban que el proceso Node.js terminaba abruptamente sin stack trace visible.

**Síntomas:**
- El endpoint `POST /users` devolvía 500 Internal Server Error
- El contenedor backend se reiniciaba automáticamente
- Los scripts de prueba (`node scripts/test_create_editor.js`) fallaban con `TypeError: fetch failed`
- No había errores de compilación TypeScript

### La Causa Raíz
El módulo `bcrypt` es un **módulo nativo de Node.js** que requiere compilación con `node-gyp` durante la instalación. Los binarios compilados son específicos para:
1. **Sistema Operativo** (Windows vs Linux)
2. **Arquitectura** (x64, ARM, etc.)
3. **Versión de Node.js**
4. **Distribución de Linux** (glibc vs musl)

**En este proyecto:**
- El `pnpm install` se ejecuta en el **host Windows**
- Los binarios de `bcrypt` se compilan para Windows
- El contenedor usa **Alpine Linux** (`node:20-alpine`) que usa `musl` en lugar de `glibc`
- Los binarios de Windows son incompatibles con Alpine Linux
- Cuando `bcrypt.hash()` se ejecuta, el proceso Node.js crashea silenciosamente

**Agravante del Monorepo:**
El `docker-compose.dev.yml` monta el directorio completo (`.:/app`) incluyendo `node_modules`, lo que significa que los binarios de Windows se copian directamente al contenedor, sobrescribiendo cualquier instalación que Docker pudiera hacer.

### Soluciones Implementadas y Alternativas

#### Solución Temporal (Implementada)
Stub de bcrypt para permitir verificación de la lógica del módulo:
```typescript
// En users.service.ts
const passwordHash = `hashed_${createUserDto.password}`;

// En auth.service.ts - CRÍTICO: También stubear la validación
const isValid = user.passwordHash === `hashed_${pass}`;
```
**Pros:** Permite verificar toda la lógica de negocio, UI, validación, etc.
**Contras:** No es seguro para producción, las contraseñas no están realmente hasheadas.

> [!IMPORTANT]
> **Debes stubear AMBOS lados**: Si stubeas `bcrypt.hash()` en `UsersService.create()`, también DEBES stubear `bcrypt.compare()` en `AuthService.validateUser()`. De lo contrario, el login fallará porque la comparación también crasheará el proceso Node.js.

#### Solución 1: Cambiar a Imagen Debian
Modificar `docker-compose.dev.yml`:
```yaml
backend:
  image: node:20  # En lugar de node:20-alpine
```
**Pros:** Debian usa `glibc`, compatible con la mayoría de módulos nativos.
**Contras:** Imagen más pesada (~900MB vs ~150MB).

#### Solución 2: Volúmenes Anónimos para node_modules
Modificar `docker-compose.dev.yml`:
```yaml
backend:
  volumes:
    - .:/app
    - /app/node_modules  # Volumen anónimo
    - /app/apps/backend/node_modules  # Si hay node_modules anidados
```
**Pros:** Fuerza la instalación dentro del contenedor con binarios correctos.
**Contras:** Requiere rebuild completo cuando cambian dependencias.

#### Solución 3: Usar bcryptjs (Recomendado para este proyecto)
Reemplazar `bcrypt` por `bcryptjs` en `package.json`:
```bash
pnpm remove bcrypt
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```
Actualizar imports:
```typescript
import * as bcrypt from 'bcryptjs';
```
**Pros:** 
- Implementación JavaScript pura, sin compilación nativa
- Funciona en cualquier plataforma
- API idéntica a `bcrypt`
**Contras:** 
- ~30% más lento (irrelevante para la mayoría de casos)

### Lección Aprendida
**Regla de Oro para Monorepos con Docker:**
1. **Evitar Alpine Linux** si el proyecto usa módulos nativos (bcrypt, sharp, sqlite3, etc.)
2. **Usar volúmenes anónimos** para `node_modules` cuando se monta el código fuente
3. **Preferir alternativas JavaScript puras** cuando estén disponibles y el rendimiento no sea crítico
4. **Documentar dependencias nativas** en el README para que otros desarrolladores sepan qué esperar

**Debugging Tip:**
Si un contenedor Node.js crashea sin stack trace al llamar a una función específica, sospechar de módulos nativos. Verificar con:
```bash
docker exec -it <container> ldd /app/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node
```

