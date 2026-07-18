// Typed, centralised configuration. Everything read from env happens here;
// the rest of the app injects ConfigService and asks for a key.

export interface AppConfig {
  env: 'development' | 'production' | 'test'
  port: number
  frontendUrl: string
  jwt: {
    secret: string
    expiresIn: string
  }
  /** First-boot owner credentials — used only by the seed when the users table is empty. */
  admin: {
    email: string | undefined
    password: string | undefined
  }
  db: {
    host: string
    port: number
    user: string
    password: string
    name: string
    synchronize: boolean
  }
  wompi: {
    publicKey: string | undefined
    privateKey: string | undefined
    integritySecret: string | undefined
    eventsSecret: string | undefined
  }
  /** Public web app base URL — target of fire-and-forget ISR revalidation calls. */
  webUrl: string | undefined
  revalidationSecret: string | undefined
  uploadsDir: string
}

const DEV_JWT_SECRET = 'dev-only-secret-not-for-production'

const configuration = (): AppConfig => {
  const env = (process.env['NODE_ENV'] ?? 'development') as AppConfig['env']
  const isProd = env === 'production'

  return {
    env,
    port: Number.parseInt(process.env['PORT'] ?? '3001', 10),
    frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    jwt: {
      secret: (() => {
        const secret = process.env['JWT_SECRET']
        if (isProd && (!secret || secret === DEV_JWT_SECRET)) {
          throw new Error(
            'JWT_SECRET is missing or set to the development default — refusing to start in ' +
              'production. Set a real secret (min 32 random chars) via the JWT_SECRET env var.'
          )
        }
        return secret ?? DEV_JWT_SECRET
      })(),
      expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
    },
    admin: {
      email: process.env['ADMIN_EMAIL'],
      password: process.env['ADMIN_PASSWORD'],
    },
    db: (() => {
      // Fail fast: synchronize can ALTER/DROP live columns and bypasses migrations.
      // It must be impossible in production, regardless of how the env is wired.
      if (isProd && process.env['DB_SYNCHRONIZE'] === 'true') {
        throw new Error(
          'DB_SYNCHRONIZE=true is forbidden in production — TypeORM synchronize can ALTER/DROP ' +
            'live columns and silently bypasses migrations. Unset it; the schema is owned by ' +
            'migrations, run once by the container entrypoint (node dist/database/migrate.js).'
        )
      }
      return {
        host: process.env['DB_HOST'] ?? 'localhost',
        port: Number.parseInt(process.env['DB_PORT'] ?? '5432', 10),
        user: process.env['DB_USER'] ?? 'postgres',
        password: process.env['DB_PASSWORD'] ?? 'postgres',
        name: process.env['DB_NAME'] ?? 'box33',
        // synchronize is ONLY ever enabled outside production (local dev / CI bootstrap),
        // and can be turned off there with DB_SYNCHRONIZE=false.
        synchronize: !isProd && process.env['DB_SYNCHRONIZE'] !== 'false',
      }
    })(),
    wompi: {
      publicKey: process.env['WOMPI_PUBLIC_KEY'],
      privateKey: process.env['WOMPI_PRIVATE_KEY'],
      integritySecret: process.env['WOMPI_INTEGRITY_SECRET'],
      eventsSecret: process.env['WOMPI_EVENTS_SECRET'],
    },
    webUrl: process.env['WEB_URL'],
    revalidationSecret: process.env['REVALIDATION_SECRET'],
    uploadsDir: process.env['UPLOADS_DIR'] ?? './data/uploads',
  }
}

export default configuration
