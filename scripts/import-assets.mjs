/**
 * One-time import of design-handoff assets into apps/web/public.
 * - Copies the 45 product photos, renaming each to its catalog slug.
 * - Copies community carousel photos and the BOX33 logo.
 * - Emits apps/api/src/seed/data/products.seed.json used by the API seeder.
 */
import { mkdirSync, copyFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const HANDOFF = join(ROOT, 'handoff/box33-community-hub-update/project')
const UPLOADS = join(HANDOFF, 'uploads')
const ROPA = join(UPLOADS, 'ROPA BX33-20260711T065715Z-2-001')
const CARRUSELES = join(UPLOADS, 'CARRUSELES-20260711T065726Z-2-001')
const PUBLIC = join(ROOT, 'apps/web/public')

// [source file base name, display name, gender] — verbatim from the design prototype.
const ROWS = [
  ['NIKE TOP VERDE', 'Top Nike Verde', 'm'],
  ['NEW BALANCE TOP LILA CLARO', 'Top New Balance Lila', 'm'],
  ['NEW BALANCE SHORT GRIS AZULADO', 'Short New Balance Gris Azulado', 'm'],
  ['NEW BALANCE TOP ROSADO', 'Top New Balance Rosado', 'm'],
  ['NEW BALANCE TOP GRIS', 'Top New Balance Gris', 'm'],
  ['NEW BALANCE TOP CELESTE', 'Top New Balance Celeste', 'm'],
  ['NEW BALANCE TOP BEIS', 'Top New Balance Beis', 'm'],
  ['ASICS SHORT SALMÓN', 'Short Asics Salmón', 'm'],
  ['NIKE SHORT ROJO', 'Short Nike Rojo', 'm'],
  ['NIKE SHORT NEGRO', 'Short Nike Negro', 'm'],
  ['ASICS SHORT NEGRO', 'Short Asics Negro', 'm'],
  ['ASICS SHORT AZUL GRISACEO', 'Short Asics Azul Grisáceo', 'm'],
  ['NEW BALANCE SHORT ROSADO', 'Short New Balance Rosado', 'm'],
  ['UNDER SHORT NEGRO', 'Short Under Armour Negro', 'm'],
  ['NIKE CAFÉ SHORT', 'Short Nike Café', 'm'],
  ['NEW BALANCE TOP BLANCO', 'Top New Balance Blanco', 'm'],
  ['NEW BALANCE TOP AZUL', 'Top New Balance Azul', 'm'],
  ['NEW BALANCE TOP NEGRO', 'Top New Balance Negro', 'm'],
  ['NIKE SHORT GRIS', 'Short Nike Gris', 'm'],
  ['REEBOK TOP NEGRO', 'Top Reebok Negro', 'm'],
  ['NEW BALANCE TOP AZUL OSCURO', 'Top New Balance Azul Oscuro', 'm'],
  ['PUMA TOP MORADO', 'Top Puma Morado', 'm'],
  ['NIKE SHORT BLANCO', 'Short Nike Blanco', 'm'],
  ['NEW BALANCE TOP BEIS OSCURO', 'Top New Balance Beis Oscuro', 'm'],
  ['NIKE SHORT AZUL REY', 'Short Nike Azul Rey', 'm'],
  ['NIKE BLUSA NEGRA', 'Blusa Nike Negra', 'm'],
  ['PUMA TOP AMARILLO', 'Top Puma Amarillo', 'm'],
  ['ADIDAS BLANCA', 'Camiseta Adidas Blanca', 'h'],
  ['ADIDAS NEGRA', 'Camiseta Adidas Negra', 'h'],
  ['ADIDAS GRIS', 'Camiseta Adidas Gris', 'h'],
  ['REEBOK VERDE', 'Camiseta Reebok Verde', 'h'],
  ['REEBOK CAFÉ', 'Camiseta Reebok Café', 'h'],
  ['REEBOK NEGRA', 'Camiseta Reebok Negra', 'h'],
  ['REEBOOK NEGRA MP', 'Camiseta Reebok Negra MP', 'h'],
  ['UNDER NARANJA', 'Camiseta Under Armour Naranja', 'h'],
  ['JUAN NIKE VERDE', 'Camiseta Nike Manga Larga', 'h'],
  ['CAMISILLA ROJA', 'Camisilla Adidas Roja', 'h'],
  ['PANTA NIKE AZUL', 'Pantaloneta Nike Azul', 'h'],
  ['PANTA RUNNIG NIKE NEGRA', 'Pantaloneta Nike Running Negra', 'h'],
  ['PANTA ASICS GRIS CLARO', 'Pantaloneta Asics Gris', 'h'],
  ['PANTA ADIDAS VERDE', 'Pantaloneta Adidas Verde', 'h'],
  ['PANTA NEW BALANCE AZUL', 'Pantaloneta New Balance Azul', 'h'],
  ['PANTA UNDER VERDE', 'Pantaloneta Under Armour Verde', 'h'],
]

// Featured on the home page ("El perchero") — indices from the prototype.
const FEATURED = new Set([0, 8, 27])

const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const category = (name) => {
  const w = name.split(' ')[0].toLowerCase()
  if (w === 'top' || w === 'blusa') return 'tops'
  if (w === 'short') return 'shorts'
  if (w === 'camiseta' || w === 'camisilla') return 'camisetas'
  if (w === 'pantaloneta') return 'pantalonetas'
  return 'otros'
}

mkdirSync(join(PUBLIC, 'images/products'), { recursive: true })
mkdirSync(join(PUBLIC, 'images/community'), { recursive: true })

const products = []
let missing = 0
for (let i = 0; i < ROWS.length; i++) {
  const [file, name, gender] = ROWS[i]
  const dir = gender === 'm' ? 'PRENDAS MUJER' : 'PRENDAS HOMBRE'
  const src = join(ROPA, dir, `${file}.jpeg`)
  const s = slug(name)
  const dest = join(PUBLIC, 'images/products', `${s}.jpeg`)
  if (!existsSync(src)) {
    console.error(`✗ missing source image: ${src}`)
    missing++
    continue
  }
  copyFileSync(src, dest)
  products.push({
    name,
    slug: s,
    gender,
    category: category(name),
    imageUrl: `/images/products/${s}.jpeg`,
    // 85.000 COP default (prototype's example price) stored in minor units —
    // the owner adjusts real prices from the dashboard.
    priceCents: 8_500_000,
    currency: 'COP',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    featured: FEATURED.has(i),
    sortOrder: i,
  })
}

// Community photos used by the home page (the 4 IG-style polaroids + extras).
const COMMUNITY = [
  ['carrusel 1/1.jpg', 'community-01.jpg'],
  ['carrusel 3/8.jpg', 'community-02.jpg'],
  ['carrusel 4/9.jpg', 'community-03.jpg'],
  ['carrusel 2/4.jpg', 'community-04.jpg'],
  ['carrusel 1/2.jpg', 'community-05.jpg'],
  ['carrusel 2/5.jpg', 'community-06.jpg'],
  ['carrusel 3/9.jpg', 'community-07.jpg'],
  ['carrusel 4/13.jpg', 'community-08.jpg'],
]
for (const [rel, out] of COMMUNITY) {
  const src = join(CARRUSELES, rel)
  if (!existsSync(src)) {
    console.error(`✗ missing community image: ${src}`)
    missing++
    continue
  }
  copyFileSync(src, join(PUBLIC, 'images/community', out))
}

copyFileSync(join(HANDOFF, 'assets/logo-box33.png'), join(PUBLIC, 'images/logo-box33.png'))

const seedDir = join(ROOT, 'apps/api/src/seed/data')
mkdirSync(seedDir, { recursive: true })
writeFileSync(join(seedDir, 'products.seed.json'), JSON.stringify(products, null, 2) + '\n')

console.log(`✓ ${products.length} products imported, ${COMMUNITY.length} community photos, logo copied`)
if (missing > 0) {
  console.error(`✗ ${missing} assets missing`)
  process.exit(1)
}
