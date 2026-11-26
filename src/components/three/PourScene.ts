import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from '../../lib/gsap'
import { POUR_POSE, type PourState, type WineKind } from './pourState'

/**
 * "Rót vang tại bàn" — Commercial-studio 1:1 scale (1 unit = 1m) PBR Three.js scene:
 *  - Custom Wine Studio Softbox PMREM environment: dark velvet chamber + tall vertical key/rim
 *    softbox strips so glass shoulders & stems catch clean unbroken commercial specular ribbons.
 *  - Opaque full-frustum cellar cyclorama (`backdropPlane`, `toneMapped: false`) so Three.js's
 *    `transmissionRenderTarget` refracts warm amber light through the crystal stemware & clear
 *    Provence flint bottle while matching `--smoky-black-1` (`#0e0d0b`) seamlessly at every edge.
 *  - High-precision Bordeaux / Burgundy / Alsace bottles with:
 *      • Authentic Beer-Lambert blown glass (antique olive-green Bordeaux, crystal-clear Provence
 *        flint, emerald-olive Alsace) + concave bottom punt + lip `bague`
 *      • Exact inset `LatheGeometry` interior liquid column clipped by a world-horizontal gravity
 *        plane (`bottleClipPlane`) so wine levels horizontally inside the bottle as it tilts!
 *      • Cut sommelier foil neck capsule (`áo thiếc cắt miệng`) with spun-gold collar rings
 *      • 3-layer `2048×1536` bespoke cotton-paper & antique gold-foil packaging (`albedo` +
 *        `metalRough` + `bump`) flush on each bottle's cylindrical wall with high-contrast ink.
 *  - Scanned CC0 Poly Haven table props (`brass_candleholders` + `wooden_cutting_board`) & pulled cork.
 */

interface WineVisualSpec {
  shape: 'bordeaux' | 'burgundy' | 'alsace'
  glassColor: string
  glassAttenuation: string
  glassAttenuationDist: number
  glassTransmission: number
  liquid: string
  meniscus: string
  attenuation: string
  liquidTransmission: number
  capsuleColor: string
  foilInk: string
  paperBg: string
  inkMain: string
  inkSub: string
  estate: string
  cuvee: string
  appellation: string
  vintage: string
  lot: string
  abv: string
}

const WINES: Record<WineKind, WineVisualSpec> = {
  red: {
    shape: 'bordeaux',
    glassColor: '#355433',
    glassAttenuation: '#071408',
    glassAttenuationDist: 0.018,
    glassTransmission: 0.72,
    liquid: '#4a0612',
    meniscus: '#a81c34',
    attenuation: '#2b0208',
    liquidTransmission: 0.36,
    capsuleColor: '#2a0a10',
    foilInk: '#9c752b',
    paperBg: '#ece2ce',
    inkMain: '#14110e',
    inkSub: '#6a1521',
    estate: 'CHÂTEAU L’ORME',
    cuvee: 'Cabernet Sauvignon',
    appellation: 'HAUT-MÉDOC · GRAND VIN DE BORDEAUX',
    vintage: '2019',
    lot: 'RÉCOLTE 2019 · CAVE N° 0148',
    abv: '750 ML · 14.0% VOL',
  },
  rose: {
    shape: 'burgundy',
    glassColor: '#ffffff',
    glassAttenuation: '#ffeae6',
    glassAttenuationDist: 0.24,
    glassTransmission: 0.96,
    liquid: '#cc5866',
    meniscus: '#f4a2ac',
    attenuation: '#a63846',
    liquidTransmission: 0.74,
    capsuleColor: '#b57b6a',
    foilInk: '#9c7138',
    paperBg: '#f2eae4',
    inkMain: '#191412',
    inkSub: '#86333e',
    estate: 'DOMAINE D’ÉTOILE',
    cuvee: 'Grenache & Cinsault',
    appellation: 'CÔTES DE PROVENCE · GRAND VIN ROSÉ',
    vintage: '2022',
    lot: 'CUVÉE CÔTIÈRE · LOT N° 0219',
    abv: '750 ML · 12.5% VOL',
  },
  white: {
    shape: 'alsace',
    glassColor: '#8ba85c',
    glassAttenuation: '#2c4412',
    glassAttenuationDist: 0.042,
    glassTransmission: 0.86,
    liquid: '#dbb950',
    meniscus: '#f6e49e',
    attenuation: '#b69028',
    liquidTransmission: 0.82,
    capsuleColor: '#1f2d16',
    foilInk: '#98762c',
    paperBg: '#ede7d4',
    inkMain: '#151810',
    inkSub: '#485a1e',
    estate: 'CLOS SAINTE-ODILE',
    cuvee: 'Riesling & Chardonnay',
    appellation: 'ALSACE GRAND CRU · RÉSERVE CAVE',
    vintage: '2021',
    lot: 'VENDANGE TARDIVE · LOT N° 0094',
    abv: '750 ML · 13.0% VOL',
  },
}

// Rolled-rim single-walled crystal Bordeaux stemware in meters (height = 0.228m).
// Keeping a rolled 2.5mm lip without doubling the entire inner wall prevents double-layer Fresnel haze!
const GLASS_PROFILE: [number, number][] = [
  [0, 0.0],
  [0.039, 0.0],
  [0.0405, 0.0014],
  [0.039, 0.003],
  [0.011, 0.0075],
  [0.0044, 0.015],
  [0.0031, 0.052],
  [0.0033, 0.088],
  [0.0068, 0.096],
  [0.022, 0.105],
  [0.039, 0.122],
  [0.0472, 0.146],
  [0.0478, 0.164],
  [0.0442, 0.194],
  [0.0392, 0.2265],
  [0.0387, 0.228],
  [0.038, 0.2255],
]

const BOWL_WINE_PROFILE: [number, number][] = [
  [0, 0.1002],
  [0.006, 0.101],
  [0.0204, 0.1063],
  [0.0378, 0.122],
  [0.046, 0.146],
  [0.0466, 0.164],
  [0.0431, 0.194],
]

// Precision bottle profiles (normalized to mouth lip at y = 0.298m, with concave bottom punt & lip bague).
// Every `labelY` sits strictly on the straight cylindrical section so glass walls never clip a label!
const BOTTLE_PROFILES: Record<
  'bordeaux' | 'burgundy' | 'alsace',
  { glass: [number, number][]; labelY: [number, number]; labelR: number; capsuleY: number }
