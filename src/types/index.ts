/**
 * @fileoverview Definiciones de tipos centralizadas para el sistema de gestión de gimnasio
 * @description Este archivo contiene todas las interfaces, tipos y enums utilizados en la aplicación
 * para garantizar consistencia y facilitar el mantenimiento del código.
 */

import { Types } from 'mongoose';

// ================================
// TIPOS DE RESPUESTA DE LA API
// ================================

/**
 * Estructura estándar de respuesta de la API
 * @template T - Tipo de datos devueltos en case de éxito
 */
export interface ApiResponse<T = any> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Mensaje descriptivo de la respuesta */
  message: string;
  /** Datos devueltos en caso de éxito */
  data?: T;
  /** Mensaje de error específico */
  error?: string;
  /** Array de errores de validación */
  errors?: string[];
}

/**
 * Información de paginación para listas
 */
export interface PaginationInfo {
  /** Página actual (base 1) */
  page: number;
  /** Límite de elementos por página */
  limit: number;
  /** Total de elementos disponibles */
  total: number;
  /** Total de páginas disponibles */
  pages: number;
}

/**
 * Respuesta paginada para listas de elementos
 * @template T - Tipo de elementos en la lista
 */
export interface PaginatedResponse<T> {
  /** Array de elementos en la página actual */
  items: T[];
  /** Información de paginación */
  pagination: PaginationInfo;
}

// ================================
// TIPOS DE AUTENTICACIÓN
// ================================

/**
 * Payload del token JWT
 */
export interface JWTPayload {
  /** ID único del usuario */
  userId: string;
  /** Email del usuario */
  email: string;
  /** Array de nombres de roles del usuario */
  roles: string[];
  /** Timestamp de emisión del token */
  iat?: number;
  /** Timestamp de expiración del token */
  exp?: number;
  /** Emisor del token */
  iss?: string;
}

/**
 * Datos requeridos para el registro de un usuario
 */
export interface RegisterRequest {
  /** Email único del usuario */
  email: string;
  /** Contraseña del usuario (mínimo 6 caracteres) */
  password: string;
  /** Nombre completo del usuario */
  fulll_name: string;
  /** Edad del usuario */
  age: string;
  /** Número de teléfono del usuario */
  phone: string;
}

/**
 * Datos requeridos para el login
 */
export interface LoginRequest {
  /** Email del usuario */
  email: string;
  /** Contraseña del usuario */
  password: string;
}

/**
 * Respuesta del proceso de autenticación
 */
export interface AuthResponse {
  /** Información del usuario autenticado (sin contraseña) */
  user: Omit<UserDocument, 'password'>;
  /** Token JWT de acceso */
  token: string;
  /** Token de renovación */
  refreshToken: string;
}

// ================================
// TIPOS DE MODELOS DE DATOS
// ================================

/**
 * Documento de usuario extendido con métodos de Mongoose
 */
