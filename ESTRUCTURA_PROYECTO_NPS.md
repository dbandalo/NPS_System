# Estructura Completa del Proyecto NPS
## Stack: Angular 16 | .NET 9 Web API | Oracle DB

---

## 📁 SOLUCIÓN COMPLETA

```
NPS.Solution/
├── backend/
│   └── NPS.API/                        ← Solución .NET 9
├── frontend/
│   └── nps-app/                        ← Proyecto Angular 16
├── database/
│   └── oracle/                         ← Scripts SQL Oracle
└── docker-compose.yml                  ← Opcional
```

---

## 🟣 BACKEND — .NET 9 Clean Architecture

```
NPS.API/
├── NPS.API.sln
│
├── src/
│   │
│   ├── 1. NPS.Domain/                          ← Núcleo del negocio (sin dependencias)
│   │   ├── NPS.Domain.csproj
│   │   ├── Entities/
│   │   │   ├── User.cs                         ← Id, Username, PasswordHash, Role, IsLocked, FailedAttempts
│   │   │   ├── Vote.cs                         ← Id, UserId, Score, CreatedAt
│   │   │   ├── RefreshToken.cs                 ← Id, UserId, Token, ExpiresAt, IsRevoked
│   │   │   └── LoginAttempt.cs                 ← Id, UserId, AttemptedAt, Success
│   │   ├── Enums/
│   │   │   ├── UserRole.cs                     ← Voter, Admin
│   │   │   └── NpsCategory.cs                  ← Promoter, Neutral, Detractor
│   │   ├── Interfaces/
│   │   │   ├── Repositories/
│   │   │   │   ├── IUserRepository.cs
│   │   │   │   ├── IVoteRepository.cs
│   │   │   │   ├── IRefreshTokenRepository.cs
│   │   │   │   └── ILoginAttemptRepository.cs
│   │   │   └── Services/
│   │   │       ├── IJwtService.cs
│   │   │       ├── INpsCalculatorService.cs
│   │   │       └── IPasswordService.cs
│   │   └── ValueObjects/
│   │       └── NpsResult.cs                    ← Score, Promoters, Detractors, Neutrals, Total
│   │
│   ├── 2. NPS.Application/                     ← Casos de uso (CQRS con MediatR)
│   │   ├── NPS.Application.csproj
│   │   ├── Common/
│   │   │   ├── Behaviors/
│   │   │   │   └── ValidationBehavior.cs       ← Pipeline de FluentValidation
│   │   │   ├── Mappings/
│   │   │   │   └── MappingProfile.cs           ← AutoMapper profiles
│   │   │   └── Exceptions/
│   │   │       ├── NotFoundException.cs
│   │   │       ├── UnauthorizedException.cs
│   │   │       ├── AccountLockedException.cs
│   │   │       └── AlreadyVotedException.cs
│   │   ├── Features/
│   │   │   ├── Auth/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── Login/
│   │   │   │   │   │   ├── LoginCommand.cs         ← Username, Password
│   │   │   │   │   │   ├── LoginCommandHandler.cs  ← Valida creds, bloqueo 3 intentos, retorna JWT+RefreshToken
│   │   │   │   │   │   └── LoginCommandValidator.cs
│   │   │   │   │   ├── RefreshToken/
│   │   │   │   │   │   ├── RefreshTokenCommand.cs
│   │   │   │   │   │   ├── RefreshTokenCommandHandler.cs
│   │   │   │   │   │   └── RefreshTokenCommandValidator.cs
│   │   │   │   │   └── Logout/
│   │   │   │   │       ├── LogoutCommand.cs
│   │   │   │   │       └── LogoutCommandHandler.cs ← Revoca RefreshToken
│   │   │   │   └── DTOs/
│   │   │   │       ├── LoginRequest.cs
│   │   │   │       ├── LoginResponse.cs            ← AccessToken, RefreshToken, ExpiresIn, Role
│   │   │   │       └── RefreshTokenRequest.cs
│   │   │   ├── Votes/
│   │   │   │   ├── Commands/
│   │   │   │   │   └── SubmitVote/
│   │   │   │   │       ├── SubmitVoteCommand.cs        ← UserId, Score (0-10)
│   │   │   │   │       ├── SubmitVoteCommandHandler.cs ← Verifica que no haya votado antes
│   │   │   │   │       └── SubmitVoteCommandValidator.cs
│   │   │   │   ├── Queries/
│   │   │   │   │   └── GetUserVoteStatus/
│   │   │   │   │       ├── GetUserVoteStatusQuery.cs
│   │   │   │   │       └── GetUserVoteStatusQueryHandler.cs ← Retorna si ya votó
│   │   │   │   └── DTOs/
│   │   │   │       ├── SubmitVoteRequest.cs
│   │   │   │       └── VoteStatusResponse.cs
│   │   │   └── Nps/
│   │   │       └── Queries/
│   │   │           └── GetNpsResult/
│   │   │               ├── GetNpsResultQuery.cs
│   │   │               ├── GetNpsResultQueryHandler.cs  ← Solo Admin
│   │   │               └── DTOs/
│   │   │                   └── NpsResultResponse.cs     ← NpsScore, Promoters%, Detractors%, Neutrals%, Total
│   │   └── DependencyInjection.cs              ← AddApplication() extension
│   │
│   ├── 3. NPS.Infrastructure/                  ← Implementaciones externas
│   │   ├── NPS.Infrastructure.csproj
│   │   ├── Persistence/
│   │   │   ├── OracleConnectionFactory.cs      ← IDbConnection con OracleConnection
│   │   │   └── Repositories/
│   │   │       ├── UserRepository.cs           ← Dapper queries
│   │   │       ├── VoteRepository.cs
│   │   │       ├── RefreshTokenRepository.cs
│   │   │       └── LoginAttemptRepository.cs
│   │   ├── Services/
│   │   │   ├── JwtService.cs                   ← Genera/valida JWT + RefreshToken
│   │   │   ├── NpsCalculatorService.cs         ← Cálculo NPS
│   │   │   └── PasswordService.cs              ← BCrypt hash/verify
│   │   └── DependencyInjection.cs              ← AddInfrastructure() extension
│   │
│   └── 4. NPS.API/                             ← Capa de presentación (Web API)
│       ├── NPS.API.csproj
│       ├── Program.cs                          ← Builder, middleware, Swagger
│       ├── appsettings.json                    ← ConnectionStrings, Jwt config
│       ├── appsettings.Development.json
│       ├── Controllers/
│       │   ├── AuthController.cs               ← POST /api/auth/login, /refresh, /logout
│       │   ├── VotesController.cs              ← POST /api/votes  |  GET /api/votes/status
│       │   └── NpsController.cs                ← GET /api/nps/result  [Admin only]
│       ├── Middleware/
│       │   ├── ExceptionHandlingMiddleware.cs  ← Manejo global de errores
│       │   └── SessionTimeoutMiddleware.cs     ← Valida inactividad 5 min
│       └── Extensions/
│           ├── JwtExtensions.cs                ← Configuración JWT Bearer
│           └── SwaggerExtensions.cs            ← Swagger + Bearer token UI
│
└── tests/
    ├── NPS.Domain.Tests/
    ├── NPS.Application.Tests/
    └── NPS.Infrastructure.Tests/
```

