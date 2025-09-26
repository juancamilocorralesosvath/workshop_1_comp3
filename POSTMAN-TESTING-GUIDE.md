# Guía de Pruebas con Postman - Gym Management API

## Archivos Creados

1. **`postman-collection.json`** - Colección de Postman con todas las pruebas organizadas por roles
2. **`permissions-setup.json`** - Definición de roles, permisos y escenarios de prueba

## Instrucciones de Uso

### 1. Importar la Colección en Postman

1. Abre Postman
2. Click en "Import"
3. Selecciona el archivo `postman-collection.json`
4. La colección "Gym Management API - Role Testing" aparecerá en tu workspace

### 2. Configurar Variables

La colección utiliza variables que se configuran automáticamente:
- `baseUrl`: http://localhost:3000 (asegúrate que el servidor esté corriendo)
- `accessToken`: Se establece automáticamente al hacer login
- `adminUserId`, `coachUserId`, etc.: Se establecen al crear usuarios

### 3. Ejecutar las Pruebas

#### Secuencia Recomendada:

1. **Setup - Create Initial Admin**
   - Ejecuta "Register Admin User"
   - Ejecuta "Login Admin" (esto establece el token de administrador)

2. **User Registration by Role**
   - Ejecuta todas las requests para crear usuarios con diferentes roles
   - Los IDs se guardan automáticamente en variables

3. **Admin Tests - Full Access**
   - Ejecuta todas las pruebas con privilegios de administrador
   - Todas deberían ser exitosas (200/201/204)

4. **Coach Tests - Limited Access**
   - Cambia el token al de coach con "Login as Coach"
   - Las pruebas de acceso a usuarios deberían fallar (403 Forbidden)
   - Solo puede acceder a su perfil

5. **Recepcionista Tests - Read Access**
   - Cambia el token con "Login as Recepcionista"
   - Puede leer y crear usuarios, pero no eliminar o cambiar estados

6. **Cliente Tests - Own Profile Only**
   - Cambia el token con "Login as Cliente"
   - Solo puede acceder a su propio perfil
   - Todas las demás operaciones deberían fallar

7. **Authentication Tests**
   - Pruebas de refresh token, logout, y acceso sin autenticación

8. **Error Handling Tests**
   - Pruebas de casos de error como emails duplicados, credenciales inválidas, etc.

## Roles y Permisos

### 🔴 Admin
- **Acceso completo** a todas las funcionalidades
- Puede crear, leer, actualizar y eliminar usuarios
- Puede cambiar estados de usuarios y asignar roles

### 🟡 Recepcionista
- Puede **crear, leer y actualizar** usuarios
- **NO puede** eliminar usuarios ni cambiar estados
- Puede gestionar su propio perfil

### 🟢 Coach
- **Solo** puede acceder a su propio perfil
- Puede actualizar su información personal
- **NO tiene acceso** a información de otros usuarios

### 🔵 Cliente
- **Solo** puede acceder a su propio perfil
- Puede actualizar su información personal y cambiar contraseña
- **NO tiene acceso** a información de otros usuarios

## Resultados Esperados

### ✅ Pruebas que DEBEN ser Exitosas:
- Admin: Todas las operaciones
- Recepcionista: CRUD de usuarios (excepto DELETE y toggle-status)
- Coach/Cliente: Solo operaciones de perfil propio

### ❌ Pruebas que DEBEN Fallar (403 Forbidden):
- Coach intentando acceder a usuarios
- Cliente intentando acceder a usuarios
- Recepcionista intentando eliminar usuarios
- Cualquier operación sin token de autenticación

## Códigos de Estado Esperados

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **204**: Operación exitosa sin contenido
- **400**: Error de validación (datos incorrectos)
- **401**: No autenticado (token inválido/faltante)
- **403**: No autorizado (permisos insuficientes)
- **404**: Recurso no encontrado
- **409**: Conflicto (email duplicado)

## Notas Importantes

1. **Orden de Ejecución**: Ejecuta las carpetas en orden secuencial
2. **Variables Automáticas**: Los tokens e IDs se establecen automáticamente
3. **Estado del Servidor**: Asegúrate que el servidor esté corriendo en puerto 3000
4. **Base de Datos**: La BD debe estar vacía al inicio para mejores resultados
5. **Logs**: Revisa la consola de Postman para mensajes de debug

## Troubleshooting

### Error de Conexión
- Verifica que el servidor esté corriendo: `npm start`
- Confirma que el puerto sea 3000

### Token Expirado
- Re-ejecuta el login del rol correspondiente
- Los tokens se actualizan automáticamente

### Variables No Establecidas
- Verifica que las requests de registro hayan sido exitosas
- Los scripts automáticos extraen los IDs de las respuestas

### Errores 500
- Revisa la consola del servidor para errores de BD
- Verifica la conexión a MongoDB