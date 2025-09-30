# 🏋️‍♂️ Gym Management System - User Module

## 👥 Equipo de Desarrollo
* Luis Manuel Rojas Correa
* Santiago Angel Ordoñez
* Cristian Molina Vides
* Juan Camilo Corrales Osvath

## 📋 Descripción del Proyecto

Sistema de gestión de gimnasio desarrollado en Express.js con TypeScript. Este módulo maneja toda la funcionalidad relacionada con usuarios, autenticación, roles y permisos.

## 🏗️ Arquitectura del Sistema

### Estructura de Carpetas
```
src/
├── controllers/        # 🎮 Lógica de negocio y manejo de endpoints
├── middleware/         # 🛡️ Funciones intermedias (auth, validación, errores)
├── models/            # 📊 Esquemas de base de datos (Mongoose)
├── routes/            # 🛣️ Definición de rutas y endpoints
├── utils/             # 🔧 Funciones utilitarias reutilizables
├── seeders/           # 🌱 Datos iniciales para la base de datos
└── types/             # 📝 Definiciones de tipos TypeScript
```

### Patrón de Arquitectura
- **MVC (Model-View-Controller)**: Separación clara de responsabilidades
- **Middleware Pattern**: Para autenticación, validación y manejo de errores
- **Repository Pattern**: Abstracción de acceso a datos con Mongoose

## 🚀 Instalación y Configuración

### Prerequisitos
- Node.js (v18+)
- MongoDB (via Docker)
- npm o bun

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copiar `.env.example` a `.env` y configurar:
```env
MONGO_URI=mongodb://admin:password@localhost:27018/workshop
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
```

### 3. Iniciar MongoDB con Docker
```bash
docker compose up -d
```

### 4. Ejecutar la Aplicación
```bash
npm start
```

## 🔧 Configuración de MongoDB

### Como correr la imagen de docker para usar mongo

1. Crear el archivo .env en la raiz del proyecto

```bash
cd workshop_1_comp3
touch .env
```

2. Meter en el archivo .env las variables de entorno necesarias (usar .env.example como referencia)

3. Una vez hecho eso, abrir docker desktop en sus pcs y correr el comando

```bash
docker compose up -d
```

(en la raiz del proyecto)

4. Abrir mongo compass
5. Seleccionar crear una nueva conexion
6. En la uri, colocar

```bash
mongodb://localhost:27018
```

7. Seleccionar advanced connection options
8. Seleccionar `Authentication`
9. En username y password colocar la info del .env
10. Save & connect.
11. ¡Listo para usar!

## 👥 Sistema de Roles y Permisos

### Roles Predefinidos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **admin** | Administrador del sistema | Todos los permisos |
| **recepcionista** | Personal de recepción | Gestión de usuarios, suscripciones, asistencias |
| **coach** | Entrenador | Lectura de usuarios, gestión de asistencias |
| **cliente** | Usuario final | Lectura de sus propios datos |

### Permisos Disponibles
- `user.*` - Gestión de usuarios
- `role.*` - Gestión de roles
- `permission.*` - Gestión de permisos
- `attendance.*` - Gestión de asistencias
- `membership.*` - Gestión de membresías
- `subscription.*` - Gestión de suscripciones

## 🔐 Autenticación y Seguridad

### JWT (JSON Web Tokens)
- **Expiración**: 7 días (configurable)
- **Refresh Tokens**: 30 días
- **Algoritmo**: HS256

### Seguridad de Contraseñas
- **Encriptación**: bcrypt con salt de 12 rounds
- **Validación**: Mínimo 6 caracteres

### Protección de Rutas
```typescript
// Ejemplo de protección por rol
router.get('/users',
  authenticate,                    // ✅ Usuario autenticado
  authorize(['admin', 'recepcionista']), // ✅ Rol autorizado
  UserController.getAllUsers
);
```

## 📡 API Endpoints

### 🔑 Autenticación (`/auth`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| POST | `/register` | Registro de usuario | Público |
| POST | `/login` | Inicio de sesión | Público |
| POST | `/refresh` | Renovar token | Público |
| GET | `/profile` | Obtener perfil | Autenticado |
| PUT | `/profile` | Actualizar perfil | Autenticado |
| PUT | `/change-password` | Cambiar contraseña | Autenticado |

### 👤 Gestión de Usuarios (`/users`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/` | Listar usuarios | Admin/Recepcionista |
| GET | `/:id` | Obtener usuario | Admin/Recepcionista |
| POST | `/` | Crear usuario | Admin/Recepcionista |
| PUT | `/:id` | Actualizar usuario | Admin/Recepcionista |
| DELETE | `/:id` | Eliminar usuario | Admin |
| POST | `/assign-roles` | Asignar roles | Admin |