---

## 📦 PAQUETES NUGET — Backend

```xml
<!-- NPS.Domain -->
<!-- Sin dependencias externas -->

<!-- NPS.Application -->
<PackageReference Include="MediatR" Version="12.*" />
<PackageReference Include="FluentValidation" Version="11.*" />
<PackageReference Include="AutoMapper" Version="13.*" />
<PackageReference Include="Microsoft.Extensions.DependencyInjection.Abstractions" />

<!-- NPS.Infrastructure -->
<PackageReference Include="Dapper" Version="2.*" />
<PackageReference Include="Oracle.ManagedDataAccess.Core" Version="23.*" />
<PackageReference Include="BCrypt.Net-Next" Version="4.*" />
<PackageReference Include="Microsoft.IdentityModel.Tokens" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" />

<!-- NPS.API -->
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.*" />
<PackageReference Include="MediatR.Extensions.Microsoft.DependencyInjection" Version="11.*" />
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" />
<PackageReference Include="FluentValidation.DependencyInjectionExtensions" />
```

---

## 🔵 FRONTEND — Angular 16

```
nps-app/
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
│
└── src/
    ├── main.ts
    ├── index.html
    ├── styles.scss                             ← Estilos globales + variables
    │
    └── app/
        ├── app.module.ts
        ├── app-routing.module.ts               ← Rutas con guards
        ├── app.component.ts
        │
        ├── core/                               ← Servicios singleton, guards, interceptors
        │   ├── core.module.ts
        │   ├── auth/
        │   │   ├── auth.service.ts             ← Login, logout, refreshToken, isLoggedIn
        │   │   ├── auth.guard.ts               ← Redirige si no autenticado
        │   │   ├── role.guard.ts               ← Redirige si no tiene el rol requerido
        │   │   └── models/
        │   │       ├── login-request.model.ts
        │   │       └── auth-response.model.ts  ← accessToken, refreshToken, role, expiresIn
        │   ├── interceptors/
        │   │   ├── jwt.interceptor.ts          ← Agrega Bearer token a cada request
        │   │   ├── refresh-token.interceptor.ts← Maneja 401 y refresca token
        │   │   └── session-timeout.interceptor.ts ← Detecta inactividad, cierra sesión a 5min
        │   └── services/
        │       ├── nps.service.ts              ← submitVote(), getNpsResult(), getVoteStatus()
        │       └── storage.service.ts          ← Wrapper de sessionStorage (token, role, user)
        │
        ├── shared/                             ← Componentes reutilizables
        │   ├── shared.module.ts
        │   └── components/
        │       ├── navbar/
        │       │   ├── navbar.component.ts
        │       │   └── navbar.component.html
        │       └── session-timeout-dialog/     ← Alerta "tu sesión expirará en X seg"
        │           ├── session-timeout-dialog.component.ts
        │           └── session-timeout-dialog.component.html
        │
        └── features/                           ← Módulos por funcionalidad
            ├── auth/
            │   ├── auth.module.ts
            │   └── login/
            │       ├── login.component.ts      ← Formulario usuario + contraseña
            │       ├── login.component.html    ← Pantalla de login
            │       └── login.component.scss
            │
            ├── survey/                         ← Solo rol VOTER
            │   ├── survey.module.ts
            │   └── survey/
            │       ├── survey.component.ts     ← Pregunta centrada + escala 0-10 seleccionable
            │       ├── survey.component.html
            │       └── survey.component.scss
            │
            ├── results/                        ← Solo rol ADMIN
            │   ├── results.module.ts
            │   └── dashboard/
            │       ├── dashboard.component.ts  ← Muestra NPS Score + breakdown
            │       ├── dashboard.component.html
            │       └── dashboard.component.scss
            │
            └── already-voted/                  ← Pantalla si votante ya votó
                ├── already-voted.component.ts
                └── already-voted.component.html
```

