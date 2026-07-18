import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { DataSource, Repository } from 'typeorm'
import type { ProductCategory } from '@box33/types'
import type { AppConfig } from '../config/configuration'
import { AuthService } from '../auth/auth.service'
import { User } from '../auth/entities/user.entity'
import { SiteSettings } from '../content/entities/site-settings.entity'
import { Wod } from '../content/entities/wod.entity'
import { Challenge } from '../content/entities/challenge.entity'
import { Podium } from '../content/entities/podium.entity'
import { Schedule } from '../content/entities/schedule.entity'
import { Plan } from '../content/entities/plan.entity'
import { Product } from '../products/entities/product.entity'

/** Serializes concurrent replicas racing to seed on first boot. */
const SEED_LOCK_KEY = 733100902

interface ProductSeedRow {
  name: string
  slug: string
  gender: 'm' | 'h'
  category: ProductCategory
  imageUrl: string
  priceCents: number
  currency: string
  sizes: string[]
  featured: boolean
  sortOrder: number
}

/**
 * First-boot seed, IN SPANISH, straight from the design handoff: owner user,
 * site content defaults and the 43-product apparel catalog. Runs before
 * listen() (OnApplicationBootstrap), so /health/ready == 200 implies seeded.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly authService: AuthService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(SiteSettings) private readonly settings: Repository<SiteSettings>,
    @InjectRepository(Wod) private readonly wods: Repository<Wod>,
    @InjectRepository(Challenge) private readonly challenges: Repository<Challenge>,
    @InjectRepository(Podium) private readonly podiums: Repository<Podium>,
    @InjectRepository(Schedule) private readonly schedules: Repository<Schedule>,
    @InjectRepository(Plan) private readonly plans: Repository<Plan>,
    @InjectRepository(Product) private readonly products: Repository<Product>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.dataSource.query('SELECT pg_advisory_lock($1)', [SEED_LOCK_KEY])
    try {
      await this.seedOwner()
      await this.seedContent()
      await this.seedProducts()
    } finally {
      await this.dataSource.query('SELECT pg_advisory_unlock($1)', [SEED_LOCK_KEY])
    }
  }

  private async seedOwner(): Promise<void> {
    if ((await this.users.count()) > 0) return
    const { email, password } = this.config.get('admin', { infer: true })
    if (!email || !password) {
      this.logger.error(
        'No user exists and ADMIN_EMAIL/ADMIN_PASSWORD are unset — the dashboard will be inaccessible until they are provided and the API restarts.'
      )
      return
    }
    const passwordHash = await this.authService.hashPassword(password)
    await this.users.save(
      this.users.create({ email: email.toLowerCase(), passwordHash, name: 'Coach', role: 'owner' })
    )
    this.logger.log(`✓ Seeded owner user ${email}`)
  }

  private async seedContent(): Promise<void> {
    if ((await this.settings.count()) > 0) return

    await this.settings.save(
      this.settings.create({ whatsappNumber: '573113018283', instagramHandle: 'box33cf' })
    )
    await this.wods.save(
      this.wods.create({
        title: 'AMRAP 16 min',
        text: '400 m run\n12 wall balls (9/6 kg)\n9 box jump overs\n6 devil press\n\nBuy-out: 40 double unders',
      })
    )
    await this.challenges.save(
      this.challenges.create({
        title: '100 Wall Balls por tiempo',
        description:
          'Anótalo en tu cuaderno del box. Escálalo a tu nivel — aquí compites contigo mismo, no contra nadie más. El que lo cierre entra al muro de la semana.',
        goal: 'Sub 5:00',
        prize: 'Shoutout + camiseta BOX33',
      })
    )
    await this.podiums.save(
      this.podiums.create({
        month: '',
        entries: [
          { place: 1, name: 'Laura G.', achievement: '22 WODs · 4 PRs este mes', photoUrl: null },
          { place: 2, name: 'Andrés M.', achievement: '20 WODs · 3 PRs', photoUrl: null },
          {
            place: 3,
            name: 'Camila R.',
            achievement: '19 WODs · primer muscle-up',
            photoUrl: null,
          },
        ],
        mentions: [
          { name: 'Juan S.', achievement: '18 WODs seguidos' },
          { name: 'Sara P.', achievement: '+12 kg en clean' },
          { name: 'Diego T.', achievement: 'primer pull-up' },
        ],
      })
    )
    await this.schedules.save(
      this.schedules.create({
        morning: ['5:30', '6:30', '7:30', '8:30', '9:30'],
        evening: ['3:30', '4:30', '5:30', '6:30', '7:30'],
        openBoxStart: '10:30',
        openBoxEnd: '13:00',
      })
    )
    await this.plans.save([
      this.plans.create({
        key: 'single',
        name: 'Clase suelta',
        tagline: 'Prueba sin compromiso',
        priceCents: 2_000_000,
        currency: 'COP',
        unit: 'class',
        features: ['1 clase guiada', 'Escalada a tu nivel', 'Sin matrícula'],
        popular: false,
        sortOrder: 0,
      }),
      this.plans.create({
        key: 'monthly',
        name: 'Mensualidad',
        tagline: 'Entrena a diario',
        priceCents: 15_000_000,
        currency: 'COP',
        unit: 'month',
        features: [
          'Clases ilimitadas',
          'Open box libre',
          'Seguimiento del coach',
          'Acceso a retos y podio',
        ],
        popular: true,
        sortOrder: 1,
      }),
      this.plans.create({
        key: 'three-week',
        name: '3x Semana',
        tagline: 'El equilibrio perfecto',
        priceCents: 11_000_000,
        currency: 'COP',
        unit: 'month',
        features: ['12 clases al mes', 'Open box libre', 'Seguimiento del coach'],
        popular: false,
        sortOrder: 2,
      }),
      this.plans.create({
        key: 'quarterly',
        name: 'Trimestre',
        tagline: 'Compromiso total · ahorra',
        priceCents: 39_000_000,
        currency: 'COP',
        unit: 'quarter',
        features: ['Todo ilimitado', 'Open box libre', '3 meses de comunidad', 'El mejor precio'],
        popular: false,
        sortOrder: 3,
      }),
    ])
    this.logger.log('✓ Seeded site content defaults')
  }

  private async seedProducts(): Promise<void> {
    if ((await this.products.count()) > 0) return
    const raw = readFileSync(join(__dirname, 'data/products.seed.json'), 'utf8')
    const rows = JSON.parse(raw) as ProductSeedRow[]
    await this.products.save(
      rows.map((row) =>
        this.products.create({
          name: row.name,
          slug: row.slug,
          gender: row.gender,
          category: row.category,
          priceCents: row.priceCents,
          currency: row.currency,
          imageUrl: row.imageUrl,
          sizes: row.sizes,
          soldOut: false,
          featured: row.featured,
          active: true,
          sortOrder: row.sortOrder,
        })
      )
    )
    this.logger.log(`✓ Seeded ${rows.length} products`)
  }
}
