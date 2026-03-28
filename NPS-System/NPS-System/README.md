# Sistema NPS (Net Promoter Score)

Sistema Full Stack para encuestas NPS con autenticacion JWT, bloqueo de cuenta y sesiones con timeout.

## Tecnologias

### Backend (.NET 6+)
- ASP.NET Core Web API
- Clean Architecture (Domain, Application, Infrastructure, API)
- Dapper (ORM)
- MediatR (CQRS Pattern)
- AutoMapper
- FluentValidation
- JWT Authentication con Refresh Tokens
- BCrypt para hash de contrasenas

### Frontend (Angular 16+)
- Angular 16
- Reactive Forms
- HTTP Interceptors
- Route Guards
- RxJS

### Base de Datos
- SQL Server 2019+

## Estructura del Proyecto

```
NPS-System/
├── src/
│   ├── NPS.Domain/           # Entidades e interfaces
│   ├── NPS.Application/      # DTOs, Commands, Queries, Handlers
│   ├── NPS.Infrastructure/   # Repositorios, Servicios
│   └── NPS.API/              # Controllers, Middleware
├── frontend/                 # Proyecto Angular
│   └── src/
│       └── app/
│           ├── core/         # Services, Guards, Interceptors
│           ├── features/     # Login, Voting, Dashboard
│           └── shared/       # Componentes compartidos
├── database/                 # Scripts SQL Server
└── NPS.sln                   # Solucion Visual Studio
```

## Requisitos Previos

- .NET 6.0 SDK o superior
- Node.js 18+ y npm
- SQL Server 2019+
- Visual Studio 2022 o VS Code

## Instalacion

### 1. Base de Datos

```bash
# Conectarse a SQL Server y ejecutar los scripts en orden:
# 1. database/01_CreateDatabase.sql
# 2. database/02_SeedData.sql
# 3. database/03_StoredProcedures.sql (opcional)
```

### 2. Backend

```bash
# Navegar a la carpeta del proyecto
cd NPS-System

# Restaurar paquetes
dotnet restore

# Configurar connection string en src/NPS.API/appsettings.json
# "DefaultConnection": "Server=localhost;Database=NPSDatabase;..."

# Ejecutar el proyecto
cd src/NPS.API
dotnet run
```

El API estara disponible en: `https://localhost:7001`

### 3. Frontend

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
ng serve
```

La aplicacion estara disponible en: `http://localhost:4200`

## Credenciales de Prueba

| Usuario   | Contrasena    | Rol     |
|-----------|---------------|---------|
| admin     | Password123!  | Admin   |
| votante1  | Password123!  | Votante |
| votante2  | Password123!  | Votante |
| votante3  | Password123!  | Votante |
| votante4  | Password123!  | Votante |
| votante5  | Password123!  | Votante |

## Funcionalidades

### Autenticacion
- Login con JWT Token (expira en 5 minutos)
- Refresh Token para renovacion automatica
- Bloqueo de cuenta despues de 3 intentos fallidos (15 minutos)
- Logout con revocacion de tokens
- Auto-logout al expirar la sesion

### Perfil Votante
- Votar una unica vez (escala 0-10)
- Agregar comentario opcional
- Interfaz visual con pregunta NPS resaltada

### Perfil Admin
- Dashboard con metricas NPS en tiempo real
- Visualizacion de promotores, neutros y detractores
- Grafico de distribucion de votos
- Lista de votos recientes

## API Endpoints

### Auth
```
POST /api/auth/login         - Iniciar sesion
POST /api/auth/refresh-token - Renovar token
POST /api/auth/logout        - Cerrar sesion
GET  /api/auth/me            - Obtener usuario actual
```

### Votes
```
POST /api/votes              - Crear voto (Votante)
GET  /api/votes/results      - Obtener resultados NPS (Admin)
GET  /api/votes/has-voted    - Verificar si ya voto (Votante)
```

## Configuracion JWT

Modificar en `appsettings.json`:

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "NPSSystem",
    "Audience": "NPSSystemUsers",
    "ExpirationMinutes": "5"
  }
}
```

## Arquitectura Clean Architecture

```
NPS.Domain (sin dependencias)
    └── Entities, Interfaces

NPS.Application (depende de Domain)
    └── DTOs, Commands, Queries, Handlers, Validators

NPS.Infrastructure (depende de Application)
    └── Repositories, Services (Dapper, BCrypt, JWT)

NPS.API (depende de Application, Infrastructure)
    └── Controllers, Middleware, Configuration
```

## Licencia

Este proyecto es para fines educativos y de evaluacion tecnica.