---

## 📦 PAQUETES NPM — Frontend

```json
{
  "dependencies": {
    "@angular/core": "^16.0.0",
    "@angular/common": "^16.0.0",
    "@angular/forms": "^16.0.0",
    "@angular/router": "^16.0.0",
    "@angular/animations": "^16.0.0",
    "rxjs": "~7.8.0"
  },
  "devDependencies": {
    "@angular/cli": "^16.0.0",
    "typescript": "~5.1.0"
  }
}
```

> Nota: El ejercicio pide usar Angular sin librerías de componentes externas para demostrar habilidad pura. Puedes agregar Angular Material si tu evaluador lo permite.

---

## 🟢 BASE DE DATOS — Oracle

```
database/oracle/
├── 00_create_tables.sql            ← Creación de tablas
├── 01_sequences.sql                ← Secuencias Oracle (en lugar de IDENTITY)
├── 02_constraints.sql              ← PK, FK, CHECK constraints
├── 03_indexes.sql                  ← Índices de performance
├── 04_seed_users.sql               ← Usuario admin y votantes de prueba
└── 05_stored_procedures.sql        ← Procedimientos opcionales
```

### Tablas Oracle

```sql
-- USERS
CREATE TABLE NPS_USERS (
    ID              NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USERNAME        VARCHAR2(100)   NOT NULL UNIQUE,
    PASSWORD_HASH   VARCHAR2(256)   NOT NULL,
    ROLE            VARCHAR2(20)    NOT NULL CHECK (ROLE IN ('ADMIN','VOTER')),
    IS_LOCKED       NUMBER(1)       DEFAULT 0 NOT NULL,
    FAILED_ATTEMPTS NUMBER(1)       DEFAULT 0 NOT NULL,
    CREATED_AT      TIMESTAMP       DEFAULT SYSTIMESTAMP NOT NULL
);

-- VOTES
CREATE TABLE NPS_VOTES (
    ID          NUMBER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID     NUMBER      NOT NULL REFERENCES NPS_USERS(ID),
    SCORE       NUMBER(2)   NOT NULL CHECK (SCORE BETWEEN 0 AND 10),
    CREATED_AT  TIMESTAMP   DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT UQ_USER_VOTE UNIQUE (USER_ID)      -- Un voto por usuario
);

-- REFRESH TOKENS
CREATE TABLE NPS_REFRESH_TOKENS (
    ID          NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID     NUMBER          NOT NULL REFERENCES NPS_USERS(ID),
    TOKEN       VARCHAR2(512)   NOT NULL UNIQUE,
    EXPIRES_AT  TIMESTAMP       NOT NULL,
    IS_REVOKED  NUMBER(1)       DEFAULT 0 NOT NULL,
    CREATED_AT  TIMESTAMP       DEFAULT SYSTIMESTAMP NOT NULL
);

-- LOGIN ATTEMPTS
CREATE TABLE NPS_LOGIN_ATTEMPTS (
    ID              NUMBER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID         NUMBER      NOT NULL REFERENCES NPS_USERS(ID),
    ATTEMPTED_AT    TIMESTAMP   DEFAULT SYSTIMESTAMP NOT NULL,
    SUCCESS         NUMBER(1)   NOT NULL
);
```

