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

  
  MEMBERSHIP_NOT_FOUND: 'Membresía no encontrada',
  MEMBERSHIP_ALREADY_EXISTS: 'La membresía ya existe',
  MEMBERSHIP_NAME_ALREADY_EXISTS: 'El nombre de la membresía ya está en uso',


  VALIDATION_FAILED: 'Error de validación',
  REQUIRED_FIELD_MISSING: 'Campo requerido faltante',
  INVALID_EMAIL_FORMAT: 'Formato de email inválido',
  PASSWORD_TOO_SHORT: 'La contraseña es muy corta',

  
  DATABASE_CONNECTION_ERROR: 'Error de conexión a la base de datos',
  DATABASE_OPERATION_FAILED: 'Operación de base de datos falló',

 
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  SERVICE_UNAVAILABLE: 'Servicio no disponible',

 
  SUBSCRIPTION_NOT_FOUND: 'No se encontró el historial de suscripciones.',
  SUBSCRIPTION_ALREADY_EXISTS: 'Ya existe un historial de suscripciones para este usuario.',

  
  ATTENDANCE_NOT_FOUND: 'Asistencia no encontrada.',
  ATTENDANCE_ALREADY_INSIDE: 'El usuario ya está dentro del gym.',
  ATTENDANCE_NOT_INSIDE: 'El usuario no está actualmente dentro del gym.',
  ATTENDANCE_NO_AVAILABLE: 'Sin asistencias disponibles para este tipo.',
  ATTENDANCE_INVALID_TYPE: 'Tipo de asistencia inválido.',
  ATTENDANCE_INVALID_DATE_RANGE: 'Rango de fechas inválido.',


  UNAUTHORIZED: 'No autorizado. Se requiere un token de autenticación válido.',
  FORBIDDEN: 'Acceso denegado. No tienes los permisos necesarios.',
  VALIDATION_ERROR: 'Error de validación. Por favor, revisa los datos enviados.',
} as const;