> = {
  bordeaux: {
    glass: [
      [0, 0.022], // deep Bordeaux punt (đáy lõm)
      [0.016, 0.014],
      [0.029, 0.002],
      [0.0355, 0.0],
      [0.0375, 0.006],
      [0.0376, 0.18], // straight cylindrical body
      [0.0364, 0.194], // high Bordeaux shoulder
      [0.0308, 0.208],
      [0.0208, 0.221],
      [0.0146, 0.233],
      [0.0138, 0.287], // slender neck
      [0.0156, 0.29], // glass bague collar ring
      [0.0156, 0.2955],
      [0.0144, 0.298], // open lip top
      [0.0098, 0.298], // inner bore mouth
      [0.0095, 0.255],
    ],
    labelY: [0.044, 0.162],
    labelR: 0.038,
    capsuleY: 0.232,
  },
  burgundy: {
    glass: [
      [0, 0.02],
      [0.018, 0.012],
      [0.032, 0.002],
      [0.038, 0.0],
      [0.0406, 0.008],
      [0.0408, 0.122], // straight lower Burgundy cylindrical wall
      [0.0382, 0.156], // sensual sloping Burgundy shoulder
      [0.0312, 0.188],
      [0.0222, 0.218],
      [0.0154, 0.242],
      [0.014, 0.287],
      [0.0157, 0.29],
      [0.0157, 0.2955],
      [0.0144, 0.298],
      [0.0098, 0.298],
      [0.0095, 0.255],
    ],
    labelY: [0.024, 0.118],
    labelR: 0.0412,
    capsuleY: 0.238,
  },
  alsace: {
    glass: [
      [0, 0.016],
      [0.016, 0.009],
      [0.028, 0.002],
      [0.0335, 0.0],
      [0.0355, 0.007],
      [0.0356, 0.118], // straight lower Alsace flute cylindrical wall
      [0.0332, 0.158], // long graceful Alsace flute taper
      [0.0276, 0.198],
      [0.0204, 0.232],
      [0.015, 0.258],
      [0.0136, 0.287],
      [0.0153, 0.29],
      [0.0153, 0.2955],
      [0.0142, 0.298],
      [0.0096, 0.298],
      [0.0093, 0.255],
    ],
    labelY: [0.022, 0.112],
    labelR: 0.036,
    capsuleY: 0.246,
  },
}

const GLASS_X = -0.052
const GLASS_Z = 0.028
const FILL_MIN = 0.102
const FILL_MAX = 0.156
const TARGET_MOUTH_Y = 0.298
const BOTTLE_PIVOT_Y = 0.18
const LOCAL_MOUTH = new THREE.Vector3(0, TARGET_MOUTH_Y - BOTTLE_PIVOT_Y, 0)

const lathe = (pts: [number, number][], segments = 96) =>
  new THREE.LatheGeometry(
    pts.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  )

/**
 * Builds an interior wine cavity LatheGeometry inset 2.6mm inside `glassPts` up to the neck (`y = 0.284m`),
 * guaranteeing internal wine NEVER pokes outside sloped Burgundy or Alsace shoulders!
 */
function buildInnerWineGeometry(glassPts: [number, number][]) {
  const wallInset = 0.0026
  const inner: [number, number][] = [[0, 0.025]]
  for (const [r, y] of glassPts) {
    if (y < 0.006) continue
    if (y > 0.284) break
    inner.push([Math.max(0.0085, r - wallInset), Math.max(0.025, y)])
  }
  inner.push([0, 0.284])
  return lathe(inner, 64)
}

function wineRadiusAt(y: number) {
  for (let i = 0; i < BOWL_WINE_PROFILE.length - 1; i++) {
    const [r0, y0] = BOWL_WINE_PROFILE[i]
    const [r1, y1] = BOWL_WINE_PROFILE[i + 1]
    if (y >= y0 && y <= y1) return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0)
  }
  return BOWL_WINE_PROFILE[BOWL_WINE_PROFILE.length - 1][0]
}

function radialTexture(stops: [number, string][], size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [p, col] of stops) g.addColorStop(p, col)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Commercial Wine Photography Studio Rig (baked into PMREM):
 * Dark velvet chamber + tall left key softbox + warm amber right rim strip.
 * Produces clean, continuous vertical highlight ribbons along the bottle shoulder and crystal bowl.
 */
function buildWineStudioEnv(renderer: THREE.WebGLRenderer) {
  const studio = new THREE.Scene()
  studio.background = new THREE.Color('#060504')

  const panel = (w: number, h: number, color: string, intensity: number, pos: [number, number, number], rotY = 0, rotX = 0) => {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(intensity),
      side: THREE.DoubleSide,
    })
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
    m.position.set(...pos)
    m.rotation.set(rotX, rotY, 0)
    studio.add(m)
  }

  // Tall narrow left key softbox strip (signature crisp vertical highlight down bottle & crystal rim)
  panel(0.95, 7.6, '#fff7ec', 3.8, [-3.5, 2.2, 2.7], 0.74, 0)
  // Crisp narrow right edge-definition strip
  panel(0.48, 6.8, '#ffe6c2', 3.0, [3.6, 2.0, 2.2], -0.84, 0)
  // Warm golden-amber cellar rim strip from behind-left
  panel(1.4, 6.0, '#ffa94a', 2.4, [-3.1, 1.8, -3.1], 2.35, 0)
  // Controlled narrow top highlight for bottle shoulder & wine meniscus sheen (without veiling the glass bowl)
  panel(2.2, 1.4, '#fff1dc', 1.35, [0.2, 5.4, 0.3], 0, Math.PI / 2)
  // Subtle warm walnut floor bounce
  panel(5.5, 5.5, '#26170c', 0.48, [0, -2.2, 0], 0, -Math.PI / 2)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const tex = pmrem.fromScene(studio, 0.02).texture
  pmrem.dispose()
  studio.traverse((o) => {
    const m = o as THREE.Mesh
    m.geometry?.dispose()
    ;(m.material as THREE.Material | undefined)?.dispose()
  })
  return tex
}

/**
 * Generates 3 matched high-res (`2048×1536`) textures (`albedo`, `roughness/metalness`, `bump`)
 * for a bespoke laid-cotton & hot-stamped antique gold wine label with pitch-crisp letterpress ink.
 */
