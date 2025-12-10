# Guía de Mantenimiento de Datos (Arquitectura Multi-Base de Datos)

Este documento define las reglas para mantener la consistencia en una arquitectura distribuida donde **Countries**, **Auth** y **Logs** residen en bases de datos (o proyectos) separados.

## 0. Arquitectura de Datos
*   **DB `world`** (antes `countries_db`): Colecciones `areas`, `languages`.
*   **DB `auth_db`**: Colección `users`. (Servicio Compartido)
*   **DB `audit_db`**: Colección `audit_logs`. (Servicio Centralizado)

> **Nota**: Al estar en bases de datos separadas, **no existe integridad referencial** a nivel de motor. Las relaciones son puramente lógicas (strings almacenados).

---

## 1. DB `countries_db` - Colección `areas`

Usamos el patrón **Materialized Paths** mediante el campo `hierarchy.ancestors`.

### A. Crear una Nueva Área
*   **Input**: `parent` (ID del padre directo).
*   **Lógica**:
    1.  Si `parent` es nulo (ej: Mundo), `ancestors = []`.
    2.  Si `parent` tiene valor:
        *   Buscar el documento del padre.
        *   `ancestors` = `padre.hierarchy.ancestors` + `[parent._id]`.
    3.  Guardar el nuevo documento.

### B. Mover un Área (Cambiar de Padre)
Esta es la operación más crítica.
*   **Input**: Nuevo `parent`.
*   **Lógica**:
    1.  Calcular los **nuevos ancestros** del área (igual que al crear).
    2.  Actualizar el área con el nuevo `parent` y los nuevos `ancestors`.
    3.  **CASCADE UPDATE (Recursivo)**: Debemos actualizar **todos los descendientes** de esta área.
        *   Buscar todas las áreas que contengan el ID de esta área en sus `ancestors`.
        *   Para cada descendiente, recalcular su array `ancestors` basándose en la nueva ruta.
        *   *Nota*: En MongoDB se puede hacer eficiente con updates masivos o cursores si la jerarquía no es muy profunda.

### C. Eliminar un Área
**Política General: SOFT DELETE (Preferido)**.
Salvo que se trate de un error de creación inmediato, se prefiere marcar `active: false` en lugar de borrar físicamente.

*   **Validación**: Verificar si tiene hijos activos.
    *   Si tiene hijos activos: **Bloquear acción** (No se puede desactivar/borrar un área que contiene sub-áreas activas).
*   **Acción**:
    *   Setear `active: false`.
    *   (Opcional) Hard Delete solo permitido si no tiene hijos y no tiene referencias históricas.

---

## 2. Relación `areas` <-> `languages`

Usamos **Referenciado (Array de IDs)** en `areas.data.languages`.

### A. Asignar Idioma a País
*   **Validación**: Antes de añadir un ID al array `data.languages`, consultar la colección `languages` para asegurar que el idioma existe y `active: true`.

### B. Borrar un Idioma (Colección `languages`)
**Política General: SOFT DELETE (Obligatorio)**.
Dado que los idiomas son referenciados por múltiples países, el borrado físico está desaconsejado.

*   **Acción**:
    *   Setear `active: false`.
    *   Esto mantiene la integridad en los países que lo tienen asignado (histórico), pero impide nuevas asignaciones (filtrando por `active: true` en los selectores del UI).

---

## 3. Resumen de Campos Computados

| Colección | Campo | Dependencia | Cuándo Recalcular |
| :--- | :--- | :--- | :--- |
| `areas` | `data.languages` | `languages._id` | Al asignar idioma (verificar existencia). Al borrar idioma (limpiar referencias). |

---

## 4. Colección `users` (Usuarios)

### A. Gestión de Identidad
*   **Unicidad**: El campo `username` (y/o `email`) debe ser único. Se debe crear un índice `unique: true` en MongoDB.
*   **Seguridad**:
    *   **Contraseñas**: NUNCA guardar en texto plano. Usar **BCrypt** (cost >= 10) para el hash.
    *   **Salt**: Generar un salt único por usuario (gestión automática por BCrypt).

### B. Eliminación de Usuario
**Política General: SOFT DELETE (Obligatorio)**.
Un usuario nunca debe ser borrado físicamente para mantener la integridad de los `audit_logs`.

*   **Acción**:
    *   Setear `active: false`.
    *   La autenticación debe rechazar el login si `active` es false.
    *   Si se intenta "re-crear" un usuario con el mismo username, se puede reactivar el anterior o requerir un nuevo username, dependiendo de la política de seguridad.

---

## 5. Colección `audit_logs` (Auditoría)

### A. Inmutabilidad
*   **Regla de Oro**: Los logs son **Solo Escritura (Append-Only)**.
*   **Acción**: La aplicación NO debe exponer endpoints para editar (`PUT`) o borrar (`DELETE`) logs individuales.

