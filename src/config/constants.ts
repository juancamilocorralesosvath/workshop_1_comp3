
import { UserRoles, PermissionCategories, PermissionActions, HttpStatusCodes } from '../types';


export const SERVER_CONFIG = {
  
  DEFAULT_PORT: 3000,
  
  DEFAULT_HOST: 'localhost',
  
  DEFAULT_ENVIRONMENT: 'development'
} as const;


export const PAGINATION_CONFIG = {

  DEFAULT_PAGE: 1,
  
  DEFAULT_LIMIT: 10,
  
  MAX_LIMIT: 100
} as const;


export const JWT_CONFIG = {
  
  DEFAULT_SECRET: 'your-super-secret-jwt-key-change-in-production',
  
  ACCESS_TOKEN_EXPIRES_IN: '7d',
  
  REFRESH_TOKEN_EXPIRES_IN: '30d',
 
  ISSUER: 'gym-management-system',
  
  ALGORITHM: 'HS256'
} as const;


export const PASSWORD_CONFIG = {
  BCRYPT_SALT_ROUNDS: 12,
  MIN_LENGTH: 6,
  MAX_LENGTH: 100
} as const;


export const DATABASE_CONFIG = {
  DEFAULT_URI: 'mongodb://localhost:27017/gym_management',
  DEFAULT_DB_NAME: 'workshop',
  CONNECTION_OPTIONS: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
} as const;