---

## 🔐 SEGURIDAD — Implementación requerida

| Requisito | Implementación |
|-----------|---------------|
| JWT por petición | `JwtService.cs` genera token firmado con `HS256`, exp: 5 min |
| Refresh Token | `RefreshTokenCommandHandler` verifica token no expirado ni revocado |
| Sesión 5 minutos | `session-timeout.interceptor.ts` detecta inactividad con `fromEvent(document, 'click/keyup/mousemove')` |
| Bloqueo 3 intentos | `LoginCommandHandler` cuenta intentos fallidos, setea `IS_LOCKED=1` al 3er fallo |
| Un voto por usuario | Constraint `UNIQUE(USER_ID)` en tabla `NPS_VOTES` + validación en `SubmitVoteCommandHandler` |
| Roles | Enum `UserRole` + `[Authorize(Roles = "Admin")]` en `NpsController` |

---

## 🔄 FLUJO DE AUTENTICACIÓN

```
Angular Login → POST /api/auth/login
    ↓
Backend verifica: usuario existe, no bloqueado, contraseña correcta
    ↓ (fallo) → registra intento, bloquea al 3er fallo → 401
    ↓ (éxito) → genera JWT (5min) + RefreshToken (7 días) → 200
    ↓
Angular guarda tokens en sessionStorage
    ↓
Cada request → jwt.interceptor.ts agrega Bearer token
    ↓ (401) → refresh-token.interceptor.ts llama POST /api/auth/refresh
    ↓ (refresh ok) → reintenta request original
    ↓ (refresh expirado) → logout, redirect a /login
```

---

## 📐 RUTAS ANGULAR

```typescript
const routes: Routes = [
  { path: 'login',   loadChildren: () => import('./features/auth/auth.module') },
  {
    path: 'survey',
    loadChildren: () => import('./features/survey/survey.module'),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'VOTER' }
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/results/results.module'),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  { path: '',         redirectTo: 'login', pathMatch: 'full' },
  { path: '**',       redirectTo: 'login' }
];
```

---

## 📋 ENDPOINTS REST

| Método | Endpoint | Auth | Rol | Descripción |
|--------|----------|------|-----|-------------|
| POST | `/api/auth/login` | No | - | Login, retorna JWT + RefreshToken |
| POST | `/api/auth/refresh` | No | - | Refresca JWT con RefreshToken válido |
| POST | `/api/auth/logout` | Sí | Any | Revoca RefreshToken |
| POST | `/api/votes` | Sí | Voter | Registra voto (0-10) |
| GET | `/api/votes/status` | Sí | Voter | ¿Ya votó el usuario? |
| GET | `/api/nps/result` | Sí | Admin | Resultado NPS completo |

---

## ⚙️ appsettings.json

```json
{
  "ConnectionStrings": {
    "OracleConnection": "Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=XEPDB1)));User Id=nps_user;Password=nps_pass;"
  },
  "JwtSettings": {
    "SecretKey": "TU_CLAVE_SECRETA_MINIMO_32_CARACTERES",
    "Issuer": "NPS.API",
    "Audience": "NPS.Client",
    "AccessTokenExpirationMinutes": 5,
    "RefreshTokenExpirationDays": 7
  }
}
```

---

## 🚀 ORDEN DE DESARROLLO SUGERIDO

1. **Base de datos** → Ejecutar scripts Oracle en orden (00 → 04)
2. **Domain** → Entities, Enums, Interfaces
3. **Infrastructure** → OracleConnectionFactory, Repositories con Dapper
4. **Application** → Commands/Queries con MediatR, Validators, Mappings
5. **API** → Controllers, Middleware, Program.cs, JWT config
6. **Frontend** → Core (AuthService, Interceptors, Guards) → Features (Login, Survey, Dashboard)

---

*Generado para ejercicio DEV-001 — Cibergestion | Stack: .NET 9 + Angular 16 + Oracle*