### B. Creación de Log
*   **Trigger**: Cualquier acción de escritura (Create, Update, Delete/SoftDelete) en `areas`, `languages` o `users`.
*   **Datos Mínimos**:
    *   `userId`: ID del usuario que ejecutó la acción (siempre string).
    *   `action`: Verbo descriptivo (ej: `CREATE_AREA`, `UPDATE_COUNTRY_LANGS`).
    *   `timestamp`: Fecha ISO de la acción.
    *   `details`: Objeto JSON con el diff o el resumen del cambio.

### C. Retención y Limpieza
*   **Política**: Definir un periodo de retención (ej: 1 a 5 años según normativa).
*   **Mecanismo**:
    *   Usar índices **TTL (Time-To-Live)** de MongoDB sobre el campo `timestamp` para borrado automático tras el periodo definido.
    *   O implementar un job programado para archivado en frío (Cold Storage) antes del borrado.

---

## 6. Resumen de Índices Recomendados

| Colección | Campo(s) | Tipo | Propósito |
| :--- | :--- | :--- | :--- |
| `areas` | `type` | Normal | Filtro rápido por tipo (País vs Continente). |
| `areas` | `hierarchy.parent` | Normal | Buscar hijos directos. |
| `areas` | `hierarchy.ancestors` | Multikey | Buscar todos los descendientes (Árbol). |
| `areas` | `data.languages` | Multikey | Buscar países por idioma. |
| `users` | `username` | Unique | Evitar duplicados. |
| `audit_logs` | `userId` | Normal | Historial por usuario. |
| `audit_logs` | `timestamp` | Normal/TTL | Orden cronológico y retención. |

---

## 7. Referencia de Esquemas (TypeScript / Mongoose)

Esta sección sirve de guía para crear los modelos en el nuevo Backend.

### A. DB: `world`

**Collection: `areas`**
```typescript
interface IArea {
  _id: string; // M49 Code (o string numérico para países)
  type: 'WORLD' | 'CONTINENT' | 'REGION' | 'COUNTRY';
  name: string; // Nombre por defecto (en)
  parent: string | null; // ID del nodo padre
  
  // Jerarquía Materializada
  hierarchy: {
    parent: string | null;     // Redundante con raíz, pero útil para agrupación
    ancestors: string[];       // Array de IDs desde la raíz [World, Continent...]
  };

  // Datos extendidos
  data?: {
    languages?: string[];      // Array de IDs (códigos ISO) de idiots
    [key: string]: any;        // Otros campos migrados
  };
  
  translations: { [langCode: string]: string }; // Nombres traducidos
  active: boolean; // Soft Delete
}
```

**Collection: `languages`**
```typescript
interface ILanguage {
  _id: string; // código ISO (es, en, fr)
  name: string;
  nativeName: string;
  active: boolean;
  translations: { [langCode: string]: string };
}
```

### B. DB: `auth_db`

**Collection: `users`**
```typescript
interface IUser {
  _id: string; // UUID o ObjectId
  username: string;
  email?: string;
  passwordHash: string; // BCrypt
  roles: string[];
  active: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### C. DB: `audit_db`

**Collection: `audit_logs`**
```typescript
interface IAuditLog {
  _id: ObjectId;
  userId: string;       // Referencia lógica a auth_db.users._id
  action: string;       // UPPER_CASE_ACTION
  resourceId?: string;  // ID del objeto afectado
  collection: string;   // 'areas', 'users', etc.
  details: any;         // Metadata del cambio
  timestamp: Date;
}
```

---

## 8. Estrategia de Conexión (Node.js)

Al usar 3 bases de datos, **no puedes usar `mongoose.connect()` por defecto** (que conecta a una sola). Debes usar `mongoose.createConnection()`.

**Ejemplo de implementación (.env):**
```env
# Connection Strings
MONGO_URI_WORLD=mongodb+srv://user:pass@cluster.mongodb.net/world
MONGO_URI_AUTH=mongodb+srv://user:pass@cluster.mongodb.net/auth_db
MONGO_URI_AUDIT=mongodb+srv://user:pass@cluster.mongodb.net/audit_db
```

**Ejemplo de Código (db.ts):**
```javascript
const connWorld = mongoose.createConnection(process.env.MONGO_URI_WORLD);
const connAuth  = mongoose.createConnection(process.env.MONGO_URI_AUTH);
const connAudit = mongoose.createConnection(process.env.MONGO_URI_AUDIT);

// Registrar Modelos en la conexión correspondiente
const AreaModel = connWorld.model('Area', AreaSchema);
const UserModel = connAuth.model('User', UserSchema);
const LogModel  = connAudit.model('AuditLog', LogSchema);
```
