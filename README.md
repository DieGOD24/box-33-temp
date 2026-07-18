# BOX33 — CrossFit Community Hub

Sitio público + tienda con pagos **Wompi** + panel del dueño ("Panel del coach"), bilingüe (ES por defecto, EN en `/en`).

Monorepo **Turborepo + pnpm**:

| Paquete                      | Qué es                                      | Puerto |
| ---------------------------- | ------------------------------------------- | ------ |
| `apps/web`                   | Next.js (App Router, next-intl, Tailwind 4) | 3000   |
| `apps/api`                   | NestJS (TypeORM + Postgres, JWT, Wompi)     | 3001   |
| `packages/types`             | Tipos compartidos (`@box33/types`)          | —      |
| `packages/typescript-config` | Presets de tsconfig                         | —      |

## Correr en local

### Opción A — Todo en Docker (lo más parecido a producción)

```bash
docker compose up --build
```

- Web: http://localhost:3000
- API + Swagger: http://localhost:3001/api/docs
- Postgres queda en `localhost:5433` (usuario/clave/db: `box33`)

El seed corre solo en el primer arranque: crea el usuario dueño
(**coach@box33.fit / box33-dev-password** en dev), todo el contenido del sitio
(WOD, reto, podio, horarios, planes) y las 43 prendas del catálogo.

### Opción B — Desarrollo con pnpm (hot reload)

```bash
# 1. Solo la base de datos en Docker
docker compose up -d postgres

# 2. Variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# En apps/api/.env pon como mínimo:
#   JWT_SECRET=cualquier-cadena-larga-de-mas-de-32-caracteres
#   ADMIN_PASSWORD=tu-clave-local
#   DB_SYNCHRONIZE=true        ← crea el esquema solo, sin migraciones (solo dev)
# En apps/web/.env.local pon REVALIDATION_SECRET (mín. 32 chars)

# 3. A correr
pnpm install
pnpm dev          # levanta API (3001) y Web (3000) con watch
```

### Panel del coach

http://localhost:3000/admin → entra con `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
Desde ahí se edita **todo**: pizarra (WOD), reto semanal, podio (con fotos),
planes y precios, horarios, inventario completo de la tienda, pedidos,
preinscritos y el número de WhatsApp del sitio.

### Wompi (pagos de la tienda)

Sin llaves configuradas, el checkout muestra aviso y la tienda sigue vendiendo
por WhatsApp. Para activar pagos en línea pon en `apps/api/.env` (o en el
compose) las llaves de tu comercio Wompi:

```
WOMPI_PUBLIC_KEY=pub_test_…      # pub_prod_… en producción
WOMPI_PRIVATE_KEY=prv_test_…
WOMPI_INTEGRITY_SECRET=…
WOMPI_EVENTS_SECRET=…
```

y registra el webhook de eventos en el panel de Wompi apuntando a
`https://<tu-api>/api/payments/wompi/events`. En sandbox puedes pagar con las
tarjetas de prueba de Wompi (`4242 4242 4242 4242`, cualquier CVC/fecha futura).

## Comandos útiles

```bash
pnpm typecheck        # tipos en todo el monorepo
pnpm lint             # eslint
pnpm test             # unit tests (vitest)
pnpm build            # build de todo
pnpm --filter @box33/web e2e                       # Playwright (stack corriendo)
pnpm --filter @box33/api migration:generate src/database/migrations/Nombre
pnpm --filter @box33/api migration:run
```

## Idiomas

Todo el copy vive en `apps/web/messages/{es,en}.json`. `/` es español,
`/en` es inglés; el switcher está en el header. CI falla si los dos
catálogos no tienen exactamente las mismas claves.

## CI/CD

`.github/workflows/ci.yml`: lint → typecheck → build → tests (web y API),
completitud i18n, auditoría de `.env.example`, drift de migraciones TypeORM,
builds Docker con smoke tests, boot de integración del artefacto real,
gitleaks, hadolint, actionlint y E2E Playwright sobre el stack completo —
con `ci-success` como único required check. `release.yml` (release-please)
versiona y `publish.yml` publica imágenes firmadas (cosign) y escaneadas
(Trivy) a ghcr.io.

## Producción

```bash
docker compose -f docker-compose.prod.yml up -d
```

Requiere: `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
`REVALIDATION_SECRET`, `NEXT_PUBLIC_SITE_URL` (y las llaves Wompi). La API
corre migraciones al arrancar (con advisory lock) antes de aceptar tráfico.
