# Instrucciones de Configuración para Pruebas de Autenticación y Autorización en Postman

## 📋 Descripción General

Esta colección de Postman está diseñada para probar completamente el sistema de roles y autenticación desde una base de datos vacía, verificando que cada rol tenga los permisos correctos según las reglas de negocio definidas.

## 🎯 Roles y Permisos del Sistema

### 👑 Admin
- **Acceso completo** a todas las rutas de usuarios
- Puede: GET, POST, PUT, DELETE en `/users`
- Puede gestionar roles y permisos
- **Códigos esperados**: 200/201/204 para todas las operaciones

### 🏢 Recepcionista
- **Solo puede ver y crear** usuarios
- Puede: GET `/users`, GET `/users/:id`, POST `/users`
- **No puede**: PUT `/users/:id`, DELETE `/users/:id`
- **Códigos esperados**: 200/201 para operaciones permitidas, 403 para operaciones prohibidas

### 🏃 Coach
- **Solo puede ver usuarios individuales** y gestionar su propio perfil
- Puede: GET `/users/:id`, GET/PUT `/auth/profile`
- **No puede**: GET `/users`, POST/PUT/DELETE `/users`
- **Códigos esperados**: 200 para operaciones permitidas, 403 para operaciones prohibidas

### 👤 Cliente
- **Solo puede gestionar su propio perfil**
- Puede: GET/PUT `/auth/profile`
- **No puede**: Ninguna operación en `/users`
- **Códigos esperados**: 200 para perfil propio, 403 para todo lo demás

## 🚀 Configuración Inicial

### 1. Preparar la Base de Datos

**IMPORTANTE**: Inicia con una base de datos completamente vacía para las pruebas.

```bash
# Detener la aplicación si está corriendo
npm stop

# Limpiar la base de datos (MongoDB)
# Opción 1: A través de MongoDB Compass o CLI
use tu_database_name
db.dropDatabase()

# Opción 2: Eliminar colecciones específicas
db.users.deleteMany({})
db.roles.deleteMany({})
db.permissions.deleteMany({})
```

### 2. Inicializar Base de Datos con Script Automático

**MÉTODO RECOMENDADO**: Usar el script de inicialización automática que crea todos los roles y usuarios necesarios.

#### Paso 2.1: Ejecutar Script de Inicialización

```bash
# Ejecutar el script de inicialización
node scripts/init-database.js
```

Este script automáticamente:
- ✅ **Limpia la base de datos** (elimina usuarios y roles existentes)
- ✅ **Crea todos los roles** (admin, recepcionista, coach, cliente)
- ✅ **Crea usuarios de prueba** con las credenciales correctas
- ✅ **Hashea las contraseñas** correctamente
- ✅ **Asigna roles apropiados** a cada usuario

#### Credenciales de Prueba Creadas:

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin@test.com | admin123 |
| **Recepcionista** | recepcionista@test.com | recep123 |
| **Coach** | coach@test.com | coach123 |
| **Cliente** | cliente@test.com | cliente123 |

#### Paso 2.2: Verificar Inicialización

Después de ejecutar el script, deberías ver:
```
🎉 Database initialized successfully!
📋 Test credentials:
Admin: admin@test.com / admin123
Recepcionista: recepcionista@test.com / recep123
Coach: coach@test.com / coach123
Cliente: cliente@test.com / cliente123
```

### 3. Configurar Variables de Entorno en Postman

1. Importa la colección `Postman_Auth_Tests.postman_collection.json`
2. Configura las siguientes variables:
   - `base_url`: `http://localhost:3000` (o tu URL de servidor)

### 4. Iniciar el Servidor

```bash
npm start
# o
npm run dev
```

## 📊 Orden de Ejecución de Pruebas

### Ejecutar en este orden exacto:

1. **🔧 Setup & Database Preparation**
   - ✅ **EJECUTAR PRIMERO**: `node scripts/init-database.js`
   - Verificar que el servidor esté funcionando

2. **🔐 2. Authentication Tests**
   - Login Admin (admin@test.com / admin123)
   - Login Recepcionista (recepcionista@test.com / recep123)
   - Login Coach (coach@test.com / coach123)
   - Login Cliente (cliente@test.com / cliente123)

