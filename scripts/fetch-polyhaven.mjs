// Downloads CC0 assets from Poly Haven (models + HDRI) into public/, then shrinks
// textures to 512px so the 3D scene stays light. Run: node scripts/fetch-polyhaven.mjs
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const MODELS = ['wine_bottles_01', 'brass_candleholders', 'wooden_cutting_board']
const HDRI = { id: 'brown_photostudio_02', res: '1k' }
const TEX_SIZE = 512

async function download(url, dest) {
  if (existsSync(dest)) return
  await mkdir(path.dirname(dest), { recursive: true })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
}

for (const id of MODELS) {
  const files = await (await fetch(`https://api.polyhaven.com/files/${id}`)).json()
  const g = files.gltf['1k'].gltf
  const dir = path.join(root, 'public/models', id)
  await download(g.url, path.join(dir, `${id}.gltf`))
  for (const [rel, info] of Object.entries(g.include)) {
    const dest = path.join(dir, rel)
    await download(info.url, dest)
    if (rel.endsWith('.jpg') || rel.endsWith('.png')) {
      const buf = await readFile(dest)
      const meta = await sharp(buf).metadata()
      if ((meta.width ?? 0) > TEX_SIZE) {
        const out = await sharp(buf).resize(TEX_SIZE, TEX_SIZE, { fit: 'inside' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
        await writeFile(dest, out)
      }
    }
  }
  console.log('model ok', id)
}

const hfiles = await (await fetch(`https://api.polyhaven.com/files/${HDRI.id}`)).json()
const h = hfiles.hdri[HDRI.res].hdr
await download(h.url, path.join(root, 'public/env', `${HDRI.id}_${HDRI.res}.hdr`))
console.log('hdri ok', HDRI.id)
