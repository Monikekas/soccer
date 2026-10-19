
# Soccer

Aplicación de gestión de ligas, equipos e inscripciones.

## Tecnologías

- Angular
- Angular Material
- ASP.NET Core 10
- Entity Framework Core
- SQL Server 2022
- Docker Compose

## Requisitos

- Git
- Docker Engine
- Docker Compose

## Configuración

Clona el repositorio y entra en la carpeta del proyecto:

```bash
git clone https://github.com/Monikekas/soccer.git
cd soccer
```

## Iniciar los servicios

```bash
docker compose up --build -d
```

Consultar los contenedores:

```bash
docker compose ps
```

Consultar los registros:

```bash
docker compose logs -f
```

## Direcciones locales

- Angular: http://localhost:4200
- API: http://localhost:5188
- OpenAPI: http://localhost:5188/openapi/v1.json
- SQL Server: localhost:1433

## Detener los servicios

```bash
docker compose down
```

Los datos de SQL Server se almacenan en un volumen de Docker.

No uses `docker compose down -v` si deseas conservar los datos.

## Base de datos

La API utiliza Entity Framework Core y la cadena de conexión `ConnectionStrings:SoccerDb`.

Para una instalación nueva se debe restaurar o crear la base de datos y aplicar los scripts o migraciones necesarios.

## Notas

Este proyecto está preparado para pruebas locales. No debe exponerse directamente a Internet con las credenciales de desarrollo.