3. **👑 3. Admin Role Tests**
   - Verificar acceso completo (todos deben devolver 200/201/204)

4. **🏢 4. Recepcionista Role Tests**
   - Verificar acceso de solo lectura/creación
   - PUT y DELETE deben devolver 403

5. **🏃 5. Coach Role Tests**
   - Verificar acceso limitado
   - Solo GET individual y perfil propio deben funcionar

6. **👤 6. Cliente Role Tests**
   - Verificar acceso solo a perfil propio
   - Todas las operaciones de usuarios deben devolver 403

7. **🔒 7. Authentication Edge Cases**
   - Probar casos sin token y con token inválido

### ⚠️ NOTA IMPORTANTE

- **No necesitas** la sección "User Registration" ni "Create Test Users"
- **Los usuarios ya existen** después del script de inicialización
- **Salta directo** a "Authentication Tests" después del setup

## ✅ Validaciones Automáticas

La colección incluye scripts de prueba automáticos que verifican:

- **Códigos de respuesta correctos**:
  - 200: Operación exitosa
  - 201: Creación exitosa
  - 204: Eliminación exitosa
  - 401: No autenticado
  - 403: Sin permisos

- **Estructura de respuesta**:
  - Presencia de tokens de autenticación
  - Datos de usuario correctos
  - Mensajes de error apropiados

- **Persistencia de tokens**:
  - Los tokens se guardan automáticamente
  - Se reutilizan en requests posteriores

## 🐛 Solución de Problemas

### Error: 500 en registros (ESPERADO INICIAL)
- **Normal en el primer intento**: Los registros con roleIds fallan porque el sistema no los acepta
- **Solución**: Usar el flujo manual descrito arriba para crear usuarios admin
- Después usar admin para crear otros usuarios vía `/users` endpoint

### Error: "Role not found"
- Asegúrate de haber creado los roles iniciales en la base de datos
- Verifica que los IDs de roles coincidan con los del script de inicialización

### Error: 500 en login con "admin@test.com"
- El usuario admin no existe o no tiene el rol correcto
- Verifica que creaste el usuario admin siguiendo los pasos del setup
- Revisa que el rol "admin" esté asignado correctamente

### Tokens expirados
- Re-ejecuta las pruebas de login
- Verifica la configuración de expiración de JWT

### Variables no encontradas
- Asegúrate de ejecutar primero los requests de login
- Verifica que las variables se estén guardando correctamente

### Usuario puede acceder a rutas que no debería
- Verifica que los roles estén asignados correctamente en la base de datos
- Revisa que el middleware de autorización esté funcionando

## 📈 Interpretación de Resultados

### ✅ Resultado Esperado
- **Admin**: Todos los tests pasan (códigos 200/201/204)
- **Recepcionista**: GET y POST pasan, PUT y DELETE fallan con 403
- **Coach**: Solo GET individual y perfil propio pasan
- **Cliente**: Solo operaciones de perfil propio pasan
- **Sin autenticación**: Todo falla con 401/403

### ❌ Posibles Problemas
- Si Admin no puede hacer alguna operación → Error en configuración de roles
- Si Recepcionista puede hacer PUT/DELETE → Error en middleware de autorización
- Si Cliente puede acceder a otros usuarios → Error en lógica de autorización
- Si tokens no funcionan → Error en autenticación JWT

## 🔄 Ejecutar Pruebas Múltiples Veces

Para ejecutar las pruebas múltiples veces:

1. **Limpiar base de datos** (paso 1)
2. **Recrear roles** (paso 2)
3. **Re-ejecutar toda la colección**

Esto asegura que cada ejecución sea independiente y confiable.

## 📝 Notas Importantes

- **No omitas la preparación de la base de datos** - es crucial para resultados consistentes
- **Ejecuta en orden** - los tests dependen de datos creados en tests anteriores
- **Revisa los logs del servidor** si hay errores inesperados
- **Los tokens tienen expiración** - si los tests fallan por tokens expirados, re-ejecuta los logins

Esta configuración garantiza una prueba completa y sistemática del sistema de autenticación y autorización basado en roles.