function createLuxuryLabelMaps(spec: WineVisualSpec, maxAniso: number) {
  const W = 2048
  const H = 1536

  const albedoCanvas = document.createElement('canvas')
  albedoCanvas.width = W
  albedoCanvas.height = H
  const ctx = albedoCanvas.getContext('2d')!

  const foilCanvas = document.createElement('canvas')
  foilCanvas.width = W / 2
  foilCanvas.height = H / 2
  const fctx = foilCanvas.getContext('2d')!
  // Default cotton paper: G = 224 (roughness ~0.88 matte), B = 0 (non-metallic so text never washes out!)
  fctx.fillStyle = 'rgb(255, 224, 0)'
  fctx.fillRect(0, 0, W / 2, H / 2)
  fctx.scale(0.5, 0.5)

  const bumpCanvas = document.createElement('canvas')
  bumpCanvas.width = W / 2
  bumpCanvas.height = H / 2
  const bctx = bumpCanvas.getContext('2d')!
  bctx.fillStyle = '#808080'
  bctx.fillRect(0, 0, W / 2, H / 2)

  // 1. Tactile cotton laid-paper stock + subtle horizontal fiber ribs + warm deckle edge shadow
  ctx.fillStyle = spec.paperBg
  ctx.fillRect(0, 0, W, H)
  for (let y = 0; y < H; y += 6) {
    ctx.fillStyle = y % 12 === 0 ? 'rgba(28,20,12,0.026)' : 'rgba(255,255,255,0.035)'
    ctx.fillRect(0, y, W, 2)
    bctx.fillStyle = y % 12 === 0 ? '#737373' : '#8d8d8d'
    bctx.fillRect(0, y / 2, W / 2, 1)
  }

  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, W * 0.66)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(38,26,14,0.13)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)

  // Crisp paper-thickness edge bevel along outer perimeter
  ctx.strokeStyle = 'rgba(20,15,10,0.42)'
  ctx.lineWidth = 10
  ctx.strokeRect(5, 5, W - 10, H - 10)

  bctx.save()
  bctx.scale(0.5, 0.5)

  // Partial-metallic antique gold foil helper (G = 68 roughness 0.27, B = 148 metalness 0.58)
  // Keeping metalness at 0.58 lets gold borders & crest gleam warmly under softboxes while staying visible at all angles!
  const FOIL_MAT = 'rgb(255, 68, 148)'

  const strokeFoilRect = (x: number, y: number, w: number, h: number, lw: number) => {
    ctx.strokeStyle = 'rgba(28,20,12,0.28)'
    ctx.lineWidth = lw + 2
    ctx.strokeRect(x + 1, y + 1, w, h)

    ctx.strokeStyle = spec.foilInk
    ctx.lineWidth = lw
    ctx.strokeRect(x, y, w, h)

    fctx.strokeStyle = FOIL_MAT
    fctx.lineWidth = lw + 2
    fctx.strokeRect(x, y, w, h)

    bctx.strokeStyle = '#bebebe'
    bctx.lineWidth = lw
    bctx.strokeRect(x, y, w, h)
  }

  // Outer charcoal keyline + double hot-stamped antique gold border
  ctx.strokeStyle = 'rgba(24,20,16,0.58)'
  ctx.lineWidth = 5
  ctx.strokeRect(34, 34, W - 68, H - 68)
  strokeFoilRect(58, 58, W - 116, H - 116, 10)
  strokeFoilRect(84, 84, W - 168, H - 168, 4)

  const cx = W / 2
  ctx.textAlign = 'center'
  fctx.textAlign = 'center'
  bctx.textAlign = 'center'

  // Top cellar header (deep burgundy / forest / bronze ink)
  ctx.fillStyle = spec.inkSub
  ctx.font = '700 44px "Be Vietnam Pro", sans-serif'
  ctx.fillText('G R I L L I   C E L L A R   S E L E C T I O N', cx, 196)

  // Engraved Chateau / Estate medallion crest (dark shadow keyline + antique gold foil)
  const crestY = 382
  ;[ctx, fctx, bctx].forEach((c, idx) => {
    c.save()
    c.translate(cx, crestY)
    if (idx === 0) {
      // Subtle engraved shadow under the gold crest for crisp contrast on pale cotton paper
      c.save()
      c.translate(1.5, 2)
      c.strokeStyle = 'rgba(24,18,12,0.34)'
      c.lineWidth = 8
      c.beginPath()
      c.ellipse(0, 0, 174, 104, 0, 0, Math.PI * 2)
      c.stroke()
      c.restore()
    }
    c.strokeStyle = idx === 0 ? spec.foilInk : idx === 1 ? FOIL_MAT : '#c6c6c6'
    c.lineWidth = idx === 1 ? 9 : 7
    c.beginPath()
    c.ellipse(0, 0, 174, 104, 0, 0, Math.PI * 2)
    c.stroke()
    c.beginPath()
    c.ellipse(0, 0, 152, 86, 0, 0, Math.PI * 2)
    c.lineWidth = 3.5
    c.stroke()

    // Chateau pediment, colonnade & vineyard rows inside medallion
    c.lineWidth = 5.5
    c.beginPath()
    c.moveTo(-94, 34)
    c.lineTo(94, 34)
    c.moveTo(-66, 34)
    c.lineTo(-66, -16)
    c.lineTo(0, -54)
    c.lineTo(66, -16)
    c.lineTo(66, 34)
    c.moveTo(-24, 34)
    c.lineTo(-24, -6)
    c.lineTo(24, -6)
    c.lineTo(24, 34)
    c.moveTo(0, -54)
    c.lineTo(0, -68)
    c.stroke()
    c.restore()
  })

  // Bold Estate / Chateau Name (deep debossed charcoal letterpress ink — 100% legible at every angle!)
  ctx.fillStyle = spec.inkMain
  ctx.font = '700 138px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(spec.estate, cx, 656)
  bctx.fillStyle = '#444444'
  bctx.font = '700 138px "Cormorant Garamond", Georgia, serif'
  bctx.fillText(spec.estate, cx, 656)

  // Ornamental gold-foil diamond divider rule
  ;[ctx, fctx, bctx].forEach((c, idx) => {
    const col = idx === 0 ? spec.foilInk : idx === 1 ? FOIL_MAT : '#c0c0c0'
    c.strokeStyle = col
    c.fillStyle = col
    c.lineWidth = 5.5
    c.beginPath()
    c.moveTo(cx - 420, 724)
    c.lineTo(cx - 38, 724)
    c.moveTo(cx + 38, 724)
    c.lineTo(cx + 420, 724)
    c.stroke()
    c.save()
    c.translate(cx, 724)
    c.rotate(Math.PI / 4)
    c.fillRect(-13, -13, 26, 26)
    c.restore()
  })

  // Appellation / Grand Cru line
  ctx.fillStyle = spec.inkSub
  ctx.font = '700 44px "Be Vietnam Pro", sans-serif'
  ctx.fillText(spec.appellation, cx, 822)

  // Italic Varietal / Cuvée name
  ctx.fillStyle = spec.inkMain
  ctx.font = 'italic 600 106px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(spec.cuvee, cx, 972)
  bctx.font = 'italic 600 106px "Cormorant Garamond", Georgia, serif'
  bctx.fillText(spec.cuvee, cx, 972)

  // Bold Vintage Year (deep letterpress ink framed by short gold dashes — never washes out!)
  ctx.fillStyle = spec.inkMain
  ctx.font = '700 112px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(spec.vintage, cx, 1130)
  bctx.font = '700 112px "Cormorant Garamond", Georgia, serif'
  bctx.fillText(spec.vintage, cx, 1130)

  ctx.strokeStyle = spec.foilInk
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(cx - 210, 1096)
  ctx.lineTo(cx - 135, 1096)
  ctx.moveTo(cx + 135, 1096)
  ctx.lineTo(cx + 210, 1096)
  ctx.stroke()

  // Numbered cellar lot + Sommelier bottling line + ABV/Volume
  ctx.fillStyle = spec.inkSub
  ctx.font = '600 34px "Be Vietnam Pro", sans-serif'
  ctx.fillText(spec.lot, cx, 1244)

  ctx.fillStyle = 'rgba(24,20,16,0.78)'
  ctx.font = '500 35px "Be Vietnam Pro", sans-serif'
  ctx.fillText('MIS EN BOUTEILLE À LA PROPRIÉTÉ · SÉLECTION SOMMELIER', cx, 1322)

  ctx.fillStyle = spec.inkMain
  ctx.font = '700 40px "Be Vietnam Pro", sans-serif'
  ctx.fillText(spec.abv, cx, 1412)

  bctx.restore()

  const albedo = new THREE.CanvasTexture(albedoCanvas)
  albedo.colorSpace = THREE.SRGBColorSpace
  albedo.anisotropy = maxAniso

  const foil = new THREE.CanvasTexture(foilCanvas)
  foil.anisotropy = maxAniso

  const bump = new THREE.CanvasTexture(bumpCanvas)
  bump.anisotropy = maxAniso

  return { albedo, foil, bump }
}

