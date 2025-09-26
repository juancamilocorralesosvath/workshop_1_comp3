/**
 * @fileoverview Constantes de configuración centralizadas para el sistema de gestión de gimnasio
 * @description Este archivo contiene todas las constantes, configuraciones y valores predeterminados
 * utilizados en toda la aplicación para facilitar el mantenimiento y la configuración.
 */

import { UserRoles, PermissionCategories, PermissionActions, HttpStatusCodes } from '../types';

// ================================
// CONFIGURACIÓN DE APLICACIÓN
// ================================

/**
 * Configuración predeterminada del servidor
 */
export const SERVER_CONFIG = {
  /** Puerto predeterminado del servidor */
  DEFAULT_PORT: 3000,
  /** Host predeterminado */
  DEFAULT_HOST: 'localhost',
  /** Entorno predeterminado */
  DEFAULT_ENVIRONMENT: 'development'
} as const;

/**
 * Configuración de paginación
 */
export const PAGINATION_CONFIG = {
  /** Página predeterminada */
  DEFAULT_PAGE: 1,
  /** Límite predeterminado de elementos por página */
  DEFAULT_LIMIT: 10,
  /** Límite máximo de elementos por página */
  MAX_LIMIT: 100
} as const;

// ================================
// CONFIGURACIÓN DE AUTENTICACIÓN
// ================================

/**
 * Configuración de JWT
 */
export const JWT_CONFIG = {
  /** Clave secreta predeterminada (CAMBIAR EN PRODUCCIÓN) */
  DEFAULT_SECRET: 'your-super-secret-jwt-key-change-in-production',
  /** Tiempo de expiración del token de acceso */
  ACCESS_TOKEN_EXPIRES_IN: '7d',
  /** Tiempo de expiración del token de renovación */
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  /** Emisor de los tokens */
  ISSUER: 'gym-management-system',
  /** Algoritmo de firma */
  ALGORITHM: 'HS256'
} as const;

/**
 * Configuración de contraseñas
 */
export const PASSWORD_CONFIG = {
  /** Número de rondas de salt para bcrypt */
  BCRYPT_SALT_ROUNDS: 12,
  /** Longitud mínima de contraseña */
  MIN_LENGTH: 6,
  /** Longitud máxima de contraseña */
  MAX_LENGTH: 100
} as const;

// ================================
// CONFIGURACIÓN DE BASE DE DATOS
// ================================

/**
 * Configuración de MongoDB
 */
export const DATABASE_CONFIG = {
  /** URI predeterminada de conexión */
  DEFAULT_URI: 'mongodb://localhost:27017/gym_management',
  /** Nombre predeterminado de la base de datos */
  DEFAULT_DB_NAME: 'workshop',
  /** Opciones de conexión */
  CONNECTION_OPTIONS: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
} as const;

// ================================
// ROLES Y PERMISOS DEL SISTEMA
// ================================

/**
 * Definición completa de roles con sus permisos
 */
