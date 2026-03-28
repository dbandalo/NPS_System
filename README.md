# Sistema NPS — Ejercicio práctico DEV-001 (Full Stack)

**Para quienes evalúan o despliegan la solución:** toda la información necesaria para clonar, preparar la base de datos, ejecutar backend y frontend está en este archivo. No es obligatorio otro documento.

---

## Qué incluye el repositorio

- **Backend:** ASP.NET Core Web API (.NET 6), Clean Architecture, Dapper, MediatR, AutoMapper, FluentValidation, JWT y refresh token, SQL Server.
- **Frontend:** Angular 16+ (login, encuesta NPS para votante, dashboard para administrador).
- **Base de datos:** scripts T-SQL en la ruta indicada abajo.

Código principal: carpeta `NPS-System/NPS-System/` (solución `NPS.sln`, API, Angular y `database/`).

---

## Requisitos en el equipo donde se pruebe

| Componente | Versión / notas |
|------------|-----------------|
| .NET SDK | 6.0 o superior (`dotnet --version`) |
| Node.js | 18 o superior + npm |
| SQL Server | 2019+ (o LocalDB); acceso para crear BD y ejecutar scripts |
| Git | Opcional; para clonar el repositorio |

---

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <CARPETA_DEL_REPO>
```

A partir de la raíz del repo, la ruta de trabajo del proyecto es:

`NPS-System/NPS-System/`

---

## 2. Base de datos (SQL Server)

1. Abrir **SQL Server Management Studio** (o `sqlcmd`) con permisos para crear base y tablas.
2. Ejecutar **en este orden** los scripts:

   | Orden | Archivo |
   |------|---------|
   | 1 | `NPS-System/NPS-System/database/01_CreateDatabase.sql` |
   | 2 | `NPS-System/NPS-System/database/02_SeedData.sql` |
   | 3 | `NPS-System/NPS-System/database/03_StoredProcedures.sql` — **opcional** (el API no depende de estos procedimientos para funcionar) |

3. Por defecto los scripts crean/usar la base **`NPSDatabase`**.

4. Ajustar la cadena de conexión en:

   `NPS-System/NPS-System/src/NPS.API/appsettings.json`

   Clave: `ConnectionStrings:DefaultConnection`.

   Ejemplo con autenticación Windows e instancia local:

   `Server=localhost;Database=NPSDatabase;Trusted_Connection=True;TrustServerCertificate=True;`

   Si usan instancia con nombre o usuario SQL, modificar `Server=`, `User Id=` y `Password=` según corresponda.

---

## 3. Backend (API)

Desde la raíz del repositorio:

```bash
cd NPS-System/NPS-System
dotnet restore
dotnet run --project src/NPS.API/NPS.API.csproj
```

- En desarrollo, la API suele publicarse en **https://localhost:7001** y/o **http://localhost:5001** (ver consola al arrancar; también `src/NPS.API/Properties/launchSettings.json`).
- **Swagger** (solo entorno Development): abrir en el navegador la URL que muestre la consola, por ejemplo `https://localhost:7001/swagger`.

### Certificado HTTPS de desarrollo (Windows / macOS)

Si el navegador marca error de certificado al llamar al API:

```bash
dotnet dev-certs https --trust
```

---

## 4. Frontend (Angular)

En **otra terminal**, desde la raíz del repo:

```bash
cd NPS-System/NPS-System/frontend
npm install
npx ng serve
```

- Aplicación: **http://localhost:4200**
- La URL del API está en `frontend/src/environments/environment.ts` (`apiUrl`). Por defecto: `https://localhost:7001/api`. Si el API corre en otro puerto o solo HTTP, cambiar `apiUrl` para que coincida.

---

## 5. Usuarios de prueba (datos semilla)

Definidos en `02_SeedData.sql`. Contraseña común indicada en ese script:

| Usuario   | Rol        | Notas |
|-----------|------------|--------|
| `admin`   | Admin      | Acceso al dashboard NPS |
| `votante1` … `votante5` | Votante | Encuesta NPS (un voto por usuario) |

**Contraseña (según el script de semilla):** `Password123!`

Si el login falla, verificar que `02_SeedData.sql` se ejecutó correctamente y que los hashes BCrypt del script no fueron modificados.

---

## 6. Comprobación rápida del flujo

1. Abrir `http://localhost:4200`.
2. Iniciar sesión como **votante** → pantalla de encuesta (0–10), enviar un voto.
3. Cerrar sesión o usar otro navegador; iniciar como **admin** → ver resultados NPS en el dashboard.
4. Opcional: probar endpoints en Swagger con el token JWT (login → copiar `accessToken` → Authorize).

---

## 7. CORS

El API permite origen `http://localhost:4200` (configurado en `Program.cs`). El front debe servirse desde ese origen o habría que ampliar la política CORS en el API.

---

## 8. Enlaces útiles en el código

| Recurso | Ubicación |
|---------|-----------|
| Scripts SQL | `NPS-System/NPS-System/database/` |
| API | `NPS-System/NPS-System/src/NPS.API/` |
| Angular | `NPS-System/NPS-System/frontend/` |
| Rutas extra (compatibilidad especificación) | `POST /api/auth/refresh`, `GET /api/votes/status`, `GET /api/nps/result` (además de `refresh-token`, `has-voted`, `votes/results`) |
