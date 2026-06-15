import fg from 'fast-glob'
import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import type { ImageManifestEntry } from '../src/env'

const imagePaths = await fg([
  'src/assets/**/**.{jpg,png,webp,jpeg}',
  'src/pages/**/assets/**.{jpg,png,webp,jpeg}',
])

const manifest: Record<string, ImageManifestEntry> = {}

for (const imagePath of imagePaths) {
  const assetName = path.basename(imagePath).split('.')[0]

  const buffer = await sharp(imagePath)
    .resize(48)
    .webp({ quality: 100 })
    .toBuffer()

  const lqip = `data:image/webp;base64,${buffer.toString('base64')}`

  manifest[assetName] = {
    lqip,
  }
}

if (!fsSync.existsSync('src/generated')) {
  // eslint-disable-next-line no-console
  console.log('Creating src/generated...')
  await fs.mkdir('src/generated', {
    recursive: true,
  })
}

await fs.writeFile(
  'src/generated/lqip-image-manifest.json',
  JSON.stringify(manifest, null, 2),
)

// eslint-disable-next-line no-console
console.log('Image manifest generated at src/generated/image-manifest.json')