/** Gravity-tapered wine stream (wider at bottle lip, narrower down in the bowl). */
function createTaperedStreamGeometry(curve: THREE.Curve<THREE.Vector3>, tubularSegments = 72, radialSegments = 14) {
  const frames = curve.computeFrenetFrames(tubularSegments, false)
  const vertexCount = (tubularSegments + 1) * (radialSegments + 1)
  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)
  const indices: number[] = []

  const P = new THREE.Vector3()
  const N = new THREE.Vector3()

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments
    curve.getPointAt(u, P)
    const baseR = THREE.MathUtils.lerp(0.0042, 0.0021, Math.pow(u, 0.65))
    const normal = frames.normals[i]
    const binormal = frames.binormals[i]

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2
      const ripple = 1 + 0.08 * Math.sin(v * 2 + u * 20)
      const r = baseR * ripple
      const sin = Math.sin(v)
      const cos = -Math.cos(v)

      N.set(cos * normal.x + sin * binormal.x, cos * normal.y + sin * binormal.y, cos * normal.z + sin * binormal.z).normalize()
      const idx = i * (radialSegments + 1) + j
      positions[idx * 3] = P.x + r * N.x
      positions[idx * 3 + 1] = P.y + r * N.y
      positions[idx * 3 + 2] = P.z + r * N.z
      normals[idx * 3] = N.x
      normals[idx * 3 + 1] = N.y
      normals[idx * 3 + 2] = N.z
      uvs[idx * 2] = u
      uvs[idx * 2 + 1] = j / radialSegments
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j
      const b = (i + 1) * (radialSegments + 1) + j
      const c = (i + 1) * (radialSegments + 1) + (j + 1)
      const d = i * (radialSegments + 1) + (j + 1)
      indices.push(a, b, d, b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return { geo, ringIndices: radialSegments * 6, totalIndices: indices.length }
}

