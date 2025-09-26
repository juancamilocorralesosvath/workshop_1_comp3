export const ERROR_MESSAGES = {
  
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  ACCOUNT_DEACTIVATED: 'La cuenta está desactivada',
  TOKEN_EXPIRED: 'El token ha expirado',
  TOKEN_INVALID: 'Token inválido',

  
  ACCESS_DENIED: 'Acceso denegado',
  INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes',

  
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_ALREADY_EXISTS: 'El usuario ya existe',

 
  ROLE_NOT_FOUND: 'Rol no encontrado',
  DEFAULT_ROLE_NOT_FOUND: 'Rol predeterminado no encontrado',
  ROLE_ALREADY_EXISTS: 'El rol ya existe',


  PERMISSION_NOT_FOUND: 'Permiso no encontrado',
  PERMISSION_ALREADY_EXISTS: 'El permiso ya existe',


  VALIDATION_FAILED: 'Error de validación',
  REQUIRED_FIELD_MISSING: 'Campo requerido faltante',
  INVALID_EMAIL_FORMAT: 'Formato de email inválido',
  PASSWORD_TOO_SHORT: 'La contraseña es muy corta',

  
  DATABASE_CONNECTION_ERROR: 'Error de conexión a la base de datos',
  DATABASE_OPERATION_FAILED: 'Operación de base de datos falló',

 
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  SERVICE_UNAVAILABLE: 'Servicio no disponible'
} as const;