export interface UserDocument {
  /** ID único generado para el usuario */
  id: string;
  /** Email único del usuario */
  email: string;
  /** Contraseña encriptada */
  password: string;
  /** Nombre completo del usuario */
  fulll_name: string;
  /** Edad del usuario */
  age: string;
  /** Número de teléfono */
  phone: string;
  /** Array de IDs de roles asignados */
  rol: Types.ObjectId[];
  /** Estado activo/inactivo del usuario */
  isActive: boolean;
  /** Fecha del último inicio de sesión */
  lastLogin?: Date;
  /** Fecha de creación del registro */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
  /** Método para comparar contraseñas */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Documento de rol extendido con métodos de Mongoose
 */
export interface RoleDocument {
  /** ID único generado para el rol */
  id: string;
  /** Nombre único del rol */
  name: string;
  /** Array de IDs de permisos asociados */
  permissions: Types.ObjectId[];
  /** Fecha de creación del registro */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Documento de permiso extendido con métodos de Mongoose
 */
export interface PermissionDocument {
  /** ID único generado para el permiso */
  id: string;
  /** Nombre único del permiso */
  name: string;
  /** Fecha de creación del registro */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

// ================================
// TIPOS DE REQUESTS
// ================================

/**
 * Datos para actualizar un usuario
 */
export interface UpdateUserRequest {
  /** Nuevo email (opcional) */
  email?: string;
  /** Nuevo nombre completo (opcional) */
  fulll_name?: string;
  /** Nueva edad (opcional) */
  age?: string;
  /** Nuevo teléfono (opcional) */
  phone?: string;
  /** Nuevo estado activo/inactivo (opcional) */
  isActive?: boolean;
}

/**
 * Datos para asignar roles a un usuario
 */
export interface AssignRolesRequest {
  /** ID del usuario al que se asignarán los roles */
  userId: string;
  /** Array de IDs de roles a asignar */
  roleIds: string[];
}

/**
 * Datos para crear un nuevo rol
 */
export interface CreateRoleRequest {
  /** Nombre único del rol */
  name: string;
  /** Array de IDs de permisos (opcional) */
  permissions?: string[];
}

/**
 * Datos para crear un nuevo permiso
 */
export interface CreatePermissionRequest {
  /** Nombre único del permiso */
  name: string;
}

/**
 * Datos para cambiar contraseña
 */
export interface ChangePasswordRequest {
  /** Contraseña actual */
  currentPassword: string;
  /** Nueva contraseña */
  newPassword: string;
}

// ================================
// ENUMS Y CONSTANTES
// ================================

/**
 * Roles predefinidos del sistema
 */
export enum UserRoles {
  ADMIN = 'admin',
  COACH = 'coach',
  RECEPTIONIST = 'recepcionista',
  CLIENT = 'cliente'
}

/**
 * Categorías de permisos del sistema
 */
export enum PermissionCategories {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  ATTENDANCE = 'attendance',
  MEMBERSHIP = 'membership',
  SUBSCRIPTION = 'subscription'
}

/**
 * Acciones disponibles para los permisos
 */
export enum PermissionActions {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

/**
 * Códigos de estado HTTP utilizados en la aplicación
 */
export enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}

// ================================
// TIPOS DE ERROR PERSONALIZADO
// ================================

/**
 * Error personalizado con código de estado HTTP
 */
export interface CustomError extends Error {
  /** Código de estado HTTP */
  statusCode?: number;
  /** Código de error de MongoDB */
  code?: number;
  /** Valores que causaron el error (para errores de duplicación) */
  keyValue?: any;
}

// ================================
// TIPOS DE FILTROS Y BÚSQUEDA
// ================================

/**
 * Filtros para la búsqueda de usuarios
 */
export interface UserFilters {
  /** Término de búsqueda (nombre o email) */
  search?: string;
  /** Filtrar por estado activo/inactivo */
  isActive?: boolean;
  /** Página para paginación */
  page?: number;
  /** Límite de elementos por página */
  limit?: number;
}

/**
 * Parámetros de query comunes para listas paginadas
 */
export interface PaginationQuery {
  /** Página actual (default: 1) */
  page?: string;
  /** Límite de elementos (default: 10) */
  limit?: string;
  /** Término de búsqueda */
  search?: string;
}

// ================================
// TIPOS DE CONFIGURACIÓN
// ================================

/**
 * Configuración de JWT
 */
export interface JWTConfig {
  /** Clave secreta para firmar tokens */
  secret: string;
  /** Tiempo de expiración del token de acceso */
  expiresIn: string;
  /** Tiempo de expiración del token de renovación */
  refreshExpiresIn: string;
  /** Emisor de los tokens */
  issuer: string;
}

/**
 * Configuración de la base de datos
 */
export interface DatabaseConfig {
  /** URI de conexión a MongoDB */
  uri: string;
  /** Nombre de la base de datos */
  name: string;
}

/**
 * Configuración general de la aplicación
 */
export interface AppConfig {
  /** Puerto del servidor */
  port: number;
  /** Entorno de ejecución */
  environment: 'development' | 'production' | 'test';
  /** Configuración de JWT */
  jwt: JWTConfig;
  /** Configuración de base de datos */
  database: DatabaseConfig;
}