### 🏋️‍♀️ Membresías (`/memberships`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/` | Obtener todas las membresías disponibles en el gimnasio. | Admin/Recepcionista |
| GET | `/:id` | Obtener una membresía específica por su ID. | Admin/Recepcionista/Coach |
| POST | `/` | Crear una nueva plantilla de membresía. | Admin |
| PUT | `/:id` | Actualizar los detalles de una membresía existente. | Admin |
| DELETE | `/:id` | Eliminar una plantilla de membresía. | Admin |
| PATCH | `/:id/toggle-status` | Activar o desactivar el estado de una membresía. | Admin |

### 📜 Suscripciones (`/subscriptions`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/user/:userId` | Obtener el historial de suscripciones de un usuario. | Admin/Recepcionista (o propietario) |
| PUT | `/:id/add-membership` | Añadir una nueva compra de membresía al historial de un usuario. | Admin/Recepcionista |
| POST | `/` | Crear manualmente un historial para un usuario (uso administrativo). | Admin |

### 🏃‍♂️ Asistencias (`/attendances`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| POST | `/check-in/:userId` | Registrar la entrada (check-in) de un usuario al gimnasio o a una clase. | Admin/Recepcionista |
| POST | `/check-out/:userId` | Registrar la salida (check-out) de un usuario. | Admin/Recepcionista |
| GET | `/status/:userId` | Verificar si un usuario está dentro y sus asistencias disponibles. | Admin/Recepcionista (o propietario) |
| GET | `/history/:userId` | Obtener el historial de asistencias de un usuario (permite filtros). | Admin/Recepcionista (o propietario) |
| GET | `/stats/:userId` | Obtener estadísticas de asistencia (anuales y mensuales) de un usuario. | Admin/Recepcionista (o propietario) |
| GET | `/active` | Listar todos los usuarios que se encuentran actualmente dentro del gimnasio. | Admin/Recepcionista/Coach |

## 🔧 Configuración Inicial

### Usuario Administrador por Defecto
```
Email: admin@gym.com
Password: admin123
```

## 🛠️ Herramientas de Desarrollo

### Scripts Disponibles
```json
{
  "start": "bun --watch src/index.ts"
}
```

### Dependencias Principales
- **express**: Framework web
- **mongoose**: ODM para MongoDB
- **jsonwebtoken**: Manejo de JWT
- **bcryptjs**: Encriptación de contraseñas
- **zod**: Validación de esquemas
- **cors**: Manejo de CORS
- **compression**: Compresión de respuestas

## 📊 Monitoreo y Logs

### Health Check
```bash
GET http://localhost:3000/health
```

### Logs del Sistema
- ✅ Conexión a MongoDB
- ✅ Inicio del servidor
- ✅ Creación de datos iniciales
- ❌ Errores de autenticación
- ❌ Errores de validación

## 🚨 Manejo de Errores

### Códigos de Estado HTTP
- `200` - Éxito
- `201` - Creado
- `400` - Error de validación
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `409` - Conflicto (recurso existe)
- `500` - Error interno del servidor

### Formato de Respuesta de Error
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": ["validation error 1", "validation error 2"]
}
```

## 🤝 Contribución

### Convenciones de Código
1. **Nombres descriptivos**: Funciones y variables en español/inglés claro
2. **Comentarios JSDoc**: Documentar funciones públicas
3. **Validación estricta**: Usar Zod para validar entradas
4. **Manejo de errores**: Usar try-catch y middleware de errores
5. **Tipado fuerte**: Aprovechar TypeScript al máximo

### Estructura de Commits
```
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
refactor: refactorizar código
test: agregar tests
```

---
## **Modelado de la base de datos**

![Modelado de datos en Mongo](./modelado.jpeg)

---
### **Link al despliegue del proyecto**
https://workshop-1-comp3.onrender.com/health

---

### **tests**

Tests desarrollados usando Jest. para correr, usar el comando:

```bash
npx jest
```

---

## **Postman**

Para correr de manera exitosa las pruebas de postman, se debe crear un environment para cada coleccion. entonces: 

1. Importar las colecciones que se encuentran en este repositorio a su aplicacion de postman

2. configurar los environments como se muestra a continuacion:

para memberships:
![Environment en postman para el modulo de memberships](./postman-memberships.png)

para subscriptions:
![Environment en postman para el modulo de memberships](./postman-subscriptions.png)

para attendances:
![Environment en postman para el modulo de memberships](./postman-attendances.png)

nota: es importante hacer a mano la variable baseUrl para cada uno de los environments, pero ya las demas variables se generan con los scripts de las peticiones


*Desarrollado con ❤️ por el equipo de desarrollo*