export const SYSTEM_ROLES = {
  [UserRoles.ADMIN]: {
    name: 'admin',
    description: 'Administrador del sistema con acceso completo',
    permissions: [
    
      `${PermissionCategories.USER}.${PermissionActions.CREATE}`,
      `${PermissionCategories.USER}.${PermissionActions.READ}`,
      `${PermissionCategories.USER}.${PermissionActions.UPDATE}`,
      `${PermissionCategories.USER}.${PermissionActions.DELETE}`,
      
      `${PermissionCategories.ROLE}.${PermissionActions.CREATE}`,
      `${PermissionCategories.ROLE}.${PermissionActions.READ}`,
      `${PermissionCategories.ROLE}.${PermissionActions.UPDATE}`,
      `${PermissionCategories.ROLE}.${PermissionActions.DELETE}`,
     
      `${PermissionCategories.PERMISSION}.${PermissionActions.CREATE}`,
      `${PermissionCategories.PERMISSION}.${PermissionActions.READ}`,
      `${PermissionCategories.PERMISSION}.${PermissionActions.DELETE}`,
      
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.CREATE}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.READ}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.UPDATE}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.DELETE}`,
      
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.CREATE}`,
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.READ}`,
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.UPDATE}`,
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.DELETE}`,
      
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
      
      `${PermissionCategories.USER}.${PermissionActions.CREATE}`,
      `${PermissionCategories.USER}.${PermissionActions.READ}`,
      `${PermissionCategories.USER}.${PermissionActions.UPDATE}`,
      
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.CREATE}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.READ}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.UPDATE}`,
    
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.READ}`,
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.UPDATE}`,
    
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.CREATE}`,
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.READ}`,
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.UPDATE}`
    ]
  },
  [UserRoles.COACH]: {
    name: 'coach',
    description: 'Entrenador con acceso a consulta de usuarios y gestión de asistencias',
    permissions: [
   
      `${PermissionCategories.USER}.${PermissionActions.READ}`,
     
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.CREATE}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.READ}`,
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.UPDATE}`,
     
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.READ}`,
      
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.READ}`
    ]
  },
  [UserRoles.CLIENT]: {
    name: 'cliente',
    description: 'Usuario final con acceso limitado a sus propios datos',
    permissions: [
      
      `${PermissionCategories.ATTENDANCE}.${PermissionActions.READ}`,
      
      `${PermissionCategories.MEMBERSHIP}.${PermissionActions.READ}`,
      
      `${PermissionCategories.SUBSCRIPTION}.${PermissionActions.READ}`
    ]
  }
} as const;


export const ALL_PERMISSIONS = Object.values(SYSTEM_ROLES)
  .flatMap(role => role.permissions)
  .filter((permission, index, array) => array.indexOf(permission) === index)
  .sort();


export const DEFAULT_ADMIN = {
  email: 'admin@gym.com',
  password: 'admin123', 
  fulll_name: 'Administrador del Sistema',
  age: '30',
  phone: '+573001234567',
  role: UserRoles.ADMIN
} as const;


export const SUCCESS_MESSAGES = {
  
  USER_REGISTERED: 'Usuario registrado exitosamente',
  LOGIN_SUCCESSFUL: 'Inicio de sesión exitoso',
  TOKEN_REFRESHED: 'Token renovado exitosamente',
  LOGOUT_SUCCESSFUL: 'Cierre de sesión exitoso',
  PROFILE_RETRIEVED: 'Perfil obtenido exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',

  
  USERS_RETRIEVED: 'Usuarios obtenidos exitosamente',
  USER_RETRIEVED: 'Usuario obtenido exitosamente',
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
  USER_DELETED: 'Usuario eliminado exitosamente',
  USER_ACTIVATED: 'Usuario activado exitosamente',
  USER_DEACTIVATED: 'Usuario desactivado exitosamente',
  ROLES_ASSIGNED: 'Roles asignados exitosamente',

  
  ROLES_RETRIEVED: 'Roles obtenidos exitosamente',
  ROLE_CREATED: 'Rol creado exitosamente',
  ROLE_UPDATED: 'Rol actualizado exitosamente',
  ROLE_DELETED: 'Rol eliminado exitosamente',

  
  PERMISSIONS_RETRIEVED: 'Permisos obtenidos exitosamente',
  PERMISSION_CREATED: 'Permiso creado exitosamente',
  PERMISSION_DELETED: 'Permiso eliminado exitosamente'
} as const;


export const ERROR_MESSAGES = {
  
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  ACCOUNT_DEACTIVATED: 'La cuenta está desactivada',
  INVALID_TOKEN: 'Token inválido o expirado',
  AUTHENTICATION_REQUIRED: 'Autenticación requerida',
  AUTHORIZATION_REQUIRED: 'No tiene permisos para realizar esta acción',
  CURRENT_PASSWORD_INCORRECT: 'La contraseña actual es incorrecta',

  
  VALIDATION_FAILED: 'Error de validación',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  INVALID_EMAIL_FORMAT: 'Formato de email inválido',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres',
  REQUIRED_FIELD_MISSING: 'Campo requerido faltante',

  
  USER_NOT_FOUND: 'Usuario no encontrado',
  ROLE_NOT_FOUND: 'Rol no encontrado',
  PERMISSION_NOT_FOUND: 'Permiso no encontrado',
  RESOURCE_NOT_FOUND: 'Recurso no encontrado',
  RESOURCE_ALREADY_EXISTS: 'El recurso ya existe',

  
  CANNOT_DELETE_ROLE_IN_USE: 'No se puede eliminar el rol porque está siendo utilizado',
  CANNOT_DELETE_PERMISSION_IN_USE: 'No se puede eliminar el permiso porque está siendo utilizado',
  DEFAULT_ROLE_NOT_FOUND: 'Rol predeterminado no encontrado',

  
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  DATABASE_CONNECTION_ERROR: 'Error de conexión a la base de datos',
  INVALID_ID_FORMAT: 'Formato de ID inválido'
} as const;



export const VALIDATION_PATTERNS = {
 
  EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  
  PHONE: /^(\+57)?[0-9]{10}$/,
  
  GENERATED_ID: /^[a-z]+_[a-f0-9]{12}$/
} as const;


export const VALIDATION_LIMITS = {
 
  MIN_NAME_LENGTH: 2,
  
  MAX_NAME_LENGTH: 100,
 
  MIN_PHONE_LENGTH: 10,
  
  MAX_PHONE_LENGTH: 15,

  MIN_AGE: 1,
  
  MAX_AGE: 120
} as const;


export const CORS_CONFIG = {
  
  DEVELOPMENT_ORIGINS: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
  
  PRODUCTION_ORIGINS: [],
  
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  
  ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
  
  CREDENTIALS: true
} as const;


export const LOGGING_CONFIG = {
  
  DEVELOPMENT_LEVEL: 'debug',

  PRODUCTION_LEVEL: 'info',
  
  TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  
  MAX_FILE_SIZE: '20m',
  
  MAX_FILES: '14d'
} as const;