export class PourScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(28, 1, 0.04, 16)
  private stage = new THREE.Group()
  private bottlePivot = new THREE.Group()
  private bottleModels: Partial<Record<WineKind, THREE.Group>> = {}
  private bottleGlassMats: THREE.MeshPhysicalMaterial[] = []
  private currentWine: WineKind = 'red'

  private liquidMat: THREE.MeshPhysicalMaterial
  private surfaceMat: THREE.MeshPhysicalMaterial
  private meniscusMat: THREE.MeshBasicMaterial
  private surfaceGroup = new THREE.Group()
  private meniscusRing: THREE.Mesh
  private rippleRing: THREE.Mesh
  private clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)
  private bottleClipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.22)

  private stream: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>
  private streamIndexCount = 0
  private streamRingSize = 0
  private droplets: THREE.Group = new THREE.Group()

  private bottleShadow!: THREE.Mesh
  private causticGlow!: THREE.Mesh
  private tableMat!: THREE.MeshStandardMaterial

  private keyLight: THREE.SpotLight
  private rimLight: THREE.SpotLight
  private candleLight: THREE.PointLight
  private flameMeshes: THREE.Mesh[] = []

  private embers: THREE.Points
  private emberSpeed!: Float32Array
  private envTex: THREE.Texture | null = null
  private extraTextures: THREE.Texture[] = []

  private ro: ResizeObserver
  private running = false
  private dragging = false
  private lastX = 0
  private spin = -0.12
  private spinTarget = -0.12
  private spinTo: gsap.QuickToFunc
  private disposed = false
  private container: HTMLElement
  private state: PourState
  private lastTime = 0
  private elapsed = 0

  constructor(container: HTMLElement, state: PourState) {
    this.container = container
    this.state = state

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.localClippingEnabled = true
    this.renderer.domElement.className = 'pour-canvas'
    container.appendChild(this.renderer.domElement)

    // Exact match to --smoky-black-1 (hsl(40, 12%, 5%) = #0e0d0b)
    this.scene.background = new THREE.Color('#0e0d0b')

    // Commercial softbox studio reflections
    this.envTex = buildWineStudioEnv(this.renderer)
    this.scene.environment = this.envTex
    this.scene.environmentIntensity = 1.05

    // Key, controlled label fill, warm cellar rim backlight, and flickering candle point light
    this.keyLight = new THREE.SpotLight('#ffe5c4', 8.0, 5.0, Math.PI / 4.3, 0.72, 1.8)
    this.keyLight.position.set(0.66, 1.05, 0.94)
    this.keyLight.target.position.set(0.03, 0.14, 0)
    this.keyLight.castShadow = true
    this.keyLight.shadow.mapSize.set(1024, 1024)
    this.keyLight.shadow.bias = -0.0004
    this.scene.add(this.keyLight, this.keyLight.target)

    const labelFill = new THREE.DirectionalLight('#ffdfbe', 1.08)
    labelFill.position.set(-0.52, 0.44, 1.2)
    this.scene.add(labelFill)

    this.rimLight = new THREE.SpotLight('#ff9d47', 7.4, 4.2, Math.PI / 3.8, 0.75, 1.7)
    this.rimLight.position.set(-0.54, 0.58, -0.82)
    this.rimLight.target.position.set(-0.01, 0.15, 0.02)
    this.scene.add(this.rimLight, this.rimLight.target)

    this.candleLight = new THREE.PointLight('#ff9838', 0.8, 1.5, 2)
    this.candleLight.position.set(-0.195, 0.27, -0.105)
    this.stage.add(this.candleLight)

    this.scene.add(this.stage)
    this.buildBackdrop()
    this.buildTable()
    this.buildCrystalGlass()

    // Wine body + meniscus + ripple inside the crystal bowl
    this.liquidMat = new THREE.MeshPhysicalMaterial({
      color: WINES.red.liquid,
      roughness: 0.04,
      metalness: 0,
      transmission: WINES.red.liquidTransmission,
      thickness: 0.065,
      attenuationColor: new THREE.Color(WINES.red.attenuation),
      attenuationDistance: 0.045,
      ior: 1.34,
      specularIntensity: 0.95,
      envMapIntensity: 1.25,
      clippingPlanes: [this.clipPlane],
      side: THREE.DoubleSide,
    })
    const liquidMesh = new THREE.Mesh(lathe(BOWL_WINE_PROFILE, 64), this.liquidMat)
    liquidMesh.position.set(GLASS_X, 0, GLASS_Z)
    liquidMesh.renderOrder = 2
    this.stage.add(liquidMesh)

    this.surfaceMat = this.liquidMat.clone()
    this.surfaceMat.clippingPlanes = []
    this.surfaceMat.roughness = 0.03
    const surfaceDisc = new THREE.Mesh(new THREE.CircleGeometry(1, 64), this.surfaceMat)
    surfaceDisc.rotation.x = -Math.PI / 2

    this.meniscusMat = new THREE.MeshBasicMaterial({
      color: WINES.red.meniscus,
      transparent: true,
      opacity: 0.76,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.meniscusRing = new THREE.Mesh(new THREE.RingGeometry(0.93, 1.0, 64), this.meniscusMat)
    this.meniscusRing.rotation.x = -Math.PI / 2
    this.meniscusRing.position.y = 0.0005

    this.rippleRing = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.25, 48),
      new THREE.MeshBasicMaterial({
        color: '#ffd8b0',
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    )
    this.rippleRing.rotation.x = -Math.PI / 2
    this.rippleRing.position.y = 0.0008

    this.surfaceGroup.add(surfaceDisc, this.meniscusRing, this.rippleRing)
    this.surfaceGroup.position.set(GLASS_X, FILL_MIN, GLASS_Z)
    this.surfaceGroup.renderOrder = 3
    this.stage.add(this.surfaceGroup)

    // Build all 3 luxury varietal bottles immediately (zero pop-in, razor-sharp 2048px packaging!)
    this.buildLuxuryBottles()
    this.stage.add(this.bottlePivot)

    this.stream = this.buildStream()
    this.stage.add(this.stream)
    this.buildDroplets()
    this.buildCork()
    this.embers = this.buildEmbers()
    this.scene.add(this.embers)

    this.spinTo = gsap.quickTo(this, 'spin', { duration: 0.55, ease: 'power3.out' })

    this.setWine('red', true)
    this.loadTablePropsAndGlassNormals()
    this.bindPointer()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
    this.resize()
    container.classList.add('is-loaded')
  }

  // --------------------------------------------------------- scene elements

  /**
   * Opaque full-frustum studio cyclorama (`transparent: false`, `toneMapped: false`):
   * Because it is opaque, Three.js renders it into `transmissionRenderTarget` so the crystal glass
   * and clear Provence bottle refract warm amber cellar light instead of a dark grey cutout,
   * while fading to exact `#0e0d0b` (`--smoky-black-1`) well inside the frustum!
   */
  private buildBackdrop() {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 512
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#0e0d0b'
    ctx.fillRect(0, 0, 512, 512)
    // Concentrated warm cellar glow right behind the crystal glass & bottle (radius ~0.34m in world),
    // dissolving 100% into #0e0d0b well inside the 0.80m camera frustum so canvas edges are invisible!
    const g = ctx.createRadialGradient(252, 266, 4, 252, 266, 76)
    g.addColorStop(0, '#30190c')
    g.addColorStop(0.42, '#1b1009')
    g.addColorStop(0.78, '#110e0b')
    g.addColorStop(1, '#0e0d0b')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 512)

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    this.extraTextures.push(tex)

    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.0),
      new THREE.MeshBasicMaterial({ map: tex }),
    )
    backdrop.position.set(0.02, 0.17, -0.64)
    this.scene.add(backdrop)
  }

  private buildTable() {
    // Elliptical walnut tabletop that dissolves smoothly to #0e0d0b well inside all 4 canvas edges
    const alphaMask = radialTexture(
      [
        [0, 'rgba(255,255,255,1)'],
        [0.36, 'rgba(255,255,255,0.9)'],
        [0.64, 'rgba(255,255,255,0.22)'],
        [0.85, 'rgba(255,255,255,0)'],
        [1, 'rgba(255,255,255,0)'],
      ],
      256,
    )
    this.extraTextures.push(alphaMask)
    this.tableMat = new THREE.MeshStandardMaterial({
      color: '#1e1610',
      roughness: 0.56,
      metalness: 0.04,
      alphaMap: alphaMask,
      transparent: true,
      envMapIntensity: 0.5,
    })
    const table = new THREE.Mesh(new THREE.CircleGeometry(0.34, 96), this.tableMat)
    table.rotation.x = -Math.PI / 2
    table.scale.set(1.0, 0.76, 1) // compressed in world Z so front edge never hits bottom mask
    table.position.set(0.005, 0, -0.03)
    table.receiveShadow = true
    this.stage.add(table)

    const brass = new THREE.MeshStandardMaterial({
      color: '#c9a362',
      metalness: 0.92,
      roughness: 0.28,
      envMapIntensity: 1.15,
    })
    const coaster = new THREE.Mesh(new THREE.RingGeometry(0.044, 0.0465, 64), brass)
    coaster.rotation.x = -Math.PI / 2
    coaster.position.set(GLASS_X, 0.0006, GLASS_Z)
    this.stage.add(coaster)

    const shadowTex = radialTexture([
      [0, 'rgba(0,0,0,0.85)'],
      [0.55, 'rgba(0,0,0,0.34)'],
      [1, 'rgba(0,0,0,0)'],
    ])
    this.extraTextures.push(shadowTex)
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })

    const glassShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.14), shadowMat)
    glassShadow.rotation.x = -Math.PI / 2
    glassShadow.position.set(GLASS_X, 0.0008, GLASS_Z)
    this.stage.add(glassShadow)

    this.causticGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.13, 0.13),
      new THREE.MeshBasicMaterial({
        map: radialTexture([
          [0, 'rgba(165, 24, 45, 0.52)'],
          [0.55, 'rgba(110, 14, 28, 0.16)'],
          [1, 'rgba(0, 0, 0, 0)'],
        ]),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.causticGlow.rotation.x = -Math.PI / 2
    this.causticGlow.position.set(GLASS_X - 0.008, 0.001, GLASS_Z + 0.008)
    this.stage.add(this.causticGlow)

    this.bottleShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), shadowMat.clone())
    this.bottleShadow.rotation.x = -Math.PI / 2
    this.bottleShadow.position.set(0.126, 0.0009, 0.01)
    this.stage.add(this.bottleShadow)
  }

  private buildCrystalGlass() {
    // Note: Do NOT set `transparent: true` alongside `transmission > 0` so Three.js renders
    // the stemware cleanly in the physical transmissive pass without double-blending!
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0,
      roughness: 0.012,
      transmission: 0.985,
      thickness: 0.0055,
      ior: 1.5,
      attenuationColor: new THREE.Color('#fff9f0'),
      attenuationDistance: 0.85,
      specularIntensity: 1.0,
      specularColor: new THREE.Color('#fffaf2'),
      clearcoat: 0.65,
      clearcoatRoughness: 0.012,
      envMapIntensity: 1.35,
    })
    const glass = new THREE.Mesh(lathe(GLASS_PROFILE, 96), crystalMat)
    glass.position.set(GLASS_X, 0, GLASS_Z)
    glass.renderOrder = 4
    this.stage.add(glass)
  }

  private buildLuxuryBottles() {
    const maxAniso = Math.min(8, this.renderer.capabilities.getMaxAnisotropy())

    ;(['red', 'rose', 'white'] as WineKind[]).forEach((kind) => {
      const spec = WINES[kind]
      const prof = BOTTLE_PROFILES[spec.shape]
      const group = new THREE.Group()
      group.position.y = -BOTTLE_PIVOT_Y

      // 1. Authentic Beer-Lambert blown glass body with concave bottom punt + lip bague
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: spec.glassColor,
        roughness: 0.032,
        metalness: 0,
        transmission: spec.glassTransmission,
        ior: 1.52,
        thickness: 0.016,
        attenuationColor: new THREE.Color(spec.glassAttenuation),
        attenuationDistance: spec.glassAttenuationDist,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        specularIntensity: 1.0,
        envMapIntensity: 1.55,
      })
      this.bottleGlassMats.push(glassMat)
      const glassBody = new THREE.Mesh(lathe(prof.glass, 96), glassMat)
      glassBody.castShadow = true
      glassBody.renderOrder = 2
      group.add(glassBody)

      // 2. Exact profile-inset internal wine column clipped by world-horizontal `bottleClipPlane`
      //    so wine NEVER pokes outside sloped shoulders AND levels horizontally during pour!
      const innerWineGeo = buildInnerWineGeometry(prof.glass)
      const innerWineMat = new THREE.MeshPhysicalMaterial({
        color: spec.liquid,
        roughness: 0.05,
        metalness: 0,
        transmission: spec.liquidTransmission * 0.82,
        thickness: 0.05,
        attenuationColor: new THREE.Color(spec.attenuation),
        attenuationDistance: 0.035,
        ior: 1.34,
        clippingPlanes: [this.bottleClipPlane],
        side: THREE.DoubleSide,
      })
      const innerWine = new THREE.Mesh(innerWineGeo, innerWineMat)
      innerWine.renderOrder = 1
      group.add(innerWine)

      // 3. Cut sommelier foil neck capsule (áo thiếc cổ chai cắt gọn dưới gờ miệng `y = 0.288m`)
      const capH = 0.288 - prof.capsuleY
      const capGeo = new THREE.CylinderGeometry(0.0141, 0.0151, capH, 64, 1, false)
      const capMat = new THREE.MeshStandardMaterial({
        color: spec.capsuleColor,
        roughness: 0.34,
        metalness: 0.68,
        envMapIntensity: 1.25,
      })
      const capsule = new THREE.Mesh(capGeo, capMat)
      capsule.position.y = prof.capsuleY + capH / 2
      capsule.castShadow = true
      group.add(capsule)

      // Spun-gold collar rings on the capsule + dark open bore inside the neck
      const goldMat = new THREE.MeshStandardMaterial({
        color: '#d8b36a',
        metalness: 0.92,
        roughness: 0.24,
        envMapIntensity: 1.45,
      })
      ;[prof.capsuleY + 0.0035, 0.2862].forEach((ry, idx) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(idx === 0 ? 0.0151 : 0.0142, 0.0008, 12, 64), goldMat)
        ring.rotation.x = Math.PI / 2
        ring.position.y = ry
        group.add(ring)
      })

      const darkBore = new THREE.Mesh(
        new THREE.CircleGeometry(0.0096, 32),
        new THREE.MeshBasicMaterial({ color: '#050203' }),
      )
      darkBore.rotation.x = -Math.PI / 2
      darkBore.position.y = 0.2965
      group.add(darkBore)

      // 4. Bespoke 2048×1536 3-map Cotton Paper + Hot-Stamped Gold Foil Front Packaging (`bao bì`)
      //    Placed strictly on the straight cylindrical wall (`labelR = bodyR + 0.4mm`) with `polygonOffset`
      const { albedo, foil, bump } = createLuxuryLabelMaps(spec, maxAniso)
      this.extraTextures.push(albedo, foil, bump)

      const [y0, y1] = prof.labelY
      const labelArc = Math.PI * 0.66 // 119° wrap keeps borders & typography crisp head-on
      const labelGeo = new THREE.CylinderGeometry(prof.labelR, prof.labelR, y1 - y0, 72, 1, true, -labelArc / 2, labelArc)

      const labelMat = new THREE.MeshStandardMaterial({
        map: albedo,
        roughnessMap: foil,
        metalnessMap: foil,
        roughness: 1.0,
        metalness: 1.0,
        bumpMap: bump,
        bumpScale: 0.0015,
        envMapIntensity: 1.2,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
      const labelMesh = new THREE.Mesh(labelGeo, labelMat)
      labelMesh.position.y = (y0 + y1) / 2
      labelMesh.castShadow = true
      labelMesh.renderOrder = 3
      group.add(labelMesh)

      group.visible = kind === this.currentWine
      this.bottleModels[kind] = group
      this.bottlePivot.add(group)
    })
  }

  private buildCork() {
    const corkGroup = new THREE.Group()
    const corkCanvas = document.createElement('canvas')
    corkCanvas.width = 256
    corkCanvas.height = 256
    const ctx = corkCanvas.getContext('2d')!
    ctx.fillStyle = '#b99366'
    ctx.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 650; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(86,56,28,0.36)' : 'rgba(220,186,140,0.26)'
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 5, 1 + Math.random() * 2.5)
    }
    ctx.save()
    ctx.translate(128, 118)
    ctx.fillStyle = 'rgba(48,28,14,0.68)'
    ctx.textAlign = 'center'
    ctx.font = '600 22px "Cormorant Garamond", serif'
    ctx.fillText('GRILLI · 2019', 0, 0)
    ctx.restore()

    const g = ctx.createLinearGradient(0, 188, 0, 256)
    g.addColorStop(0, 'rgba(74, 8, 20, 0)')
    g.addColorStop(1, 'rgba(74, 8, 20, 0.82)')
    ctx.fillStyle = g
    ctx.fillRect(0, 188, 256, 68)

    const corkTex = new THREE.CanvasTexture(corkCanvas)
    corkTex.colorSpace = THREE.SRGBColorSpace
    this.extraTextures.push(corkTex)
    const corkMat = new THREE.MeshStandardMaterial({ map: corkTex, roughness: 0.86, metalness: 0 })
    const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.044, 32), corkMat)
    cork.rotation.z = Math.PI / 2
    cork.rotation.y = 0.48
    cork.castShadow = true
    cork.receiveShadow = true
    corkGroup.add(cork)
    corkGroup.position.set(0.028, 0.0105, 0.084)
    this.stage.add(corkGroup)
  }

  private buildStream() {
    // Locked to shared POUR_POSE so the stream always emerges squarely from the bottle's lower lip
    const mouthWorld = LOCAL_MOUTH.clone()
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), POUR_POSE.tilt)
      .add(new THREE.Vector3(POUR_POSE.px, POUR_POSE.py, GLASS_Z))

    const start = mouthWorld.clone().add(new THREE.Vector3(-0.0025, -0.0035, 0))
    const mid = new THREE.Vector3(GLASS_X + 0.016, mouthWorld.y - 0.046, GLASS_Z)
    const end = new THREE.Vector3(GLASS_X + 0.003, FILL_MIN + 0.004, GLASS_Z)
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)

    const { geo, ringIndices, totalIndices } = createTaperedStreamGeometry(curve, 72, 14)
    this.streamIndexCount = totalIndices
    this.streamRingSize = ringIndices
    geo.setDrawRange(0, 0)

    const mat = new THREE.MeshPhysicalMaterial({
      color: WINES.red.liquid,
      roughness: 0.04,
      metalness: 0,
      transmission: 0.55,
      thickness: 0.01,
      ior: 1.34,
      emissive: new THREE.Color('#2a0308'),
      emissiveIntensity: 0.55,
      specularIntensity: 1,
      envMapIntensity: 1.45,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.renderOrder = 3
    return mesh
  }

  private buildDroplets() {
    const geo = new THREE.SphereGeometry(0.0018, 10, 10)
    for (let i = 0; i < 7; i++) {
      const d = new THREE.Mesh(geo, this.surfaceMat)
      d.visible = false
      this.droplets.add(d)
    }
    this.droplets.position.set(GLASS_X, FILL_MIN, GLASS_Z)
    this.droplets.renderOrder = 3
    this.stage.add(this.droplets)
  }

  private buildEmbers() {
    const count = 65
    const pos = new Float32Array(count * 3)
    this.emberSpeed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.15 + Math.random() * 0.42
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = 0.02 + Math.random() * 0.52
      pos[i * 3 + 2] = Math.sin(a) * r - 0.06
      this.emberSpeed[i] = 0.012 + Math.random() * 0.026
    }
    const eg = new THREE.BufferGeometry()
    eg.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return new THREE.Points(
      eg,
      new THREE.PointsMaterial({
        size: 0.008,
        map: radialTexture([
          [0, 'rgba(255, 220, 162, 0.92)'],
          [0.45, 'rgba(228, 175, 100, 0.32)'],
          [1, 'rgba(228, 175, 100, 0)'],
        ]),
        transparent: true,
        opacity: 0.44,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: '#e4c590',
      }),
    )
  }

  // --------------------------------------------------------- async PBR table props

  private loadTablePropsAndGlassNormals() {
    const gltfLoader = new GLTFLoader()
    const texLoader = new THREE.TextureLoader()

    // Apply scanned blown-glass micro-normal map onto our bottle glass materials for subtle artisanal ripple
    texLoader.load(
      'models/wine_bottles_01/textures/wine_bottles_01_nor_gl_1k.jpg',
      (nor) => {
        if (this.disposed) {
          nor.dispose()
          return
        }
        nor.wrapS = nor.wrapT = THREE.RepeatWrapping
        nor.repeat.set(2, 2)
        this.extraTextures.push(nor)
        this.bottleGlassMats.forEach((m) => {
          m.normalMap = nor
          m.normalScale.set(0.045, 0.045)
          m.needsUpdate = true
        })
        if (!this.running) this.tick()
      },
      undefined,
      () => {},
    )

    // Scanned oak serving board + walnut tabletop normal/roughness
    gltfLoader.load(
      'models/wooden_cutting_board/wooden_cutting_board.gltf',
      (gltf) => {
        if (this.disposed) return
        const board = gltf.scene
        board.traverse((o) => {
          const m = o as THREE.Mesh
          if (!m.isMesh) return
          m.castShadow = true
          m.receiveShadow = true
          const mat = m.material as THREE.MeshStandardMaterial
          if (mat.map && !this.tableMat.normalMap) {
            const nor = mat.normalMap?.clone()
            const rough = mat.roughnessMap?.clone()
            if (nor) {
              nor.wrapS = nor.wrapT = THREE.RepeatWrapping
              nor.repeat.set(2.2, 2.2)
              nor.needsUpdate = true
              this.tableMat.normalMap = nor
              this.tableMat.normalScale.set(0.32, 0.32)
            }
            if (rough) {
              rough.wrapS = rough.wrapT = THREE.RepeatWrapping
              rough.repeat.set(2.2, 2.2)
              rough.needsUpdate = true
              this.tableMat.roughnessMap = rough
            }
            this.tableMat.needsUpdate = true
          }
          mat.color.set('#6e4e34')
          mat.envMapIntensity = 0.62
        })
        board.scale.setScalar(0.68)
        board.position.set(-0.185, 0.001, -0.102)
        board.rotation.y = 0.34
        this.stage.add(board)
        if (!this.running) this.tick()
      },
      undefined,
      () => {},
    )

    // Scanned ornate brass candelabra with glowing twin flames
    gltfLoader.load(
      'models/brass_candleholders/brass_candleholders.gltf',
      (gltf) => {
        if (this.disposed) return
        const holder = gltf.scene.getObjectByName('brass_candleholder_02') ?? gltf.scene.children[0]
        if (!holder) return
        holder.position.set(0, 0, 0)
        holder.scale.setScalar(0.64)
        holder.traverse((o) => {
          const m = o as THREE.Mesh
          if (!m.isMesh) return
          const mat = m.material as THREE.MeshStandardMaterial
          if (mat.name.includes('flame')) {
            mat.emissive = new THREE.Color('#ffab40')
            mat.emissiveIntensity = 3.0
            mat.depthWrite = false
            this.flameMeshes.push(m)
          } else {
            m.castShadow = true
            m.receiveShadow = true
            mat.envMapIntensity = 1.15
          }
        })
        const wrap = new THREE.Group()
        wrap.position.set(-0.195, 0.028, -0.102)
        wrap.rotation.y = 0.36
        wrap.add(holder)
        this.stage.add(wrap)
        if (!this.running) this.tick()
      },
      undefined,
      () => {},
    )
  }

  // ------------------------------------------------------------- public API

  setWine(kind: WineKind, immediate = false) {
    this.currentWine = kind
    const w = WINES[kind]
    const liquid = new THREE.Color(w.liquid)
    const meniscus = new THREE.Color(w.meniscus)
    const atten = new THREE.Color(w.attenuation)
    const d = immediate ? 0 : 0.7

    ;(['red', 'rose', 'white'] as WineKind[]).forEach((k) => {
      const model = this.bottleModels[k]
      if (model) model.visible = k === kind
    })
    if (!immediate && this.bottlePivot) {
      gsap.fromTo(this.bottlePivot.scale, { x: 0.96, y: 0.96, z: 0.96 }, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(1.7)' })
    }

    ;[this.liquidMat, this.surfaceMat, this.stream?.material].forEach((m) => {
      if (!m) return
      gsap.to(m.color, { r: liquid.r, g: liquid.g, b: liquid.b, duration: d, ease: 'power2.inOut' })
      gsap.to(m, { transmission: w.liquidTransmission, duration: d })
    })
    gsap.to(this.liquidMat.attenuationColor, { r: atten.r, g: atten.g, b: atten.b, duration: d })
    gsap.to(this.meniscusMat.color, { r: meniscus.r, g: meniscus.g, b: meniscus.b, duration: d })

    if (this.stream) {
      const glow = liquid.clone().multiplyScalar(0.38)
      gsap.to(this.stream.material.emissive, { r: glow.r, g: glow.g, b: glow.b, duration: d })
    }
    if (this.causticGlow) {
      const cMat = this.causticGlow.material as THREE.MeshBasicMaterial
      gsap.to(cMat.color, { r: meniscus.r, g: meniscus.g, b: meniscus.b, duration: d })
    }
  }

  start() {
    if (this.running || this.disposed) return
    this.running = true
    this.lastTime = performance.now()
    gsap.ticker.add(this.tick)
  }

  stop() {
    if (!this.running) return
    this.running = false
    gsap.ticker.remove(this.tick)
  }

  dispose() {
    this.stop()
    this.disposed = true
    this.ro.disconnect()
    this.unbindPointer()
    this.envTex?.dispose()
    this.extraTextures.forEach((t) => t.dispose())
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mat = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else mat?.dispose()
    })
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  // ---------------------------------------------------------------- per frame

  private tick = () => {
    const now = performance.now()
    const dt = Math.min((now - this.lastTime) / 1000, 0.05)
    this.lastTime = now
    this.elapsed += dt
    this.adaptQuality(now)

    const s = this.state
    const t = this.elapsed

    // Keep bottle mouth in Z-plane of crystal glass while pouring, and rotate around bottle's own Y axis
    // ('ZYX' Euler order: roll around local bottle axis first, then tilt in Z!) so the front label faces camera!
    const pourBlend = THREE.MathUtils.clamp(s.tilt / POUR_POSE.tilt, 0, 1)
    const bz = THREE.MathUtils.lerp(0.01, GLASS_Z, pourBlend)
    this.bottlePivot.position.set(s.px, s.py, bz)
    this.bottlePivot.rotation.order = 'ZYX'
    this.bottlePivot.rotation.set(0, s.roll, s.tilt)

    // World-horizontal gravity plane inside the bottle:
    // Upright: fills up to shoulder (0.215m before pour -> 0.165m after pouring 1 glass).
    // Tilted: levels horizontally across the belly & neck right down to the pouring mouth!
    const uprightBottleLevel = THREE.MathUtils.lerp(0.215, 0.165, s.fill)
    const mouthWorldY = s.py + (TARGET_MOUTH_Y - BOTTLE_PIVOT_Y) * Math.cos(s.tilt)
    this.bottleClipPlane.constant = THREE.MathUtils.lerp(uprightBottleLevel, mouthWorldY + 0.03, pourBlend)

    this.bottleShadow.position.set(s.px, 0.0009, bz)
    ;(this.bottleShadow.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.clamp(1 - (s.py - 0.18) * 5.5, 0.08, 0.9)

    // Wine fill + meniscus + surface swirl inside the crystal bowl
    const level = THREE.MathUtils.lerp(FILL_MIN, FILL_MAX, s.fill)
    this.clipPlane.constant = level
    const r = wineRadiusAt(level)
    const pouring = Math.max(0, s.streamHead - s.streamTail)

    this.surfaceGroup.position.y = level
    this.surfaceGroup.scale.set(r, 1, r)
    this.surfaceGroup.visible = s.fill > 0.015

    const wobble = (pouring * 0.045 + s.swirl * 0.035) * Math.sin(t * 9.5)
    this.surfaceGroup.rotation.z = wobble
    this.surfaceGroup.rotation.x = Math.cos(t * 8.2) * wobble * 0.6

    const ripplePhase = (t * 2.4) % 1
    const rippleScale = 0.15 + ripplePhase * 0.78
    this.rippleRing.scale.setScalar(rippleScale)
    ;(this.rippleRing.material as THREE.MeshBasicMaterial).opacity = pouring * (1 - ripplePhase) * 0.48

    ;(this.causticGlow.material as THREE.MeshBasicMaterial).opacity = s.fill * 0.75

    // Stream draw range
    const ring = this.streamRingSize
    const head = Math.floor((s.streamHead * this.streamIndexCount) / ring) * ring
    const tail = Math.floor((s.streamTail * this.streamIndexCount) / ring) * ring
    this.stream.geometry.setDrawRange(tail, Math.max(0, head - tail))
    this.stream.visible = head - tail > 0

    // Micro-droplets at stream impact
    this.droplets.position.y = level
    this.droplets.children.forEach((child, i) => {
      if (pouring <= 0.15 || s.fill < 0.04) {
        child.visible = false
        return
      }
      child.visible = true
      const phase = (t * 3.6 + i * 0.37) % 1
      const ang = i * 2.1 + t * 1.5
      const rad = 0.004 + phase * 0.014
      child.position.set(Math.cos(ang) * rad, Math.sin(phase * Math.PI) * 0.012 * pouring, Math.sin(ang) * rad)
      child.scale.setScalar((1 - phase * 0.6) * pouring)
    })

    // Organic candle flame flicker
    const flicker = 0.86 + 0.14 * (Math.sin(t * 7.1) * 0.6 + Math.sin(t * 15.3 + 1.2) * 0.4)
    this.candleLight.intensity = (0.68 + s.glow * 0.32) * flicker
    this.flameMeshes.forEach((fm, idx) => {
      fm.scale.y = 0.94 + 0.1 * Math.sin(t * 9.2 + idx * 1.7)
    })

    this.rimLight.intensity = 5.6 + s.glow * 3.4
    this.keyLight.intensity = 7.4 + s.glow * 1.8

    this.stage.rotation.y = this.spin + Math.sin(t * 0.45) * 0.018

    const p = this.embers.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      let y = p.getY(i) + this.emberSpeed[i] * dt
      if (y > 0.56) y = 0.02
      p.setY(i, y)
      p.setX(i, p.getX(i) + Math.sin(y * 12 + i) * 0.00018)
    }
    p.needsUpdate = true

    const aspect = this.camera.aspect
    const portraitBack = aspect < 1.05 ? 1 + (1.05 - aspect) * 0.72 : 1
    this.camera.position.set(s.camX * portraitBack, s.camY, s.camZ * portraitBack)
    this.camera.lookAt(s.lookX, s.lookY, 0)

    this.renderer.render(this.scene, this.camera)
  }

  // ---------------------------------------------------------------- helpers

  private frames = 0
  private windowStart = 0
  private pixelRatio = Math.min(window.devicePixelRatio, 1.75)
  private adaptQuality(now: number) {
    if (!this.windowStart) this.windowStart = now
    this.frames++
    if (this.frames < 45) return
    const avg = (now - this.windowStart) / this.frames
    this.frames = 0
    this.windowStart = now
    if (avg > 34 && this.pixelRatio > 0.75) {
      this.pixelRatio = Math.max(0.75, this.pixelRatio - 0.25)
      this.renderer.setPixelRatio(this.pixelRatio)
      this.resize()
    }
  }

  private resize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    if (!this.running) this.tick()
  }

  private onDown = (e: PointerEvent) => {
    this.dragging = true
    this.lastX = e.clientX
    this.renderer.domElement.setPointerCapture(e.pointerId)
    this.container.classList.add('is-dragging')
  }
  private onMove = (e: PointerEvent) => {
    if (!this.dragging) return
    this.spinTarget = THREE.MathUtils.clamp(this.spinTarget + (e.clientX - this.lastX) * 0.009, -1.65, 1.35)
    this.spinTo(this.spinTarget)
    this.lastX = e.clientX
  }
  private onUp = (e: PointerEvent) => {
    this.dragging = false
    this.container.classList.remove('is-dragging')
    if (this.renderer.domElement.hasPointerCapture(e.pointerId)) {
      this.renderer.domElement.releasePointerCapture(e.pointerId)
    }
  }

  private bindPointer() {
    const el = this.renderer.domElement
    el.addEventListener('pointerdown', this.onDown)
    el.addEventListener('pointermove', this.onMove)
    el.addEventListener('pointerup', this.onUp)
    el.addEventListener('pointercancel', this.onUp)
  }

  private unbindPointer() {
    const el = this.renderer.domElement
    el.removeEventListener('pointerdown', this.onDown)
    el.removeEventListener('pointermove', this.onMove)
    el.removeEventListener('pointerup', this.onUp)
    el.removeEventListener('pointercancel', this.onUp)
  }

  rotateBy(rad: number) {
    this.spinTarget = THREE.MathUtils.clamp(this.spinTarget + rad, -1.65, 1.35)
    this.spinTo(this.spinTarget)
  }
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}
