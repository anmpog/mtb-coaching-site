import path from 'node:path'
import type { ImageManifest } from '../env'
import manifest from '../generated/lqip-image-manifest.json'
const typedManifest = manifest as ImageManifest

function getLqip(image: ImageMetadata) {
  const imagePath = path.basename(image.src).split('.')[0]

  const { lqip } = typedManifest[imagePath]

  if (!lqip) {
    throw new Error('LQIP was not found')
  }

  return lqip
}

export default getLqip
