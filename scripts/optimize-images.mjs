// Converts curated real photographs into cohesive, warm-dark WebP assets in /public/images.
// Every photo is self-hosted locally (no external hotlinking) and receives a subtle editorial
// warm-charcoal grade + soft corner vignette so the entire site shares Grilli's lighting mood.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const G = path.resolve(root, '../grilli/assets/images')
const L = path.resolve(root, '../LUN-RA-Hotel-website/public/images')
const U = path.resolve(root, '_staging/unsplash')
const C = path.resolve(root, '_staging/curated')
const out = path.resolve(root, 'public/images')

const u = (id) => path.join(U, `photo-${id}.jpg`)
const c = (name) => path.join(C, `${name}.jpg`)

function vignetteSvg(w, h, strength = 0.32) {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="v" cx="50%" cy="50%" r="72%">
          <stop offset="45%" stop-color="#0e0c0a" stop-opacity="0"/>
          <stop offset="100%" stop-color="#0b0908" stop-opacity="${strength}"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#v)"/>
    </svg>`,
  )
}

/**
 * [output name, source file, max width, quality, grade options]
 * grade: { brightness, saturation, warm, vignette, cropBottom }
 */
const jobs = [
  // Hero (Grilli originals — already signature dark slate)
  ['hero-1', path.join(G, 'hero-slider-1.jpg'), 1920, 78, { vignette: 0.18 }],
  ['hero-2', path.join(G, 'hero-slider-2.jpg'), 1920, 78, { vignette: 0.18 }],
  ['hero-3', path.join(G, 'hero-slider-3.jpg'), 1920, 78, { vignette: 0.18 }],

  // Culinary Pillars (Grilli 3-column intro between Hero & Story)
  ['pillar-1', c('us-grill-flame'), 900, 78, { brightness: 0.96, vignette: 0.28 }],
  ['pillar-2', path.join(G, 'service-2.jpg'), 900, 80, { vignette: 0.2 }],
  ['pillar-3', path.join(G, 'service-3.jpg'), 900, 80, { vignette: 0.2 }],

  // Story (Real charcoal grill embers + steak plating hands — zero Western chef mismatch)
  ['story-main', c('us-grill-sizzle'), 1000, 80, { brightness: 0.96, vignette: 0.28 }],
  ['story-small', c('ss-steak-pass'), 500, 82, { brightness: 0.88, warm: true, vignette: 0.36 }],

  // Signature Dishes (4 dark-plated / charcoal-grilled hero dishes)
  ['sig-wagyu', u('1558030006-450675393462'), 1400, 80, { vignette: 0.26 }],
  ['sig-salmon', u('1519708227418-c8fd9a32b7a2'), 1400, 80, { vignette: 0.22 }],
  ['sig-seabass', c('px-grill-fish'), 1400, 80, { brightness: 0.92, warm: true, vignette: 0.34 }],
  ['sig-mousse', u('1565958011703-44f9829ba187'), 1400, 80, { brightness: 0.94, vignette: 0.28 }],

  // Menu (20 items — cohesive warm-dark editorial food grading)
  ['menu-tomato-soup', u('1534939561126-855b8675edd7'), 800, 78, { brightness: 0.92, vignette: 0.34 }],
  ['menu-sprout-salad', u('1540189549336-e6e99c3679fe'), 800, 78, { brightness: 0.92, vignette: 0.32 }],
  ['menu-dumplings', u('1534422298391-e4f8c172dddb'), 800, 78, { brightness: 0.94, vignette: 0.3 }],
  ['menu-avocado-salad', u('1512621776951-a57141f2eefd'), 800, 78, { brightness: 0.84, warm: true, vignette: 0.42 }],
  ['menu-ribs', u('1544025162-d76694265947'), 800, 78, { brightness: 0.92, vignette: 0.32 }],
  ['menu-skewers', c('px-yakitori'), 800, 78, { brightness: 0.86, warm: true, vignette: 0.44 }],
  ['menu-chicken', u('1598103442097-8b74394b95c6'), 800, 78, { brightness: 0.94, vignette: 0.3 }],
  ['menu-tagliatelle', u('1551183053-bf91a1d81141'), 800, 78, { brightness: 0.9, vignette: 0.34 }],
  ['menu-risotto', c('us-risotto-dk'), 800, 78, { brightness: 0.88, warm: true, vignette: 0.42 }],
  ['menu-pannacotta', u('1488477181946-6428a0291777'), 800, 78, { brightness: 0.9, vignette: 0.34 }],
  ['menu-brownie', u('1606313564200-e75d5e30476c'), 800, 78, { brightness: 0.92, vignette: 0.32 }],
  ['menu-old-fashioned', u('1470337458703-46ad1756a187'), 800, 78, { vignette: 0.24 }],
  ['menu-orange-cocktail', u('1514362545857-3bc16c4c7d1b'), 800, 78, { vignette: 0.24 }],
  ['menu-spritz', u('1560512823-829485b8bf24'), 800, 78, { brightness: 0.92, vignette: 0.3 }],
  ['menu-watermelon', u('1527661591475-527312dd65f5'), 800, 78, { brightness: 0.9, vignette: 0.34 }],
  ['menu-red-wine', u('1510812431401-41d2bd2722f3'), 800, 78, { vignette: 0.26 }],

  // Chef (Roaring charcoal grill & steaks in smoky dark kitchen — matches Trần Minh Khôi's charcoal story)
  ['chef', c('px-chef-smoke'), 1100, 82, { brightness: 0.95, warm: true, vignette: 0.3 }],

  // Gallery (16 distinct photos — zero duplicates across Story/Experience, cohesive evening grade)
  ['gal-room-dark', u('1517248135467-4c7edcad34c4'), 1400, 78, { vignette: 0.25 }],
  ['gal-room-window', c('px-din1'), 1400, 78, { cropBottom: 0.62, brightness: 0.9, warm: true, vignette: 0.36 }],
  ['gal-room-warm', u('1555396273-367ea4eb4db5'), 1400, 78, { brightness: 0.88, warm: true, vignette: 0.36 }],
  ['gal-room-top', path.join(L, 'dining-top.jpg'), 1100, 78, { brightness: 0.92, vignette: 0.28 }],
  ['gal-table', u('1414235077428-338989a2e8c0'), 1400, 78, { brightness: 0.92, vignette: 0.3 }],
  ['gal-steak-spread', u('1504674900247-0877df9cc836'), 1400, 78, { brightness: 0.88, warm: true, vignette: 0.36 }],
  ['gal-grill-platter', u('1555939594-58d7cb561ad1'), 1100, 78, { brightness: 0.92, vignette: 0.3 }],
  ['gal-pasta', u('1481931098730-318b6f776db0'), 1100, 78, { brightness: 0.9, vignette: 0.32 }],
  ['gal-shrimp', u('1535400255456-984241443b29'), 1400, 78, { brightness: 0.92, vignette: 0.3 }],
  ['gal-bar', u('1551024709-8f23befc6f87'), 1400, 78, { brightness: 0.92, vignette: 0.3 }],
  ['gal-whisky', u('1470337458703-46ad1756a187'), 1400, 78, { vignette: 0.26 }],
  ['gal-spritz', path.join(G, 'event-1.jpg'), 1200, 78, { brightness: 0.92, vignette: 0.3 }],
  ['gal-flames', c('rp-fire-wok'), 1400, 78, { brightness: 0.94, vignette: 0.3 }],
  ['gal-chopping', u('1551218808-94e220e084d2'), 1100, 78, { brightness: 0.86, warm: true, vignette: 0.4 }],
  ['gal-grill', u('1599487488170-d11ec9c172f0'), 1400, 78, { brightness: 0.88, warm: true, vignette: 0.38 }],
  ['gal-toast', c('px-din3'), 1400, 78, { brightness: 0.98, vignette: 0.22 }],

  // Experience (4 distinct dark-evening experiences)
  ['exp-chef-table', c('ss-chef-dark'), 1000, 80, { brightness: 0.94, warm: true, vignette: 0.34 }],
  ['exp-private', path.join(L, 'dish.jpg'), 1000, 78, { brightness: 0.94, vignette: 0.28 }],
  ['exp-wine', c('us-wine-cellar'), 1000, 78, { brightness: 0.95, warm: true, vignette: 0.28 }],
  ['exp-acoustic', c('us-guitar'), 1000, 78, { brightness: 0.9, warm: true, vignette: 0.38 }],

  // Backgrounds
  ['testimonial-bg', path.join(G, 'testimonial-bg.jpg'), 1920, 72, { vignette: 0.2 }],
  ['footer-bg', path.join(G, 'footer-bg.jpg'), 1920, 72, { vignette: 0.2 }],
  ['reservation-bg', path.join(L, 'restaurant.jpg'), 1600, 72, { brightness: 0.88, vignette: 0.3 }],
]

await mkdir(out, { recursive: true })
let done = 0
for (const [name, src, width, quality, opts = {}] of jobs) {
  if (!existsSync(src)) {
    console.warn('missing source', name, src)
    continue
  }
  let img = sharp(src).rotate()
  if (opts.cropBottom) {
    const meta = await img.metadata()
    if (meta.width && meta.height) {
      const ch = Math.round(meta.height * opts.cropBottom)
      img = img.extract({ left: 0, top: meta.height - ch, width: meta.width, height: ch })
    }
  }
  img = img.resize({ width, withoutEnlargement: true })
  if (opts.brightness || opts.saturation) {
    img = img.modulate({
      brightness: opts.brightness ?? 1,
      saturation: opts.saturation ?? 0.95,
    })
  }
  if (opts.warm) {
    // Subtle warm amber highlight lift & cool-blue suppression to match Grilli's candle/charcoal palette
    img = img.recomb([
      [1.05, 0.02, 0.0],
      [0.01, 1.0, 0.0],
      [0.0, 0.0, 0.88],
    ])
  }
  const buf = await img.toBuffer()
  const rmeta = await sharp(buf).metadata()
  let finalPipe = sharp(buf)
  if (opts.vignette && rmeta.width && rmeta.height) {
    finalPipe = finalPipe.composite([{ input: vignetteSvg(rmeta.width, rmeta.height, opts.vignette), blend: 'multiply' }])
  }
  await finalPipe.webp({ quality, effort: 5 }).toFile(path.join(out, `${name}.webp`))
  done++
}
console.log(`optimized ${done}/${jobs.length} images -> public/images`)
