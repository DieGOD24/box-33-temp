import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, In, Repository } from 'typeorm'
import type { FindOptionsWhere } from 'typeorm'
import type {
  CreateProductInput,
  Paginated,
  ProductListQuery,
  UpdateProductInput,
} from '@box33/types'
import { Product } from './entities/product.entity'
import { RevalidateService } from '../common/revalidate.service'

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 50
const FEATURED_LIMIT = 6

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    private readonly revalidate: RevalidateService
  ) {}

  // ── Public catalog ──────────────────────────────────────────────────────────

  async list(query: ProductListQuery): Promise<Paginated<Product>> {
    const page = Math.max(1, Math.floor(query.page ?? 1))
    const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(query.limit ?? DEFAULT_LIMIT)))

    const where: FindOptionsWhere<Product> = { active: true }
    if (query.gender) where.gender = query.gender
    if (query.category) where.category = query.category
    if (query.q) where.name = ILike(`%${query.q}%`)

    const [items, total] = await this.products.findAndCount({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) }
  }

  async featured(): Promise<Product[]> {
    return this.products.find({
      where: { active: true, featured: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
      take: FEATURED_LIMIT,
    })
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.products.findOne({ where: { slug, active: true } })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  /** Bulk lookup used by the checkout flow. Returns whatever exists — caller validates. */
  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return []
    return this.products.find({ where: { id: In(ids) } })
  }

  // ── Admin ───────────────────────────────────────────────────────────────────

  async adminList(q?: string): Promise<Product[]> {
    const where: FindOptionsWhere<Product> = {}
    if (q) where.name = ILike(`%${q}%`)
    return this.products.find({ where, order: { sortOrder: 'ASC', name: 'ASC' } })
  }

  async create(input: CreateProductInput): Promise<Product> {
    const slug = await this.uniqueSlug(this.slugify(input.name))
    const product = this.products.create({
      name: input.name,
      slug,
      gender: input.gender,
      category: input.category,
      priceCents: input.priceCents ?? null,
      imageUrl: input.imageUrl ?? null,
      sizes: input.sizes ?? [],
      featured: input.featured ?? false,
      soldOut: input.soldOut ?? false,
      active: input.active ?? true,
      sortOrder: input.sortOrder ?? 0,
    })
    const saved = await this.products.save(product)
    this.triggerRevalidate()
    return saved
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await this.products.findOne({ where: { id } })
    if (!product) throw new NotFoundException('Product not found')
    Object.assign(product, input)
    const saved = await this.products.save(product)
    this.triggerRevalidate()
    return saved
  }

  async remove(id: string): Promise<void> {
    const result = await this.products.delete({ id })
    if (!result.affected) throw new NotFoundException('Product not found')
    this.triggerRevalidate()
  }

  async toggleStock(id: string): Promise<Product> {
    const product = await this.products.findOne({ where: { id } })
    if (!product) throw new NotFoundException('Product not found')
    product.soldOut = !product.soldOut
    const saved = await this.products.save(product)
    this.triggerRevalidate()
    return saved
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** 'Short Asics Salmón' → 'short-asics-salmon' (NFD diacritics strip). */
  private slugify(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /** Appends -2 / -3 / … until the slug is free. */
  private async uniqueSlug(base: string): Promise<string> {
    const root = base || 'producto'
    let slug = root
    let n = 2
    while (await this.products.findOne({ where: { slug } })) {
      slug = `${root}-${n}`
      n += 1
    }
    return slug
  }

  private triggerRevalidate(): void {
    void this.revalidate.revalidate(['products', 'content'])
  }
}
