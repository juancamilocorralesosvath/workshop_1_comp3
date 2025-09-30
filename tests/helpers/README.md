# Estructura de Testing - Proyecto Gym Management

Esta estructura está diseñada siguiendo las mejores prácticas para testing en Node.js/Express con Jest y TypeScript.

## 📁 Estructura de Carpetas

```
tests/
├── fixtures/           # Datos de prueba estáticos
├── helpers/            # Utilidades y configuración de pruebas
├── integration/        # Pruebas de integración (API endpoints)
│   ├── database/       # Pruebas de conexión a BD
│   └── routes/         # Pruebas de rutas completas
├── mocks/              # Mocks de dependencias externas
├── unit/               # Pruebas unitarias
│   ├── controllers/    # Pruebas de controladores
│   ├── middleware/     # Pruebas de middleware
│   ├── services/       # Pruebas de servicios
│   └── utils/          # Pruebas de utilidades
```

## 🧪 Tipos de Pruebas

### Unit Tests (Pruebas Unitarias)
- **Ubicación**: `tests/unit/`
- **Propósito**: Probar funciones/métodos individuales de forma aislada
- **Cobertura**: Services, Controllers, Middleware, Utils
- **Características**: Rápidas, con mocks de dependencias

### Integration Tests (Pruebas de Integración)
- **Ubicación**: `tests/integration/`
- **Propósito**: Probar la interacción entre componentes
- **Cobertura**: Endpoints completos, flujos de datos
- **Características**: Base de datos en memoria, requests HTTP reales

## 🛠️ Archivos de Configuración

### `setup.ts`
- Configuración global de pruebas
- MongoDB en memoria
- Limpieza de datos entre pruebas
- Creación de roles por defecto

### `test-utils.ts`
- Funciones helper para crear datos de prueba
- Generación de tokens JWT
- Validaciones comunes
- Limpieza de base de datos

## 📝 Comandos de Pruebas

```bash
# Ejecutar todas las pruebas
npm run test

# Ejecutar en modo watch
npm run test:watch

# Ejecutar con cobertura
npm run test:coverage

# Solo pruebas unitarias
npm run test:unit

# Solo pruebas de integración
npm run test:integration
```

## ✅ Meta de Cobertura

- **Objetivo**: Mínimo 80% de cobertura
- **Enfoque**: Rutas críticas y lógica de negocio
- **Prioridad**: Memberships y Subscriptions

## 🤝 Colaboración

Esta estructura permite que múltiples desarrolladores trabajen simultáneamente en diferentes tipos de pruebas sin conflictos.