export const SYSTEM_ROLES = {
  [UserRoles.ADMIN]: {
    name: 'admin',
    description: 'Administrador del sistema con acceso completo',
    permissions: [
      // Permisos de usuarios
      `${PermissionCategories.USER}.${PermissionActions.CREATE}`,
      `${PermissionCategories.USER}.${PermissionActions.READ}`,
      `${PermissionCategories.USER}.${PermissionActions.UPDATE}`,
      `${PermissionCategories.USER}.${PermissionActions.DELETE}`,
      // Permisos de roles
      `${PermissionCategories.ROLE}.${PermissionActions.CREATE}`,
      `${PermissionCategories.ROLE}.${PermissionActions.READ}`,
      `${PermissionCategories.ROLE}.${PermissionActions.UPDATE}`,
      `${PermissionCategories.ROLE}.${PermissionActions.DELETE}`,
      // Permisos de permisos
      `${PermissionCategories.PERMISSION}.${PermissionActions.CREATE}`,
      `${PermissionCategories.PERMISSION}.${PermissionActions.READ}`,
      `${PermissionCategories.PERMISSION}.${PermissionActions.DELETE}`,
      // Permisos de asistencias
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.CREATE}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.READ}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.UPDATE}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.DELETE}`,
      // Permisos de membresías
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.CREATE}`,
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.READ}`,
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.UPDATE}`,
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.DELETE}`,
      // Permisos de suscripciones
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.CREATE}`,
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.READ}`,
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.UPDATE}`,
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.DELETE}`
    ]
  },
  [UserRoles.RECEPTIONIST]: {
    name: 'recepcionista',
    description: 'Personal de recepción con acceso a gestión de usuarios y servicios',
    permissions: [
      // Permisos de usuarios
      `${PermissionCategories.USER}.${PermissionActions.CREATE}`,
      `${PermissionCategories.USER}.${PermissionActions.READ}`,
      `${PermissionCategories.USER}.${PermissionActions.UPDATE}`,
      // Permisos de asistencias
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.CREATE}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.READ}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.UPDATE}`,
      // Permisos de membresías
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.READ}`,
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.UPDATE}`,
      // Permisos de suscripciones
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.CREATE}`,
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.READ}`,
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.UPDATE}`
    ]
  },
  [UserRoles.COACH]: {
    name: 'coach',
    description: 'Entrenador con acceso a consulta de usuarios y gestión de asistencias',
    permissions: [
      // Permisos de usuarios
      `${PermissionCategories.USER}.${PermissionActions.READ}`,
      // Permisos de asistencias
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.CREATE}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.READ}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.UPDATE}`,
      // Permisos de membresías
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.READ}`,
      // Permisos de suscripciones
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.READ}`
    ]
  },
  [UserRoles.CLIENT]: {
    name: 'cliente',
    description: 'Usuario final con acceso limitado a sus propios datos',
    permissions: [
      // Permisos de asistencias
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.READ}`,
      // Permisos de membresías
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.READ}`,
      // Permisos de suscripciones
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.READ}`
    ]
  }
} as const;

/**
 * Lista de todos los permisos disponibles en el sistema
 */
export const ALL_PERMISSIONS = Object.values(SYSTEM_ROLES)
  .flatMap(role => role.permissions)
  .filter((permission, index, array) => array.indexOf(permission) === index)
  .sort();

/**
 * Usuario administrador predeterminado
 */
export const DEFAULT_ADMIN = {
  email: 'admin@gym.com',
  password: 'admin123', // CAMBIAR EN PRODUCCIÓN
  fulll_name: 'Administrador del Sistema',
  age: '30',
  phone: '+573001234567',
  role: UserRoles.ADMIN
} as const;

// ================================
// MENSAJES DEL SISTEMA
// ================================

/**
 * Mensajes de éxito estandardizados
 */
export const SUCCESS_MESSAGES = {
  // Autenticación
  USER_REGISTERED: 'Usuario registrado exitosamente',
  LOGIN_SUCCESSFUL: 'Inicio de sesión exitoso',
  TOKEN_REFRESHED: 'Token renovado exitosamente',
  LOGOUT_SUCCESSFUL: 'Cierre de sesión exitoso',
  PROFILE_RETRIEVED: 'Perfil obtenido exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',

  // Gestión de usuarios
  USERS_RETRIEVED: 'Usuarios obtenidos exitosamente',
  USER_RETRIEVED: 'Usuario obtenido exitosamente',
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
  USER_DELETED: 'Usuario eliminado exitosamente',
  USER_ACTIVATED: 'Usuario activado exitosamente',
  USER_DEACTIVATED: 'Usuario desactivado exitosamente',
  ROLES_ASSIGNED: 'Roles asignados exitosamente',

  // Gestión de roles
  ROLES_RETRIEVED: 'Roles obtenidos exitosamente',
  ROLE_CREATED: 'Rol creado exitosamente',
  ROLE_UPDATED: 'Rol actualizado exitosamente',
  ROLE_DELETED: 'Rol eliminado exitosamente',

  // Gestión de permisos
  PERMISSIONS_RETRIEVED: 'Permisos obtenidos exitosamente',
  PERMISSION_CREATED: 'Permiso creado exitosamente',
  PERMISSION_DELETED: 'Permiso eliminado exitosamente'
} as const;

/**
 * Mensajes de error estandardizados
 */
export const ERROR_MESSAGES = {
  // Errores de autenticación
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  ACCOUNT_DEACTIVATED: 'La cuenta está desactivada',
  INVALID_TOKEN: 'Token inválido o expirado',
  AUTHENTICATION_REQUIRED: 'Autenticación requerida',
  AUTHORIZATION_REQUIRED: 'No tiene permisos para realizar esta acción',
  CURRENT_PASSWORD_INCORRECT: 'La contraseña actual es incorrecta',

  // Errores de validación
  VALIDATION_FAILED: 'Error de validación',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  INVALID_EMAIL_FORMAT: 'Formato de email inválido',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres',
  REQUIRED_FIELD_MISSING: 'Campo requerido faltante',

  // Errores de recursos
  USER_NOT_FOUND: 'Usuario no encontrado',
  ROLE_NOT_FOUND: 'Rol no encontrado',
  PERMISSION_NOT_FOUND: 'Permiso no encontrado',
  RESOURCE_NOT_FOUND: 'Recurso no encontrado',
  RESOURCE_ALREADY_EXISTS: 'El recurso ya existe',

  // Errores de negocio
  CANNOT_DELETE_ROLE_IN_USE: 'No se puede eliminar el rol porque está siendo utilizado',
  CANNOT_DELETE_PERMISSION_IN_USE: 'No se puede eliminar el permiso porque está siendo utilizado',
  DEFAULT_ROLE_NOT_FOUND: 'Rol predeterminado no encontrado',

  // Errores del servidor
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  DATABASE_CONNECTION_ERROR: 'Error de conexión a la base de datos',
  INVALID_ID_FORMAT: 'Formato de ID inválido'
} as const;

// ================================
// CONFIGURACIÓN DE VALIDACIÓN
// ================================

/**
 * Expresiones regulares para validación
 */
export const VALIDATION_PATTERNS = {
  /** Patrón para validar email */
  EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  /** Patrón para validar teléfono (formato colombiano) */
  PHONE: /^(\+57)?[0-9]{10}$/,
  /** Patrón para validar ID generado */
  GENERATED_ID: /^[a-z]+_[a-f0-9]{12}$/
} as const;

/**
 * Límites de validación
 */
export const VALIDATION_LIMITS = {
  /** Longitud mínima para nombres */
  MIN_NAME_LENGTH: 2,
  /** Longitud máxima para nombres */
  MAX_NAME_LENGTH: 100,
  /** Longitud mínima para teléfono */
  MIN_PHONE_LENGTH: 10,
  /** Longitud máxima para teléfono */
  MAX_PHONE_LENGTH: 15,
  /** Edad mínima */
  MIN_AGE: 1,
  /** Edad máxima */
  MAX_AGE: 120
} as const;

// ================================
// CONFIGURACIÓN DE CORS
// ================================

/**
 * Configuración de CORS
 */
export const CORS_CONFIG = {
  /** Orígenes permitidos en desarrollo */
  DEVELOPMENT_ORIGINS: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
  /** Orígenes permitidos en producción (configurar según necesidades) */
  PRODUCTION_ORIGINS: [],
  /** Métodos HTTP permitidos */
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  /** Headers permitidos */
  ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
  /** Permite credenciales */
  CREDENTIALS: true
} as const;

// ================================
// CONFIGURACIÓN DE LOGS
// ================================

/**
 * Configuración de logging
 */
export const LOGGING_CONFIG = {
  /** Nivel de log en desarrollo */
  DEVELOPMENT_LEVEL: 'debug',
  /** Nivel de log en producción */
  PRODUCTION_LEVEL: 'info',
  /** Formato de timestamp */
  TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  /** Tamaño máximo de archivo de log */
  MAX_FILE_SIZE: '20m',
  /** Número máximo de archivos de log */
  MAX_FILES: '14d'
} as const;